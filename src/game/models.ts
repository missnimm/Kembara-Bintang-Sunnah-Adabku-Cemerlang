import * as THREE from 'three';
import type { AvatarId, StationId } from '../data/adabContent';
import {
  createAvatarFaceTexture,
  createContactShadowTexture,
  createPicnicMatTexture,
  createRiceFaceTexture,
  createSignboardTexture,
  createWoodTexture,
} from './textures';

export interface AvatarRig {
  group: THREE.Group;
  bodyGroup: THREE.Group;
  headGroup: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  cape: THREE.Mesh;
  contactShadow: THREE.Mesh;
}

export interface StationVisuals {
  group: THREE.Group;
  ring: THREE.Mesh;
  beacon: THREE.Mesh;
  checkmark: THREE.Group;
  interactTargets: THREE.Object3D[];
}

export interface LampuMerahVisuals extends StationVisuals {
  redLight: THREE.Mesh;
  amberLight: THREE.Mesh;
  greenLight: THREE.Mesh;
  gateArm: THREE.Group;
}

export interface PokokVisuals extends StationVisuals {
  appleMeshes: THREE.Group[];
}

export interface Stesen2Visuals extends StationVisuals {
  nearPlate: THREE.Group;
  farPlate: THREE.Group;
}

export function createRobloxAvatar(character: AvatarId, maxAnisotropy: number): AvatarRig {
  const isGirl = character === 'aisyah';
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);

  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbd3b4, roughness: 0.65, metalness: 0.02 });
  const shirtMat = new THREE.MeshStandardMaterial({
    color: isGirl ? 0xf472b6 : 0x38bdf8,
    roughness: 0.55,
    metalness: 0.05,
  });
  const collarMat = new THREE.MeshStandardMaterial({
    color: isGirl ? 0xfce7f3 : 0xe0f2fe,
    roughness: 0.45,
    metalness: 0.05,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: isGirl ? 0xdb2777 : 0x1e3a8a,
    roughness: 0.72,
    metalness: 0.02,
  });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.1 });

  // Contact shadow grounded at y = 0.02
  const shadowGeo = new THREE.PlaneGeometry(1.5, 1.5);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: createContactShadowTexture(),
    transparent: true,
    depthWrite: false,
    opacity: 0.5,
  });
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.025;
  root.add(contactShadow);

  // Legs (pivot at hip y = 0.75)
  const makeLeg = (xOffset: number) => {
    const legPivot = new THREE.Group();
    legPivot.position.set(xOffset, 0.75, 0);

    const upper = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.56, 0.34), pantsMat);
    upper.position.y = -0.28;
    upper.castShadow = true;
    legPivot.add(upper);

    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.2, 0.42), shoeMat);
    shoe.position.set(0, -0.65, 0.04);
    shoe.castShadow = true;
    legPivot.add(shoe);

    return legPivot;
  };

  const leftLeg = makeLeg(-0.2);
  const rightLeg = makeLeg(0.2);
  bodyGroup.add(leftLeg, rightLeg);

  // Torso (Baju Melayu / Baju Kurung)
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.82, 0.48), shirtMat);
  torso.position.y = 1.16;
  torso.castShadow = true;
  torso.receiveShadow = true;
  bodyGroup.add(torso);

  // Sampin / Skirt hem accent
  const hem = new THREE.Mesh(
    new THREE.BoxGeometry(0.88, isGirl ? 0.34 : 0.24, 0.52),
    new THREE.MeshStandardMaterial({
      color: isGirl ? 0xf9a8d4 : 0xfbbf24,
      roughness: 0.6,
      metalness: 0.1,
    })
  );
  hem.position.y = isGirl ? 0.78 : 0.82;
  hem.castShadow = true;
  bodyGroup.add(hem);

  // Chest Star Emblem (Bintang Sunnah)
  const starShape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 0.14 : 0.06;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const sx = Math.cos(a) * r;
    const sy = Math.sin(a) * r;
    if (i === 0) starShape.moveTo(sx, sy);
    else starShape.lineTo(sx, sy);
  }
  starShape.closePath();
  const emblemGeo = new THREE.ExtrudeGeometry(starShape, { depth: 0.04, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01 });
  const emblemMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.25, metalness: 0.7 });
  const emblem = new THREE.Mesh(emblemGeo, emblemMat);
  emblem.position.set(0, 1.24, 0.25);
  bodyGroup.add(emblem);

  // Collar detail
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.12, 16), collarMat);
  collar.position.y = 1.58;
  bodyGroup.add(collar);

  // Arms (pivot at shoulder y = 1.5)
  const makeArm = (xOffset: number) => {
    const armPivot = new THREE.Group();
    armPivot.position.set(xOffset, 1.5, 0);

    const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.56, 0.3), shirtMat);
    sleeve.position.y = -0.26;
    sleeve.castShadow = true;
    armPivot.add(sleeve);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), skinMat);
    hand.position.y = -0.6;
    hand.castShadow = true;
    armPivot.add(hand);

    return armPivot;
  };

  const leftArm = makeArm(-0.58);
  const rightArm = makeArm(0.58);
  bodyGroup.add(leftArm, rightArm);

  // Head Group (Roblox blocky-rounded style)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.62, 0);
  bodyGroup.add(headGroup);

  const faceTex = createAvatarFaceTexture(maxAnisotropy, isGirl);
  const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.55, metalness: 0.02 });
  const headMaterials = [skinMat, skinMat, skinMat, skinMat, faceMat, skinMat];
  const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.68, 0.68), headMaterials);
  headMesh.position.y = 0.34;
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  if (isGirl) {
    // Pastel Pink Tudung layers (primary + secondary + floral pin)
    const tudungMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.68, metalness: 0.04 });
    const tudungTop = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.22, 0.78), tudungMat);
    tudungTop.position.set(0, 0.64, -0.02);
    tudungTop.castShadow = true;
    headGroup.add(tudungTop);

    const tudungBack = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.76, 0.32), tudungMat);
    tudungBack.position.set(0, 0.32, -0.26);
    tudungBack.castShadow = true;
    headGroup.add(tudungBack);

    const tudungLeft = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.64, 0.52), tudungMat);
    tudungLeft.position.set(-0.38, 0.3, -0.04);
    const tudungRight = tudungLeft.clone();
    tudungRight.position.x = 0.38;
    headGroup.add(tudungLeft, tudungRight);

    const tudungDrape = new THREE.Mesh(new THREE.ConeGeometry(0.52, 0.55, 4), tudungMat);
    tudungDrape.rotation.y = Math.PI / 4;
    tudungDrape.position.set(0, -0.06, 0.02);
    headGroup.add(tudungDrape);

    // Cute flower pin
    const pin = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.1, 0),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3, metalness: 0.2 })
    );
    pin.position.set(0.38, 0.54, 0.26);
    headGroup.add(pin);
  } else {
    // Boy hair + Songkok Hitam with Star
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
    const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.44, 0.26), hairMat);
    hairBack.position.set(0, 0.4, -0.24);
    headGroup.add(hairBack);

    const hairFringe = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.14, 0.18), hairMat);
    hairFringe.position.set(0, 0.58, 0.32);
    headGroup.add(hairFringe);

    const songkokMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.15 });
    const songkok = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.28, 0.66), songkokMat);
    songkok.position.set(0, 0.74, -0.02);
    songkok.rotation.x = -0.06;
    songkok.castShadow = true;
    headGroup.add(songkok);

    const songkokBand = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.06, 0.68),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.25, metalness: 0.75 })
    );
    songkokBand.position.set(0, 0.64, -0.02);
    headGroup.add(songkokBand);
  }

  // Unlockable Superhero Bintang Sunnah Cape (hidden until earned!)
  const capeGeo = new THREE.BoxGeometry(0.78, 1.05, 0.06);
  const capeMat = new THREE.MeshStandardMaterial({
    color: isGirl ? 0xec4899 : 0x0284c7,
    roughness: 0.45,
    metalness: 0.2,
  });
  const cape = new THREE.Mesh(capeGeo, capeMat);
  cape.position.set(0, 0.98, -0.32);
  cape.rotation.x = 0.22;
  cape.castShadow = true;
  cape.visible = false;
  bodyGroup.add(cape);

  return {
    group: root,
    bodyGroup,
    headGroup,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    cape,
    contactShadow,
  };
}

