import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { STATION_LIST, type AvatarId, type StationId } from '../data/adabContent';
import { soundEngine } from '../audio/soundEngine';
import {
  createCleanupStation,
  createGoldenStarMesh,
  createHandWashStation,
  createLampuMerahGate,
  createPicnicDiningStation,
  createPokokKebaikan,
  createRobloxAvatar,
  createStylizedTree,
  createWoodenFenceSegment,
  createWoodTexture,
  type AvatarRig,
  type LampuMerahVisuals,
  type PokokVisuals,
  type StationVisuals,
  type Stesen2Visuals,
} from './models';
import { createMeadowTexture } from './textures';

export type GamePhase = 'title' | 'playing' | 'modal';
export type AvatarAnimAction = 'idle' | 'wash' | 'sit' | 'doa' | 'eat' | 'celebrate';

export interface SceneCallbacks {
  onNearStation: (stationId: StationId | null) => void;
  onOpenStation: (stationId: StationId) => void;
  onCollectWorldStar: (starId: number) => void;
}

interface WorldStarItem {
  id: number;
  mesh: THREE.Group;
  position: THREE.Vector3;
  collected: boolean;
  phase: number;
}

interface BurstParticle {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  active: boolean;
}

// Pre-allocated math helpers (zero GC in render loop)
const _camTarget = new THREE.Vector3();
const _camDesired = new THREE.Vector3();
const _moveDir = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _rayMouse = new THREE.Vector2();

