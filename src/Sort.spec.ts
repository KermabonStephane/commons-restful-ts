import {describe, it, expect} from "vitest";
import {Sort, SortOrder, parse} from "./Sort";

describe("We parse a sort string", () => {
    it("should parse a sort string)", () => {
        const sorts: Sort[] = parse("firstName:asc,lastName:desc");
        expect(sorts.length).toBe(2)
        expect(sorts[0].property).toBe("firstName")
        expect(sorts[0].order).toBe(SortOrder.ASC)
        expect(sorts[1].property).toBe("lastName")
        expect(sorts[1].order).toBe(SortOrder.DESC)
    });
})

describe("We parse a single sort string", () => {
   const inputs = [
       {input: "firstName", expectedProperty: "firstName", expectedOrder: SortOrder.ASC},
       {input: "lastName", expectedProperty: "lastName", expectedOrder: SortOrder.ASC},
       {input: "firstName:asc", expectedProperty: "firstName", expectedOrder: SortOrder.ASC},
       {input: "lastName:desc", expectedProperty: "lastName", expectedOrder: SortOrder.DESC},
       {input: "firstName:ASC", expectedProperty: "firstName", expectedOrder: SortOrder.ASC},
       {input: "lastName:DESC", expectedProperty: "lastName", expectedOrder: SortOrder.DESC},
       {input: "first_name:asc", expectedProperty: "first_name", expectedOrder: SortOrder.ASC},
   ];

   it.each(inputs)("should parse a single sort string", ({input, expectedProperty, expectedOrder}) => {
       const sorts: Sort[] = parse(input);
       expect(sorts.length).toBe(1);
       expect(sorts[0].property).toBe(expectedProperty);
       expect(sorts[0].order).toBe(expectedOrder);
       });
});

describe("We parse sort string with spaces", () => {
    it("should parse a sort string with spaces", () => {
        const sorts: Sort[] = parse(" firstName : asc , lastName : desc ");
        expect(sorts.length).toBe(2);
        expect(sorts[0].property).toBe("firstName")
        expect(sorts[0].order).toBe(SortOrder.ASC)
        expect(sorts[1].property).toBe("lastName")
        expect(sorts[1].order).toBe(SortOrder.DESC)
    });
})

describe("We parse sort string with a Bad format", () => {
    const inputStrings = [
        {inputString: "", expectedError: "Bad format of the sorts string ''"},
        {inputString: "a = b", expectedError: "Bad format of the sorts string 'a = b'"},
        {inputString: "a:petit", expectedError: "Bad format of the sorts string 'a:petit'"},
        ]
    it.each(inputStrings)("should throw error for bad format", (input) => {
        expect(() => parse(input.inputString)).toThrow(input.expectedError);
    });
})