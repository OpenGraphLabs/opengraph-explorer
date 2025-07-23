# AnnotationListResponse

어노테이션 목록 응답 스키마

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**items** | [**Array&lt;AnnotationRead&gt;**](AnnotationRead.md) | Annotation list | [default to undefined]
**total** | **number** | Total count | [default to undefined]
**page** | **number** | Current page | [default to undefined]
**limit** | **number** | Page size | [default to undefined]
**pages** | **number** | Total pages | [default to undefined]

## Example

```typescript
import { AnnotationListResponse } from 'opengraph-api-client';

const instance: AnnotationListResponse = {
    items,
    total,
    page,
    limit,
    pages,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
