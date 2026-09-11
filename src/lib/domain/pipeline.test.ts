import { describe, expect, it } from "vitest";
import { PIPELINE_COLUMNS } from "./pipeline";

describe("pipeline columns", () => {
  it("includes the disqualified column after closed leads", () => {
    expect(PIPELINE_COLUMNS).toEqual(["Novos", "Em contato", "Proposta", "Fechados", "Desqualificados"]);
  });
});
