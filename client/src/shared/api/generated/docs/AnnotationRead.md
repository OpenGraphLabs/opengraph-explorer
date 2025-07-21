# AnnotationRead

Annotation read schema with client-friendly mask information

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
**status** | **string** | Status of the annotation | [optional] [default to StatusEnum_PENDING]
**sourceType** | **string** | Source type of the annotation | [default to undefined]
**imageId** | **number** | Image ID | [default to undefined]
**categoryId** | **number** |  | [optional] [default to undefined]
**createdBy** | **number** |  | [optional] [default to undefined]
**id** | **number** | Annotation ID | [default to undefined]
**createdAt** | **string** | Creation timestamp | [default to undefined]
**updatedAt** | **string** | Last update timestamp | [default to undefined]
**maskInfo** | **object** |  | [optional] [default to undefined]

## Example

```typescript
import { AnnotationRead } from 'opengraph-api-client';

const instance: AnnotationRead = {
    bbox,
    area,
    segmentationSize,
    segmentationCounts,
    pointCoords,
    isCrowd,
    predictedIou,
    stabilityScore,
    status,
    sourceType,
    imageId,
    categoryId,
    createdBy,
    id,
    createdAt,
    updatedAt,
    maskInfo,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
