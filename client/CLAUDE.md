# OpenGraph Explorer Client Development Guide

## Project Structure and Architecture

### Directory Structure
```
client/
├── src/
│   ├── app/                    # Application routing and global configuration
│   ├── pages/                  # Page components
│   ├── components/             # Reusable UI components
│   ├── contexts/               # React Context Providers
│   │   ├── data/              # Data management contexts
│   │   └── page/              # Page-specific state management contexts
│   ├── shared/                 # Shared utilities and components
│   │   ├── api/               # API clients and services
│   │   ├── hooks/             # Shared React hooks
│   │   ├── ui/                # Design system
│   │   └── utils/             # Utility functions
```

## Core Architecture Pattern: Context Provider-based "UI Database"

### Core Concept
A hierarchical data management system using React Context API where UI components focus purely on rendering while data logic is separated and managed in Providers.

### Provider Hierarchy

#### 1. Entity-Level Providers
```typescript
// Example: contexts/data/ImagesContext.tsx
interface ImagesConfig {
  limit?: number;
  page?: number;
  datasetId?: number;
  randomSeed?: number;
  fetchAnnotationCounts?: boolean;
}

export function ImagesProvider({ 
  children, 
  config = {} 
}: {
  children: ReactNode;
  config?: ImagesConfig;
}) {
  // Data fetching and state management logic
  // Using custom hooks
}
```

#### 2. Page-Level Providers
```typescript
// Example: contexts/page/HomePageContext.tsx
export function HomePageProvider({ children }: { children: ReactNode }) {
  // Page-specific state management
  // Combining entity data and page logic
}
```

### Provider Composition Pattern
```typescript
// Example: pages/Home.tsx
<AnnotationsProvider config={{ mode: 'approved', limit: 24 }}>
  <ImagesProvider config={{ limit: 100 }}>
    <CategoriesProvider config={{ dictionaryId: 1, limit: 100 }}>
      <HomePageProvider>
        <HomeContent />
      </HomePageProvider>
    </CategoriesProvider>
  </ImagesProvider>
</AnnotationsProvider>
```

## Development Guidelines

### 1. Page Component Pattern

#### Page Structure
```typescript
// pages/ExamplePage.tsx
export function ExamplePage() {
  return (
    <EntityProvider1 config={config1}>
      <EntityProvider2 config={config2}>
        <ExamplePageProvider>
          <ExamplePageContent />
        </ExamplePageProvider>
      </EntityProvider2>
    </EntityProvider1>
  );
}

// Page content as separate component
function ExamplePageContent() {
  const { data, loading } = useEntityProvider1();
  const { handleAction } = useExamplePageProvider();
  
  if (loading) return <LoadingState />;
  
  return (
    <div>
      {/* UI rendering logic only */}
    </div>
  );
}
```

#### Page Split Criteria
- **Large pages (500+ lines)**: Split by logical units
- **Data dependencies**: Each component uses only required contexts
- **Reusability**: Extract common logic to shared folder

### 2. Context Provider Guidelines

#### Entity Provider Pattern
```typescript
// contexts/data/EntityContext.tsx
interface EntityConfig {
  // Configuration options
}

export function EntityProvider({ children, config = {} }) {
  // 1. API calls and data fetching
  const { data, loading, error } = useApiQuery();
  
  // 2. Data transformation and processing
  const processedData = useMemo(() => {
    return transformData(data);
  }, [data]);
  
  // 3. Context value composition
  const value = {
    data: processedData,
    loading,
    error,
    // Required actions
  };
  
  return (
    <EntityContext.Provider value={value}>
      {children}
    </EntityContext.Provider>
  );
}

// Custom hook
export function useEntity() {
  const context = useContext(EntityContext);
  if (!context) {
    throw new Error('useEntity must be used within EntityProvider');
  }
  return context;
}
```

#### Page Provider Pattern
```typescript
// contexts/page/PageContext.tsx
export function PageProvider({ children }) {
  // 1. Use entity contexts
  const { data1 } = useEntity1();
  const { data2 } = useEntity2();
  
  // 2. Page-specific state management
  const [pageState, setPageState] = useState();
  
  // 3. Page-specific business logic
  const handlePageAction = useCallback(() => {
    // Logic implementation
  }, [data1, data2]);
  
  const value = {
    // Composed data
    // Page actions
  };
  
  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
}
```

### 3. Component Structure and Naming Conventions

