## opengraph-api-client@1.0.0

This generator creates TypeScript/JavaScript client that utilizes [axios](https://github.com/axios/axios). The generated Node module can be used in the following environments:

Environment
* Node.js
* Webpack
* Browserify

Language level
* ES5 - you must have a Promises/A+ library installed
* ES6

Module system
* CommonJS
* ES6 module system

It can be used in both TypeScript and JavaScript. In TypeScript, the definition will be automatically resolved via `package.json`. ([Reference](https://www.typescriptlang.org/docs/handbook/declaration-files/consumption.html))

### Building

To build and compile the typescript sources to javascript use:
```
npm install
npm run build
```

### Publishing

First build the package then run `npm publish`

### Consuming

navigate to the folder of your consuming project and run one of the following commands.

_published:_

```
npm install opengraph-api-client@1.0.0 --save
```

_unPublished (not recommended):_

```
npm install PATH_TO_GENERATED_PACKAGE --save
```

### Documentation for API Endpoints

All URIs are relative to *http://localhost*

Class | Method | HTTP request | Description
------------ | ------------- | ------------- | -------------
*AnnotationsApi* | [**createAnnotationSelectionApiV1AnnotationsSelectionsPost**](docs/AnnotationsApi.md#createannotationselectionapiv1annotationsselectionspost) | **POST** /api/v1/annotations/selections | Create Annotation Selection
*AnnotationsApi* | [**createAnnotationSelectionsBatchApiV1AnnotationsSelectionsBatchPost**](docs/AnnotationsApi.md#createannotationselectionsbatchapiv1annotationsselectionsbatchpost) | **POST** /api/v1/annotations/selections/batch | Create Annotation Selections Batch
*AnnotationsApi* | [**deleteAnnotationSelectionApiV1AnnotationsSelectionsSelectionIdDelete**](docs/AnnotationsApi.md#deleteannotationselectionapiv1annotationsselectionsselectioniddelete) | **DELETE** /api/v1/annotations/selections/{selection_id} | Delete Annotation Selection
*AnnotationsApi* | [**getAnnotationApiV1AnnotationsAnnotationIdGet**](docs/AnnotationsApi.md#getannotationapiv1annotationsannotationidget) | **GET** /api/v1/annotations/{annotation_id} | Get Annotation
*AnnotationsApi* | [**getAnnotationSelectionApiV1AnnotationsSelectionsSelectionIdGet**](docs/AnnotationsApi.md#getannotationselectionapiv1annotationsselectionsselectionidget) | **GET** /api/v1/annotations/selections/{selection_id} | Get Annotation Selection
*AnnotationsApi* | [**getAnnotationsByImageApiV1AnnotationsImageImageIdGet**](docs/AnnotationsApi.md#getannotationsbyimageapiv1annotationsimageimageidget) | **GET** /api/v1/annotations/image/{image_id} | Get Annotations By Image
*AnnotationsApi* | [**getApprovedAnnotationsApiV1AnnotationsApprovedGet**](docs/AnnotationsApi.md#getapprovedannotationsapiv1annotationsapprovedget) | **GET** /api/v1/annotations/approved | Get Approved Annotations
*AnnotationsApi* | [**getApprovedAnnotationsByImageApiV1AnnotationsImageImageIdApprovedGet**](docs/AnnotationsApi.md#getapprovedannotationsbyimageapiv1annotationsimageimageidapprovedget) | **GET** /api/v1/annotations/image/{image_id}/approved | Get Approved Annotations By Image
*AnnotationsApi* | [**getImageSelectionStatsApiV1AnnotationsSelectionsImageImageIdStatsGet**](docs/AnnotationsApi.md#getimageselectionstatsapiv1annotationsselectionsimageimageidstatsget) | **GET** /api/v1/annotations/selections/image/{image_id}/stats | Get Image Selection Stats
*AnnotationsApi* | [**getMyAnnotationSelectionsApiV1AnnotationsSelectionsMeGet**](docs/AnnotationsApi.md#getmyannotationselectionsapiv1annotationsselectionsmeget) | **GET** /api/v1/annotations/selections/me | Get My Annotation Selections
*AnnotationsApi* | [**updateAnnotationSelectionApiV1AnnotationsSelectionsSelectionIdPut**](docs/AnnotationsApi.md#updateannotationselectionapiv1annotationsselectionsselectionidput) | **PUT** /api/v1/annotations/selections/{selection_id} | Update Annotation Selection
*AuthenticationApi* | [**generateZkProofApiV1AuthZkloginProvePost**](docs/AuthenticationApi.md#generatezkproofapiv1authzkloginprovepost) | **POST** /api/v1/auth/zklogin/prove | Generate Zk Proof
*AuthenticationApi* | [**getMeApiV1AuthMeGet**](docs/AuthenticationApi.md#getmeapiv1authmeget) | **GET** /api/v1/auth/me | Get Me
*AuthenticationApi* | [**googleCallbackApiV1AuthGoogleCallbackGet**](docs/AuthenticationApi.md#googlecallbackapiv1authgooglecallbackget) | **GET** /api/v1/auth/google/callback | Google Callback
*AuthenticationApi* | [**updateSuiAddressApiV1AuthSuiAddressPost**](docs/AuthenticationApi.md#updatesuiaddressapiv1authsuiaddresspost) | **POST** /api/v1/auth/sui-address | Update Sui Address
*AuthenticationApi* | [**zkloginInitApiV1AuthZkloginInitPost**](docs/AuthenticationApi.md#zklogininitapiv1authzklogininitpost) | **POST** /api/v1/auth/zklogin/init | Zklogin Init
*CategoriesApi* | [**createCategoryApiV1CategoriesPost**](docs/CategoriesApi.md#createcategoryapiv1categoriespost) | **POST** /api/v1/categories/ | Create Category
*CategoriesApi* | [**deleteCategoryApiV1CategoriesCategoryIdDelete**](docs/CategoriesApi.md#deletecategoryapiv1categoriescategoryiddelete) | **DELETE** /api/v1/categories/{category_id} | Delete Category
*CategoriesApi* | [**getCategoryApiV1CategoriesCategoryIdGet**](docs/CategoriesApi.md#getcategoryapiv1categoriescategoryidget) | **GET** /api/v1/categories/{category_id} | Get Category
*CategoriesApi* | [**updateCategoryApiV1CategoriesCategoryIdPut**](docs/CategoriesApi.md#updatecategoryapiv1categoriescategoryidput) | **PUT** /api/v1/categories/{category_id} | Update Category
*DatasetsApi* | [**createDatasetApiV1DatasetsPost**](docs/DatasetsApi.md#createdatasetapiv1datasetspost) | **POST** /api/v1/datasets/ | Create Dataset
*DatasetsApi* | [**deleteDatasetApiV1DatasetsDatasetIdDelete**](docs/DatasetsApi.md#deletedatasetapiv1datasetsdatasetiddelete) | **DELETE** /api/v1/datasets/{dataset_id} | Delete Dataset
*DatasetsApi* | [**getDatasetApiV1DatasetsDatasetIdGet**](docs/DatasetsApi.md#getdatasetapiv1datasetsdatasetidget) | **GET** /api/v1/datasets/{dataset_id} | Get Dataset
*DatasetsApi* | [**getDatasetImagesApiV1DatasetsDatasetIdImagesGet**](docs/DatasetsApi.md#getdatasetimagesapiv1datasetsdatasetidimagesget) | **GET** /api/v1/datasets/{dataset_id}/images | Get Dataset Images
*DatasetsApi* | [**getDatasetsApiV1DatasetsGet**](docs/DatasetsApi.md#getdatasetsapiv1datasetsget) | **GET** /api/v1/datasets/ | Get Datasets
*DatasetsApi* | [**updateDatasetApiV1DatasetsDatasetIdPut**](docs/DatasetsApi.md#updatedatasetapiv1datasetsdatasetidput) | **PUT** /api/v1/datasets/{dataset_id} | Update Dataset
*DefaultApi* | [**healthCheckHealthGet**](docs/DefaultApi.md#healthcheckhealthget) | **GET** /health | Health Check
*DefaultApi* | [**rootGet**](docs/DefaultApi.md#rootget) | **GET** / | Root
*DictionariesApi* | [**createDictionaryApiV1DictionariesPost**](docs/DictionariesApi.md#createdictionaryapiv1dictionariespost) | **POST** /api/v1/dictionaries/ | Create Dictionary
*DictionariesApi* | [**getDictionaryApiV1DictionariesDictionaryIdGet**](docs/DictionariesApi.md#getdictionaryapiv1dictionariesdictionaryidget) | **GET** /api/v1/dictionaries/{dictionary_id} | Get Dictionary
*DictionaryCategoriesApi* | [**createDictionaryCategoriesBatchApiV1DictionaryCategoriesBatchPost**](docs/DictionaryCategoriesApi.md#createdictionarycategoriesbatchapiv1dictionarycategoriesbatchpost) | **POST** /api/v1/dictionary-categories/batch | Create Dictionary Categories Batch
*DictionaryCategoriesApi* | [**createDictionaryCategoryApiV1DictionaryCategoriesPost**](docs/DictionaryCategoriesApi.md#createdictionarycategoryapiv1dictionarycategoriespost) | **POST** /api/v1/dictionary-categories/ | Create Dictionary Category
*DictionaryCategoriesApi* | [**deleteDictionaryCategoryApiV1DictionaryCategoriesDictionaryIdCategoryIdDelete**](docs/DictionaryCategoriesApi.md#deletedictionarycategoryapiv1dictionarycategoriesdictionaryidcategoryiddelete) | **DELETE** /api/v1/dictionary-categories/{dictionary_id}/{category_id} | Delete Dictionary Category
*DictionaryCategoriesApi* | [**getDictionaryCategoriesApiV1DictionaryCategoriesDictionaryIdGet**](docs/DictionaryCategoriesApi.md#getdictionarycategoriesapiv1dictionarycategoriesdictionaryidget) | **GET** /api/v1/dictionary-categories/{dictionary_id} | Get Dictionary Categories
*ImagesApi* | [**addImageApiV1ImagesPost**](docs/ImagesApi.md#addimageapiv1imagespost) | **POST** /api/v1/images/ | Add Image
*ImagesApi* | [**getImageApiV1ImagesImageIdGet**](docs/ImagesApi.md#getimageapiv1imagesimageidget) | **GET** /api/v1/images/{image_id} | Get Image
*ImagesApi* | [**getImagesApiV1ImagesGet**](docs/ImagesApi.md#getimagesapiv1imagesget) | **GET** /api/v1/images/ | Get Images
*UsersApi* | [**createUserApiV1UsersPost**](docs/UsersApi.md#createuserapiv1userspost) | **POST** /api/v1/users/ | Create User
*UsersApi* | [**deleteCurrentUserApiV1UsersMeDelete**](docs/UsersApi.md#deletecurrentuserapiv1usersmedelete) | **DELETE** /api/v1/users/me | Delete Current User
*UsersApi* | [**deleteUserApiV1UsersUserIdDelete**](docs/UsersApi.md#deleteuserapiv1usersuseriddelete) | **DELETE** /api/v1/users/{user_id} | Delete User
*UsersApi* | [**getCurrentUserInfoApiV1UsersMeGet**](docs/UsersApi.md#getcurrentuserinfoapiv1usersmeget) | **GET** /api/v1/users/me | Get Current User Info
*UsersApi* | [**getCurrentUserProfileApiV1UsersMeProfileGet**](docs/UsersApi.md#getcurrentuserprofileapiv1usersmeprofileget) | **GET** /api/v1/users/me/profile | Get Current User Profile
*UsersApi* | [**getUserApiV1UsersUserIdGet**](docs/UsersApi.md#getuserapiv1usersuseridget) | **GET** /api/v1/users/{user_id} | Get User
*UsersApi* | [**getUserProfileApiV1UsersUserIdProfileGet**](docs/UsersApi.md#getuserprofileapiv1usersuseridprofileget) | **GET** /api/v1/users/{user_id}/profile | Get User Profile
*UsersApi* | [**getUsersApiV1UsersGet**](docs/UsersApi.md#getusersapiv1usersget) | **GET** /api/v1/users/ | Get Users
*UsersApi* | [**searchUserByEmailApiV1UsersSearchByEmailGet**](docs/UsersApi.md#searchuserbyemailapiv1userssearchbyemailget) | **GET** /api/v1/users/search/by-email | Search User By Email
*UsersApi* | [**searchUserBySuiAddressApiV1UsersSearchBySuiAddressGet**](docs/UsersApi.md#searchuserbysuiaddressapiv1userssearchbysuiaddressget) | **GET** /api/v1/users/search/by-sui-address | Search User By Sui Address
*UsersApi* | [**updateCurrentUserApiV1UsersMePut**](docs/UsersApi.md#updatecurrentuserapiv1usersmeput) | **PUT** /api/v1/users/me | Update Current User
*UsersApi* | [**updateUserApiV1UsersUserIdPut**](docs/UsersApi.md#updateuserapiv1usersuseridput) | **PUT** /api/v1/users/{user_id} | Update User


### Documentation For Models

 - [AnnotationClientRead](docs/AnnotationClientRead.md)
 - [AnnotationListResponse](docs/AnnotationListResponse.md)
 - [AnnotationRead](docs/AnnotationRead.md)
 - [AnnotationSelectionStats](docs/AnnotationSelectionStats.md)
 - [CategoryCreate](docs/CategoryCreate.md)
 - [CategoryListResponse](docs/CategoryListResponse.md)
 - [CategoryRead](docs/CategoryRead.md)
 - [CategoryUpdate](docs/CategoryUpdate.md)
 - [CurrentUserResponse](docs/CurrentUserResponse.md)
 - [DatasetCreate](docs/DatasetCreate.md)
 - [DatasetListItem](docs/DatasetListItem.md)
 - [DatasetListResponse](docs/DatasetListResponse.md)
 - [DatasetRead](docs/DatasetRead.md)
 - [DatasetUpdate](docs/DatasetUpdate.md)
 - [DictionaryCategoryBatchCreate](docs/DictionaryCategoryBatchCreate.md)
 - [DictionaryCategoryCreate](docs/DictionaryCategoryCreate.md)
 - [DictionaryCategoryRead](docs/DictionaryCategoryRead.md)
 - [DictionaryCreate](docs/DictionaryCreate.md)
 - [DictionaryRead](docs/DictionaryRead.md)
 - [HTTPValidationError](docs/HTTPValidationError.md)
 - [ImageCreate](docs/ImageCreate.md)
 - [ImageListResponse](docs/ImageListResponse.md)
 - [ImageRead](docs/ImageRead.md)
 - [UpdateSuiAddressRequest](docs/UpdateSuiAddressRequest.md)
 - [UpdateSuiAddressResponse](docs/UpdateSuiAddressResponse.md)
 - [UserAnnotationSelectionBatchCreate](docs/UserAnnotationSelectionBatchCreate.md)
 - [UserAnnotationSelectionBatchResponse](docs/UserAnnotationSelectionBatchResponse.md)
 - [UserAnnotationSelectionCreate](docs/UserAnnotationSelectionCreate.md)
 - [UserAnnotationSelectionRead](docs/UserAnnotationSelectionRead.md)
 - [UserAnnotationSelectionUpdate](docs/UserAnnotationSelectionUpdate.md)
 - [UserCreate](docs/UserCreate.md)
 - [UserProfile](docs/UserProfile.md)
 - [UserRead](docs/UserRead.md)
 - [UserUpdate](docs/UserUpdate.md)
 - [ValidationError](docs/ValidationError.md)
 - [ValidationErrorLocInner](docs/ValidationErrorLocInner.md)
 - [ZkLoginInitRequest](docs/ZkLoginInitRequest.md)
 - [ZkLoginInitResponse](docs/ZkLoginInitResponse.md)
 - [ZkProofRequest](docs/ZkProofRequest.md)
 - [ZkProofResponse](docs/ZkProofResponse.md)


<a id="documentation-for-authorization"></a>
## Documentation For Authorization


Authentication schemes defined for the API:
<a id="HTTPBearer"></a>
### HTTPBearer

- **Type**: Bearer authentication

