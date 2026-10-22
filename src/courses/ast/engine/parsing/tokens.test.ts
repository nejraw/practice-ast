import { describe, expect, it } from "vitest";
import { tokenize, tokensOf } from "./tokens";

const texts = (code: string) => tokensOf(tokenize(code)).map((token) => token.text);
const categories = (code: string) => tokensOf(tokenize(code)).map((token) => `${token.category}:${token.text}`);

describe("tokenize", () => {
  it("turns characters into tokens and skips whitespace", () => {
    expect(texts("price * quantity + tax")).toEqual(["price", "*", "quantity", "+", "tax"]);
    expect(tokenize("price * quantity").pieces.filter((piece) => piece.kind === "skipped")).toHaveLength(2);
  });

  it("takes the longest match", () => {
    expect(texts("a+++b")).toEqual(["a", "++", "+", "b"]);
    expect(texts("a+++++b")).toEqual(["a", "++", "++", "+", "b"]);
  });

  it("reads / as division or a regex depending on what came before", () => {
    expect(categories("x = a / b / g")).toEqual(["name:x", "operator:=", "name:a", "operator:/", "name:b", "operator:/", "name:g"]);
    expect(categories("x = /b/g")).toEqual(["name:x", "operator:=", "regexp:/b/g"]);
  });

  it("splits template literals around their placeholders", () => {
    expect(texts("`Hi ${name}!`")).toEqual(["`", "Hi ", "${", "name", "}", "!", "`"]);
  });

  it("leaves contextual keywords as names", () => {
    expect(categories("let of = 1")).toEqual(["name:let", "name:of", "operator:=", "number:1"]);
    expect(categories("const x")[0]).toBe("keyword:const");
  });

  it("keeps comments and newlines as skipped pieces", () => {
    const skipped = tokenize("a // note\nb").pieces.filter((piece) => piece.kind === "skipped");
    expect(skipped.map((piece) => piece.kind === "skipped" && piece.what)).toEqual(["whitespace", "comment", "newline"]);
  });

  it("stops at characters it can't read", () => {
    const result = tokenize('a = "unterminated');
    expect(result.error?.pos).toBe(4);
    expect(tokensOf(result).map((token) => token.text)).toEqual(["a", "="]);
  });
});