#### Folder Structure
```
components/
├── datasets/           # Domain-specific components
│   ├── DatasetCard.tsx
│   ├── DatasetImageGallery.tsx
│   └── index.ts
├── annotations/        # Domain-specific components
└── shared/            # Common components
```

#### Naming Conventions
- **Components**: PascalCase (`DatasetCard`)
- **File names**: PascalCase (`DatasetCard.tsx`)
- **Hooks**: camelCase with use prefix (`useDatasets`)
- **Context**: PascalCase with Context suffix (`DatasetsContext`)
- **Provider**: PascalCase with Provider suffix (`DatasetsProvider`)

### 4. Shared Utilities Management

#### shared/utils Structure
```typescript
// shared/utils/dataset.ts
export type ActiveTab = "all" | "confirmed" | "pending";

export const ANNOTATION_COLORS = [
  // Color palette
];

export const DEFAULT_PAGE_SIZE = 25;

export const getAnnotationColor = (index: number) => {
  return ANNOTATION_COLORS[index % ANNOTATION_COLORS.length];
};

export const isImageType = (dataType: string): boolean => {
  return dataType.startsWith("image/");
};
```

### 5. API Integration Pattern - Generic CRUD Architecture

#### Core API Structure
```
shared/api/
├── generated/          # OpenAPI 생성 코드 (유지, legacy 호환용)
├── core/              # Generic API 레이어 
│   ├── client.ts      # Axios 클라이언트 및 인증
│   ├── hooks/         # 재사용 가능한 API hooks
│   │   ├── useSingleGet.ts
│   │   ├── usePaginatedGet.ts
│   │   ├── usePost.ts
│   │   └── index.ts
│   ├── types/         # 공통 타입 정의
│   └── index.ts
├── endpoints/         # 도메인별 API 정의 (새로운 패턴)
│   ├── datasets.ts    # ✅ 구현 완료
│   ├── users.ts       # ✅ 구현 완료  
│   ├── images.ts      # 🚧 마이그레이션 예정
│   ├── annotations.ts # 🚧 마이그레이션 예정
│   └── index.ts
└── services/          # 비즈니스 로직 (legacy, 점진적 제거)
```

#### Generic Hooks 사용 패턴
```typescript
// 1. Single Get Hook (기본 데이터)
import { useSingleGet } from '@/shared/api/core';

const { data, isLoading, error } = useSingleGet<APIResponseType, ClientType>({
  url: '/api/v1/datasets/1',
  authenticated: true,
  parseData: (raw) => ({ id: raw.id, name: raw.name })
});

// 2. Single Get Hook (통계 포함 데이터)  
const { data, isLoading, error } = useSingleGet<APIStatsResponseType, ClientStatsType>({
  url: '/api/v1/datasets/1',  // 또는 전용 엔드포인트
  authenticated: true,
  parseData: (raw) => transformWithStats(raw)
});

const { data, isLoading, error } = useSingleGet<RawType, ParsedType>({
  url: '/api/v1/datasets/1',
  authenticated: true,
  parseData: (raw) => ({ id: raw.id, name: raw.name })
});

// 2. Paginated Get Hook  
import { usePaginatedGet } from '@/shared/api/core';

const { data, totalCount, isLoading } = usePaginatedGet<RawItem, ApiResponse, ParsedItem>({
  url: '/api/v1/datasets',
  page: 1,
  limit: 20,
  search: 'query',
  sortBy: 'newest',
  authenticated: true,
  parseData: (item) => transformItem(item),
  setTotalPages: (total) => setPages(total)
});

// 3. Post/Put/Delete Hooks
import { usePost, usePut, useDelete } from '@/shared/api/core';

const { post, isPosting, error } = usePost<CreateData, RawResponse, ParsedResponse>(
  '/api/v1/datasets',
  (raw) => parseResponse(raw),
  { authenticated: true }
);
```

