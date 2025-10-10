import {describe, it, expect} from "vitest";
import {parseRangeHeader} from "./HeaderPageable";

describe("HeaderPageable", () => {
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

    it("should throw error for null header", () => {
        // @ts-ignore
        expect(() => parseRangeHeader(null)).toThrow("Header cannot be null or empty");
    });

    it("should throw error for empty header", () => {
        expect(() => parseRangeHeader("")).toThrow("Header cannot be null or empty");
    });

    it("should throw error for header not starting with 'Range:'", () => {
        const header = "X-Range: items=0-9";
        expect(() => parseRangeHeader(header)).toThrow(`Header '${header}' is not in the correct format. The format must be like 'Range: elements=0-9'`);
    });

    it("should throw error for header with incorrect format (missing '=')", () => {
        const header = "Range: items0-9";
        expect(() => parseRangeHeader(header)).toThrow(`Header '${header}' is not in the correct format. The format must be like 'Range: elements=0-9'`);
    });

    it("should throw error for header with end less than start", () => {
        const header = "Range: items=9-0";
        expect(() => parseRangeHeader(header)).toThrow(`Header '${header}' is not in the correct format. The end must be greater than the start`);
    });

    it("should throw error for header with end equal to start", () => {
        const header = "Range: items=5-5";
        expect(() => parseRangeHeader(header)).toThrow(`Header '${header}' is not in the correct format. The end must be greater than the start`);
    });
});
