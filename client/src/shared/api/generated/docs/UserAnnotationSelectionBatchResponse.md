# UserAnnotationSelectionBatchResponse

사용자 어노테이션 선택 배치 생성 응답 스키마

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**createdSelections** | [**Array&lt;UserAnnotationSelectionRead&gt;**](UserAnnotationSelectionRead.md) | Successfully created annotation selections | [default to undefined]
**totalCreated** | **number** | Total number of selections created | [default to undefined]
**autoApprovedCount** | **number** | Number of selections that triggered auto-approval | [default to undefined]
**mergedAnnotationsCount** | **number** | Number of merged annotations created from auto-approvals | [default to undefined]

## Example

```typescript
import { UserAnnotationSelectionBatchResponse } from 'opengraph-api-client';

const instance: UserAnnotationSelectionBatchResponse = {
    createdSelections,
    totalCreated,
    autoApprovedCount,
    mergedAnnotationsCount,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
