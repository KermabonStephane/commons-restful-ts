import {describe, it, expect} from "vitest";
import {parseContentRangeHeader, parseRangeHeader} from "./HeaderPageable";

describe("We parse a Range header", () => {
    const validRangeHeaders = [
        { header: "Range: items=0-9", expectedElementName: "items", expectedPage: 0, expectedSize: 10 },
        { header: "Range: users=10-19", expectedElementName: "users", expectedPage: 1, expectedSize: 10 },
        { header: "Range: products=100-149", expectedElementName: "products", expectedPage: 2, expectedSize: 50 },
        { header: "Range: firstNames=0-9", expectedElementName: "firstNames", expectedPage: 0, expectedSize: 10 },
        { header: "Range: first-names=0-9", expectedElementName: "first-names", expectedPage: 0, expectedSize: 10 },
        { header: "Range: first_names=0-9", expectedElementName: "first_names", expectedPage: 0, expectedSize: 10 },
    ];

    it.each(validRangeHeaders)("should parse a valid range header: %s", ({ header, expectedElementName, expectedPage, expectedSize }) => {
        const pageable = parseRangeHeader(header);
        expect(pageable.elementName).toBe(expectedElementName);
        expect(pageable.page).toBe(expectedPage);
        expect(pageable.size).toBe(expectedSize);
        expect(pageable.total).toBe(-1); // Default total for parsed Range headers
    });

    const nullOrEmptyHeaders = [null, "", undefined];

    it.each(nullOrEmptyHeaders)("should throw error for null header", (header) => {
        // @ts-ignore
        expect(() => parseRangeHeader(header)).toThrow("Header cannot be null or empty");
    });

    const invalidHeaders = ["X-Range: items=0-9", "Range: items0-9", "Range: "]

    it.each(invalidHeaders)("should throw error for header not starting with 'Range:'", (header) => {
        expect(() => parseRangeHeader(header)).toThrow(`Header '${header}' is not in the correct format. The format must be like 'Range: elements=0-9'`);
    });

    const startGreaterOrEqualsThanEndHeader =  ["Range: items=9-0", "Range: items=5-5"]

    it.each(startGreaterOrEqualsThanEndHeader)("should throw error for header with end less than start", (header) => {
        expect(() => parseRangeHeader(header)).toThrow(`Header '${header}' is not in the correct format. The end must be greater than the start`);
    });
});

describe("We parse a Content-Range header", () => {
    const validRangeHeaders = [
        { header: "Content-Range: elements 0-9/100", expectedElementName: "elements", expectedPage: 0, expectedSize: 10, expectedTotal: 100 },
        { header: "Content-Range: users 10-19/100", expectedElementName: "users", expectedPage: 1, expectedSize: 10, expectedTotal: 100},
    ]

    it.each(validRangeHeaders)("should parse a valid header", ({header, expectedElementName, expectedPage, expectedSize, expectedTotal}) => {
        const pageable = parseContentRangeHeader(header);
        expect(pageable.elementName).toBe(expectedElementName);
        expect(pageable.page).toBe(expectedPage);
        expect(pageable.size).toBe(expectedSize);
        expect(pageable.total).toBe(expectedTotal);
    });

    const nullOrEmptyHeaders = [null, "", undefined];

    it.each(nullOrEmptyHeaders)("should throw error for null header", (header) => {
        // @ts-ignore
        expect(() => parseContentRangeHeader(header)).toThrow("Header cannot be null or empty");
    });

    const invalidHeaders = ["X-Content-Range: elements 0-9/100", "Content-Range: elements0-9/100"];

    it.each(invalidHeaders)("should throw error for bad format header", (header) => {
        // @ts-ignore
        expect(() => parseContentRangeHeader(header)).toThrow(`Header '${header}' is not in the correct format. The format must be like 'Content-Range: elements 0-9/100'`);
    });

    const badRangeHeaders = ["Content-Range: elements 10-0/100", "Content-Range: elements 10-9/100"];

    it.each(badRangeHeaders)("should throw error for bad range header", (header) => {
        // @ts-ignore
        expect(() => parseContentRangeHeader(header)).toThrow(`Header '${header}' is not in the correct format. The end must be greater than the start`);
    });

    it("should throw error for inconsistencies", () => {
        const header = "Content-Range: elements 10-19/10";
        // @ts-ignore
        expect(() => parseContentRangeHeader(header)).toThrow(`Header '${header}' is not in the correct format. The start must be less than the total`);
    });


});