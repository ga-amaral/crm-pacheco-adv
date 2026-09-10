import { describe, expect, it } from "vitest";
import { toggleSelection } from "./selection";

describe("bulk selection", () => {
  it("toggles one id without affecting the others", () => {
    expect(toggleSelection(["a", "b"], "b")).toEqual(["a"]);
    expect(toggleSelection(["a"], "c")).toEqual(["a", "c"]);
  });
});