function createCheckmarkGroup(): THREE.Group {
  const grp = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x16a34a,
    emissiveIntensity: 0.4,
    roughness: 0.25,
    metalness: 0.3,
  });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 24), mat);
  disc.rotation.x = Math.PI / 2;
  grp.add(disc);

  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.35, 0.16), whiteMat);
  leg1.position.set(-0.12, -0.04, 0.02);
  leg1.rotation.z = 0.7;
  const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.62, 0.16), whiteMat);
  leg2.position.set(0.12, 0.05, 0.02);
  leg2.rotation.z = -0.65;
  grp.add(leg1, leg2);

  grp.visible = false;
  return grp;
}

function createStationMarkerRing(colorHex: number): { ring: THREE.Mesh; beacon: THREE.Mesh } {
  const ringMat = new THREE.MeshBasicMaterial({
    color: colorHex,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(2.15, 2.45, 36), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;

  const beaconMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.45,
    roughness: 0.2,
    metalness: 0.6,
  });
  const beacon = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), beaconMat);
  beacon.position.y = 3.8;

  return { ring, beacon };
}

function createWoodenSign(
  maxAnisotropy: number,
  title: string,
  subtitle: string,
  badgeColor: string,
  woodMat: THREE.Material
): THREE.Group {
  const sign = new THREE.Group();
  const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 2.1, 10), woodMat);
  postL.position.set(-0.95, 1.05, 0);
  postL.castShadow = true;
  const postR = postL.clone();
  postR.position.x = 0.95;

  const board = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.25, 0.14), woodMat);
  board.position.set(0, 2.15, 0);
  board.castShadow = true;

  const frontFace = new THREE.Mesh(
    new THREE.PlaneGeometry(2.26, 1.12),
    new THREE.MeshStandardMaterial({
      map: createSignboardTexture(maxAnisotropy, title, subtitle, badgeColor),
      roughness: 0.45,
    })
  );
  frontFace.position.set(0, 2.15, 0.075);

  sign.add(postL, postR, board, frontFace);
  return sign;
}