export class SunnahWorldScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean;
  private maxAnisotropy: number;

  private clock = new THREE.Clock();
  private frameId = 0;
  private disposed = false;

  private avatarRig: AvatarRig;
  private avatarPos = new THREE.Vector3(-9, 0, 9.5);
  private avatarVelY = 0;
  private avatarYaw = Math.PI;
  private isGrounded = true;
  private coyoteTimer = 0;
  private jumpBuffer = 0;
  private squashY = 1;
  private walkCycle = 0;
  private currentAction: AvatarAnimAction = 'idle';

  private keys = new Set<string>();
  private virtualMove = { x: 0, y: 0 };

  // Camera orbit state
  private camYaw = 0.25;
  private camPitch = 0.42;
  private camDist = 11.5;
  private isDraggingCam = false;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private pointerDownX = 0;
  private pointerDownY = 0;

  private phase: GamePhase = 'title';
  private callbacks: SceneCallbacks;
  private completedStations = new Set<StationId>();
  private nearStationId: StationId | null = null;
  private focusStationId: StationId | null = null;

  private woodMat: THREE.MeshStandardMaterial;
  private stationVisuals = new Map<StationId, StationVisuals>();
  private lampuVisuals!: LampuMerahVisuals;
  private pokokVisuals!: PokokVisuals;
  private stesen2Visuals!: Stesen2Visuals;

  private worldStars: WorldStarItem[] = [];
  private raycaster = new THREE.Raycaster();
  private clickableObjects: { obj: THREE.Object3D; stationId?: StationId; starId?: number }[] = [];

  private particlePool: BurstParticle[] = [];
  private gateOpenAmount = 0;

  // Obstacle bounding circles [x, z, radius]
  private obstacles: { x: number; z: number; r: number }[] = [
    { x: -9, z: 3.6, r: 1.4 }, // Stesen 1 sign/sink
    { x: 0, z: -2.05, r: 1.45 }, // Stesen 2 table
    { x: 8, z: -9, r: 0.9 }, // Pokok trunk
    { x: -8.5, z: -9, r: 1.3 }, // Stesen 3 counter
  ];

  constructor(container: HTMLElement, initialAvatar: AvatarId, callbacks: SceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;

    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();

    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xcffafe);
    this.scene.fog = new THREE.Fog(0xcffafe, 32, 82);

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 140);
    this.camera.position.set(0, 9, 18);

    this.woodMat = new THREE.MeshStandardMaterial({
      map: createWoodTexture(this.maxAnisotropy),
      roughness: 0.72,
      metalness: 0.04,
    });

    this.setupLighting();
    this.buildEnvironment();
    this.buildStations();
    this.buildWorldStars();
    this.buildParticlePool();

    this.avatarRig = createRobloxAvatar(initialAvatar, this.maxAnisotropy);
    this.avatarRig.group.position.copy(this.avatarPos);
    this.avatarRig.group.rotation.y = this.avatarYaw;
    this.scene.add(this.avatarRig.group);

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.bindEvents();
    this.startLoop();
  }

  private setupLighting() {
    const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x65a30d, 0.85);
    hemi.position.set(0, 35, 0);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfffbeb, 1.55);
    sun.position.set(18, 28, 16);
    sun.castShadow = !this.isSoftwareGl;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 2;
    sun.shadow.camera.far = 70;
    const d = 22;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
    this.scene.add(sun);

    const rim = new THREE.DirectionalLight(0xbae6fd, 0.45);
    rim.position.set(-16, 12, -16);
    this.scene.add(rim);
  }

  private buildEnvironment() {
    // Extended meadow ground (never boxed in!)
    const groundGeo = new THREE.PlaneGeometry(140, 140);
    const groundMat = new THREE.MeshStandardMaterial({
      map: createMeadowTexture(this.maxAnisotropy),
      roughness: 0.92,
      metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Distant rolling hills beyond playable park
    const hillMat = new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.95 });
    const hillCoords: [number, number, number, number][] = [
      [-36, -34, 16, 6],
      [0, -42, 22, 8],
      [38, -32, 18, 6.5],
      [42, 10, 17, 5.5],
      [-42, 12, 16, 5.5],
      [0, 44, 24, 6],
    ];
    hillCoords.forEach(([hx, hz, r, h]) => {
      const hill = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), hillMat);
      hill.scale.set(1.4, h / r, 1.1);
      hill.position.set(hx, -0.3, hz);
      this.scene.add(hill);
    });

    // Stepping stone path connecting the 5 stations in a clear adventure loop
    const pathWaypoints = [
      new THREE.Vector3(-9, 0.03, 9.5),
      new THREE.Vector3(-9, 0.03, 5),
      new THREE.Vector3(-4.5, 0.03, 2),
      new THREE.Vector3(0, 0.03, -2),
      new THREE.Vector3(5, 0.03, 1.5),
      new THREE.Vector3(9.5, 0.03, 4),
      new THREE.Vector3(9, 0.03, -3),
      new THREE.Vector3(8, 0.03, -9),
      new THREE.Vector3(0, 0.03, -9.5),
      new THREE.Vector3(-8.5, 0.03, -9),
    ];
    const pathCurve = new THREE.CatmullRomCurve3(pathWaypoints);
    const stoneSamples = pathCurve.getSpacedPoints(46);

    const stoneGeo = new THREE.CylinderGeometry(0.58, 0.64, 0.08, 8);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.85, metalness: 0.02 });
    const stoneInst = new THREE.InstancedMesh(stoneGeo, stoneMat, stoneSamples.length);
    stoneInst.receiveShadow = true;
    const dummy = new THREE.Object3D();
    const stoneColor = new THREE.Color();
    stoneSamples.forEach((pt, idx) => {
      dummy.position.set(pt.x + Math.sin(idx * 2.1) * 0.14, 0.03, pt.z + Math.cos(idx * 1.7) * 0.14);
      dummy.rotation.y = idx * 0.6;
      const sc = 0.85 + (idx % 3) * 0.14;
      dummy.scale.set(sc, 1, sc * 0.88);
      dummy.updateMatrix();
      stoneInst.setMatrixAt(idx, dummy.matrix);
      stoneColor.setHex(idx % 2 === 0 ? 0xfef3c7 : 0xfde68a);
      stoneInst.setColorAt(idx, stoneColor);
    });
    stoneInst.instanceMatrix.needsUpdate = true;
    if (stoneInst.instanceColor) stoneInst.instanceColor.needsUpdate = true;
    stoneInst.computeBoundingSphere();
    this.scene.add(stoneInst);

    // Instanced wildflower clusters scattered across the meadow
    const flowerCount = 85;
    const flowerGeo = new THREE.DodecahedronGeometry(0.16, 0);
    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
    const flowerInst = new THREE.InstancedMesh(flowerGeo, flowerMat, flowerCount);
    const flowerPalette = [0xf472b6, 0xfacc15, 0x60a5fa, 0xfb923c, 0xc084fc];
    const fColor = new THREE.Color();
    for (let i = 0; i < flowerCount; i++) {
      const angle = i * 2.39996;
      const dist = 5.5 + ((i * 7) % 18);
      const fx = Math.cos(angle) * dist;
      const fz = Math.sin(angle) * dist;
      dummy.position.set(fx, 0.12, fz);
      dummy.rotation.set(0, angle, 0);
      const sc = 0.75 + (i % 4) * 0.2;
      dummy.scale.setScalar(sc);
      dummy.updateMatrix();
      flowerInst.setMatrixAt(i, dummy.matrix);
      fColor.setHex(flowerPalette[i % flowerPalette.length]);
      flowerInst.setColorAt(i, fColor);
    }
    flowerInst.instanceMatrix.needsUpdate = true;
    if (flowerInst.instanceColor) flowerInst.instanceColor.needsUpdate = true;
    flowerInst.computeBoundingSphere();
    this.scene.add(flowerInst);

    // Natural perimeter: stylized tree grove + low wooden park fence
    const treeRingCount = 18;
    for (let i = 0; i < treeRingCount; i++) {
      const a = (i / treeRingCount) * Math.PI * 2;
      const r = 21.5 + (i % 3) * 2.4;
      const tree = createStylizedTree(0.95 + (i % 3) * 0.22);
      tree.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      tree.rotation.y = a;
      this.scene.add(tree);
    }

    // Open wooden fence posts at park boundary (±16.5)
    for (let x = -14; x <= 14; x += 3.5) {
      const fNorth = createWoodenFenceSegment(this.woodMat);
      fNorth.position.set(x, 0, -16.5);
      const fSouth = createWoodenFenceSegment(this.woodMat);
      fSouth.position.set(x, 0, 16.5);
      this.scene.add(fNorth, fSouth);
    }
    for (let z = -14; z <= 14; z += 3.5) {
      const fWest = createWoodenFenceSegment(this.woodMat);
      fWest.position.set(-16.5, 0, z);
      fWest.rotation.y = Math.PI / 2;
      const fEast = createWoodenFenceSegment(this.woodMat);
      fEast.position.set(16.5, 0, z);
      fEast.rotation.y = Math.PI / 2;
      this.scene.add(fWest, fEast);
    }
  }

  private buildStations() {
    const s1 = createHandWashStation(this.maxAnisotropy, this.woodMat);
    s1.group.position.set(...STATION_LIST[0].position);
    this.scene.add(s1.group);
    this.stationVisuals.set('stesen1', s1);
    s1.interactTargets.forEach((obj) => this.clickableObjects.push({ obj, stationId: 'stesen1' }));

    const s2 = createPicnicDiningStation(this.maxAnisotropy, this.woodMat);
    s2.group.position.set(...STATION_LIST[1].position);
    this.scene.add(s2.group);
    this.stationVisuals.set('stesen2', s2);
    this.stesen2Visuals = s2;
    s2.interactTargets.forEach((obj) => this.clickableObjects.push({ obj, stationId: 'stesen2' }));

    const lm = createLampuMerahGate(this.maxAnisotropy, this.woodMat);
    lm.group.position.set(...STATION_LIST[2].position);
    lm.group.rotation.y = -0.35;
    this.scene.add(lm.group);
    this.stationVisuals.set('lampu_merah', lm);
    this.lampuVisuals = lm;
    lm.interactTargets.forEach((obj) => this.clickableObjects.push({ obj, stationId: 'lampu_merah' }));

    const pk = createPokokKebaikan(this.maxAnisotropy, this.woodMat);
    pk.group.position.set(...STATION_LIST[3].position);
    this.scene.add(pk.group);
    this.stationVisuals.set('pokok', pk);
    this.pokokVisuals = pk;
    pk.interactTargets.forEach((obj) => this.clickableObjects.push({ obj, stationId: 'pokok' }));

    const s3 = createCleanupStation(this.maxAnisotropy, this.woodMat);
    s3.group.position.set(...STATION_LIST[4].position);
    this.scene.add(s3.group);
    this.stationVisuals.set('stesen3', s3);
    s3.interactTargets.forEach((obj) => this.clickableObjects.push({ obj, stationId: 'stesen3' }));
  }

  private buildWorldStars() {
    const starCoords: [number, number, number][] = [
      [-9, 1.05, 7.2],
      [-5.2, 1.05, 2.4],
      [4.5, 1.05, 1.2],
      [9.2, 1.05, -2.5],
      [1.2, 1.05, -9.2],
      [-5.2, 1.05, -9.0],
    ];
    starCoords.forEach((coords, idx) => {
      const mesh = createGoldenStarMesh();
      mesh.position.set(...coords);
      this.scene.add(mesh);
      const item: WorldStarItem = {
        id: idx,
        mesh,
        position: new THREE.Vector3(...coords),
        collected: false,
        phase: idx * 1.1,
      };
      this.worldStars.push(item);
      this.clickableObjects.push({ obj: mesh, starId: idx });
    });
  }

  private buildParticlePool() {
    const geo = new THREE.OctahedronGeometry(0.14, 0);
    const colors = [0xfacc15, 0x38bdf8, 0x4ade80, 0xf472b6, 0xfb923c];
    for (let i = 0; i < 40; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        emissive: colors[i % colors.length],
        emissiveIntensity: 0.4,
        roughness: 0.3,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.visible = false;
      this.scene.add(mesh);
      this.particlePool.push({
        mesh,
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 0.9,
        active: false,
      });
    }
  }

  public spawnBurst(origin: THREE.Vector3, count = 18) {
    let spawned = 0;
    for (const p of this.particlePool) {
      if (!p.active) {
        p.active = true;
        p.life = 0;
        p.maxLife = 0.65 + Math.random() * 0.45;
        p.mesh.visible = true;
        p.mesh.position.copy(origin);
        p.mesh.scale.setScalar(1);
        const angle = Math.random() * Math.PI * 2;
        const speed = 2.2 + Math.random() * 3.8;
        p.vel.set(Math.cos(angle) * speed, 4.2 + Math.random() * 3.6, Math.sin(angle) * speed);
        spawned++;
        if (spawned >= count) break;
      }
    }
  }

  public setAvatar(character: AvatarId) {
    this.scene.remove(this.avatarRig.group);
    this.avatarRig = createRobloxAvatar(character, this.maxAnisotropy);
    this.avatarRig.group.position.copy(this.avatarPos);
    this.avatarRig.group.rotation.y = this.avatarYaw;
    this.avatarRig.cape.visible = this.completedStations.size >= STATION_LIST.length;
    this.scene.add(this.avatarRig.group);
  }

  public setPhase(phase: GamePhase) {
    this.phase = phase;
    if (phase !== 'playing') {
      this.keys.clear();
      this.virtualMove.x = 0;
      this.virtualMove.y = 0;
    }
  }

  public setCompletedStations(ids: StationId[]) {
    this.completedStations = new Set(ids);
    this.stationVisuals.forEach((vis, id) => {
      const done = this.completedStations.has(id);
      vis.checkmark.visible = done;
      vis.beacon.visible = !done;
    });
    if (this.lampuVisuals) {
      const lampuDone = this.completedStations.has('lampu_merah');
      (this.lampuVisuals.redLight.material as THREE.MeshStandardMaterial).emissiveIntensity = lampuDone ? 0.1 : 1.3;
      (this.lampuVisuals.greenLight.material as THREE.MeshStandardMaterial).emissiveIntensity = lampuDone ? 1.4 : 0.1;
    }
    this.avatarRig.cape.visible = this.completedStations.size >= STATION_LIST.length;
  }

  public triggerAvatarAction(action: AvatarAnimAction) {
    this.currentAction = action;
    if (action === 'celebrate') {
      this.spawnBurst(new THREE.Vector3(this.avatarPos.x, this.avatarPos.y + 1.8, this.avatarPos.z), 26);
    }
  }

  public focusStation(stationId: StationId) {
    const st = STATION_LIST.find((s) => s.id === stationId);
    if (!st) return;
    this.focusStationId = stationId;
    // Place avatar right in front of the station so they can inspect & start
    const [sx, , sz] = st.position;
    this.avatarPos.set(sx, 0, sz + 2.1);
    this.avatarVelY = 0;
    this.isGrounded = true;
    this.avatarYaw = Math.PI;
    this.avatarRig.group.position.copy(this.avatarPos);
    this.avatarRig.group.rotation.y = this.avatarYaw;
    this.nearStationId = stationId;
    this.callbacks.onNearStation(stationId);
  }

  public setVirtualMove(x: number, y: number) {
    this.virtualMove.x = x;
    this.virtualMove.y = y;
  }

  public triggerJump() {
    this.jumpBuffer = 0.15;
  }

  private bindEvents() {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);

    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
  }

  private handleResize = () => {
    if (this.disposed) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (this.phase !== 'playing') return;
    this.keys.add(e.code);
    if (e.code === 'Space') {
      e.preventDefault();
      this.jumpBuffer = 0.15;
    }
    if (e.code === 'KeyE' && this.nearStationId) {
      this.callbacks.onOpenStation(this.nearStationId);
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };

  private handleBlur = () => {
    this.keys.clear();
    this.virtualMove.x = 0;
    this.virtualMove.y = 0;
  };

  private handlePointerDown = (e: PointerEvent) => {
    if (this.phase !== 'playing') return;
    this.isDraggingCam = true;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
    this.pointerDownX = e.clientX;
    this.pointerDownY = e.clientY;
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (!this.isDraggingCam || this.phase !== 'playing') return;
    const dx = e.clientX - this.lastPointerX;
    const dy = e.clientY - this.lastPointerY;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
    this.camYaw -= dx * 0.0065;
    this.camPitch = THREE.MathUtils.clamp(this.camPitch + dy * 0.0045, 0.18, 0.85);
  };

  private handlePointerUp = (e: PointerEvent) => {
    if (!this.isDraggingCam) return;
    this.isDraggingCam = false;

    const moved = Math.hypot(e.clientX - this.pointerDownX, e.clientY - this.pointerDownY);
    if (moved < 8 && this.phase === 'playing') {
      this.raycastClick(e);
    }
  };

  private raycastClick(e: PointerEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    _rayMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    _rayMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(_rayMouse, this.camera);

    const targets = this.clickableObjects.map((c) => c.obj);
    const hits = this.raycaster.intersectObjects(targets, true);
    if (hits.length === 0) return;

    let hitObj: THREE.Object3D | null = hits[0].object;
    while (hitObj) {
      const found = this.clickableObjects.find((c) => c.obj === hitObj);
      if (found) {
        if (found.stationId) {
          this.focusStation(found.stationId);
          this.callbacks.onOpenStation(found.stationId);
          return;
        }
        if (found.starId !== undefined) {
          const item = this.worldStars.find((s) => s.id === found.starId);
          if (item && !item.collected) {
            this.collectWorldStar(item);
          }
          return;
        }
      }
      hitObj = hitObj.parent;
    }
  }

  private collectWorldStar(item: WorldStarItem) {
    item.collected = true;
    item.mesh.visible = false;
    soundEngine.playStarCollect();
    this.spawnBurst(item.position, 20);
    this.callbacks.onCollectWorldStar(item.id);
  }

  private startLoop() {
    const tick = () => {
      if (this.disposed) return;
      const rawDt = this.clock.getDelta();
      const dt = Math.min(rawDt, 0.05);
      const elapsed = this.clock.elapsedTime;

      this.update(dt, elapsed);
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.frameId = window.setTimeout(tick, 16);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) {
        if (sync) gl.deleteSync(sync);
        return;
      }
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private update(dt: number, elapsed: number) {
    // Rotate Q/E camera smoothly
    if (this.phase === 'playing') {
      if (this.keys.has('KeyQ')) this.camYaw += 1.6 * dt;
      if (this.keys.has('KeyE') && !this.nearStationId) this.camYaw -= 1.6 * dt;
    }

    // Update avatar movement in playing phase
    let speed = 0;
    if (this.phase === 'playing') {
      const ix =
        (this.keys.has('KeyD') || this.keys.has('ArrowRight') ? 1 : 0) -
        (this.keys.has('KeyA') || this.keys.has('ArrowLeft') ? 1 : 0) +
        this.virtualMove.x;
      const iy =
        (this.keys.has('KeyW') || this.keys.has('ArrowUp') ? 1 : 0) -
        (this.keys.has('KeyS') || this.keys.has('ArrowDown') ? 1 : 0) +
        this.virtualMove.y;

      _forward.set(-Math.sin(this.camYaw), 0, -Math.cos(this.camYaw));
      _right.set(Math.cos(this.camYaw), 0, -Math.sin(this.camYaw));
      _moveDir.set(0, 0, 0).addScaledVector(_forward, iy).addScaledVector(_right, ix);

      const mag = _moveDir.length();
      if (mag > 0.05) {
        _moveDir.normalize();
        const moveSpeed = 6.8;
        this.avatarPos.x += _moveDir.x * moveSpeed * dt;
        this.avatarPos.z += _moveDir.z * moveSpeed * dt;
        speed = 1;

        // Clamp within park fence
        this.avatarPos.x = THREE.MathUtils.clamp(this.avatarPos.x, -15.2, 15.2);
        this.avatarPos.z = THREE.MathUtils.clamp(this.avatarPos.z, -15.2, 15.2);

        // Soft circular obstacle push-out
        for (const obs of this.obstacles) {
          const dx = this.avatarPos.x - obs.x;
          const dz = this.avatarPos.z - obs.z;
          const dist = Math.hypot(dx, dz);
          if (dist < obs.r && dist > 0.001) {
            this.avatarPos.x = obs.x + (dx / dist) * obs.r;
            this.avatarPos.z = obs.z + (dz / dist) * obs.r;
          }
        }

        const targetYaw = Math.atan2(_moveDir.x, _moveDir.z);
        let diff = targetYaw - this.avatarYaw;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.avatarYaw += diff * Math.min(1, 12 * dt);

        if (this.isGrounded) {
          soundEngine.playStep();
        }
        this.focusStationId = null;
      }

      // Coyote time + Jump buffer
      if (this.isGrounded) this.coyoteTimer = 0.12;
      else this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);

      if (this.jumpBuffer > 0) this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);

      if (this.jumpBuffer > 0 && this.coyoteTimer > 0) {
        this.avatarVelY = 8.4;
        this.isGrounded = false;
        this.coyoteTimer = 0;
        this.jumpBuffer = 0;
        this.squashY = 1.24;
        soundEngine.playJump();
      }
    }

    // Vertical physics
    if (!this.isGrounded || this.avatarPos.y > 0) {
      this.avatarVelY -= 22 * dt;
      this.avatarPos.y += this.avatarVelY * dt;
      if (this.avatarPos.y <= 0) {
        this.avatarPos.y = 0;
        this.avatarVelY = 0;
        this.isGrounded = true;
        this.squashY = 0.78;
      }
    }

    this.squashY = THREE.MathUtils.damp(this.squashY, 1, 12, dt);
    this.avatarRig.group.position.copy(this.avatarPos);
    this.avatarRig.group.rotation.y = this.avatarYaw;

    // Contact shadow shrinks subtly when jumping
    const shadowScale = THREE.MathUtils.clamp(1 - this.avatarPos.y * 0.16, 0.45, 1);
    this.avatarRig.contactShadow.position.y = 0.025 - this.avatarPos.y;
    this.avatarRig.contactShadow.scale.setScalar(shadowScale);

    // Limb & Action Animations
    this.animateAvatarLimbs(dt, elapsed, speed);

    // World Stars bob & proximity pickup
    for (const st of this.worldStars) {
      if (st.collected) continue;
      st.mesh.rotation.y = elapsed * 2.2 + st.phase;
      st.mesh.position.y = st.position.y + Math.sin(elapsed * 3 + st.phase) * 0.16;

      if (this.phase === 'playing') {
        const d = Math.hypot(this.avatarPos.x - st.position.x, this.avatarPos.z - st.position.z);
        if (d < 1.35 && this.avatarPos.y < 1.8) {
          this.collectWorldStar(st);
        }
      }
    }

    // Station beacons, apples, and Lampu Merah gate animation
    this.stationVisuals.forEach((vis, id) => {
      vis.beacon.rotation.y = elapsed * 1.8;
      vis.beacon.position.y = 3.6 + Math.sin(elapsed * 2.6) * 0.22;
      if (vis.checkmark.visible) {
        vis.checkmark.rotation.y = Math.sin(elapsed * 1.5) * 0.25;
      }
      if (id === 'stesen1') {
        vis.group.children.forEach((c) => {
          if (c.userData.floatSeed !== undefined) {
            c.position.y = 1.52 + Math.sin(elapsed * 2.4 + c.userData.floatSeed) * 0.12;
          }
        });
      }
    });

    if (this.pokokVisuals) {
      this.pokokVisuals.appleMeshes.forEach((ap, idx) => {
        ap.rotation.y = Math.sin(elapsed * 1.5 + idx) * 0.3;
        ap.position.y = (idx === 1 ? 2.4 : 2.15) + Math.sin(elapsed * 2.2 + idx) * 0.07;
      });
    }

    if (this.lampuVisuals) {
      const targetGate = this.completedStations.has('lampu_merah') ? 1 : 0;
      this.gateOpenAmount = THREE.MathUtils.damp(this.gateOpenAmount, targetGate, 6, dt);
      this.lampuVisuals.gateArm.rotation.z = this.gateOpenAmount * (Math.PI * 0.44);
    }

    // Station proximity detection
    if (this.phase === 'playing') {
      let closest: StationId | null = null;
      let closestDist = 3.2;
      for (const st of STATION_LIST) {
        const d = Math.hypot(this.avatarPos.x - st.position[0], this.avatarPos.z - st.position[2]);
        if (d < closestDist) {
          closestDist = d;
          closest = st.id;
        }
      }
      if (closest !== this.nearStationId) {
        this.nearStationId = closest;
        this.callbacks.onNearStation(closest);
      }
    }

    // Update burst particles
    for (const p of this.particlePool) {
      if (!p.active) continue;
      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }
      p.vel.y -= 11 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.rotation.x += 5 * dt;
      p.mesh.rotation.y += 6 * dt;
      const fade = 1 - p.life / p.maxLife;
      p.mesh.scale.setScalar(Math.max(0.01, fade));
    }

    // Camera positioning
    if (this.phase === 'title') {
      const orbitA = elapsed * 0.22;
      _camDesired.set(Math.sin(orbitA) * 18, 8.5 + Math.sin(elapsed * 0.4) * 1.1, Math.cos(orbitA) * 18);
      _camTarget.set(0, 1.5, -1);
      this.camera.position.lerp(_camDesired, 1 - Math.exp(-4 * dt));
      this.camera.lookAt(_camTarget);
    } else if (this.phase === 'modal' && this.focusStationId) {
      const st = STATION_LIST.find((s) => s.id === this.focusStationId);
      if (st) {
        _camDesired.set(st.position[0] + 3.2, 4.2, st.position[2] + 6.4);
        _camTarget.set(st.position[0], 1.4, st.position[2] + 0.5);
        this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, _camDesired.x, 5, dt);
        this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, _camDesired.y, 5, dt);
        this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, _camDesired.z, 5, dt);
        this.camera.lookAt(_camTarget);
      }
    } else {
      const horizDist = Math.cos(this.camPitch) * this.camDist;
      const vertDist = Math.sin(this.camPitch) * this.camDist;
      _camDesired.set(
        this.avatarPos.x + Math.sin(this.camYaw) * horizDist,
        this.avatarPos.y + 1.8 + vertDist,
        this.avatarPos.z + Math.cos(this.camYaw) * horizDist
      );
      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, _camDesired.x, 8, dt);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, _camDesired.y, 8, dt);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, _camDesired.z, 8, dt);
      _camTarget.set(this.avatarPos.x, this.avatarPos.y + 1.45, this.avatarPos.z);
      this.camera.lookAt(_camTarget);
    }
  }

  private animateAvatarLimbs(dt: number, elapsed: number, speed: number) {
    const rig = this.avatarRig;
    const invSquash = 1 / Math.sqrt(this.squashY);
    rig.bodyGroup.scale.set(invSquash, this.squashY, invSquash);

    if (this.phase === 'modal' && this.currentAction !== 'idle') {
      rig.bodyGroup.position.y = 0;
      if (this.currentAction === 'wash') {
        rig.leftArm.rotation.set(-0.9, 0, Math.sin(elapsed * 12) * 0.25 + 0.25);
        rig.rightArm.rotation.set(-0.9, 0, -Math.sin(elapsed * 12) * 0.25 - 0.25);
        rig.leftLeg.rotation.x = 0;
        rig.rightLeg.rotation.x = 0;
      } else if (this.currentAction === 'sit') {
        rig.bodyGroup.position.y = -0.35;
        rig.leftLeg.rotation.x = -1.25;
        rig.rightLeg.rotation.x = -1.25;
        rig.leftArm.rotation.set(-0.4, 0, 0.15);
        rig.rightArm.rotation.set(-0.4, 0, -0.15);
      } else if (this.currentAction === 'doa') {
        rig.bodyGroup.position.y = -0.35;
        rig.leftLeg.rotation.x = -1.25;
        rig.rightLeg.rotation.x = -1.25;
        rig.leftArm.rotation.set(-1.1 + Math.sin(elapsed * 3) * 0.08, 0, -0.2);
        rig.rightArm.rotation.set(-1.1 + Math.sin(elapsed * 3) * 0.08, 0, 0.2);
      } else if (this.currentAction === 'eat') {
        rig.bodyGroup.position.y = -0.35;
        rig.leftLeg.rotation.x = -1.25;
        rig.rightLeg.rotation.x = -1.25;
        rig.leftArm.rotation.set(-0.2, 0, 0.15);
        rig.rightArm.rotation.set(-1.15 + Math.sin(elapsed * 5) * 0.35, 0, -0.1);
      } else if (this.currentAction === 'celebrate') {
        rig.bodyGroup.position.y = Math.abs(Math.sin(elapsed * 6)) * 0.35;
        rig.leftArm.rotation.set(-2.6, 0, -0.2);
        rig.rightArm.rotation.set(-2.6, 0, 0.2);
        rig.leftLeg.rotation.x = Math.sin(elapsed * 6) * 0.2;
        rig.rightLeg.rotation.x = -Math.sin(elapsed * 6) * 0.2;
      }
      return;
    }

    rig.bodyGroup.position.y = 0;

    if (!this.isGrounded) {
      rig.leftArm.rotation.set(-2.1, 0, -0.2);
      rig.rightArm.rotation.set(-2.1, 0, 0.2);
      rig.leftLeg.rotation.x = 0.45;
      rig.rightLeg.rotation.x = -0.35;
    } else if (speed > 0.1) {
      this.walkCycle += dt * 11;
      const swing = Math.sin(this.walkCycle) * 0.72;
      rig.leftLeg.rotation.x = swing;
      rig.rightLeg.rotation.x = -swing;
      rig.leftArm.rotation.set(-swing * 0.85, 0, 0.08);
      rig.rightArm.rotation.set(swing * 0.85, 0, -0.08);
      rig.headGroup.position.y = 1.62 + Math.abs(Math.sin(this.walkCycle)) * 0.05;
    } else {
      const idleBob = Math.sin(elapsed * 2.4) * 0.04;
      rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, 0, 10, dt);
      rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, 0, 10, dt);
      rig.leftArm.rotation.set(idleBob, 0, 0.08);
      rig.rightArm.rotation.set(-idleBob, 0, -0.08);
      rig.headGroup.position.y = 1.62 + Math.sin(elapsed * 2.4) * 0.02;
    }
  }

  public dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    this.renderer.domElement.removeEventListener('pointerdown', this.handlePointerDown);

    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });

    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
