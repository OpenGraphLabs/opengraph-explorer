# AnnotationUserCreate

사용자가 어노테이션을 생성할 때 사용하는 스키마 (source_type, status 제외)

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**bbox** | **Array&lt;number&gt;** |  | [optional] [default to undefined]
**area** | **number** |  | [optional] [default to undefined]
**segmentationSize** | **Array&lt;number&gt;** |  | [optional] [default to undefined]
**segmentationCounts** | **string** |  | [optional] [default to undefined]
**pointCoords** | **Array&lt;Array&lt;number&gt;&gt;** |  | [optional] [default to undefined]
**isCrowd** | **boolean** | Is Crowd | [optional] [default to false]
**predictedIou** | **number** |  | [optional] [default to undefined]
**stabilityScore** | **number** |  | [optional] [default to undefined]
**imageId** | **number** | Image ID | [default to undefined]
**categoryId** | **number** |  | [optional] [default to undefined]
**createdBy** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { AnnotationUserCreate } from 'opengraph-api-client';

const instance: AnnotationUserCreate = {
    bbox,
    area,
    segmentationSize,
    segmentationCounts,
    pointCoords,
    isCrowd,
    predictedIou,
    stabilityScore,
    imageId,
    categoryId,
    createdBy,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
