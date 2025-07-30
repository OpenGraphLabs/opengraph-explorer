# AuthenticationApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**generateZkProofApiV1AuthZkloginProvePost**](#generatezkproofapiv1authzkloginprovepost) | **POST** /api/v1/auth/zklogin/prove | Generate Zk Proof|
|[**getMeApiV1AuthMeGet**](#getmeapiv1authmeget) | **GET** /api/v1/auth/me | Get Me|
|[**googleCallbackApiV1AuthGoogleCallbackGet**](#googlecallbackapiv1authgooglecallbackget) | **GET** /api/v1/auth/google/callback | Google Callback|
|[**updateSuiAddressApiV1AuthSuiAddressPost**](#updatesuiaddressapiv1authsuiaddresspost) | **POST** /api/v1/auth/sui-address | Update Sui Address|
|[**zkloginInitApiV1AuthZkloginInitPost**](#zklogininitapiv1authzklogininitpost) | **POST** /api/v1/auth/zklogin/init | Zklogin Init|

# **generateZkProofApiV1AuthZkloginProvePost**
> ZkProofResponse generateZkProofApiV1AuthZkloginProvePost(zkProofRequest)

ZK proof를 생성하고 Sui 주소를 도출합니다.  1. JWT 토큰 검증 2. 사용자 salt 조회 3. ZK proof 생성 4. Sui 주소 도출 5. 사용자 계정에 Sui 주소 연결

### Example

```typescript
import {
    AuthenticationApi,
    Configuration,
    ZkProofRequest
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let zkProofRequest: ZkProofRequest; //

const { status, data } = await apiInstance.generateZkProofApiV1AuthZkloginProvePost(
    zkProofRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **zkProofRequest** | **ZkProofRequest**|  | |


### Return type

**ZkProofResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getMeApiV1AuthMeGet**
> CurrentUserResponse getMeApiV1AuthMeGet()

현재 로그인한 사용자 정보 조회

### Example

```typescript
import {
    AuthenticationApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

const { status, data } = await apiInstance.getMeApiV1AuthMeGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**CurrentUserResponse**

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

# **googleCallbackApiV1AuthGoogleCallbackGet**
> any googleCallbackApiV1AuthGoogleCallbackGet()

Google OAuth 콜백 처리  1. Authorization code를 access token으로 교환 2. Google 사용자 정보 조회 3. 사용자 생성 또는 업데이트 4. JWT 토큰 생성 및 클라이언트로 리다이렉트

### Example

```typescript
import {
    AuthenticationApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let code: string; // (default to undefined)
let state: string; // (default to undefined)

const { status, data } = await apiInstance.googleCallbackApiV1AuthGoogleCallbackGet(
    code,
    state
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **code** | [**string**] |  | defaults to undefined|
| **state** | [**string**] |  | defaults to undefined|


### Return type

**any**

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

# **updateSuiAddressApiV1AuthSuiAddressPost**
> UpdateSuiAddressResponse updateSuiAddressApiV1AuthSuiAddressPost(updateSuiAddressRequest)

클라이언트에서 생성한 Sui 주소를 사용자 계정에 업데이트합니다.  Args:     request: Sui 주소 업데이트 요청     current_user: 현재 인증된 사용자     db: 데이터베이스 세션      Returns:     UpdateSuiAddressResponse: 업데이트 결과

### Example

```typescript
import {
    AuthenticationApi,
    Configuration,
    UpdateSuiAddressRequest
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let updateSuiAddressRequest: UpdateSuiAddressRequest; //

const { status, data } = await apiInstance.updateSuiAddressApiV1AuthSuiAddressPost(
    updateSuiAddressRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **updateSuiAddressRequest** | **UpdateSuiAddressRequest**|  | |


### Return type

**UpdateSuiAddressResponse**

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

# **zkloginInitApiV1AuthZkloginInitPost**
> ZkLoginInitResponse zkloginInitApiV1AuthZkloginInitPost(zkLoginInitRequest)

zkLogin 초기화  1. Ephemeral public key를 받아서 nonce 생성 2. Google OAuth URL 생성 및 반환

### Example

```typescript
import {
    AuthenticationApi,
    Configuration,
    ZkLoginInitRequest
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new AuthenticationApi(configuration);

let zkLoginInitRequest: ZkLoginInitRequest; //

const { status, data } = await apiInstance.zkloginInitApiV1AuthZkloginInitPost(
    zkLoginInitRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **zkLoginInitRequest** | **ZkLoginInitRequest**|  | |


### Return type

**ZkLoginInitResponse**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

