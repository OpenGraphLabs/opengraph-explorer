# AnnotationRead

어노테이션 읽기 스키마

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
**id** | **number** | Annotation ID | [default to undefined]
**status** | **string** | Annotation status | [default to undefined]
**sourceType** | **string** | Source type (AUTO or USER) | [default to undefined]
**imageId** | **number** | Associated image ID | [default to undefined]
**categoryId** | **number** |  | [optional] [default to undefined]
**createdBy** | **number** |  | [optional] [default to undefined]
**createdAt** | **string** | Creation timestamp | [default to undefined]
**updatedAt** | **string** | Last update timestamp | [default to undefined]

## Example

```typescript
import { AnnotationRead } from 'opengraph-api-client';

const instance: AnnotationRead = {
    bbox,
    area,
    segmentationSize,
    segmentationCounts,
    polygon,
    pointCoords,
    isCrowd,
    predictedIou,
    stabilityScore,
    id,
    status,
    sourceType,
    imageId,
    categoryId,
    createdBy,
    createdAt,
    updatedAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
