const DIRS = [[0, 1], [1, 0], [1, 1], [-1, 1]];
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const rand = (n) => Math.floor(Math.random() * n);

function tryPlace(grid, size, word) {
  for (let attempt = 0; attempt < 400; attempt++) {
    const [dr, dc] = DIRS[rand(DIRS.length)];
    const r = rand(size), c = rand(size);
    const er = r + dr * (word.length - 1), ec = c + dc * (word.length - 1);
    if (er < 0 || er >= size || ec >= size) continue;
    let ok = true;
    for (let i = 0; i < word.length; i++) {
      const ch = grid[r + dr * i][c + dc * i];
      if (ch && ch !== word[i]) { ok = false; break; }
    }
    if (!ok) continue;
    const cells = [];
    for (let i = 0; i < word.length; i++) {
      grid[r + dr * i][c + dc * i] = word[i];
      cells.push([r + dr * i, c + dc * i]);
    }
    return cells;
  }
  return null;
}

export function generateGrid(keys, size = 16) {
  for (let round = 0; round < 50; round++) {
    const grid = Array.from({ length: size }, () => Array(size).fill(""));
    const placements = {};
    const sorted = [...keys].sort((a, b) => b.length - a.length);
    let failed = false;
    for (const k of sorted) {
      const cells = tryPlace(grid, size, k);
      if (!cells) { failed = true; break; }
      placements[k] = cells;
    }
    if (failed) continue;
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (!grid[r][c]) grid[r][c] = ALPHA[rand(26)];
    return { grid, placements };
  }
  throw new Error("Não foi possível gerar a grade");
}

export function lineCells(a, b) {
  const dr = b[0] - a[0], dc = b[1] - a[1];
  if (!(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) return [a];
  const len = Math.max(Math.abs(dr), Math.abs(dc));
  const sr = Math.sign(dr), sc = Math.sign(dc);
  return Array.from({ length: len + 1 }, (_, i) => [a[0] + sr * i, a[1] + sc * i]);
}
