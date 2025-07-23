# DatasetCreate

Dataset creation schema

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**name** | **string** | Dataset name | [default to undefined]
**description** | **string** |  | [optional] [default to undefined]
**tags** | **Array&lt;string&gt;** |  | [optional] [default to undefined]
**dictionaryId** | **number** |  | [optional] [default to undefined]

## Example

```typescript
import { DatasetCreate } from 'opengraph-api-client';

const instance: DatasetCreate = {
    name,
    description,
    tags,
    dictionaryId,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
