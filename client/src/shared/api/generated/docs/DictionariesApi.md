# DictionariesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createDictionaryApiV1DictionariesPost**](#createdictionaryapiv1dictionariespost) | **POST** /api/v1/dictionaries/ | Create Dictionary|
|[**getDictionaryApiV1DictionariesDictionaryIdGet**](#getdictionaryapiv1dictionariesdictionaryidget) | **GET** /api/v1/dictionaries/{dictionary_id} | Get Dictionary|

# **createDictionaryApiV1DictionariesPost**
> DictionaryRead createDictionaryApiV1DictionariesPost(dictionaryCreate)

Create a new dictionary

### Example

```typescript
import {
    DictionariesApi,
    Configuration,
    DictionaryCreate
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new DictionariesApi(configuration);

let dictionaryCreate: DictionaryCreate; //

const { status, data } = await apiInstance.createDictionaryApiV1DictionariesPost(
    dictionaryCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dictionaryCreate** | **DictionaryCreate**|  | |


### Return type

**DictionaryRead**

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

# **getDictionaryApiV1DictionariesDictionaryIdGet**
> DictionaryRead getDictionaryApiV1DictionariesDictionaryIdGet()

Get a dictionary by ID

### Example

```typescript
import {
    DictionariesApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new DictionariesApi(configuration);

let dictionaryId: number; // (default to undefined)

const { status, data } = await apiInstance.getDictionaryApiV1DictionariesDictionaryIdGet(
    dictionaryId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dictionaryId** | [**number**] |  | defaults to undefined|


### Return type

**DictionaryRead**

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

