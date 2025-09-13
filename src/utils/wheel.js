// Unbiased crypto RNG for fair picks
export function cryptoRandomInt(maxExclusive) {
  // returns int in [0, maxExclusive)
  const arr = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
  let r;
  do {
    crypto.getRandomValues(arr);
    r = arr[0];
  } while (r >= limit);
  return r % maxExclusive;
}

// Map wheel angle to index (0 is top)
export function pickIndexFair(itemsLen, offsetDeg) {
  // offsetDeg: rotation % 360
  const slice = 360 / itemsLen;
  const pointerDeg = (360 - offsetDeg) % 360; // top pointer
  return Math.floor(pointerDeg / slice);
}

// Auto choose black/white text based on background color
export function contrastOn(hexColor) {
  const hex = hexColor.startsWith("#") ? hexColor.slice(1) : hexColor;
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const int = parseInt(full, 16);
  const r = (int >> 16) & 255,
    g = (int >> 8) & 255,
    b = int & 255;
  const luminance =
    0.2126 * (r / 255) ** 2.2 +
    0.7152 * (g / 255) ** 2.2 +
    0.0722 * (b / 255) ** 2.2;
  return luminance > 0.5 ? "#111111" : "#FFFFFF";
}

// Pleasant pastel palette
export const PALETTE = [
  "#FDE68A",
  "#93C5FD",
  "#FCA5A5",
  "#A7F3D0",
  "#C4B5FD",
  "#FDBA74",
  "#86EFAC",
  "#9CA3AF",
  "#F9A8D4",
  "#67E8F9",
];

// Encode/Decode items to URL for share
export function encodeItemsToQuery(items) {
  const q = encodeURIComponent(items.join("|"));
  const url = new URL(window.location.href);
  if (items.length) url.searchParams.set("items", q);
  else url.searchParams.delete("items");
  return url.toString();
}
export function readItemsFromQuery() {
  const url = new URL(window.location.href);
  const q = url.searchParams.get("items");
  if (!q) return null;
  try {
    const decoded = decodeURIComponent(q);
    const arr = decoded
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);
    return arr.length ? arr : null;
  } catch {
    return null;
  }
}

// Remove items param from current URL (used on Clear)
export function stripItemsFromUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("items");
  window.history.replaceState({}, "", url.toString());
}
