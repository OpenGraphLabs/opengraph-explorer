# AnnotationsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createUserAnnotationApiV1AnnotationsPost**](#createuserannotationapiv1annotationspost) | **POST** /api/v1/annotations/ | Create User Annotation|
|[**getAnnotationApiV1AnnotationsAnnotationIdGet**](#getannotationapiv1annotationsannotationidget) | **GET** /api/v1/annotations/{annotation_id} | Get Annotation|
|[**getAnnotationsByImageApiV1AnnotationsImageImageIdGet**](#getannotationsbyimageapiv1annotationsimageimageidget) | **GET** /api/v1/annotations/image/{image_id} | Get Annotations By Image|

# **createUserAnnotationApiV1AnnotationsPost**
> AnnotationRead createUserAnnotationApiV1AnnotationsPost(annotationUserCreate)

Create a new annotation

### Example

```typescript
import {
    AnnotationsApi,
    Configuration,
    AnnotationUserCreate
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new AnnotationsApi(configuration);

let annotationUserCreate: AnnotationUserCreate; //

const { status, data } = await apiInstance.createUserAnnotationApiV1AnnotationsPost(
    annotationUserCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **annotationUserCreate** | **AnnotationUserCreate**|  | |


### Return type

**AnnotationRead**

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

# **getAnnotationApiV1AnnotationsAnnotationIdGet**
> AnnotationRead getAnnotationApiV1AnnotationsAnnotationIdGet()

Get a annotation by id

### Example

```typescript
import {
    AnnotationsApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new AnnotationsApi(configuration);

let annotationId: number; // (default to undefined)

const { status, data } = await apiInstance.getAnnotationApiV1AnnotationsAnnotationIdGet(
    annotationId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **annotationId** | [**number**] |  | defaults to undefined|


### Return type

**AnnotationRead**

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

# **getAnnotationsByImageApiV1AnnotationsImageImageIdGet**
> Array<AnnotationRead> getAnnotationsByImageApiV1AnnotationsImageImageIdGet()

Get all annotations for a specific image with client-friendly mask information

### Example

```typescript
import {
    AnnotationsApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new AnnotationsApi(configuration);

let imageId: number; // (default to undefined)

const { status, data } = await apiInstance.getAnnotationsByImageApiV1AnnotationsImageImageIdGet(
    imageId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **imageId** | [**number**] |  | defaults to undefined|


### Return type

**Array<AnnotationRead>**

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

