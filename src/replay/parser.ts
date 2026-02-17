export type AWBWReplay = { [key: string]: AWBWReplayValue };
export type AWBWReplayValue = null | number | string | AWBWReplay | AWBWReplayValue[];

/** Parses the replay file into a Typescript object.
  * 
  * Current supports the following format:
  * - `N;` = null
  * - `s:<integer>:"<string>";` = string
  * - `i:<integer>;` = integer
  * - `d:<float>;` = float
  * - `O:<integer>:"<string>":<integer>:{ ... }` = object of string-value pairs
  * - `a:<integer>:{ ... }` = array of integer-value pairs
  */
export class ReplayParser {
  data: string;
  position: number = 0;

  constructor(data: string) {
    this.data = data;
  }

  parseValue(): AWBWReplayValue {
    const character = this.data[this.position];

    switch (character) {
      case "N":
        return this.parseNull();
      case "s":
        return this.parseString();
      case "i":
        return this.parseInteger();
      case "d":
        return this.parseFloatd();
      case "O":
        return this.parseObject();
      case "a":
        return this.parseArray();
      default:
        throw new Error(
          `Failed to parse replay: unexpected character '${character}' at position ${this.position}`
        );
    }
  }

  /** Parses null value: `N;`.
    */
  private parseNull(): null {
    this.expect("N");
    this.expect(";");
    return null;
  }

  /** Parses string value: `s:<integer>:"<string>";`.
    */
  private parseString(): string {
    this.expect("s");
    this.expect(":");

    const length = parseInt(this.readUntil(":"), 10);
    this.expect(":");
    this.expect("\"");

    const value = this.readSubstring(length);
    this.expect("\"");
    this.expect(";");

    return value;
  }

  /** Parses integer value: `i:<integer>;`.
    */
  private parseInteger(): number {
    this.expect("i");
    this.expect(":");

    const value = parseInt(this.readUntil(";"), 10);
    this.expect(";");

    return value;
  }

  /** Parse float value: `d:<float>;`.
    */
  private parseFloatd(): number {
    this.expect("d");
    this.expect(":");

    const value = Number(this.readUntil(";"));
    this.expect(";");

    return value;
  }

  /** Parse object value: `O:<integer>:"<string>":<integer>:{ ... }` where each
    * property is a string-value pair `s:<integer>:"<string>";< ... >`.
    */
  private parseObject(): AWBWReplay {
    this.expect("O");
    this.expect(":");

    const nameLength = parseInt(this.readUntil(":"), 10);
    this.expect(":");
    this.expect("\"");

    const name = this.readSubstring(nameLength);
    this.expect("\"");
    this.expect(":");
    
    const propertyCount = parseInt(this.readUntil(":"), 10);
    this.expect(":");
    this.expect("{");

    const object: AWBWReplay = {};
    object[name] = {};

    for (let i = 0; i < propertyCount; i++) {
      const key = this.parseString();
      const value = this.parseValue();

      object[name][key] = value;
    }

    this.expect("}");

    return object;
  }

  /** Parses array value: `a:<integer>:{ ... }` where each element is an
    * integer-value pair `i:<integer>;< ... >`.
    */
  private parseArray(): AWBWReplayValue[] {
    this.expect("a");
    this.expect(":");

    const elementCount = parseInt(this.readUntil(":"), 10);
    this.expect(":");
    this.expect("{");

    const array: AWBWReplayValue[] = [];

    for (let i = 0; i < elementCount; i++) {
      const index = this.parseInteger();
      const value = this.parseValue();

      if (i !== index) {
        throw new Error(
          `Failed to parse replay: expected index ${i}, found ${index} at position ${this.position}`
        );
      }

      array.push(value);
    }

    this.expect("}");

    return array;
  }

  private expect(expected: string): void {
    if (this.position >= this.data.length) {
      throw new Error(
        `Failed to parse replay: unexpected end of data, expected ${expected}`
      );
    }

    const actual = this.data[this.position];

    if (actual !== expected) {
      throw new Error(
        `Failed to parse replay: expected '${expected}', found '${actual}' at position ${this.position}`
      );
    }

    this.position++;
  }

  private readSubstring(length: number): string {
    const start = this.position;
    this.position += length;

    if (this.position > this.data.length) {
      throw new Error(
        `Failed to parse replay: unexpected end of data at position ${this.position}`
      );
    }

    return this.data.substring(start, this.position);
  }

  private readUntil(delimiter: string): string {
    const start = this.position;

    while (this.position < this.data.length && this.data[this.position] !== delimiter) {
      this.position++;
    }

    return this.data.substring(start, this.position);
  }
}
