/**
 * Real V8 bytecode, captured with `node --print-bytecode` (Node 26.11.1).
 * Each instruction is mapped by hand to the source range of the tree node it
 * came from; `bytecode.test.ts` checks every range is a real node.
 */

export interface BytecodeLine {
  /** Byte offset in the function's bytecode, as V8 prints it ("@ 2"). */
  offset: number;
  /** The instruction's actual bytes, in hex. */
  bytes: string;
  /** V8's readable form of those bytes. */
  instruction: string;
  /** What it does, in plain words. */
  meaning: string;
  /** The source range of the node this instruction came from. */
  range: [number, number];
  /** For jumps: the offset execution continues at when the jump is taken. */
  jumpTo?: number;
}

export interface BytecodeExample {
  code: string;
  /** What V8's register names stand for in this function. */
  registers: Array<[string, string]>;
  lines: BytecodeLine[];
}

export const NODE_VERSION = "Node 26.11.1";

export type BytecodeExampleName = "total" | "max";

export const bytecodeExamples: Record<BytecodeExampleName, BytecodeExample> = {
  total: {
    code: "function total(price, quantity, tax) {\n  return price * quantity + tax;\n}",
    registers: [
      ["a0", "price"],
      ["a1", "quantity"],
      ["a2", "tax"],
      ["r0", "a spare register"],
    ],
    lines: [
      { offset: 0, bytes: "0b 04", instruction: "Ldar a1", meaning: "Load quantity into the accumulator.", range: [56, 64] },
      { offset: 2, bytes: "42 03 01", instruction: "Mul a0, FBV[1]", meaning: "Multiply it by price.", range: [48, 64] },
      { offset: 5, bytes: "d2", instruction: "Star0", meaning: "Store the product in r0, to free up the accumulator.", range: [48, 64] },
      { offset: 6, bytes: "0b 05", instruction: "Ldar a2", meaning: "Load tax.", range: [67, 70] },
      { offset: 8, bytes: "40 f9 00", instruction: "Add r0, FBV[0]", meaning: "Add the product from r0.", range: [48, 70] },
      { offset: 11, bytes: "b7", instruction: "Return", meaning: "Return what's in the accumulator.", range: [41, 71] },
    ],
  },
  max: {
    code: "function max(a, b) {\n  if (a > b) return a;\n  return b;\n}",
    registers: [
      ["a0", "a"],
      ["a1", "b"],
    ],
    lines: [
      { offset: 0, bytes: "0b 04", instruction: "Ldar a1", meaning: "Load b.", range: [31, 32] },
      { offset: 2, bytes: "78 03 00 00", instruction: "TestGreaterThan a0, [0]", meaning: "Is a greater than b? The answer goes in the accumulator.", range: [27, 32] },
      { offset: 6, bytes: "a6 05", instruction: "JumpIfFalse [5]", meaning: "If not, jump ahead to @ 11, skipping the first return.", range: [23, 43], jumpTo: 11 },
      { offset: 8, bytes: "0b 03", instruction: "Ldar a0", meaning: "Load a.", range: [41, 42] },
      { offset: 10, bytes: "b7", instruction: "Return", meaning: "Return it.", range: [34, 43] },
      { offset: 11, bytes: "0b 04", instruction: "Ldar a1", meaning: "Load b.", range: [53, 54] },
      { offset: 13, bytes: "b7", instruction: "Return", meaning: "Return it.", range: [46, 55] },
    ],
  },
};
