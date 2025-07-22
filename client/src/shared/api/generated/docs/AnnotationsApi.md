# AnnotationsApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**approveSelectionsBatchApiV1AnnotationsSelectionsApproveBatchPost**](#approveselectionsbatchapiv1annotationsselectionsapprovebatchpost) | **POST** /api/v1/annotations/selections/approve-batch | Approve Selections Batch|
|[**createAnnotationSelectionApiV1AnnotationsSelectionsPost**](#createannotationselectionapiv1annotationsselectionspost) | **POST** /api/v1/annotations/selections | Create Annotation Selection|
|[**createAnnotationSelectionsBatchApiV1AnnotationsSelectionsBatchPost**](#createannotationselectionsbatchapiv1annotationsselectionsbatchpost) | **POST** /api/v1/annotations/selections/batch | Create Annotation Selections Batch|
|[**createUserAnnotationApiV1AnnotationsPost**](#createuserannotationapiv1annotationspost) | **POST** /api/v1/annotations/ | Create User Annotation|
|[**deleteAnnotationSelectionApiV1AnnotationsSelectionsSelectionIdDelete**](#deleteannotationselectionapiv1annotationsselectionsselectioniddelete) | **DELETE** /api/v1/annotations/selections/{selection_id} | Delete Annotation Selection|
|[**getAnnotationApiV1AnnotationsAnnotationIdGet**](#getannotationapiv1annotationsannotationidget) | **GET** /api/v1/annotations/{annotation_id} | Get Annotation|
|[**getAnnotationSelectionApiV1AnnotationsSelectionsSelectionIdGet**](#getannotationselectionapiv1annotationsselectionsselectionidget) | **GET** /api/v1/annotations/selections/{selection_id} | Get Annotation Selection|
|[**getAnnotationsByImageApiV1AnnotationsImageImageIdGet**](#getannotationsbyimageapiv1annotationsimageimageidget) | **GET** /api/v1/annotations/image/{image_id} | Get Annotations By Image|
|[**getApprovedAnnotationsApiV1AnnotationsApprovedGet**](#getapprovedannotationsapiv1annotationsapprovedget) | **GET** /api/v1/annotations/approved | Get Approved Annotations|
|[**getImageSelectionStatsApiV1AnnotationsSelectionsImageImageIdStatsGet**](#getimageselectionstatsapiv1annotationsselectionsimageimageidstatsget) | **GET** /api/v1/annotations/selections/image/{image_id}/stats | Get Image Selection Stats|
|[**getMyAnnotationSelectionsApiV1AnnotationsSelectionsMeGet**](#getmyannotationselectionsapiv1annotationsselectionsmeget) | **GET** /api/v1/annotations/selections/me | Get My Annotation Selections|
|[**getSelectionSummaryApiV1AnnotationsSelectionsSummaryGet**](#getselectionsummaryapiv1annotationsselectionssummaryget) | **GET** /api/v1/annotations/selections/summary | Get Selection Summary|
|[**getSelectionsReadyForApprovalApiV1AnnotationsSelectionsReadyForApprovalGet**](#getselectionsreadyforapprovalapiv1annotationsselectionsreadyforapprovalget) | **GET** /api/v1/annotations/selections/ready-for-approval | Get Selections Ready For Approval|
|[**updateAnnotationSelectionApiV1AnnotationsSelectionsSelectionIdPut**](#updateannotationselectionapiv1annotationsselectionsselectionidput) | **PUT** /api/v1/annotations/selections/{selection_id} | Update Annotation Selection|

# **approveSelectionsBatchApiV1AnnotationsSelectionsApproveBatchPost**
> any approveSelectionsBatchApiV1AnnotationsSelectionsApproveBatchPost(requestBody)

Bulk-approves annotation selections.  Used by administrators to process selections that are eligible for approval in bulk.

### Example

```typescript
import {
    AnnotationsApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new AnnotationsApi(configuration);

let requestBody: Array<object>; //

const { status, data } = await apiInstance.approveSelectionsBatchApiV1AnnotationsSelectionsApproveBatchPost(
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **Array<object>**|  | |


### Return type

**any**

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

# **getSelectionSummaryApiV1AnnotationsSelectionsSummaryGet**
> AnnotationSelectionSummary getSelectionSummaryApiV1AnnotationsSelectionsSummaryGet()

Get annotation selection summary  Provides summary information such as total number of selections, distribution by status, and number of selections pending approval.

### Example

```typescript
import {
    AnnotationsApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new AnnotationsApi(configuration);

const { status, data } = await apiInstance.getSelectionSummaryApiV1AnnotationsSelectionsSummaryGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**AnnotationSelectionSummary**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | Successful Response |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getSelectionsReadyForApprovalApiV1AnnotationsSelectionsReadyForApprovalGet**
> Array<AnnotationSelectionStats> getSelectionsReadyForApprovalApiV1AnnotationsSelectionsReadyForApprovalGet()

Get annotation selections ready for approval  Returns items that have the same selection made by at least the specified minimum number of users.

### Example

```typescript
import {
    AnnotationsApi,
    Configuration
} from 'opengraph-api-client';

const configuration = new Configuration();
const apiInstance = new AnnotationsApi(configuration);

let minSelectionCount: number; //승인을 위한 최소 선택 수 (optional) (default to 5)

const { status, data } = await apiInstance.getSelectionsReadyForApprovalApiV1AnnotationsSelectionsReadyForApprovalGet(
    minSelectionCount
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **minSelectionCount** | [**number**] | 승인을 위한 최소 선택 수 | (optional) defaults to 5|


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

