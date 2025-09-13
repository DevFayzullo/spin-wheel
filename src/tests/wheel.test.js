import { describe, it, expect } from "vitest";
import { pickIndexFair } from "../src/utils/wheel";

describe("pickIndexFair", () => {
  it("maps 0deg to index 0 when pointer is top", () => {
    const idx = pickIndexFair(6, 0);
    expect(idx).toBe(0);
  });
  it("respects slice boundaries", () => {
    // 6 slices => 60deg each
    expect(pickIndexFair(6, 10)).toBe(0);
    expect(pickIndexFair(6, 59.9)).toBe(0);
    expect(pickIndexFair(6, 60)).toBe(5); // wrap logic due to pointer inversion
  });
});
