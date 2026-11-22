import * as THREE from 'three';

function finalizeColorTexture(canvas: HTMLCanvasElement, maxAnisotropy: number, repeatX = 1, repeatY = 1): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  if (repeatX !== 1 || repeatY !== 1) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
  }
  tex.needsUpdate = true;
  return tex;
}

export function createMeadowTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#7ad66b';
  ctx.fillRect(0, 0, 512, 512);

  // Soft stylized grass patches (Roblox-inspired cheerful meadow)
  const palette = ['#6bc75d', '#86e077', '#5eb851', '#94e884'];
  for (let i = 0; i < 420; i++) {
    ctx.fillStyle = palette[i % palette.length];
    const x = (i * 97) % 512;
    const y = (i * 173) % 512;
    const w = 12 + (i % 5) * 6;
    const h = 8 + (i % 4) * 5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.fill();
  }

  // Subtle clover dots
  ctx.fillStyle = '#bef264';
  for (let i = 0; i < 65; i++) {
    const x = (i * 131 + 20) % 512;
    const y = (i * 211 + 15) % 512;
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  return finalizeColorTexture(canvas, maxAnisotropy, 18, 18);
}

export function createWoodTexture(maxAnisotropy: number, baseHex = '#c9884c', grainHex = '#a86932'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = grainHex;
  ctx.lineWidth = 3;
  for (let y = 16; y < 256; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(85, y - 4, 170, y + 4, 256, y);
    ctx.stroke();
  }

  // Plank seams
  ctx.strokeStyle = 'rgba(70, 35, 10, 0.25)';
  ctx.lineWidth = 2;
  for (let y = 64; y < 256; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  return finalizeColorTexture(canvas, maxAnisotropy);
}

export function createPicnicMatTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const size = 32;
  for (let y = 0; y < 256; y += size) {
    for (let x = 0; x < 256; x += size) {
      const ix = x / size;
      const iy = y / size;
      if ((ix + iy) % 2 === 0) {
        ctx.fillStyle = '#fff5f5';
      } else if (ix % 2 === 1 && iy % 2 === 1) {
        ctx.fillStyle = '#ef4444';
      } else {
        ctx.fillStyle = '#fca5a5';
      }
      ctx.fillRect(x, y, size, size);
    }
  }

  // Crisp stitched border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.strokeRect(5, 5, 246, 246);

  return finalizeColorTexture(canvas, maxAnisotropy, 2, 2);
}

export function createAvatarFaceTexture(maxAnisotropy: number, isGirl: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Warm skin tone matching head material
  ctx.fillStyle = '#fbd3b4';
  ctx.fillRect(0, 0, 256, 256);

  // Rosy cheeks
  ctx.fillStyle = 'rgba(248, 113, 113, 0.42)';
  ctx.beginPath();
  ctx.ellipse(66, 154, 22, 13, 0, 0, Math.PI * 2);
  ctx.ellipse(190, 154, 22, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Expressive Roblox-inspired big friendly eyes
  const drawEye = (cx: number) => {
    ctx.fillStyle = '#311b0e';
    ctx.beginPath();
    ctx.ellipse(cx, 116, 17, 21, 0, 0, Math.PI * 2);
    ctx.fill();

    // Specular sparkle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 5, 108, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 6, 122, 3, 0, Math.PI * 2);
    ctx.fill();

    if (isGirl) {
      ctx.strokeStyle = '#311b0e';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 16, 102);
      ctx.lineTo(cx - 24, 94);
      ctx.moveTo(cx + 16, 102);
      ctx.lineTo(cx + 24, 94);
      ctx.stroke();
    }
  };

  drawEye(88);
  drawEye(168);

  // Eyebrows
  ctx.strokeStyle = '#4a2b16';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(88, 92, 20, Math.PI * 1.18, Math.PI * 1.82);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(168, 92, 20, Math.PI * 1.18, Math.PI * 1.82);
  ctx.stroke();

  // Happy smile
  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(128, 152, 26, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  return finalizeColorTexture(canvas, maxAnisotropy);
}

export function createSignboardTexture(
  maxAnisotropy: number,
  title: string,
  subtitle: string,
  badgeColor: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Warm wooden sign background
  ctx.fillStyle = '#d99b59';
  ctx.fillRect(0, 0, 512, 256);

  // Inner cream placard
  ctx.fillStyle = '#fffbeb';
  ctx.beginPath();
  ctx.roundRect(22, 22, 468, 212, 22);
  ctx.fill();

  // Colored border
  ctx.strokeStyle = badgeColor;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.roundRect(22, 22, 468, 212, 22);
  ctx.stroke();

  // Top accent pill header
  ctx.fillStyle = badgeColor;
  ctx.beginPath();
  ctx.roundRect(48, 38, 416, 66, 16);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px Fredoka, Nunito, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 256, 72);

  ctx.fillStyle = '#334155';
  ctx.font = 'bold 28px Nunito, sans-serif';
  ctx.fillText(subtitle, 256, 156);

  ctx.fillStyle = badgeColor;
  ctx.font = 'bold 22px Nunito, sans-serif';
  ctx.fillText('Dekati atau Klik untuk Misi!', 256, 204);

  return finalizeColorTexture(canvas, maxAnisotropy);
}

export function createRiceFaceTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 128, 128);

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(44, 58, 7, 0, Math.PI * 2);
  ctx.arc(84, 58, 7, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fda4af';
  ctx.beginPath();
  ctx.arc(32, 70, 8, 0, Math.PI * 2);
  ctx.arc(96, 70, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(64, 68, 10, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  return finalizeColorTexture(canvas, maxAnisotropy);
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.5)');
  grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.22)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
