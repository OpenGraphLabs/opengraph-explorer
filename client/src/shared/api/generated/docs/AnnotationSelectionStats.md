# AnnotationSelectionStats

어노테이션 선택 통계 스키마

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**imageId** | **number** |  | [default to undefined]
**selectedAnnotationIdsKey** | **string** |  | [default to undefined]
**categoryId** | **number** |  | [default to undefined]
**categoryName** | **string** |  | [default to undefined]
**selectionCount** | **number** | 동일한 선택을 한 사용자 수 | [default to undefined]
**status** | **string** | 현재 상태 | [default to undefined]
**firstSelectedAt** | **string** | 첫 선택 시각 | [default to undefined]
**lastSelectedAt** | **string** | 마지막 선택 시각 | [default to undefined]
**isReadyForApproval** | **boolean** | 승인 가능 여부 (5명 이상 선택) | [default to undefined]

## Example

```typescript
import { AnnotationSelectionStats } from 'opengraph-api-client';

const instance: AnnotationSelectionStats = {
    imageId,
    selectedAnnotationIdsKey,
    categoryId,
    categoryName,
    selectionCount,
    status,
    firstSelectedAt,
    lastSelectedAt,
    isReadyForApproval,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
