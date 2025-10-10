const RANGE_HEADER_NAME: string = "Range";
const RANGE_HEADER_PATTERN = /^Range: [a-zA-Z-_]+=\d+-\d+$/;
const CONTENT_RANGE_HEADER_NAME: string = "Content-Range";
const CONTENT_RANGE_HEADER_PATTERN = /^Content-Range: [a-zA-Z]+ \d+-\d+\/\d+$/;
const ACCEPT_RANGES_HEADER_NAME: string = "Accept-Ranges";
const ACCEPT_RANGES_HEADER_PATTERN = /^Accept-Ranges: [a-zA-Z]+$/;

export type HeaderPageable = {
    readonly elementName: string;
    readonly page: number;
    readonly size: number;
    readonly total: number;
}

export function parseRangeHeader(header: string): HeaderPageable {
    if (!header) {
        throw new Error("Header cannot be null or empty");
    }
    if (!RANGE_HEADER_PATTERN.test(header)) {
        throw new Error(`Header '${header}' is not in the correct format. The format must be like 'Range: elements=0-9'`);
    }

    const parts = header.substring(RANGE_HEADER_NAME.length + 2).split("=");
    const elementName = parts[0];
    const range = parts[1].split("-");
    const start = Number.parseInt(range[0], 10);
    const end = Number.parseInt(range[1], 10);
    if (end <= start) {
        throw new Error(`Header '${header}' is not in the correct format. The end must be greater than the start`);
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

export function parseContentRangeHeader(header: string): HeaderPageable {
    if (!header) {
        throw new Error("Header cannot be null or empty");
    }
    if (!CONTENT_RANGE_HEADER_PATTERN.test(header)) {
        throw new Error(`Header '${header}' is not in the correct format. The format must be like 'Content-Range: elements 0-9/100'`);
    }

    const parts = header.substring(CONTENT_RANGE_HEADER_NAME.length + 2).split(" ");
    const elementName = parts[0];
    const range = parts[1].split(/[-/]/);
    const start = Number.parseInt(range[0], 10);
    const end = Number.parseInt(range[1], 10);
    const total = Number.parseInt(range[2], 10);
    if (end <= start) {
        throw new Error(`Header '${header}' is not in the correct format. The end must be greater than the start`);
    }
    const size = end - start + 1;
    const page = start / size;
    if (start >= total) {
        throw new Error(`Header '${header}' is not in the correct format. The start must be less than the total`);
    }

    return {
        elementName,
        page,
        size,
        total
    }
}

export function parseAcceptRangesHeader(header: string): HeaderPageable {
    if (!header) {
        throw new Error("Header cannot be null or empty");
    }
    if (!ACCEPT_RANGES_HEADER_PATTERN.test(header)) {
        throw new Error(`Header '${header}' is not in the correct format. The format must be like 'Accept-Ranges: elements'`);
    }

    const elementName = header.substring(ACCEPT_RANGES_HEADER_NAME.length + 2);
    return {
        elementName,
        page: -1,
        size: -1,
        total: -1
    };
}

export function toRangeHeader(header: HeaderPageable): string {
    const start: number = header.page * header.size;
    const end = Math.min((header.page + 1) * header.size - 1, header.total -1);
    return `${RANGE_HEADER_NAME}: ${header.elementName}=${start}-${end}`;
}

export function toContentRangeHeader(header: HeaderPageable): string {
    const start: number = header.page * header.size;
    const end = Math.min((header.page + 1) * header.size - 1, header.total -1);
    return `${CONTENT_RANGE_HEADER_NAME}: ${header.elementName} ${start}-${end}/${header.total}`;
}

export function toAcceptRangesHeader(header: HeaderPageable): string {
    return `${ACCEPT_RANGES_HEADER_NAME}: ${header.elementName}`;
}

export type HeaderPageableBuilder = {
    elementName(elementName: string): HeaderPageableBuilder;
    page(page: number): HeaderPageableBuilder;
    size(size: number): HeaderPageableBuilder;
    total(total: number): HeaderPageableBuilder;
    build(): HeaderPageable;
};

export function toBuilder(header?: HeaderPageable): HeaderPageableBuilder {
    const props = {
        elementName: header ? header.elementName : "elements",
        page: header ? header.page : 0,
        size: header ? header.size : 0,
        total: header ? header.total : 0,
    };

    return {
        elementName(elementName: string): HeaderPageableBuilder {
            props.elementName = elementName;
            return this;
        },
        page(page: number): HeaderPageableBuilder {
            props.page = page;
            return this;
        },
        size(size: number): HeaderPageableBuilder {
            props.size = size;
            return this;
        },
        total(total: number): HeaderPageableBuilder {
            props.total = total;
            return this;
        },
        build(): HeaderPageable {
            return {
                elementName: props.elementName,
                page: props.page,
                size: props.size,
                total: props.total,
            };
        }
    };
}

export function nextPage(header: HeaderPageable): HeaderPageable {
    const lastPage = (header.total - 1) / header.size;
    if (header.page >= lastPage) {
        throw new Error(`We are currently on the last page`);
    }
    return toBuilder(header).page(header.page + 1).build();
}

export function previousPage(header: HeaderPageable): HeaderPageable {
    if (header.page <= 0) {
        throw new Error(`We are currently on the first page`);
    }
    return toBuilder(header).page(header.page - 1).build();
}

export function firstPage(header: HeaderPageable): HeaderPageable {
    return toBuilder(header).page(0).build();
}

export function lastPage(header: HeaderPageable): HeaderPageable {
    return toBuilder(header).page((header.page - 1) / header.size).build();
}