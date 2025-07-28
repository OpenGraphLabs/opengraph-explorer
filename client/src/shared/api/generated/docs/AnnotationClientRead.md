# AnnotationClientRead

클라이언트용 어노테이션 읽기 스키마 (RLE 데이터 제외)

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | Annotation ID | [default to undefined]
**bbox** | **Array&lt;number&gt;** | Bounding box [x, y, width, height] | [default to undefined]
**area** | **number** | Segmentation area | [default to undefined]
**pointCoords** | **Array&lt;Array&lt;number&gt;&gt;** |  | [optional] [default to undefined]
**isCrowd** | **boolean** | Is crowd annotation | [optional] [default to false]
**predictedIou** | **number** |  | [optional] [default to undefined]
**stabilityScore** | **number** |  | [optional] [default to undefined]
**status** | **string** | Annotation status | [default to undefined]
**sourceType** | **string** | Source type (AUTO or USER) | [default to undefined]
**imageId** | **number** | Associated image ID | [default to undefined]
**categoryId** | **number** |  | [optional] [default to undefined]
**createdBy** | **number** |  | [optional] [default to undefined]
**createdAt** | **string** | Creation timestamp | [default to undefined]
**updatedAt** | **string** | Last update timestamp | [default to undefined]
**polygon** | **object** |  | [optional] [default to undefined]

## Example

```typescript
import { AnnotationClientRead } from 'opengraph-api-client';

const instance: AnnotationClientRead = {
    id,
    bbox,
    area,
    pointCoords,
    isCrowd,
    predictedIou,
    stabilityScore,
    status,
    sourceType,
    imageId,
    categoryId,
    createdBy,
    createdAt,
    updatedAt,
    polygon,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