#### Endpoint Definition Pattern
```typescript
// shared/api/endpoints/datasets.ts
import { useSingleGet, usePaginatedGet, usePost, usePut, useDelete } from '../core/hooks';

// Type definitions with camelCase conversion
export interface Dataset {
  id: number;
  name: string;
  description?: string;
  tags?: string[];
  dictionaryId?: number;  // snake_case → camelCase
  createdBy?: number;
  createdAt: string;
}

// Parsing function for type conversion
const parseDataset = (raw: DatasetRead): Dataset => ({
  id: raw.id,
  name: raw.name,
  description: raw.description || undefined,
  tags: raw.tags || undefined,
  dictionaryId: raw.dictionary_id || undefined,  // 자동 변환
  createdBy: raw.created_by || undefined,
  createdAt: raw.created_at,
});

// CRUD hooks for domain
export function useDataset(datasetId: number, options = {}) {
  return useSingleGet<DatasetRead, Dataset>({
    url: `/api/v1/datasets/${datasetId}`,
    enabled: options.enabled && !!datasetId,
    authenticated: true,
    parseData: parseDataset,
  });
}

export function useDatasets(options = {}) {
  return usePaginatedGet<DatasetListItem, DatasetListResponse, Dataset>({
    url: '/api/v1/datasets',
    page: options.page || 1,
    limit: options.limit || 20,
    search: options.search,
    sortBy: options.sortBy,
    authenticated: true,
    parseData: parseDatasetListItem,
    setTotalPages: options.setTotalPages,
  });
}

export function useCreateDataset() {
  return usePost<DatasetCreateInput, DatasetRead, Dataset>(
    '/api/v1/datasets',
    parseDataset,
    { authenticated: true }
  );
}
```

## Latest Implemented Patterns (Dataset & User)

### Dataset API Pattern - Unified Statistics
**Status**: ✅ **완전 구현** - 모든 Dataset 엔드포인트 통일

#### 서버 변경사항
- **DatasetWithStats 통일**: 모든 endpoint에서 `image_count`, `annotation_count` 포함
- **GET /datasets**: `List[DatasetWithStats]` 반환
- **GET /datasets/{id}**: `DatasetWithStats` 반환  
- **POST /datasets**: `DatasetWithStats` 반환
- **PUT /datasets/{id}**: `DatasetWithStats` 반환

#### 클라이언트 구현
```typescript
// shared/api/endpoints/datasets.ts

// 기본 Dataset 타입 (통계 없음) - 사용 안함
export interface Dataset {
  id: number;
  name: string;
  description?: string;
  tags?: string[];
  dictionaryId?: number;
  createdBy?: number;
  createdAt: string;
}

// 통계 포함 Dataset 타입 (실제 사용)
export interface DatasetWithStats extends Dataset {
  imageCount: number;
  annotationCount: number;
}

// API Response 타입 (snake_case)
interface DatasetWithStatsResponse {
  id: number;
  name: string;
  description?: string | null;
  tags?: string[] | null;
  dictionary_id?: number | null;
  created_by?: number | null;
  created_at: string;
  image_count: number;
  annotation_count: number;
}

// 파싱 함수
const parseDatasetWithStats = (resp: DatasetWithStatsResponse): DatasetWithStats => ({
  id: resp.id,
  name: resp.name,
  description: resp.description || undefined,
  tags: resp.tags || undefined,
  dictionaryId: resp.dictionary_id || undefined,
  createdBy: resp.created_by || undefined,
  createdAt: resp.created_at,
  imageCount: resp.image_count,
  annotationCount: resp.annotation_count,
});

// CRUD Hooks (모두 DatasetWithStats 반환)
export function useDataset(datasetId: number, options = {}) {
  return useSingleGet<DatasetWithStatsResponse, DatasetWithStats>({
    url: `${DATASETS_BASE}/${datasetId}`,
    enabled: options.enabled && !!datasetId,
    authenticated: true,
    parseData: parseDatasetWithStats,
  });
}

export function useDatasets(options = {}) {
  return usePaginatedGet<DatasetWithStatsResponse, DatasetListResponse, DatasetWithStats>({
    url: DATASETS_BASE,
    page: options.page || 1,
    limit: options.limit || 25,
    search: options.search,
    sortBy: options.sortBy,
    authenticated: true,
    parseData: parseDatasetWithStats,
    setTotalPages: options.setTotalPages,
  });
}
```

### User API Pattern - 효율성 최적화
**Status**: ✅ **완전 구현** - 기본 정보와 통계 정보 분리

#### 서버 효율성 원칙
- **기본 User 작업**: `UserRead` 사용 (빠른 단일 테이블 쿼리)
- **통계 필요시**: `UserProfile` 사용 (JOIN 포함)

#### 엔드포인트 분리
```
# 기본 정보 (JOIN 없음, 빠름)
GET /users/me           -> UserRead
GET /users/{id}         -> UserRead  
POST /users             -> UserRead
PUT /users/me           -> UserRead
PUT /users/{id}         -> UserRead

# 통계 포함 정보 (JOIN 포함)
GET /users/me/profile   -> UserProfile
GET /users/{id}/profile -> UserProfile
```

