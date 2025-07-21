# UserRead

User read schema

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**email** | **string** | User email address | [default to undefined]
**googleId** | **string** |  | [optional] [default to undefined]
**displayName** | **string** |  | [optional] [default to undefined]
**profileImageUrl** | **string** |  | [optional] [default to undefined]
**suiAddress** | **string** |  | [optional] [default to undefined]
**id** | **number** | User ID | [default to undefined]
**createdAt** | **string** | Creation timestamp | [default to undefined]

## Example

```typescript
import { UserRead } from 'opengraph-api-client';

const instance: UserRead = {
    email,
    googleId,
    displayName,
    profileImageUrl,
    suiAddress,
    id,
    createdAt,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
