import { describe, expect, it } from "vitest";
import { mapOffset, mapSpan } from "./position";

describe("mapOffset", () => {
  const before = "let total = 1;";
  const after = "let grandtotal = 1;";

  it("keeps offsets before the edit and shifts the ones after it", () => {
    expect(mapOffset(before, after, 3)).toBe(3);
    expect(mapOffset(before, after, before.indexOf("="))).toBe(after.indexOf("="));
    expect(mapOffset(after, before, after.length)).toBe(before.length);
  });

  it("has no answer inside the edited stretch", () => {
    expect(mapOffset(after, before, after.indexOf("and"))).toBeNull();
  });

  it("maps spans only when both ends survive", () => {
    expect(mapSpan(before, after, { start: 12, end: 13 })).toEqual({ start: 17, end: 18 });
    // "grandtotal" ends up as "total"; a span starting inside "grand" has nowhere to go.
    expect(mapSpan(after, before, { start: 4, end: 14 })).toEqual({ start: 4, end: 9 });
    expect(mapSpan(after, before, { start: 6, end: 14 })).toBeNull();
  });
});
