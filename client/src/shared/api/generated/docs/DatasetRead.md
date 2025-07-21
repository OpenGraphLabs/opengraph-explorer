# DatasetRead

Dataset read schema

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | Dataset name | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**tags** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**id** | **number** | Dataset ID | [default to undefined]
**createdBy** | **number** |  | [optional] [default to undefined]
**createdAt** | **string** | Creation timestamp | [default to undefined]

## Example

```typescript
import { DatasetRead } from 'opengraph-api-client';

const instance: DatasetRead = {
    name,
    description,
    tags,
    id,
    createdBy,
    createdAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
