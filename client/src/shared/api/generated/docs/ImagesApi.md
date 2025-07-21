# ImagesApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**addImageApiV1ImagesPost**](#addimageapiv1imagespost) | **POST** /api/v1/images/ | Add Image|
|[**getImageApiV1ImagesImageIdGet**](#getimageapiv1imagesimageidget) | **GET** /api/v1/images/{image_id} | Get Image|

# **addImageApiV1ImagesPost**
> ImageRead addImageApiV1ImagesPost(imageCreate)

Add a new image to specific dataset.

### Example

```typescript
import {
    ImagesApi,
    Configuration,
    ImageCreate
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new ImagesApi(configuration);

let imageCreate: ImageCreate; //

const { status, data } = await apiInstance.addImageApiV1ImagesPost(
    imageCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **imageCreate** | **ImageCreate**|  | |


### Return type

**ImageRead**

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

# **getImageApiV1ImagesImageIdGet**
> ImageRead getImageApiV1ImagesImageIdGet()

Get specific image by ID.

### Example

```typescript
import {
    ImagesApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new ImagesApi(configuration);

let imageId: number; // (default to undefined)

const { status, data } = await apiInstance.getImageApiV1ImagesImageIdGet(
    imageId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **imageId** | [**number**] |  | defaults to undefined|


### Return type

**ImageRead**

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

