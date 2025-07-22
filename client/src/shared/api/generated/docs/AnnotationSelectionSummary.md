# AnnotationSelectionSummary

어노테이션 선택 요약 스키마

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**totalSelections** | **number** | 전체 선택 수 | [default to undefined]
**pendingSelections** | **number** | 대기 중인 선택 수 | [default to undefined]
**approvedSelections** | **number** | 승인된 선택 수 | [default to undefined]
**rejectedSelections** | **number** | 거부된 선택 수 | [default to undefined]
**readyForApproval** | **number** | 승인 가능한 선택 수 | [default to undefined]
**imagesWithSelections** | **number** | 선택이 있는 이미지 수 | [default to undefined]
**avgSelectionsPerImage** | **number** | 이미지당 평균 선택 수 | [default to undefined]
**activeUsers** | **number** | 선택에 참여한 사용자 수 | [default to undefined]
**avgSelectionsPerUser** | **number** | 사용자당 평균 선택 수 | [default to undefined]

## Example

```typescript
import { AnnotationSelectionSummary } from 'opengraph-api-client';

const instance: AnnotationSelectionSummary = {
    totalSelections,
    pendingSelections,
    approvedSelections,
    rejectedSelections,
    readyForApproval,
    imagesWithSelections,
    avgSelectionsPerImage,
    activeUsers,
    avgSelectionsPerUser,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
