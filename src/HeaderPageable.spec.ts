import {describe, it, expect} from "vitest";
import {
    parseContentRangeHeader,
    parseRangeHeader,
    parseAcceptRangesHeader,
    HeaderPageable,
    toBuilder,
    nextPage,
    previousPage,
    toRangeHeader,
    toContentRangeHeader,
    toAcceptRangesHeader
} from "./HeaderPageable";

describe("We parse a Range header", () => {
    const validRangeHeaders = [
        {header: "Range: items=0-9", expectedElementName: "items", expectedPage: 0, expectedSize: 10},
        {header: "Range: users=10-19", expectedElementName: "users", expectedPage: 1, expectedSize: 10},
        {header: "Range: products=100-149", expectedElementName: "products", expectedPage: 2, expectedSize: 50},
        {header: "Range: firstNames=0-9", expectedElementName: "firstNames", expectedPage: 0, expectedSize: 10},
        {header: "Range: first-names=0-9", expectedElementName: "first-names", expectedPage: 0, expectedSize: 10},
        {header: "Range: first_names=0-9", expectedElementName: "first_names", expectedPage: 0, expectedSize: 10},
    ];

    it.each(validRangeHeaders)("should parse a valid range header: %s", ({
                                                                             header,
                                                                             expectedElementName,
                                                                             expectedPage,
                                                                             expectedSize
                                                                         }) => {
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

    const startGreaterOrEqualsThanEndHeader = ["Range: items=9-0", "Range: items=5-5"]

    it.each(startGreaterOrEqualsThanEndHeader)("should throw error for header with end less than start", (header) => {
        expect(() => parseRangeHeader(header)).toThrow(`Header '${header}' is not in the correct format. The end must be greater than the start`);
    });
});

describe("We parse a Content-Range header", () => {
    const validRangeHeaders = [
        {
            header: "Content-Range: elements 0-9/100",
            expectedElementName: "elements",
            expectedPage: 0,
            expectedSize: 10,
            expectedTotal: 100
        },
        {
            header: "Content-Range: users 10-19/100",
            expectedElementName: "users",
            expectedPage: 1,
            expectedSize: 10,
            expectedTotal: 100
        },
    ]

    it.each(validRangeHeaders)("should parse a valid header", ({
                                                                   header,
                                                                   expectedElementName,
                                                                   expectedPage,
                                                                   expectedSize,
                                                                   expectedTotal
                                                               }) => {
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

describe("We parse an Accept-Ranges header", () => {
    const validRangeHeaders = [
        {header: 'Accept-Ranges: elements', expectedElementName: 'elements'},
        {header: 'Accept-Ranges: records', expectedElementName: 'records'},
        {header: 'Accept-Ranges: firstNames', expectedElementName: 'firstNames'},
    ];

    it.each(validRangeHeaders)("should parse a valid header", ({header, expectedElementName}) => {
        const pageable = parseAcceptRangesHeader(header);
        expect(pageable.elementName).toBe(expectedElementName);

    });

    const nullOrEmptyHeaders = [null, "", undefined];

    it.each(nullOrEmptyHeaders)("should throw error for null header", (header) => {
        // @ts-ignore
        expect(() => parseAcceptRangesHeader(header)).toThrow("Header cannot be null or empty");
    });

    const badRangeHeaders = ["Accept-Ranges: ", "elementName"];

    it.each(badRangeHeaders)("should throw error for bad format header", (header) => {
        // @ts-ignore
        expect(() => parseAcceptRangesHeader(header)).toThrow(`Header '${header}' is not in the correct format. The format must be like 'Accept-Ranges: elements`);
    });
});

describe("We test the writers function", () => {
    const headers = [
        {
            header: {elementName: "records", page: 0, size: 10, total: 100},
            expectedRangeString: "Range: records=0-9",
            expectedContentRangeString: "Content-Range: records 0-9/100",
            expectedAcceptRangesString: "Accept-Ranges: records"
        },
        {
            header: {elementName: "records", page: 0, size: 10, total: 10},
            expectedRangeString: "Range: records=0-9",
            expectedContentRangeString: "Content-Range: records 0-9/10",
            expectedAcceptRangesString: "Accept-Ranges: records"
        },
        {
            header: {elementName: "records", page: 1, size: 10, total: 100},
            expectedRangeString: "Range: records=10-19",
            expectedContentRangeString: "Content-Range: records 10-19/100",
            expectedAcceptRangesString: "Accept-Ranges: records"
        },
        {
            header: {elementName: "elements", page: 0, size: 10, total: 9},
            expectedRangeString: "Range: elements=0-8",
            expectedContentRangeString: "Content-Range: elements 0-8/9",
            expectedAcceptRangesString: "Accept-Ranges: elements"
        },
    ];

    it.each(headers)("should write a Range header", ({header, expectedRangeString}) => {
        expect(toRangeHeader(header)).toBe(expectedRangeString);
    });

    it.each(headers)("should write a Content-Range header", ({header, expectedContentRangeString}) => {
        expect(toContentRangeHeader(header)).toBe(expectedContentRangeString);
    });

    it.each(headers)("should write an Accept-Ranges header", ({header, expectedAcceptRangesString}) => {
        expect(toAcceptRangesHeader(header)).toBe(expectedAcceptRangesString);
    });
});


describe("We test the builder", () => {
    it("should build a HeaderPageable object", () => {
        const pageable: HeaderPageable = toBuilder()
            .elementName("items")
            .page(1)
            .size(20)
            .total(100)
            .build();

        expect(pageable.elementName).toBe("items");
        expect(pageable.page).toBe(1);
        expect(pageable.size).toBe(20);
        expect(pageable.total).toBe(100);
    });

    it("should use default values", () => {
        const pageable: HeaderPageable = toBuilder().build();

        expect(pageable.elementName).toBe("elements");
        expect(pageable.page).toBe(0);
        expect(pageable.size).toBe(0);
        expect(pageable.total).toBe(0);
    });

    it("should override default values", () => {
        const orginal: HeaderPageable = {
            elementName: "records",
            page: 0,
            size: 10,
            total: 100
        };

        const pageable: HeaderPageable = toBuilder(orginal)
            .elementName("items")
            .page(1)
            .size(20)
            .build();

        expect(pageable.elementName).toBe("items");
        expect(pageable.page).toBe(1);
        expect(pageable.size).toBe(20);
        expect(pageable.total).toBe(100);
    });
});


describe("We test the navigation", () => {

    const headersForNextPageFunction = [
        {header: {elementName: "records", page: 0, size: 10, total: 100}, expectedNextPage: 1},
        {header: {elementName: "records", page: 1, size: 10, total: 100}, expectedNextPage: 2},
        {header: {elementName: "records", page: 8, size: 10, total: 100}, expectedNextPage: 9},
    ];

    it.each(headersForNextPageFunction)("should return the next page", ({header, expectedNextPage}) => {
        const nextHeader = nextPage(header);
        expect(nextHeader.page).toBe(expectedNextPage);
    });

    const headerForPreviousPage = [
        {header: {elementName: "records", page: 1, size: 10, total: 100}, expectedPreviousPage: 0},
        {header: {elementName: "records", page: 2, size: 10, total: 100}, expectedPreviousPage: 1},
        {header: {elementName: "records", page: 9, size: 10, total: 100}, expectedPreviousPage: 8},
    ];

    it.each(headerForPreviousPage)("should return the previous page", ({header, expectedPreviousPage}) => {
        const previousHeader = previousPage(header);
        expect(previousHeader.page).toBe(expectedPreviousPage);
    });
});