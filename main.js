const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

// 粒子タイプ
const AIR = 0;
const SAND = 1;
const WATER = 2;
const ROCK = 3;

// 粒子の物理パラメータ
const particleInfo = {
  [AIR]:   { color: [0, 0, 0], density: 0, friction: 0, fluidity: 0 },
  [SAND]:  { color: [230, 200, 80], density: 3, friction: 1, fluidity: 1 },
  [WATER]: { color: [80, 120, 255], density: 1, friction: 0.1, fluidity: 5 },
  [ROCK]:  { color: [150, 150, 150], density: 10, friction: 5, fluidity: 0 }
};

// グリッド初期化
const grid = Array.from({ length: H }, () => Array(W).fill(AIR));

// 現在選択中の粒子
let currentType = SAND;

// ボタンで粒子切り替え
document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    const type = btn.dataset.type;
    if (type === "sand") currentType = SAND;
    if (type === "water") currentType = WATER;
    if (type === "rock") currentType = ROCK;
  });
});

// マウスで粒子を置く
let isDown = false;
canvas.addEventListener("mousedown", () => isDown = true);
canvas.addEventListener("mouseup", () => isDown = false);
canvas.addEventListener("mouseleave", () => isDown = false);

canvas.addEventListener("mousemove", e => {
  if (!isDown) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(e.clientX - rect.left);
  const y = Math.floor(e.clientY - rect.top);
  if (x >= 0 && x < W && y >= 0 && y < H) {
    grid[y][x] = currentType;
  }
});

// 粒子の交換（密度で判定）
function trySwap(x1, y1, x2, y2) {
  const a = grid[y1][x1];
  const b = grid[y2][x2];
  if (particleInfo[a].density > particleInfo[b].density) {
    grid[y1][x1] = b;
    grid[y2][x2] = a;
    return true;
  }
  return false;
}

// 物理更新
function update() {
  for (let y = H - 2; y >= 0; y--) {
    for (let x = 0; x < W; x++) {
      const type = grid[y][x];
      if (type === AIR || type === ROCK) continue;

      const info = particleInfo[type];

      // 下へ落ちる
      if (trySwap(x, y, x, y + 1)) continue;

      // 砂・水の斜め落下
      const dirs = [-1, 1];
      for (const dx of dirs) {
        if (x + dx >= 0 && x + dx < W) {
          if (trySwap(x, y, x + dx, y + 1)) break;
        }
      }

      // 水の横流れ
      if (type === WATER) {
        const flow = Math.floor(info.fluidity);
        const dx = Math.random() < 0.5 ? -flow : flow;
        const nx = x + dx;
        if (nx >= 0 && nx < W) {
          if (grid[y][nx] === AIR) {
            grid[y][nx] = WATER;
            grid[y][x] = AIR;
          }
        }
      }
    }
  }
}

// 描画
function draw() {
  const img = ctx.createImageData(W, H);
  const data = img.data;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const type = grid[y][x];
      const [r, g, b] = particleInfo[type].color;
      const i = (y * W + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
}

// メインループ
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
