# CategoriesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createCategoryApiV1CategoriesPost**](#createcategoryapiv1categoriespost) | **POST** /api/v1/categories/ | Create Category|
|[**deleteCategoryApiV1CategoriesCategoryIdDelete**](#deletecategoryapiv1categoriescategoryiddelete) | **DELETE** /api/v1/categories/{category_id} | Delete Category|
|[**getCategoriesApiV1CategoriesGet**](#getcategoriesapiv1categoriesget) | **GET** /api/v1/categories/ | Get Categories|
|[**getCategoryApiV1CategoriesCategoryIdGet**](#getcategoryapiv1categoriescategoryidget) | **GET** /api/v1/categories/{category_id} | Get Category|
|[**updateCategoryApiV1CategoriesCategoryIdPut**](#updatecategoryapiv1categoriescategoryidput) | **PUT** /api/v1/categories/{category_id} | Update Category|

# **createCategoryApiV1CategoriesPost**
> CategoryRead createCategoryApiV1CategoriesPost(categoryCreate)

Create a new category.

### Example

```typescript
import {
    CategoriesApi,
    Configuration,
    CategoryCreate
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new CategoriesApi(configuration);

let categoryCreate: CategoryCreate; //

const { status, data } = await apiInstance.createCategoryApiV1CategoriesPost(
    categoryCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **categoryCreate** | **CategoryCreate**|  | |


### Return type

**CategoryRead**

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

# **deleteCategoryApiV1CategoriesCategoryIdDelete**
> any deleteCategoryApiV1CategoriesCategoryIdDelete()

Delete a specific category.

### Example

```typescript
import {
    CategoriesApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new CategoriesApi(configuration);

let categoryId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteCategoryApiV1CategoriesCategoryIdDelete(
    categoryId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
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

# **getCategoriesApiV1CategoriesGet**
> CategoryListResponse getCategoriesApiV1CategoriesGet()

List all categories.

### Example

```typescript
import {
    CategoriesApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new CategoriesApi(configuration);

let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 10)

const { status, data } = await apiInstance.getCategoriesApiV1CategoriesGet(
    page,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
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

# **getCategoryApiV1CategoriesCategoryIdGet**
> CategoryRead getCategoryApiV1CategoriesCategoryIdGet()

Get a specific category.

### Example

```typescript
import {
    CategoriesApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new CategoriesApi(configuration);

let categoryId: number; // (default to undefined)

const { status, data } = await apiInstance.getCategoryApiV1CategoriesCategoryIdGet(
    categoryId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **categoryId** | [**number**] |  | defaults to undefined|


### Return type

**CategoryRead**

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

# **updateCategoryApiV1CategoriesCategoryIdPut**
> CategoryRead updateCategoryApiV1CategoriesCategoryIdPut(categoryUpdate)

Update a specific category.

### Example

```typescript
import {
    CategoriesApi,
    Configuration,
    CategoryUpdate
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new CategoriesApi(configuration);

let categoryId: number; // (default to undefined)
let categoryUpdate: CategoryUpdate; //

const { status, data } = await apiInstance.updateCategoryApiV1CategoriesCategoryIdPut(
    categoryId,
    categoryUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **categoryUpdate** | **CategoryUpdate**|  | |
| **categoryId** | [**number**] |  | defaults to undefined|


### Return type

**CategoryRead**

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