export function createHandWashStation(maxAnisotropy: number, woodMat: THREE.Material): StationVisuals {
  const group = new THREE.Group();
  const interactTargets: THREE.Object3D[] = [];

  const { ring, beacon } = createStationMarkerRing(0x0284c7);
  group.add(ring, beacon);

  // Stone base plinth
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8, metalness: 0.05 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.22, 1.6), baseMat);
  base.position.y = 0.11;
  base.receiveShadow = true;
  group.add(base);

  // Sink cabinet
  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.95, 1.0), woodMat);
  cabinet.position.set(0, 0.69, 0);
  cabinet.castShadow = true;
  cabinet.receiveShadow = true;
  group.add(cabinet);
  interactTargets.push(cabinet);

  // Ceramic basin
  const ceramicMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.1 });
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.42, 0.32, 20), ceramicMat);
  basin.position.set(-0.25, 1.24, 0.05);
  basin.castShadow = true;
  group.add(basin);

  // Water surface inside basin
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.15,
    transparent: true,
    opacity: 0.85,
  });
  const waterDisc = new THREE.Mesh(new THREE.CircleGeometry(0.46, 20), waterMat);
  waterDisc.rotation.x = -Math.PI / 2;
  waterDisc.position.set(-0.25, 1.36, 0.05);
  group.add(waterDisc);

  // Chrome curved faucet (TubeGeometry)
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.15, metalness: 0.92 });
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.25, 1.35, -0.35),
    new THREE.Vector3(-0.25, 1.82, -0.32),
    new THREE.Vector3(-0.25, 1.88, -0.05),
    new THREE.Vector3(-0.25, 1.7, 0.05),
  ]);
  const faucet = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.055, 10, false), chromeMat);
  faucet.castShadow = true;
  group.add(faucet);

  // Flowing water stream
  const stream = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.05, 0.34, 10),
    new THREE.MeshStandardMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.78, roughness: 0.1 })
  );
  stream.position.set(-0.25, 1.52, 0.05);
  group.add(stream);

  // Soap dispenser + Soap bubbles cluster
  const soapBottle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.14, 0.32, 12),
    new THREE.MeshStandardMaterial({ color: 0x2dd4bf, roughness: 0.35, metalness: 0.1 })
  );
  soapBottle.position.set(0.55, 1.32, 0.15);
  soapBottle.castShadow = true;
  group.add(soapBottle);

  const bubbleMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    roughness: 0.05,
    metalness: 0.0,
    transparent: true,
    opacity: 0.7,
    iridescence: 0.8,
  });
  for (let i = 0; i < 5; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.08 + (i % 3) * 0.03, 12, 12), bubbleMat);
    b.position.set(-0.4 + i * 0.18, 1.48 + (i % 2) * 0.16, 0.25 - (i % 3) * 0.1);
    b.userData.floatSeed = i * 1.4;
    group.add(b);
  }

  // Signboard
  const sign = createWoodenSign(maxAnisotropy, 'STESEN 1', 'Sebelum Makan', '#0284c7', woodMat);
  sign.position.set(0, 0, -1.35);
  group.add(sign);
  interactTargets.push(sign);

  const checkmark = createCheckmarkGroup();
  checkmark.position.set(0, 3.3, -1.35);
  group.add(checkmark);

  return { group, ring, beacon, checkmark, interactTargets };
}

