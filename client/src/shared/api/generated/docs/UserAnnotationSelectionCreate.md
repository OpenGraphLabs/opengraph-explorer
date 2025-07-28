# UserAnnotationSelectionCreate

사용자 어노테이션 선택 생성 스키마

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**imageId** | **number** | 이미지 ID | [default to undefined]
**selectedAnnotationIds** | **Array&lt;number&gt;** | 선택된 어노테이션 ID 목록 | [default to undefined]
**categoryId** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { UserAnnotationSelectionCreate } from 'opengraph-api-client';

const instance: UserAnnotationSelectionCreate = {
    imageId,
    selectedAnnotationIds,
    categoryId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
