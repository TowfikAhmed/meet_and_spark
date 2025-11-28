// A lightweight pseudo-random noise generator for flow fields.
// Based on a simplified permutation table approach.

const PERM_SIZE = 256;
const perm = new Uint8Array(PERM_SIZE * 2);

// Initialize permutation table with deterministic randomness for consistent aesthetic
for (let i = 0; i < PERM_SIZE; i++) {
  perm[i] = i;
}

// Fisher-Yates shuffle with a seeded random to ensure consistent visual start
let seed = 1234;
function seededRandom() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

for (let i = PERM_SIZE - 1; i > 0; i--) {
  const r = Math.floor(seededRandom() * (i + 1));
  const t = perm[i];
  perm[i] = perm[r];
  perm[r] = t;
}
for (let i = 0; i < PERM_SIZE; i++) {
  perm[PERM_SIZE + i] = perm[i];
}

function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(t: number, a: number, b: number) {
  return a + t * (b - a);
}

function grad(hash: number, x: number, y: number, z: number) {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

// 3D Noise function for time-varying flow fields
export function noise3D(x: number, y: number, z: number) {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;

  x -= Math.floor(x);
  y -= Math.floor(y);
  z -= Math.floor(z);

  const u = fade(x);
  const v = fade(y);
  const w = fade(z);

  const A = perm[X] + Y;
  const AA = perm[A] + Z;
  const AB = perm[A + 1] + Z;
  const B = perm[X + 1] + Y;
  const BA = perm[B] + Z;
  const BB = perm[B + 1] + Z;

  return lerp(w,
    lerp(v,
      lerp(u, grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z)),
      lerp(u, grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z))
    ),
    lerp(v,
      lerp(u, grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1)),
      lerp(u, grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1))
    )
  );
}