export function createPicnicDiningStation(maxAnisotropy: number, woodMat: THREE.Material): Stesen2Visuals {
  const group = new THREE.Group();
  const interactTargets: THREE.Object3D[] = [];

  const { ring, beacon } = createStationMarkerRing(0x059669);
  ring.scale.setScalar(1.3);
  group.add(ring, beacon);

  // Checkered picnic mat (offset Y >= 0.025 to prevent Z-fighting)
  const matMesh = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 0.05, 3.6),
    new THREE.MeshStandardMaterial({
      map: createPicnicMatTexture(maxAnisotropy),
      roughness: 0.88,
      metalness: 0.0,
    })
  );
  matMesh.position.y = 0.025;
  matMesh.receiveShadow = true;
  group.add(matMesh);
  interactTargets.push(matMesh);

  // Sitting cushions (2 cushions)
  const cushionMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.85 });
  const cushionL = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.5, 0.12, 16), cushionMat);
  cushionL.position.set(-0.9, 0.11, 1.15);
  cushionL.receiveShadow = true;
  const cushionR = cushionL.clone();
  cushionR.position.set(0.9, 0.11, 1.15);
  group.add(cushionL, cushionR);

  // Low wooden picnic table
  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 1.5), woodMat);
  tableTop.position.set(0, 0.45, -0.05);
  tableTop.castShadow = true;
  tableTop.receiveShadow = true;
  group.add(tableTop);
  interactTargets.push(tableTop);

  for (const [lx, lz] of [
    [-1.1, -0.65],
    [1.1, -0.65],
    [-1.1, 0.55],
    [1.1, 0.55],
  ]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.4, 10), woodMat);
    leg.position.set(lx, 0.25, lz);
    leg.castShadow = true;
    group.add(leg);
  }

  // Cute Kawaii Rice Bowl (nearest plate!)
  const nearPlate = new THREE.Group();
  nearPlate.position.set(0, 0.5, 0.35);
  const ceramicMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.08 });
  const plateRim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.32, 0.08, 20), ceramicMat);
  plateRim.position.y = 0.04;
  nearPlate.add(plateRim);

  const riceMound = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
    new THREE.MeshStandardMaterial({ map: createRiceFaceTexture(maxAnisotropy), roughness: 0.7 })
  );
  riceMound.position.y = 0.08;
  nearPlate.add(riceMound);

  // Fried chicken drumstick beside rice
  const chickenMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.55 });
  const drumstick = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.14, 6, 10), chickenMat);
  drumstick.rotation.z = Math.PI / 3;
  drumstick.position.set(0.2, 0.13, 0.08);
  nearPlate.add(drumstick);
  group.add(nearPlate);

  // Far Dish Plate (Ayam & Buah di hujung meja)
  const farPlate = new THREE.Group();
  farPlate.position.set(-0.75, 0.5, -0.45);
  const farRim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.28, 0.08, 18),
    new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.25 })
  );
  farRim.position.y = 0.04;
  const appleSnack = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 14), new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 }));
  appleSnack.position.set(-0.08, 0.16, 0);
  const orangeSnack = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 14), new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.45 }));
  orangeSnack.position.set(0.12, 0.15, 0.05);
  farPlate.add(farRim, appleSnack, orangeSnack);
  group.add(farPlate);

  // Glass of water & Teapot
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    roughness: 0.1,
    metalness: 0.1,
    transparent: true,
    opacity: 0.65,
  });
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.26, 14), glassMat);
  cup.position.set(0.7, 0.63, 0.2);
  group.add(cup);

  const pitcher = new THREE.Mesh(
    new THREE.LatheGeometry(
      [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(0.18, 0),
        new THREE.Vector2(0.22, 0.18),
        new THREE.Vector2(0.14, 0.36),
        new THREE.Vector2(0.17, 0.42),
      ],
      16
    ),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.25, metalness: 0.2 })
  );
  pitcher.position.set(0.78, 0.5, -0.35);
  group.add(pitcher);

  // Signboard
  const sign = createWoodenSign(maxAnisotropy, 'STESEN 2', 'Semasa Makan', '#059669', woodMat);
  sign.position.set(0, 0, -2.1);
  group.add(sign);
  interactTargets.push(sign);

  const checkmark = createCheckmarkGroup();
  checkmark.position.set(0, 3.3, -2.1);
  group.add(checkmark);

  return { group, ring, beacon, checkmark, interactTargets, nearPlate, farPlate };
}

