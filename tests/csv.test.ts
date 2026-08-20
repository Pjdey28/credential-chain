import { describe, expect, it } from "vitest";

import { parseCsv } from "../lib/csv";

describe("CSV parsing", () => {
  it("parses credential rows and quoted commas", () => {
    const rows = parseCsv(
      "studentName,studentId,institution\n\"Doe, Jane\",S001,\"Example Institute, Main Campus\""
    );

    expect(rows).toEqual([
      {
        studentName: "Doe, Jane",
        studentId: "S001",
        institution: "Example Institute, Main Campus",
      },
    ]);
  });
});