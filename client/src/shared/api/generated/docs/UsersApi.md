# UsersApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createUserApiV1UsersPost**](#createuserapiv1userspost) | **POST** /api/v1/users/ | Create User|
|[**deleteCurrentUserApiV1UsersMeDelete**](#deletecurrentuserapiv1usersmedelete) | **DELETE** /api/v1/users/me | Delete Current User|
|[**deleteUserApiV1UsersUserIdDelete**](#deleteuserapiv1usersuseriddelete) | **DELETE** /api/v1/users/{user_id} | Delete User|
|[**getCurrentUserInfoApiV1UsersMeGet**](#getcurrentuserinfoapiv1usersmeget) | **GET** /api/v1/users/me | Get Current User Info|
|[**getCurrentUserProfileApiV1UsersMeProfileGet**](#getcurrentuserprofileapiv1usersmeprofileget) | **GET** /api/v1/users/me/profile | Get Current User Profile|
|[**getUserApiV1UsersUserIdGet**](#getuserapiv1usersuseridget) | **GET** /api/v1/users/{user_id} | Get User|
|[**getUserProfileApiV1UsersUserIdProfileGet**](#getuserprofileapiv1usersuseridprofileget) | **GET** /api/v1/users/{user_id}/profile | Get User Profile|
|[**getUsersApiV1UsersGet**](#getusersapiv1usersget) | **GET** /api/v1/users/ | Get Users|
|[**searchUserByEmailApiV1UsersSearchByEmailGet**](#searchuserbyemailapiv1userssearchbyemailget) | **GET** /api/v1/users/search/by-email | Search User By Email|
|[**searchUserBySuiAddressApiV1UsersSearchBySuiAddressGet**](#searchuserbysuiaddressapiv1userssearchbysuiaddressget) | **GET** /api/v1/users/search/by-sui-address | Search User By Sui Address|
|[**updateCurrentUserApiV1UsersMePut**](#updatecurrentuserapiv1usersmeput) | **PUT** /api/v1/users/me | Update Current User|
|[**updateUserApiV1UsersUserIdPut**](#updateuserapiv1usersuseridput) | **PUT** /api/v1/users/{user_id} | Update User|

# **createUserApiV1UsersPost**
> UserRead createUserApiV1UsersPost(userCreate)

Create a new user.

### Example

```typescript
import {
    UsersApi,
    Configuration,
    UserCreate
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let userCreate: UserCreate; //

const { status, data } = await apiInstance.createUserApiV1UsersPost(
    userCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userCreate** | **UserCreate**|  | |


### Return type

**UserRead**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteCurrentUserApiV1UsersMeDelete**
> deleteCurrentUserApiV1UsersMeDelete()

Delete the current user.

### Example

```typescript
import {
    UsersApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

const { status, data } = await apiInstance.deleteCurrentUserApiV1UsersMeDelete();
```

### Parameters
This endpoint does not have any parameters.


### Return type

void (empty response body)

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | Successful Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteUserApiV1UsersUserIdDelete**
> deleteUserApiV1UsersUserIdDelete()

Delete a specific user by ID. Note: This endpoint requires admin privileges.

### Example

```typescript
import {
    UsersApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let userId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteUserApiV1UsersUserIdDelete(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**number**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**204** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCurrentUserInfoApiV1UsersMeGet**
> UserRead getCurrentUserInfoApiV1UsersMeGet()

Get the current user\'s information.

### Example

```typescript
import {
    UsersApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

const { status, data } = await apiInstance.getCurrentUserInfoApiV1UsersMeGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**UserRead**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getCurrentUserProfileApiV1UsersMeProfileGet**
> UserProfile getCurrentUserProfileApiV1UsersMeProfileGet()

Get the current user\'s profile information.

### Example

```typescript
import {
    UsersApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

const { status, data } = await apiInstance.getCurrentUserProfileApiV1UsersMeProfileGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**UserProfile**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getUserApiV1UsersUserIdGet**
> UserRead getUserApiV1UsersUserIdGet()

Get a specific user by ID.

### Example

```typescript
import {
    UsersApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let userId: number; // (default to undefined)

const { status, data } = await apiInstance.getUserApiV1UsersUserIdGet(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**number**] |  | defaults to undefined|


### Return type

**UserRead**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getUserProfileApiV1UsersUserIdProfileGet**
> UserProfile getUserProfileApiV1UsersUserIdProfileGet()

Get a specific user\'s profile by ID.

### Example

```typescript
import {
    UsersApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let userId: number; // (default to undefined)

const { status, data } = await apiInstance.getUserProfileApiV1UsersUserIdProfileGet(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**number**] |  | defaults to undefined|


### Return type

**UserProfile**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getUsersApiV1UsersGet**
> Array<UserRead> getUsersApiV1UsersGet()

List all users with optional pagination and email filter.

### Example

```typescript
import {
    UsersApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let skip: number; //건너뛸 개수 (optional) (default to 0)
let limit: number; //제한 개수 (optional) (default to 100)
let emailFilter: string; //이메일 필터 (optional) (default to undefined)

const { status, data } = await apiInstance.getUsersApiV1UsersGet(
    skip,
    limit,
    emailFilter
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **skip** | [**number**] | 건너뛸 개수 | (optional) defaults to 0|
| **limit** | [**number**] | 제한 개수 | (optional) defaults to 100|
| **emailFilter** | [**string**] | 이메일 필터 | (optional) defaults to undefined|


### Return type

**Array<UserRead>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **searchUserByEmailApiV1UsersSearchByEmailGet**
> UserRead searchUserByEmailApiV1UsersSearchByEmailGet()

Search for a user by email address.

### Example

```typescript
import {
    UsersApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let email: string; //이메일 주소 (default to undefined)

const { status, data } = await apiInstance.searchUserByEmailApiV1UsersSearchByEmailGet(
    email
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **email** | [**string**] | 이메일 주소 | defaults to undefined|


### Return type

**UserRead**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **searchUserBySuiAddressApiV1UsersSearchBySuiAddressGet**
> UserRead searchUserBySuiAddressApiV1UsersSearchBySuiAddressGet()

Search for a user by Sui wallet address.

### Example

```typescript
import {
    UsersApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let suiAddress: string; //Sui 지갑 주소 (default to undefined)

const { status, data } = await apiInstance.searchUserBySuiAddressApiV1UsersSearchBySuiAddressGet(
    suiAddress
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **suiAddress** | [**string**] | Sui 지갑 주소 | defaults to undefined|


### Return type

**UserRead**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateCurrentUserApiV1UsersMePut**
> UserRead updateCurrentUserApiV1UsersMePut(userUpdate)

Update the current user\'s information.

### Example

```typescript
import {
    UsersApi,
    Configuration,
    UserUpdate
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let userUpdate: UserUpdate; //

const { status, data } = await apiInstance.updateCurrentUserApiV1UsersMePut(
    userUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userUpdate** | **UserUpdate**|  | |


### Return type

**UserRead**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateUserApiV1UsersUserIdPut**
> UserRead updateUserApiV1UsersUserIdPut(userUpdate)

Update a specific user by ID. Note: This endpoint requires admin privileges.

### Example

```typescript
import {
    UsersApi,
    Configuration,
    UserUpdate
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new UsersApi(configuration);

let userId: number; // (default to undefined)
let userUpdate: UserUpdate; //

const { status, data } = await apiInstance.updateUserApiV1UsersUserIdPut(
    userId,
    userUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userUpdate** | **UserUpdate**|  | |
| **userId** | [**number**] |  | defaults to undefined|


### Return type

**UserRead**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