export function createLampuMerahGate(maxAnisotropy: number, woodMat: THREE.Material): LampuMerahVisuals {
  const group = new THREE.Group();
  const interactTargets: THREE.Object3D[] = [];

  const { ring, beacon } = createStationMarkerRing(0xdc2626);
  group.add(ring, beacon);

  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.65 });

  // Traffic Light Pole + Housing
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 2.2, 12), darkMetal);
  pole.position.set(-1.35, 1.1, 0);
  pole.castShadow = true;
  group.add(pole);

  const housing = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.65, 0.52), darkMetal);
  housing.position.set(-1.35, 2.55, 0);
  housing.castShadow = true;
  group.add(housing);
  interactTargets.push(housing);

  const makeLens = (y: number, color: number, emissiveOn: boolean) => {
    const lens = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: emissiveOn ? 1.2 : 0.12,
        roughness: 0.2,
      })
    );
    lens.position.set(-1.35, y, 0.22);
    group.add(lens);
    return lens;
  };

  const redLight = makeLens(3.05, 0xef4444, true);
  const amberLight = makeLens(2.55, 0xf59e0b, false);
  const greenLight = makeLens(2.05, 0x22c55e, false);

  // Right barrier post + pivoting barrier arm
  const rightPost = new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.4, 0.28), darkMetal);
  rightPost.position.set(1.35, 0.7, 0);
  rightPost.castShadow = true;
  group.add(rightPost);

  const gateArm = new THREE.Group();
  gateArm.position.set(-1.15, 1.1, 0);
  const armBar = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.18, 0.12),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 })
  );
  armBar.position.x = 1.2;
  armBar.castShadow = true;
  gateArm.add(armBar);

  // Red warning stripes on gate arm
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
  for (let i = 0; i < 4; i++) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.19, 0.13), stripeMat);
    stripe.position.x = 0.35 + i * 0.55;
    gateArm.add(stripe);
  }
  group.add(gateArm);

  // Signboard
  const sign = createWoodenSign(maxAnisotropy, 'LAMPU MERAH', 'Elak Larangan Adab', '#dc2626', woodMat);
  sign.position.set(0.3, 0, -1.3);
  group.add(sign);
  interactTargets.push(sign);

  const checkmark = createCheckmarkGroup();
  checkmark.position.set(0.3, 3.3, -1.3);
  group.add(checkmark);

  return {
    group,
    ring,
    beacon,
    checkmark,
    interactTargets,
    redLight,
    amberLight,
    greenLight,
    gateArm,
  };
}

