# DatasetsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createDatasetApiV1DatasetsPost**](#createdatasetapiv1datasetspost) | **POST** /api/v1/datasets/ | Create Dataset|
|[**deleteDatasetApiV1DatasetsDatasetIdDelete**](#deletedatasetapiv1datasetsdatasetiddelete) | **DELETE** /api/v1/datasets/{dataset_id} | Delete Dataset|
|[**getDatasetApiV1DatasetsDatasetIdGet**](#getdatasetapiv1datasetsdatasetidget) | **GET** /api/v1/datasets/{dataset_id} | Get Dataset|
|[**getDatasetImagesApiV1DatasetsDatasetIdImagesGet**](#getdatasetimagesapiv1datasetsdatasetidimagesget) | **GET** /api/v1/datasets/{dataset_id}/images | Get Dataset Images|
|[**getDatasetsApiV1DatasetsGet**](#getdatasetsapiv1datasetsget) | **GET** /api/v1/datasets/ | Get Datasets|
|[**updateDatasetApiV1DatasetsDatasetIdPut**](#updatedatasetapiv1datasetsdatasetidput) | **PUT** /api/v1/datasets/{dataset_id} | Update Dataset|

# **createDatasetApiV1DatasetsPost**
> DatasetRead createDatasetApiV1DatasetsPost(datasetCreate)

Create a new dataset.

### Example

```typescript
import {
    DatasetsApi,
    Configuration,
    DatasetCreate
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new DatasetsApi(configuration);

let datasetCreate: DatasetCreate; //

const { status, data } = await apiInstance.createDatasetApiV1DatasetsPost(
    datasetCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **datasetCreate** | **DatasetCreate**|  | |


### Return type

**DatasetRead**

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

# **deleteDatasetApiV1DatasetsDatasetIdDelete**
> deleteDatasetApiV1DatasetsDatasetIdDelete()

데이터셋을 삭제합니다.

### Example

```typescript
import {
    DatasetsApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new DatasetsApi(configuration);

let datasetId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteDatasetApiV1DatasetsDatasetIdDelete(
    datasetId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **datasetId** | [**number**] |  | defaults to undefined|


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

# **getDatasetApiV1DatasetsDatasetIdGet**
> DatasetRead getDatasetApiV1DatasetsDatasetIdGet()

Get a dataset by id.

### Example

```typescript
import {
    DatasetsApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new DatasetsApi(configuration);

let datasetId: number; // (default to undefined)

const { status, data } = await apiInstance.getDatasetApiV1DatasetsDatasetIdGet(
    datasetId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **datasetId** | [**number**] |  | defaults to undefined|


### Return type

**DatasetRead**

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

# **getDatasetImagesApiV1DatasetsDatasetIdImagesGet**
> ImageListResponse getDatasetImagesApiV1DatasetsDatasetIdImagesGet()

Get all images in a dataset.

### Example

```typescript
import {
    DatasetsApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new DatasetsApi(configuration);

let datasetId: number; // (default to undefined)
let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 100)

const { status, data } = await apiInstance.getDatasetImagesApiV1DatasetsDatasetIdImagesGet(
    datasetId,
    page,
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **datasetId** | [**number**] |  | defaults to undefined|
| **page** | [**number**] |  | (optional) defaults to 1|
| **limit** | [**number**] |  | (optional) defaults to 100|


### Return type

**ImageListResponse**

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

# **getDatasetsApiV1DatasetsGet**
> DatasetListResponse getDatasetsApiV1DatasetsGet()

List all datasets.

### Example

```typescript
import {
    DatasetsApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new DatasetsApi(configuration);

let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 10)

const { status, data } = await apiInstance.getDatasetsApiV1DatasetsGet(
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

**DatasetListResponse**

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

# **updateDatasetApiV1DatasetsDatasetIdPut**
> DatasetRead updateDatasetApiV1DatasetsDatasetIdPut(datasetUpdate)

데이터셋을 업데이트합니다.

### Example

```typescript
import {
    DatasetsApi,
    Configuration,
    DatasetUpdate
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new DatasetsApi(configuration);

let datasetId: number; // (default to undefined)
let datasetUpdate: DatasetUpdate; //

const { status, data } = await apiInstance.updateDatasetApiV1DatasetsDatasetIdPut(
    datasetId,
    datasetUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **datasetUpdate** | **DatasetUpdate**|  | |
| **datasetId** | [**number**] |  | defaults to undefined|


### Return type

**DatasetRead**

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

