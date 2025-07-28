# DatasetListItem

Dataset list item schema

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | Dataset ID | [default to undefined]
**name** | **string** | Dataset name | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**tags** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**dictionaryId** | **number** |  | [optional] [default to undefined]
**createdBy** | **number** |  | [optional] [default to undefined]
**createdAt** | **string** | Creation timestamp | [default to undefined]
**imageCount** | **number** | Number of images | [optional] [default to 0]

## Example

```typescript
import { DatasetListItem } from 'opengraph-api-client';

const instance: DatasetListItem = {
    id,
    name,
    description,
    tags,
    dictionaryId,
    createdBy,
    createdAt,
    imageCount,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
