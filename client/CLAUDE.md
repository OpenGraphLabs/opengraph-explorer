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
├── generated/          # OpenAPI 생성 코드 (유지용)
├── core/              # Generic API 레이어 
│   ├── client.ts      # Axios 클라이언트 및 인증
│   ├── hooks/         # 재사용 가능한 API hooks
│   └── types/         # 공통 타입 정의
├── endpoints/         # 도메인별 API 정의
│   ├── datasets.ts
│   ├── images.ts
│   ├── annotations.ts
│   └── users.ts
└── services/          # 비즈니스 로직 (legacy)
```

#### Generic Hooks 사용 패턴
```typescript
// 1. Single Get Hook
import { useSingleGet } from '@/shared/api/core';

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

1. **Generic API Pattern**
   - Use generic CRUD hooks for all API calls
   - Define domain-specific endpoints with type conversion
   - Implement proper error handling and authentication

2. **Single Responsibility Principle**
   - UI components handle rendering only
   - Providers handle data management only
   - Endpoints handle API logic and type conversion

3. **Type Safety & Conversion**
   - Convert snake_case API responses to camelCase client types
   - Use parsing functions for consistent type transformation
   - Define clear TypeScript interfaces for all data structures

4. **Context Optimization**
   - Include only necessary data in Context
   - Prevent unnecessary re-renders with useMemo, useCallback
   - Use generic hooks within Context Providers

5. **Error Handling**
   - Set error boundaries when using Context
   - Provide Loading/Error state UI
   - Handle 401 errors with automatic logout

### ❌ Avoid

1. **API Anti-patterns**
   - Don't use generated API clients directly in components
   - Avoid raw axios calls - use generic hooks instead
   - Don't mix authentication patterns

2. **Context Misuse**
   - Use useState for local state
   - Don't use Context for non-global data
   - Avoid bypassing generic API layer

3. **Type Inconsistencies**
   - Don't use snake_case in client-side types
   - Avoid manual API calls without type conversion
   - Don't skip parseData functions in endpoint definitions

4. **Performance Issues**
   - Ensure reference stability for large objects
   - Avoid unnecessary Context nesting
   - Don't forget to implement pagination for large datasets

## Refactoring Checklist

### When Adding New API Integration
- [ ] Create endpoint definition in `shared/api/endpoints/`
- [ ] Define client-side types with camelCase conversion
- [ ] Implement parseData functions for type transformation
- [ ] Add CRUD hooks (useGet, usePaginatedGet, usePost, etc.)
- [ ] Update Context Providers to use new generic hooks
- [ ] Test authentication and error handling

### When Adding New Page
- [ ] Identify required entity Providers
- [ ] Create page Provider using generic API hooks
- [ ] Design Provider composition structure
- [ ] Plan component splitting
- [ ] Define types and error handling

### When Refactoring Existing Page
- [ ] Measure current line count
- [ ] Replace legacy API calls with generic hooks
- [ ] Separate data logic from UI logic
- [ ] Update Context Providers to use endpoint definitions
- [ ] Convert snake_case types to camelCase
- [ ] Verify build and tests

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

## Migration Priority

### Phase 1: Core Entities (✅ Completed)
- [x] **Datasets**: Generic API pattern implemented
- [x] **Authentication**: JWT + User ID header integration
- [x] **Build System**: TypeScript compilation successful

### Phase 2: Primary Entities
- [ ] **Images**: Convert to generic API pattern
- [ ] **Annotations**: Convert to generic API pattern  
- [ ] **Categories**: Convert to generic API pattern

### Phase 3: Secondary Entities
- [ ] **Users**: Convert to generic API pattern
- [ ] **Dictionaries**: Convert to generic API pattern

### Phase 4: Legacy Cleanup
- [ ] Remove generated API client dependencies
- [ ] Clean up legacy service classes
- [ ] Update documentation

Follow this guide to write consistent and maintainable React client code with the new Generic CRUD API pattern.