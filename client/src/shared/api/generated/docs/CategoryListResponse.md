# CategoryListResponse

Category list response schema

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**items** | [**Array&lt;CategoryRead&gt;**](CategoryRead.md) | Category list | [default to undefined]
**total** | **number** | Total count | [default to undefined]
**page** | **number** | Current page | [default to undefined]
**limit** | **number** | Page size | [default to undefined]
**pages** | **number** | Total pages | [default to undefined]

## Example

```typescript
import { CategoryListResponse } from 'opengraph-api-client';

const instance: CategoryListResponse = {
    items,
    total,
    page,
    limit,
    pages,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
