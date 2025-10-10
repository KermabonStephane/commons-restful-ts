const RANGE_HEADER_NAME: string = "Range";
const RANGE_HEADER_PATTERN = /^Range: [a-zA-Z-_]+=\d+-\d+$/;

export type HeaderPageable = {
    elementName: string;
    page: number;
    size: number;
    total: number;
}

export function parseRangeHeader(header: string): HeaderPageable {
    if (!header) {
        throw new Error("Header cannot be null or empty");
    }
    if (!RANGE_HEADER_PATTERN.test(header)) {
        throw new Error(`Header \'${header}\' is not in the correct format. The format must be like \'Range: elements=0-9\'`);
    }

    const parts = header.substring(RANGE_HEADER_NAME.length + 2).split("=");
    const elementName = parts[0];
    const range = parts[1].split("-");
    const start = parseInt(range[0], 10);
    const end = parseInt(range[1], 10);
    if (end <= start) {
        throw new Error(`Header \'${header}\' is not in the correct format. The end must be greater than the start`);
    }
    const size = end - start + 1;
    const page = start / size;

    return {
        elementName,
        page,
        size,
        total: -1
    }
}
