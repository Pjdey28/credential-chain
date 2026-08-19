import { prisma } from "./prisma";
import { hashBlock, sha256 } from "./crypto";

const GENESIS_HASH = "0".repeat(64);

export interface LedgerVerificationResult {
  valid: boolean;
  totalBlocks: number;
  invalidBlock?: number;
  reason?: string;
}

export async function getLatestBlock() {
  return prisma.ledgerBlock.findFirst({
    orderBy: {
      blockIndex: "desc",
    },
  });
}

export async function getNextBlockIndex(): Promise<number> {
  const latestBlock = await getLatestBlock();

  if (!latestBlock) {
    return 0;
  }

  return latestBlock.blockIndex + 1;
}

export async function addBlock(params: {
  credentialId: string;
  dataHash: string;
  issuerId: string;
}) {
  const latestBlock = await getLatestBlock();

  const blockIndex = latestBlock
    ? latestBlock.blockIndex + 1
    : 0;

  const previousHash = latestBlock
    ? latestBlock.currentHash
    : GENESIS_HASH;

  const timestamp = new Date();

  const currentHash = hashBlock(
    blockIndex,
    params.dataHash,
    previousHash,
    timestamp
  );

  return prisma.ledgerBlock.create({
    data: {
      blockIndex,
      credentialId: params.credentialId,
      dataHash: params.dataHash,
      previousHash,
      currentHash,
      timestamp,
      issuerId: params.issuerId,
    },
  });
}

export async function verifyLedger(): Promise<LedgerVerificationResult> {
  const blocks = await prisma.ledgerBlock.findMany({
    orderBy: {
      blockIndex: "asc",
    },
  });

  if (blocks.length === 0) {
    return {
      valid: true,
      totalBlocks: 0,
    };
  }

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    const expectedPreviousHash =
      i === 0
        ? GENESIS_HASH
        : blocks[i - 1].currentHash;

    if (block.previousHash !== expectedPreviousHash) {
      return {
        valid: false,
        totalBlocks: blocks.length,
        invalidBlock: block.blockIndex,
        reason: "Previous hash mismatch",
      };
    }

    const expectedCurrentHash = hashBlock(
      block.blockIndex,
      block.dataHash,
      block.previousHash,
      block.timestamp
    );

    if (block.currentHash !== expectedCurrentHash) {
      return {
        valid: false,
        totalBlocks: blocks.length,
        invalidBlock: block.blockIndex,
        reason: "Current hash mismatch",
      };
    }
  }

  return {
    valid: true,
    totalBlocks: blocks.length,
  };
}

export async function calculateLedgerFingerprint(): Promise<string> {
  const blocks = await prisma.ledgerBlock.findMany({
    orderBy: {
      blockIndex: "asc",
    },
    select: {
      currentHash: true,
    },
  });

  return sha256(
    blocks.map((block: { currentHash: any; }) => block.currentHash).join("|")
  );
}