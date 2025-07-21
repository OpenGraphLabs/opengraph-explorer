# DictionaryCategoriesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createDictionaryCategoryApiV1DictionaryCategoriesPost**](#createdictionarycategoryapiv1dictionarycategoriespost) | **POST** /api/v1/dictionary-categories/ | Create Dictionary Category|
|[**deleteDictionaryCategoryApiV1DictionaryCategoriesDictionaryIdCategoryIdDelete**](#deletedictionarycategoryapiv1dictionarycategoriesdictionaryidcategoryiddelete) | **DELETE** /api/v1/dictionary-categories/{dictionary_id}/{category_id} | Delete Dictionary Category|
|[**getDictionaryCategoriesApiV1DictionaryCategoriesDictionaryIdGet**](#getdictionarycategoriesapiv1dictionarycategoriesdictionaryidget) | **GET** /api/v1/dictionary-categories/{dictionary_id} | Get Dictionary Categories|

# **createDictionaryCategoryApiV1DictionaryCategoriesPost**
> DictionaryCategoryRead createDictionaryCategoryApiV1DictionaryCategoriesPost(dictionaryCategoryCreate)

Create a new dictionary-category association.

### Example

```typescript
import {
    DictionaryCategoriesApi,
    Configuration,
    DictionaryCategoryCreate
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new DictionaryCategoriesApi(configuration);

let dictionaryCategoryCreate: DictionaryCategoryCreate; //

const { status, data } = await apiInstance.createDictionaryCategoryApiV1DictionaryCategoriesPost(
    dictionaryCategoryCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dictionaryCategoryCreate** | **DictionaryCategoryCreate**|  | |


### Return type

**DictionaryCategoryRead**

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

# **deleteDictionaryCategoryApiV1DictionaryCategoriesDictionaryIdCategoryIdDelete**
> any deleteDictionaryCategoryApiV1DictionaryCategoriesDictionaryIdCategoryIdDelete()

Delete a dictionary-category association.

### Example

```typescript
import {
    DictionaryCategoriesApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new DictionaryCategoriesApi(configuration);

let dictionaryId: number; // (default to undefined)
let categoryId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteDictionaryCategoryApiV1DictionaryCategoriesDictionaryIdCategoryIdDelete(
    dictionaryId,
    categoryId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dictionaryId** | [**number**] |  | defaults to undefined|
| **categoryId** | [**number**] |  | defaults to undefined|


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

# **getDictionaryCategoriesApiV1DictionaryCategoriesDictionaryIdGet**
> CategoryListResponse getDictionaryCategoriesApiV1DictionaryCategoriesDictionaryIdGet()

List all categories related to a dictionary.

### Example

```typescript
import {
    DictionaryCategoriesApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new DictionaryCategoriesApi(configuration);

let dictionaryId: number; // (default to undefined)
let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 10)

const { status, data } = await apiInstance.getDictionaryCategoriesApiV1DictionaryCategoriesDictionaryIdGet(
    dictionaryId,
    page,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **dictionaryId** | [**number**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 1|
| **limit** | [**number**] |  | (optional) defaults to 10|


### Return type

**CategoryListResponse**

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