#### 클라이언트 구현
```typescript
// shared/api/endpoints/users.ts

// 기본 User 타입 (빠른 조회용)
export interface User {
  id: number;
  email: string;
  displayName?: string;
  profileImageUrl?: string;
  suiAddress?: string;
  googleId?: string;
  createdAt: string;
}

// 통계 포함 User 타입 (프로필 전용)
export interface UserProfile extends User {
  datasetCount: number;
  annotationCount: number;
}

// API Response 타입들
interface UserResponse {
  id: number;
  email: string;
  display_name?: string | null;
  profile_image_url?: string | null;
  sui_address?: string | null;
  google_id?: string | null;
  created_at: string;
}

interface UserProfileResponse extends UserResponse {
  dataset_count: number;
  annotation_count: number;
}

// 파싱 함수들
const parseUser = (resp: UserResponse): User => ({
  id: resp.id,
  email: resp.email,
  displayName: resp.display_name || undefined,
  profileImageUrl: resp.profile_image_url || undefined,
  suiAddress: resp.sui_address || undefined,
  googleId: resp.google_id || undefined,
  createdAt: resp.created_at,
});

const parseUserProfile = (resp: UserProfileResponse): UserProfile => ({
  ...parseUser(resp),
  datasetCount: resp.dataset_count,
  annotationCount: resp.annotation_count,
});

// CRUD Hooks (용도별 분리)
// 기본 정보 (빠름)
export function useCurrentUser(options = {}) {
  return useSingleGet<UserResponse, User>({
    url: `${USERS_BASE}/me`,
    enabled: options.enabled,
    authenticated: true,
    parseData: parseUser,
  });
}

// 통계 포함 정보 (Profile 페이지용)
export function useCurrentUserProfile(options = {}) {
  return useSingleGet<UserProfileResponse, UserProfile>({
    url: `${USERS_BASE}/me/profile`,
    enabled: options.enabled,
    authenticated: true,
    parseData: parseUserProfile,
  });
}
```

#### 사용 예시
```typescript
// pages/Profile.tsx - 통계가 필요한 경우
import { useCurrentUserProfile } from '@/shared/api/endpoints/users';

export function Profile() {
  const { data: profile, isLoading } = useCurrentUserProfile({ enabled: isAuthenticated });
  
  return (
    <div>
      <h1>{profile?.displayName}</h1>
      <p>Datasets: {profile?.datasetCount}</p>
      <p>Annotations: {profile?.annotationCount}</p>
    </div>
  );
}

// components/Header.tsx - 기본 정보만 필요한 경우
import { useCurrentUser } from '@/shared/api/endpoints/users';

export function Header() {
  const { data: user } = useCurrentUser({ enabled: isAuthenticated });
  
  return (
    <div>
      <span>{user?.displayName}</span>
      <img src={user?.profileImageUrl} />
    </div>
  );
}
```

### 공통 구현 패턴

#### 1. Type Conversion Pattern
```typescript
// snake_case (API) → camelCase (Client) 자동 변환
const parseEntity = (resp: APIResponseType): ClientType => ({
  id: resp.id,
  createdAt: resp.created_at,           // snake_case → camelCase
  userId: resp.user_id,                 // snake_case → camelCase
  imageCount: resp.image_count,         // snake_case → camelCase
  someOptionalField: resp.some_optional_field || undefined,  // null → undefined
});
```

#### 2. Error Handling Pattern
```typescript
// 모든 endpoint에서 일관된 에러 처리
const { data, isLoading, error } = useEndpoint(params);

if (error) {
  return <ErrorState message={error.message} />;
}

if (isLoading) {
  return <LoadingState />;
}
```

#### 3. Authentication Pattern
```typescript
// 자동 인증 헤더 주입
export function useEntityHook() {
  return useSingleGet<RawType, ParsedType>({
    url: '/api/v1/entity',
    authenticated: true,  // 자동으로 JWT + User-ID 헤더 추가
    parseData: parseEntity,
  });
}
```

