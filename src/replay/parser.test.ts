import { describe, expect, test } from "vitest";
import { AWBWReplay, ReplayParser } from "./parser";

describe("ReplayParser", () => {
  test("parse null", () => {
    const data = "N;"
    const parser = new ReplayParser(data);

    expect(parser.parseValue()).toBe(null);
  });

  test("parse string", () => {
    const data = "s:5:\"moved\";";
    const parser = new ReplayParser(data);

    expect(parser.parseValue()).toBe("moved");
  });

  test("parse integer", () => {
    const data = "i:0;";
    const parser = new ReplayParser(data);

    expect(parser.parseValue()).toBe(0);
  });

  test("parse float", () => {
    const data = "d:7.7;";
    const parser = new ReplayParser(data);

    expect(parser.parseValue()).toEqual(7.7);
  });

  test("parse object", () => {
    const data = "O:8:\"position\":2:{s:1:\"x\";i:22;s:1:\"y\";i:13;}"
    const parser = new ReplayParser(data);
    const result = parser.parseValue() as AWBWReplay;
    const position = result.position as AWBWReplay;

    expect(position["x"]).toBe(22);
    expect(position["y"]).toBe(13);
  });

  test("parse array", () => {
    const data = "a:2:{i:0;s:1:\"x\";i:1;s:1:\"y\";}"
    const parser = new ReplayParser(data);
    const result = parser.parseValue() as AWBWReplay[];

    expect(result[0]).toBe("x");
    expect(result[1]).toBe("y");
  });
});
