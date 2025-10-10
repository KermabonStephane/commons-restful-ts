# Commons RESTful TS

`commons-restful-ts` is a lightweight TypeScript library providing utilities for handling RESTful API headers related to pagination, such as `Range`, `Content-Range`, and `Accept-Ranges`.

It provides an immutable `HeaderPageable` type and a builder to create instances, as well as functions to parse and generate these headers.

## Installation

```bash
npm install commons-restful-ts
```

## Usage

### Creating a `HeaderPageable` Object

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

### Parsing Headers

The library provides functions to parse `Range`, `Content-Range`, and `Accept-Ranges` headers from their string representation.

#### Parse `Range` Header

```typescript
import { parseRangeHeader } from 'commons-restful-ts';

const rangeHeader = "Range: items=0-9";
const pageable = parseRangeHeader(rangeHeader);

// pageable.elementName -> "items"
// pageable.page -> 0
// pageable.size -> 10
```

#### Parse `Content-Range` Header

```typescript
import { parseContentRangeHeader } from 'commons-restful-ts';

const contentRangeHeader = "Content-Range: items 0-9/100";
const pageable = parseContentRangeHeader(contentRangeHeader);

// pageable.elementName -> "items"
// pageable.page -> 0
// pageable.size -> 10
// pageable.total -> 100
```

### Generating Headers

You can also generate header strings from a `HeaderPageable` object.

```typescript
import { toRangeHeader, toContentRangeHeader, headerPageableBuilder } from 'commons-restful-ts';

const pageable = headerPageableBuilder()
    .elementName("users")
    .page(1)
    .size(20)
    .total(100)
    .build();

const rangeHeader = toRangeHeader(pageable); 
// "Range: users=20-39"

const contentRangeHeader = toContentRangeHeader(pageable);
// "Content-Range: users 20-39/100"
```

## API Reference

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

## Running Tests

To run the tests for this library, use the following command:

```bash
npm test
```
