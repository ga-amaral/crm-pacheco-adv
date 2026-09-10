import { describe, expect, it } from "vitest";
import { getInitials } from "./profile";
import { canManageUsers, getTemperatureLabel, getTemperatureTone } from "./profile";

describe("profile initials", () => {
  it("uses the first letters of the first and last names", () => {
    expect(getInitials("Maria Clara Silva")).toBe("MS");
  });

  it("falls back to the email when the name is empty", () => {
    expect(getInitials("", "ana.pacheco@example.com")).toBe("AP");
  });

  it("translates temperature values for display", () => {
    expect(getTemperatureLabel("Cold")).toBe("Fria");
    expect(getTemperatureLabel("Warm")).toBe("Morna");
    expect(getTemperatureLabel("Hot")).toBe("Quente");
  });

  it("only allows admins and owners to manage users", () => {
    expect(canManageUsers("Admin Master")).toBe(true);
    expect(canManageUsers("Owner")).toBe(true);
    expect(canManageUsers("User")).toBe(false);
  });

  it("assigns a visual tone to each temperature", () => {
    expect(getTemperatureTone("Cold")).toContain("blue");
    expect(getTemperatureTone("Warm")).toContain("amber");
    expect(getTemperatureTone("Hot")).toContain("red");
  });
});
