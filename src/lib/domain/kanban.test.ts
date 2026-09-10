import { describe, expect, it } from "vitest";
import { moveLeadToColumn } from "./kanban";

describe("kanban movement", () => {
  it("updates the selected lead column without changing other leads", () => {
    expect(moveLeadToColumn([{ id: "1", pipeline_column: "Novos" }, { id: "2", pipeline_column: "Proposta" }], "1", "Fechados")).toEqual([{ id: "1", pipeline_column: "Fechados" }, { id: "2", pipeline_column: "Proposta" }]);
  });
});
