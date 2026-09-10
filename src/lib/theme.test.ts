import { describe, expect, it } from "vitest";
import { normalizeTheme } from "./theme";

describe("theme preference", () => {
  it("accepts only the supported light and dark themes", () => {
    expect(normalizeTheme("dark")).toBe("dark");
    expect(normalizeTheme("light")).toBe("light");
    expect(normalizeTheme("system")).toBe("light");
    expect(normalizeTheme(null)).toBe("light");
  });
});
