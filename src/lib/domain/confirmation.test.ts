import { describe, expect, it } from "vitest";
import { getDeleteConfirmationMessage } from "./confirmation";

describe("delete confirmation", () => {
  it("warns that deletion cannot be undone", () => {
    expect(getDeleteConfirmationMessage(1)).toContain("não pode ser desfeita");
    expect(getDeleteConfirmationMessage(3)).toContain("3 leads");
  });
});