export function createPokokKebaikan(maxAnisotropy: number, woodMat: THREE.Material): PokokVisuals {
  const group = new THREE.Group();
  const interactTargets: THREE.Object3D[] = [];

  const { ring, beacon } = createStationMarkerRing(0xd97706);
  ring.scale.setScalar(1.35);
  group.add(ring, beacon);

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.68, 2.8, 12), trunkMat);
  trunk.position.y = 1.4;
  trunk.castShadow = true;
  group.add(trunk);
  interactTargets.push(trunk);

  // Root flares
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + 0.4;
    const rootMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.28, 0.9, 8), trunkMat);
    rootMesh.position.set(Math.cos(angle) * 0.55, 0.25, Math.sin(angle) * 0.55);
    rootMesh.rotation.z = Math.cos(angle) * 0.6;
    rootMesh.rotation.x = -Math.sin(angle) * 0.6;
    group.add(rootMesh);
  }

  // Lush canopy clusters
  const leafColors = [0x22c55e, 0x16a34a, 0x4ade80, 0x15803d];
  const canopyOffsets: [number, number, number, number][] = [
    [0, 3.7, 0, 1.75],
    [-1.25, 3.2, 0.6, 1.25],
    [1.25, 3.25, 0.5, 1.3],
    [0, 3.3, -1.15, 1.3],
    [0, 4.45, 0.1, 1.2],
  ];
  canopyOffsets.forEach(([x, y, z, r], idx) => {
    const canopy = new THREE.Mesh(
      new THREE.DodecahedronGeometry(r, 1),
      new THREE.MeshStandardMaterial({ color: leafColors[idx % leafColors.length], roughness: 0.78 })
    );
    canopy.position.set(x, y, z);
    canopy.castShadow = true;
    group.add(canopy);
  });

  // 3 Glowing Giant Wisdom Apples hanging low
  const appleMeshes: THREE.Group[] = [];
  const applePos: [number, number, number][] = [
    [-1.25, 2.15, 0.9],
    [0, 2.4, 1.25],
    [1.25, 2.15, 0.9],
  ];
  const appleColors = [0xef4444, 0x3b82f6, 0x10b981];

  applePos.forEach(([ax, ay, az], idx) => {
    const appleGrp = new THREE.Group();
    appleGrp.position.set(ax, ay, az);

    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: appleColors[idx],
        emissiveIntensity: 0.25,
        roughness: 0.22,
        metalness: 0.1,
      })
    );
    body.castShadow = true;
    appleGrp.add(body);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 6), trunkMat);
    stem.position.y = 0.34;
    const leaf = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.04, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.6 })
    );
    leaf.position.set(0.09, 0.38, 0);
    leaf.rotation.z = 0.3;
    appleGrp.add(stem, leaf);

    group.add(appleGrp);
    appleMeshes.push(appleGrp);
    interactTargets.push(appleGrp);
  });

  const sign = createWoodenSign(maxAnisotropy, 'POKOK KEBAIKAN', 'Hikmah Sunnah', '#d97706', woodMat);
  sign.position.set(0, 0, -1.9);
  group.add(sign);
  interactTargets.push(sign);

  const checkmark = createCheckmarkGroup();
  checkmark.position.set(0, 3.3, -1.9);
  group.add(checkmark);

  return { group, ring, beacon, checkmark, interactTargets, appleMeshes };
}

