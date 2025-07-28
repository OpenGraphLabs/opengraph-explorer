# UserCreate

User creation schema

## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**email** | **string** | User email address | [default to undefined]
**googleId** | **string** |  | [optional] [default to undefined]
**displayName** | **string** |  | [optional] [default to undefined]
**profileImageUrl** | **string** |  | [optional] [default to undefined]
**suiAddress** | **string** |  | [optional] [default to undefined]

## Example

```typescript
import { UserCreate } from 'opengraph-api-client';

const instance: UserCreate = {
    email,
    googleId,
    displayName,
    profileImageUrl,
    suiAddress,
};
```

[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)