#### Context Provider with Generic API
```typescript
// contexts/data/DatasetsListContext.tsx
import { useDatasets, type Dataset } from '@/shared/api/endpoints';

export function DatasetsListProvider({ children, config = {} }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const {
    data: datasets,
    totalCount,
    isLoading,
    error,
    refetch,
  } = useDatasets({
    page: currentPage,
    limit: config.pageSize || 20,
    search: config.search,
    sortBy: config.sortBy,
    setTotalPages,
  });

  return (
    <DatasetsListContext.Provider value={{
      datasets,
      totalDatasets: totalCount,
      totalPages,
      currentPage,
      setCurrentPage,
      isLoading,
      error,
      refetch,
    }}>
      {children}
    </DatasetsListContext.Provider>
  );
}
```

#### Authentication Integration
```typescript
// core/client.ts - 인증 헤더 자동 주입
const authService = {
  getAuthHeaders: () => {
    const headers = {};
    
    // JWT 토큰 (sessionStorage)
    const jwt = sessionStorage.getItem("zklogin-jwt");
    if (jwt) headers.Authorization = `Bearer ${jwt}`;
    
    // User ID 헤더 (localStorage)  
    const userId = localStorage.getItem("opengraph-user-id");
    if (userId) headers["X-Opengraph-User-Id"] = userId;
    
    return headers;
  }
};

// 401 에러 시 자동 로그아웃
if (err.response?.status === 401 && authenticated) {
  authService.clearAuthState();
  window.location.reload();
}
```

## Best Practices and Considerations

### ✅ Recommended

1. **Generic API Pattern** (✅ Datasets, Users 구현 완료)
   - Use `useSingleGet`, `usePaginatedGet`, `usePost`, `usePut`, `useDelete` 
   - Define domain-specific endpoints with snake_case → camelCase conversion
   - Implement proper error handling and authentication
   - Example: `useDataset()`, `useCurrentUserProfile()`

2. **Performance-Optimized Endpoint Design**
   - **Dataset pattern**: 모든 엔드포인트에 통계 포함 (일관성 우선)
   - **User pattern**: 기본 정보와 통계 정보 분리 (성능 우선)
   - 용도에 따라 적절한 패턴 선택

3. **Type Safety & Conversion**
   - 모든 API 응답을 `parseEntity()` 함수로 변환
   - snake_case (API) → camelCase (Client) 자동 변환
   - `null` → `undefined` 변환으로 TypeScript 호환성 확보
   - Interface separation: `EntityResponse` (API) vs `Entity` (Client)

4. **Authentication Integration**
   - `authenticated: true` 옵션으로 자동 헤더 주입
   - JWT (sessionStorage) + User-ID (localStorage) 조합
   - 401 에러 시 자동 로그아웃 처리

5. **Context Optimization**
   - Context Provider에서 generic hooks 사용
   - UI component는 순수 렌더링만 담당
   - Context에서 데이터 변환 및 비즈니스 로직 처리

### ❌ Avoid

1. **API Anti-patterns**
   - ❌ `apiClient.datasets.getDatasets()` (generated client 직접 사용)
   - ❌ `axios.get('/api/v1/datasets')` (raw axios 호출)
   - ✅ `useDatasets()` (generic hook 사용)

2. **Performance Anti-patterns**
   - ❌ 항상 통계 정보까지 포함하여 조회 (User case)
   - ❌ 기본 정보와 통계 정보를 별도 호출 (Dataset case)
   - ✅ 용도에 따른 적절한 endpoint 선택

3. **Type Inconsistencies**
   - ❌ `user.display_name` (snake_case 사용)
   - ❌ `dataset.image_count` (snake_case 사용)
   - ✅ `user.displayName` (camelCase 사용)
   - ✅ `dataset.imageCount` (camelCase 사용)

4. **Authentication Issues**
   - ❌ 수동으로 헤더 설정
   - ❌ 토큰 만료 시 에러 처리 누락
   - ✅ `authenticated: true` 옵션 사용
   - ✅ 자동 로그아웃 처리

## Refactoring Checklist

### When Adding New API Integration
- [ ] **성능 패턴 결정**: Dataset-style (통계 통합) vs User-style (정보 분리)
- [ ] Create endpoint definition in `shared/api/endpoints/`
- [ ] Define API response types (`EntityResponse`) with snake_case
- [ ] Define client types (`Entity`) with camelCase conversion
- [ ] Implement `parseEntity()` functions for type transformation
- [ ] Add CRUD hooks using generic patterns:
  - [ ] `useSingleGet<EntityResponse, Entity>`
  - [ ] `usePaginatedGet<EntityResponse, EntityListResponse, Entity>`
  - [ ] `usePost<EntityCreateInput, EntityResponse, Entity>`
  - [ ] `usePut<EntityUpdateInput, EntityResponse, Entity>`
  - [ ] `useDelete<{}, EntityResponse, Entity>`
