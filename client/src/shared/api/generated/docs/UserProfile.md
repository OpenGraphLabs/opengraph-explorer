# UserProfile

User profile schema

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**id** | **number** | User ID | [default to undefined]
**email** | **string** | User email address | [default to undefined]
**googleId** | **string** |  | [optional] [default to undefined]
**displayName** | **string** |  | [optional] [default to undefined]
**profileImageUrl** | **string** |  | [optional] [default to undefined]
**suiAddress** | **string** |  | [optional] [default to undefined]
**createdAt** | **string** | Creation timestamp | [default to undefined]
**datasetCount** | **number** | Number of created datasets | [optional] [default to 0]
**annotationCount** | **number** | Number of created annotations | [optional] [default to 0]

## Example

```typescript
import { UserProfile } from 'opengraph-api-client';

const instance: UserProfile = {
    id,
    email,
    googleId,
    displayName,
    profileImageUrl,
    suiAddress,
    createdAt,
    datasetCount,
    annotationCount,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