export function createCleanupStation(maxAnisotropy: number, woodMat: THREE.Material): StationVisuals {
  const group = new THREE.Group();
  const interactTargets: THREE.Object3D[] = [];

  const { ring, beacon } = createStationMarkerRing(0x7c3aed);
  group.add(ring, beacon);

  // Dish rack & counter
  const counter = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 1.1), woodMat);
  counter.position.set(0, 0.45, 0);
  counter.castShadow = true;
  counter.receiveShadow = true;
  group.add(counter);
  interactTargets.push(counter);

  // Clean stacked plates
  const plateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.18, metalness: 0.1 });
  for (let i = 0; i < 4; i++) {
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.25, 0.06, 18), plateMat);
    plate.position.set(-0.55, 0.95 + i * 0.07, 0);
    plate.castShadow = true;
    group.add(plate);
  }

  // Sparkling towel & Trophy cup
  const towel = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.06, 0.35),
    new THREE.MeshStandardMaterial({ color: 0xa78bfa, roughness: 0.85 })
  );
  towel.position.set(0.15, 0.93, 0.12);
  group.add(towel);

  // Mini Trophy Star
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.82 });
  const trophyBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.14, 14), goldMat);
  trophyBase.position.set(0.75, 0.97, 0);
  const trophyCup = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.12, 0.32, 14), goldMat);
  trophyCup.position.set(0.75, 1.2, 0);
  group.add(trophyBase, trophyCup);

  const sign = createWoodenSign(maxAnisotropy, 'STESEN 3', 'Selepas Makan & Kuiz', '#7c3aed', woodMat);
  sign.position.set(0, 0, -1.35);
  group.add(sign);
  interactTargets.push(sign);

  const checkmark = createCheckmarkGroup();
  checkmark.position.set(0, 3.3, -1.35);
  group.add(checkmark);

  return { group, ring, beacon, checkmark, interactTargets };
}

export function createGoldenStarMesh(): THREE.Group {
  const starGrp = new THREE.Group();
  const starShape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 0.38 : 0.17;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const sx = Math.cos(a) * r;
    const sy = Math.sin(a) * r;
    if (i === 0) starShape.moveTo(sx, sy);
    else starShape.lineTo(sx, sy);
  }
  starShape.closePath();

  const geo = new THREE.ExtrudeGeometry(starShape, {
    depth: 0.12,
    bevelEnabled: true,
    bevelSize: 0.03,
    bevelThickness: 0.03,
    bevelSegments: 2,
  });
  geo.center();

  const mat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xd97706,
    emissiveIntensity: 0.35,
    roughness: 0.18,
    metalness: 0.8,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  starGrp.add(mesh);

  const halo = new THREE.Mesh(
    new THREE.RingGeometry(0.45, 0.52, 24),
    new THREE.MeshBasicMaterial({ color: 0xfef08a, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
  );
  starGrp.add(halo);

  return starGrp;
}

export function createStylizedTree(scale = 1): THREE.Group {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22 * scale, 0.34 * scale, 1.8 * scale, 8),
    new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.9 })
  );
  trunk.position.y = 0.9 * scale;
  trunk.castShadow = true;
  tree.add(trunk);

  const foliageMat1 = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.8 });
  const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.78 });

  const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1 * scale, 1), foliageMat1);
  crown1.position.y = 2.2 * scale;
  crown1.castShadow = true;

  const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8 * scale, 1), foliageMat2);
  crown2.position.set(0.35 * scale, 2.9 * scale, 0.2 * scale);
  crown2.castShadow = true;

  const crown3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.75 * scale, 1), foliageMat1);
  crown3.position.set(-0.4 * scale, 2.6 * scale, -0.2 * scale);
  crown3.castShadow = true;

  tree.add(crown1, crown2, crown3);
  return tree;
}

export function createWoodenFenceSegment(woodMat: THREE.Material): THREE.Group {
  const seg = new THREE.Group();
  const post1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.95, 0.18), woodMat);
  post1.position.set(-1.2, 0.475, 0);
  post1.castShadow = true;
  const post2 = post1.clone();
  post2.position.x = 1.2;

  const railTop = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 0.08), woodMat);
  railTop.position.set(0, 0.75, 0);
  railTop.castShadow = true;
  const railBot = railTop.clone();
  railBot.position.y = 0.38;

  seg.add(post1, post2, railTop, railBot);
  return seg;
}

export function getStationMeta(id: StationId) {
  return id;
}

export { createWoodTexture };
