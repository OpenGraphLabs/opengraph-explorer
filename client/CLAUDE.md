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
│   └── widgets/               # Complex widget components
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

### 5. API Integration Pattern

#### API Client Usage
```typescript
// contexts/data/EntityContext.tsx
import { useApiQuery } from '@/shared/hooks/useApiQuery';

export function EntityProvider({ config }) {
  const { data, loading, error } = useApiQuery.useEntities({
    ...config,
    enabled: !!config.entityId,
  });
  
  // ...
}
```

#### Service Layer Usage
```typescript
// shared/api/services/entityService.ts
export class EntityService {
  async getEntity(id: number) {
    // API call logic
  }
}
```

## Best Practices and Considerations

### ✅ Recommended

1. **Single Responsibility Principle**
   - UI components handle rendering only
   - Providers handle data management only

2. **Context Optimization**
   - Include only necessary data in Context
   - Prevent unnecessary re-renders with useMemo, useCallback

3. **Type Safety**
   - Define TypeScript types for all Contexts
   - Explicit Props interface declarations

4. **Error Handling**
   - Set error boundaries when using Context
   - Provide Loading/Error state UI

### ❌ Avoid

1. **Context Misuse**
   - Use useState for local state
   - Don't use Context for non-global data

2. **Circular Dependencies**
   - No direct dependencies between Providers
   - Compose entity Providers only in page Providers

3. **Performance Issues**
   - Ensure reference stability for large objects
   - Avoid unnecessary Context nesting

## Refactoring Checklist

### When Adding New Page
- [ ] Identify required entity Providers
- [ ] Create page Provider
- [ ] Design Provider composition structure
- [ ] Plan component splitting
- [ ] Define types and error handling

### When Refactoring Existing Page
- [ ] Measure current line count
- [ ] Separate data logic from UI logic
- [ ] Design Provider hierarchy
- [ ] Split and move components
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
- **Maintainability**: Enhanced through Context-based modularization
- **Reusability**: Common Providers and components extracted

Follow this guide to write consistent and maintainable React client code.