- [ ] Set `authenticated: true` for protected endpoints
- [ ] Update Context Providers to use new generic hooks
- [ ] Test authentication and error handling

### When Adding New Page
- [ ] Identify required entity data (basic vs with statistics)
- [ ] Choose appropriate hooks based on performance needs
- [ ] Create page Provider using generic API hooks
- [ ] Design Provider composition structure
- [ ] Plan component splitting (keep UI components pure)
- [ ] Define loading/error states
- [ ] Test with actual API responses

### When Refactoring Existing API Usage
- [ ] Measure current performance (API calls, loading times)
- [ ] Replace legacy patterns:
  - [ ] ❌ `apiClient.entities.getEntities()` → ✅ `useEntities()`
  - [ ] ❌ `axios.get('/api/v1/entities')` → ✅ `useEntities()`
  - [ ] ❌ Manual type conversion → ✅ `parseEntity()` function
- [ ] Update type usage:
  - [ ] ❌ `entity.field_name` → ✅ `entity.fieldName`
  - [ ] ❌ Manual null checks → ✅ `|| undefined` in parseData
- [ ] Test loading states and error handling
- [ ] Verify build and authentication flow

## Development Commands

```bash
# Start development server
yarn dev

# Build and type check
yarn build

# Code formatting
yarn prettify

# Regenerate API client
yarn codegen
```

## Performance Metrics

### Before/After Refactoring Comparison
- **Home.tsx**: 542 → 105 lines (80% reduction)
- **Profile.tsx**: 885 → 70 lines (92% reduction)
- **DatasetDetail.tsx**: Significantly simplified
- **API Layer**: Generic CRUD pattern eliminates code duplication
- **Type Safety**: 100% snake_case → camelCase conversion
- **Maintainability**: Enhanced through Context-based modularization + Generic API
- **Reusability**: Common Providers, components, and API hooks extracted

## Migration Priority & Status

### Phase 1: Core Entities (✅ **100% 완료**)
- [x] **Datasets**: ✅ **완전 구현** - DatasetWithStats 통일 패턴
  - 모든 CRUD 연산에서 `image_count`, `annotation_count` 포함
  - `useDataset()`, `useDatasets()`, `useCreateDataset()` 등 완성
  - Context Provider 마이그레이션 완료
- [x] **Users**: ✅ **최적화 완료** - 성능 우선 분리 패턴  
  - 기본 정보: `useCurrentUser()`, `useUser()` (빠른 단일 테이블 쿼리)
  - 통계 정보: `useCurrentUserProfile()` (필요시에만 JOIN)
  - Profile.tsx 페이지 마이그레이션 완료
- [x] **Authentication**: ✅ JWT + User-ID 헤더 자동 처리
- [x] **Build System**: ✅ TypeScript 컴파일 성공

### Phase 2: Primary Entities (🚧 **마이그레이션 대기**)
- [ ] **Images**: 🔄 Dataset 패턴 적용 예정
  - 통계 정보 (annotation_count) 포함 여부 결정 필요
  - Context Provider 마이그레이션 예정
- [ ] **Annotations**: 🔄 Dataset 패턴 적용 예정  
  - 관련 entity 정보 포함 여부 결정 필요
- [ ] **Categories**: 🔄 User 패턴 적용 예정
  - 기본 정보와 사용 통계 분리 고려

### Phase 3: Secondary Entities (⏳ **계획 단계**)
- [ ] **Dictionaries**: 🔄 User 패턴 적용 예정
  - DictionaryCategories와의 관계 고려

### Phase 4: Legacy Cleanup (⏳ **최종 단계**)
- [ ] Remove openapi-generator 의존성 완전 제거
- [ ] Clean up legacy service classes (`shared/api/services/`)
- [ ] Update all Context Providers to use new patterns
- [ ] Performance optimization review

### 📊 현재 상태 요약
- **✅ 완료**: Datasets (통합), Users (분리) - 2개 엔티티
- **🚧 진행 중**: 없음
- **⏳ 대기**: Images, Annotations, Categories, Dictionaries - 4개 엔티티
- **전체 진행률**: **33% (2/6 엔티티 완료)**

Follow this guide to write consistent and maintainable React client code with the new Generic CRUD API pattern.