const SORT_PATTERN = /^[a-z_]+(?::(?:asc|desc))?(?:,[a-z_]+(?::(?:asc|desc))?)*$/i;

export enum SortOrder {
    ASC = "ASC",
    DESC = "DESC"
}

export type Sort = {
    readonly property: string;
    readonly order: SortOrder;
}

export function parse(input: string): Sort[] {
    if (!input) {
        throw new Error(`Bad format of the sorts string '${input}'`);
    }
    const cleanInput = input.replace(/ /g, "");
    if (cleanInput === "" || !SORT_PATTERN.test(cleanInput)) {
        throw new Error(`Bad format of the sorts string '${input}'`);
    }

    const sortsAsString = cleanInput.split(",");
    return sortsAsString.map(sortAsString => {
        const split = sortAsString.split(":");
        const order = split.length === 1 ? SortOrder.ASC : (split[1].toUpperCase() as SortOrder);
        return { property: split[0], order };
    });
}