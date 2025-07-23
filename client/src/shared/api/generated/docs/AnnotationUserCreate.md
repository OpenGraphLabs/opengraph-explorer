# AnnotationUserCreate

사용자가 생성하는 어노테이션 스키마

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**bbox** | **Array&lt;number&gt;** | Bounding box [x, y, width, height] | [default to undefined]
**area** | **number** | Segmentation area | [default to undefined]
**segmentationSize** | **Array&lt;number&gt;** |  | [optional] [default to undefined]
**segmentationCounts** | **string** |  | [optional] [default to undefined]
**polygon** | **object** |  | [optional] [default to undefined]
**pointCoords** | **Array&lt;Array&lt;number&gt;&gt;** |  | [optional] [default to undefined]
**isCrowd** | **boolean** | Is crowd annotation | [optional] [default to false]
**predictedIou** | **number** |  | [optional] [default to undefined]
**stabilityScore** | **number** |  | [optional] [default to undefined]
**imageId** | **number** | Associated image ID | [default to undefined]
**categoryId** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { AnnotationUserCreate } from 'opengraph-api-client';

const instance: AnnotationUserCreate = {
    bbox,
    area,
    segmentationSize,
    segmentationCounts,
    polygon,
    pointCoords,
    isCrowd,
    predictedIou,
    stabilityScore,
    imageId,
    categoryId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
