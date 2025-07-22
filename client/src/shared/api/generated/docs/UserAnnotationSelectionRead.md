# UserAnnotationSelectionRead

사용자 어노테이션 선택 조회 스키마

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** |  | [default to undefined]
**userId** | **number** |  | [default to undefined]
**imageId** | **number** |  | [default to undefined]
**categoryId** | **number** |  | [default to undefined]
**selectedAnnotationIdsKey** | **string** | 정규화된 어노테이션 ID 문자열 키 | [default to undefined]
**status** | **string** | 선택 상태 | [default to undefined]
**createdAt** | **string** |  | [default to undefined]
**updatedAt** | **string** |  | [optional] [default to undefined]
**selectedAnnotationIds** | **Array&lt;number&gt;** | 선택된 어노테이션 ID 목록을 computed field로 제공 | [default to undefined]

## Example

```typescript
import { UserAnnotationSelectionRead } from 'opengraph-api-client';

const instance: UserAnnotationSelectionRead = {
    id,
    userId,
    imageId,
    categoryId,
    selectedAnnotationIdsKey,
    status,
    createdAt,
    updatedAt,
    selectedAnnotationIds,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
