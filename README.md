# Commons RESTful TS

`commons-restful-ts` is a lightweight TypeScript library providing utilities for handling RESTful API concerns such as pagination and sorting.

## Installation

```bash
npm install commons-restful-ts
```

## Usage

### Pagination

The library provides an immutable `HeaderPageable` type for handling pagination headers like `Range`, `Content-Range`, and `Accept-Ranges`.

#### Creating a `HeaderPageable` Object

You can easily create `HeaderPageable` objects using the `headerPageableBuilder`.

```typescript
import { headerPageableBuilder, HeaderPageable } from 'commons-restful-ts';

const pageable: HeaderPageable = headerPageableBuilder()
    .elementName("items")
    .page(2)
    .size(50)
    .total(250)
    .build();
```

#### Parsing Pagination Headers

```typescript
import { parseRangeHeader, parseContentRangeHeader } from 'commons-restful-ts';

const rangeHeader = "Range: items=0-9";
const pageableFromRange = parseRangeHeader(rangeHeader);

const contentRangeHeader = "Content-Range: items 0-9/100";
const pageableFromContentRange = parseContentRangeHeader(contentRangeHeader);
```

#### Generating Pagination Headers

```typescript
import { toRangeHeader, toContentRangeHeader, headerPageableBuilder } from 'commons-restful-ts';

const pageable = headerPageableBuilder().elementName("users").page(1).size(20).total(100).build();

const rangeHeader = toRangeHeader(pageable); 
// "Range: users=20-39"

const contentRangeHeader = toContentRangeHeader(pageable);
// "Content-Range: users 20-39/100"
```

### Sorting

The library also provides utilities for parsing sort parameters.

#### Parsing a Sort String

Sort parameters are provided as a comma-separated string. Each part consists of a property name and an optional sort direction (`asc` or `desc`), separated by a colon. If no direction is provided, `ASC` is used as the default.

```typescript
import { parse, Sort } from 'commons-restful-ts/Sort';

const sortString = "name:asc,age:desc,createdAt";
const sorts: Sort[] = parse(sortString);

// sorts will be:
// [
//   { property: 'name', order: 'ASC' },
//   { property: 'age', order: 'DESC' },
//   { property: 'createdAt', order: 'ASC' }
// ]
```

## API Reference

### Pagination (`HeaderPageable.ts`)

*   `HeaderPageable`: An immutable type representing pagination information.
    *   `elementName: string`
    *   `page: number`
    *   `size: number`
    *   `total: number`
*   `headerPageableBuilder()`: Returns a builder to construct a `HeaderPageable` object.
*   `parseRangeHeader(header: string): HeaderPageable`: Parses a `Range` header string.
*   `parseContentRangeHeader(header: string): HeaderPageable`: Parses a `Content-Range` header string.
*   `parseAcceptRangesHeader(header: string): HeaderPageable`: Parses an `Accept-Ranges` header string.
*   `toRangeHeader(header: HeaderPageable): string`: Generates a `Range` header string.
*   `toContentRangeHeader(header: HeaderPageable): string`: Generates a `Content-Range` header string.
*   `toAcceptRangesHeader(header: HeaderPageable): string`: Generates an `Accept-Ranges` header string.

### Sorting (`Sort.ts`)

*   `Sort`: An immutable type representing a sort criterion.
    *   `property: string`
    *   `order: SortOrder`
*   `SortOrder`: An enum for sort direction (`ASC` or `DESC`).
*   `parse(input: string): Sort[]`: Parses a sort string into an array of `Sort` objects.

## Running Tests

To run the tests for this library, use the following command:

```bash
npm test
```
