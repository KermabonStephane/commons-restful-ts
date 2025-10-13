
export enum FilterOperator {
    EQUALS = "eq",
    NOT_EQUALS = "ne",
    GREATER = "gt",
    GREATER_OR_EQUALS = "gte",
    LESS = "lt",
    LESS_OR_EQUALS = "lte",
    LIKE = "like",
    IN = "in"
}

export type Filter = {
    readonly property: string;
    readonly operator: FilterOperator;
    readonly value: string;
}

function getOperator(operatorAsString: string): FilterOperator {
switch (operatorAsString) {
    case "eq":
        return FilterOperator.EQUALS;
    case "ne":
        return FilterOperator.NOT_EQUALS;
        case "gt":
        return FilterOperator.GREATER;
    case "gte":
        return FilterOperator.GREATER_OR_EQUALS;
        case "lt":
        return FilterOperator.LESS;
    case "lte":
        return FilterOperator.LESS_OR_EQUALS;
        case "like":
        return FilterOperator.LIKE;
    case "in":
        return FilterOperator.IN;
    default:
        throw new Error(`Bad format of the filters string '${operatorAsString}'`);
}

function parseFilter(filterAsString: string): Filter {
    const strings = filterAsString.split(" ");
    if (strings.length != 3) {
        throw new Error(`Bad format of the filters string '${filterAsString}'`);
    }
    const property = strings[0];
    const operatorAsString = strings[1];
    const value = strings[2];

    const operator: FilterOperator = getOperator(operatorAsString);

    return {
        property: property,
        operator: operator,
        value: value
    };
}

export function parse(input: string): Filter[] {
    if (!input) {
        throw new Error(`Bad format of the filters string '${input}'`);
    }

    return input.split(",").map(filterAsString => parseFilter(filterAsString));
}