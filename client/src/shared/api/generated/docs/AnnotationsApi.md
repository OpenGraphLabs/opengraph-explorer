# AnnotationsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createAnnotationSelectionApiV1AnnotationsSelectionsPost**](#createannotationselectionapiv1annotationsselectionspost) | **POST** /api/v1/annotations/selections | Create Annotation Selection|
|[**createAnnotationSelectionsBatchApiV1AnnotationsSelectionsBatchPost**](#createannotationselectionsbatchapiv1annotationsselectionsbatchpost) | **POST** /api/v1/annotations/selections/batch | Create Annotation Selections Batch|
|[**deleteAnnotationSelectionApiV1AnnotationsSelectionsSelectionIdDelete**](#deleteannotationselectionapiv1annotationsselectionsselectioniddelete) | **DELETE** /api/v1/annotations/selections/{selection_id} | Delete Annotation Selection|
|[**getAnnotationApiV1AnnotationsAnnotationIdGet**](#getannotationapiv1annotationsannotationidget) | **GET** /api/v1/annotations/{annotation_id} | Get Annotation|
|[**getAnnotationSelectionApiV1AnnotationsSelectionsSelectionIdGet**](#getannotationselectionapiv1annotationsselectionsselectionidget) | **GET** /api/v1/annotations/selections/{selection_id} | Get Annotation Selection|
|[**getAnnotationsByImageApiV1AnnotationsImageImageIdGet**](#getannotationsbyimageapiv1annotationsimageimageidget) | **GET** /api/v1/annotations/image/{image_id} | Get Annotations By Image|
|[**getApprovedAnnotationsApiV1AnnotationsApprovedGet**](#getapprovedannotationsapiv1annotationsapprovedget) | **GET** /api/v1/annotations/approved | Get Approved Annotations|
|[**getApprovedAnnotationsByImageApiV1AnnotationsImageImageIdApprovedGet**](#getapprovedannotationsbyimageapiv1annotationsimageimageidapprovedget) | **GET** /api/v1/annotations/image/{image_id}/approved | Get Approved Annotations By Image|
|[**getImageSelectionStatsApiV1AnnotationsSelectionsImageImageIdStatsGet**](#getimageselectionstatsapiv1annotationsselectionsimageimageidstatsget) | **GET** /api/v1/annotations/selections/image/{image_id}/stats | Get Image Selection Stats|
|[**getMyAnnotationSelectionsApiV1AnnotationsSelectionsMeGet**](#getmyannotationselectionsapiv1annotationsselectionsmeget) | **GET** /api/v1/annotations/selections/me | Get My Annotation Selections|
|[**updateAnnotationSelectionApiV1AnnotationsSelectionsSelectionIdPut**](#updateannotationselectionapiv1annotationsselectionsselectionidput) | **PUT** /api/v1/annotations/selections/{selection_id} | Update Annotation Selection|

# **createAnnotationSelectionApiV1AnnotationsSelectionsPost**
> UserAnnotationSelectionRead createAnnotationSelectionApiV1AnnotationsSelectionsPost(userAnnotationSelectionCreate)

Create a new annotation selection  Records user selections that combine multiple AUTO annotations to form a meaningful entity. If the same selection is made by five or more users, it is automatically marked as APPROVED.

### Example

```typescript
import {
    AnnotationsApi,
    Configuration,
    UserAnnotationSelectionCreate
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new AnnotationsApi(configuration);

let userAnnotationSelectionCreate: UserAnnotationSelectionCreate; //

const { status, data } = await apiInstance.createAnnotationSelectionApiV1AnnotationsSelectionsPost(
    userAnnotationSelectionCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userAnnotationSelectionCreate** | **UserAnnotationSelectionCreate**|  | |


### Return type

**UserAnnotationSelectionRead**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createAnnotationSelectionsBatchApiV1AnnotationsSelectionsBatchPost**
> UserAnnotationSelectionBatchResponse createAnnotationSelectionsBatchApiV1AnnotationsSelectionsBatchPost(userAnnotationSelectionBatchCreate)

Create multiple annotation selections in batch  Allows creating multiple annotation selections at once for efficiency. Each selection in the batch is processed independently - some may succeed while others fail.  Request body example: {     \"selections\": [         {             \"image_id\": 3,             \"selected_annotation_ids\": [1, 3, 4],             \"category_id\": 5         },         {             \"image_id\": 3,              \"selected_annotation_ids\": [2, 6, 7],             \"category_id\": 7         }     ] }

### Example

```typescript
import {
    AnnotationsApi,
    Configuration,
    UserAnnotationSelectionBatchCreate
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new AnnotationsApi(configuration);

let userAnnotationSelectionBatchCreate: UserAnnotationSelectionBatchCreate; //

const { status, data } = await apiInstance.createAnnotationSelectionsBatchApiV1AnnotationsSelectionsBatchPost(
    userAnnotationSelectionBatchCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userAnnotationSelectionBatchCreate** | **UserAnnotationSelectionBatchCreate**|  | |


### Return type

**UserAnnotationSelectionBatchResponse**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deleteAnnotationSelectionApiV1AnnotationsSelectionsSelectionIdDelete**
> any deleteAnnotationSelectionApiV1AnnotationsSelectionsSelectionIdDelete()

Delete a annotation selection (only available for that annotator)

### Example

```typescript
import {
    AnnotationsApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new AnnotationsApi(configuration);

let selectionId: number; // (default to undefined)

const { status, data } = await apiInstance.deleteAnnotationSelectionApiV1AnnotationsSelectionsSelectionIdDelete(
    selectionId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **selectionId** | [**number**] |  | defaults to undefined|


### Return type

**any**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
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

# **getAnnotationSelectionApiV1AnnotationsSelectionsSelectionIdGet**
> UserAnnotationSelectionRead getAnnotationSelectionApiV1AnnotationsSelectionsSelectionIdGet()

Get a annotation selection by id

### Example

```typescript
import {
    AnnotationsApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new AnnotationsApi(configuration);

let selectionId: number; // (default to undefined)

const { status, data } = await apiInstance.getAnnotationSelectionApiV1AnnotationsSelectionsSelectionIdGet(
    selectionId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **selectionId** | [**number**] |  | defaults to undefined|


### Return type

**UserAnnotationSelectionRead**

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
> Array<AnnotationClientRead> getAnnotationsByImageApiV1AnnotationsImageImageIdGet()

Get all annotations for a specific image with client-friendly format (polygon data, no RLE)

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

**Array<AnnotationClientRead>**

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

# **getApprovedAnnotationsApiV1AnnotationsApprovedGet**
> AnnotationListResponse getApprovedAnnotationsApiV1AnnotationsApprovedGet()

List all approved annotations.

### Example

```typescript
import {
    AnnotationsApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new AnnotationsApi(configuration);

let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 10)

const { status, data } = await apiInstance.getApprovedAnnotationsApiV1AnnotationsApprovedGet(
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

**AnnotationListResponse**

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

# **getApprovedAnnotationsByImageApiV1AnnotationsImageImageIdApprovedGet**
> Array<AnnotationClientRead> getApprovedAnnotationsByImageApiV1AnnotationsImageImageIdApprovedGet()

Get all annotations for a specific image with client-friendly format (polygon data, no RLE)

### Example

```typescript
import {
    AnnotationsApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new AnnotationsApi(configuration);

let imageId: number; // (default to undefined)

const { status, data } = await apiInstance.getApprovedAnnotationsByImageApiV1AnnotationsImageImageIdApprovedGet(
    imageId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **imageId** | [**number**] |  | defaults to undefined|


### Return type

**Array<AnnotationClientRead>**

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

# **getImageSelectionStatsApiV1AnnotationsSelectionsImageImageIdStatsGet**
> Array<AnnotationSelectionStats> getImageSelectionStatsApiV1AnnotationsSelectionsImageImageIdStatsGet()

Get annotation selection stats for a specific image  Provides information such as the number of users who made the same selection and whether it qualifies for approval.

### Example

```typescript
import {
    AnnotationsApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new AnnotationsApi(configuration);

let imageId: number; // (default to undefined)

const { status, data } = await apiInstance.getImageSelectionStatsApiV1AnnotationsSelectionsImageImageIdStatsGet(
    imageId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **imageId** | [**number**] |  | defaults to undefined|


### Return type

**Array<AnnotationSelectionStats>**

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

# **getMyAnnotationSelectionsApiV1AnnotationsSelectionsMeGet**
> Array<UserAnnotationSelectionRead> getMyAnnotationSelectionsApiV1AnnotationsSelectionsMeGet()

List annotation selections for specific user

### Example

```typescript
import {
    AnnotationsApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new AnnotationsApi(configuration);

let imageId: number; //특정 이미지의 선택만 조회 (optional) (default to undefined)
let selectionStatus: string; //특정 상태의 선택만 조회 (PENDING|APPROVED|REJECTED) (optional) (default to undefined)
let limit: number; //조회할 선택 수 (optional) (default to 100)
let offset: number; //건너뛸 선택 수 (optional) (default to 0)

const { status, data } = await apiInstance.getMyAnnotationSelectionsApiV1AnnotationsSelectionsMeGet(
    imageId,
    selectionStatus,
    limit,
    offset
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **imageId** | [**number**] | 특정 이미지의 선택만 조회 | (optional) defaults to undefined|
| **selectionStatus** | [**string**] | 특정 상태의 선택만 조회 (PENDING|APPROVED|REJECTED) | (optional) defaults to undefined|
| **limit** | [**number**] | 조회할 선택 수 | (optional) defaults to 100|
| **offset** | [**number**] | 건너뛸 선택 수 | (optional) defaults to 0|


### Return type

**Array<UserAnnotationSelectionRead>**

### Authorization

[HTTPBearer](../README.md#HTTPBearer)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |
|**422** | Validation Error |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updateAnnotationSelectionApiV1AnnotationsSelectionsSelectionIdPut**
> UserAnnotationSelectionRead updateAnnotationSelectionApiV1AnnotationsSelectionsSelectionIdPut(userAnnotationSelectionUpdate)

Update a annotation selection  Mainly used for category update or status change by administrator

### Example

```typescript
import {
    AnnotationsApi,
    Configuration,
    UserAnnotationSelectionUpdate
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new AnnotationsApi(configuration);

let selectionId: number; // (default to undefined)
let userAnnotationSelectionUpdate: UserAnnotationSelectionUpdate; //

const { status, data } = await apiInstance.updateAnnotationSelectionApiV1AnnotationsSelectionsSelectionIdPut(
    selectionId,
    userAnnotationSelectionUpdate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userAnnotationSelectionUpdate** | **UserAnnotationSelectionUpdate**|  | |
| **selectionId** | [**number**] |  | defaults to undefined|


### Return type

**UserAnnotationSelectionRead**

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

