import {
  describe,
  expect,
  it,
} from "vitest";

import {
  hashBlock,
} from "../lib/crypto";

describe("Hash Chain", () => {
  const GENESIS_HASH = "0".repeat(64);

  it("creates a valid genesis block", () => {
    const timestamp = new Date(
      "2026-08-20T10:00:00.000Z"
    );

    const dataHash = "credential-data-hash";

    const currentHash = hashBlock(
      0,
      dataHash,
      GENESIS_HASH,
      timestamp
    );

    expect(currentHash).toHaveLength(64);
    expect(GENESIS_HASH).toHaveLength(64);
  });

  it("links blocks using the previous block hash", () => {
    const timestamp1 = new Date(
      "2026-08-20T10:00:00.000Z"
    );

    const block0Hash = hashBlock(
      0,
      "credential-0",
      GENESIS_HASH,
      timestamp1
    );

    const timestamp2 = new Date(
      "2026-08-20T10:01:00.000Z"
    );

    const block1Hash = hashBlock(
      1,
      "credential-1",
      block0Hash,
      timestamp2
    );

    expect(block1Hash).not.toBe(block0Hash);
  });

  it("detects when a block is modified", () => {
    const timestamp = new Date(
      "2026-08-20T10:00:00.000Z"
    );

    const originalDataHash = "original-data";

    const originalBlockHash = hashBlock(
      0,
      originalDataHash,
      GENESIS_HASH,
      timestamp
    );

    const tamperedBlockHash = hashBlock(
      0,
      "tampered-data",
      GENESIS_HASH,
      timestamp
    );

    expect(tamperedBlockHash).not.toBe(
      originalBlockHash
    );
  });

  it("detects broken chain relationships", () => {
    const timestamp1 = new Date(
      "2026-08-20T10:00:00.000Z"
    );

    const block0Hash = hashBlock(
      0,
      "credential-0",
      GENESIS_HASH,
      timestamp1
    );

    const timestamp2 = new Date(
      "2026-08-20T10:01:00.000Z"
    );

    const block1Hash = hashBlock(
      1,
      "credential-1",
      block0Hash,
      timestamp2
    );

    const fakePreviousHash = "f".repeat(64);

    const tamperedBlock1Hash = hashBlock(
      1,
      "credential-1",
      fakePreviousHash,
      timestamp2
    );

    expect(tamperedBlock1Hash).not.toBe(
      block1Hash
    );

    expect(fakePreviousHash).not.toBe(
      block0Hash
    );
  });
});