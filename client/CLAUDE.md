# OpenGraph Explorer Client Development Guide

## Project Structure and Architecture

### Optimized Directory Structure
```
client/
├── src/
│   ├── app/                    # Application routing and global configuration
│   ├── pages/                  # Page components (pure composition)
│   ├── components/             # Feature-specific UI components
│   │   ├── home/              # Home page specific components
│   │   ├── profile/           # Profile page specific components
│   │   ├── datasets/          # Dataset page specific components
│   │   └── common/            # Reusable UI components
│   ├── contexts/               # Global contexts only
│   │   ├── data/              # Entity data management contexts
│   │   └── app/               # App-level global state
│   ├── shared/                 # Shared utilities and components
│   │   ├── api/               # API clients and endpoints
│   │   ├── hooks/             # Shared React hooks
│   │   │   └── pages/         # Page-specific business logic hooks
│   │   ├── providers/         # ⭐️ Page Context Providers
│   │   ├── ui/                # Design system
│   │   └── utils/             # Utility functions
```

## Core Architecture Pattern: Page Hook + Provider Pattern

### Core Concept
A clean separation of concerns where **Page Hooks** contain all business logic and data fetching, while **Page Providers** wrap the hooks in Context API for efficient data sharing. UI components remain pure and focused solely on rendering.

### Architecture Flow
```
Page Hook (Business Logic) → Page Provider (Context Wrapper) → UI Components (Pure Rendering)
```

### Pattern Structure

#### 1. Page Hook (Business Logic Layer)
```typescript
// shared/hooks/pages/useHomePage.ts
export function useHomePage(options: UseHomePageOptions = {}) {
  // ✅ API data fetching
  const { data: annotations } = useAnnotations({ 
    status: "APPROVED", 
    sourceType: "USER",
    page: currentPage,
    limit: options.annotationsLimit 
  });
  
  // ✅ Page-specific UI state
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [showGlobalMasks, setShowGlobalMasks] = useState(true);
  
  // ✅ Business logic and computed values
  const annotationsWithImages = useMemo(() => {
    return annotations.map(annotation => ({
      ...annotation,
      image: imageMap.get(annotation.imageId),
      categoryName: categoryMap.get(annotation.categoryId)?.name
    }));
  }, [annotations, imageMap, categoryMap]);
  
  // ✅ Page actions
  const handleAnnotationClick = useCallback((annotation) => {
    setSelectedAnnotation(annotation);
  }, []);
  
  return {
    // Data
    annotationsWithImages,
    selectedAnnotation,
    showGlobalMasks,
    
    // Actions
    handleAnnotationClick,
    setShowGlobalMasks,
    
    // Loading states
    isLoading,
    error,
  };
}
```

#### 2. Page Provider (Context Wrapper Layer)
```typescript
// shared/providers/HomePageProvider.tsx
const HomePageContext = createContext<ReturnType<typeof useHomePage> | null>(null);

export function HomePageProvider({ children, options = {} }: HomePageProviderProps) {
  const homePageData = useHomePage({
    annotationsLimit: 25,
    categoriesLimit: 100,
    ...options,
  });

  return (
    <HomePageContext.Provider value={homePageData}>
      {children}
    </HomePageContext.Provider>
  );
}

export function useHomePageContext() {
  const context = useContext(HomePageContext);
  if (!context) {
    throw new Error('useHomePageContext must be used within HomePageProvider');
  }
  return context;
}
```

#### 3. Page Component (Composition Layer)
```typescript
// pages/Home.tsx
export function Home() {
  return (
    <HomePageProvider>
      <HomeContent />
    </HomePageProvider>
  );
}

function HomeContent() {
  const { error } = useHomePageContext();
  
  if (error) return <HomeErrorState />;
  
  return (
    <Box>
      <HomeHeader />      {/* ← Uses useHomePageContext() */}
      <HomeGallery />     {/* ← Uses useHomePageContext() */}
      <HomePagination />  {/* ← Uses useHomePageContext() */}
    </Box>
  );
}
```

#### 4. UI Components (Pure Rendering Layer)
```typescript
// components/home/HomeHeader.tsx
export function HomeHeader() {
  const { 
    dataType, 
    setDataType, 
    selectedCategory, 
    handleCategorySelect 
  } = useHomePageContext(); // ← Only gets what it needs
  
  return (
    <Header>
      <DataTypeToggle value={dataType} onChange={setDataType} />
      <CategorySearch selected={selectedCategory} onSelect={handleCategorySelect} />
    </Header>
  );
}

// components/home/HomeGallery.tsx
export function HomeGallery() {
  const { 
    annotationsWithImages, 
    handleAnnotationClick,
    showGlobalMasks 
  } = useHomePageContext(); // ← Only gets what it needs
  
  return (
    <Grid>
      {annotationsWithImages.map(item => (
        <ImageCard 
          key={item.id}
          data={item}
          showMasks={showGlobalMasks}
          onClick={handleAnnotationClick}
        />
      ))}
    </Grid>
  );
}
```

## Development Guidelines

### 🚀 Benefits of Page Hook + Provider Pattern

1. **🚫 No Props Drilling**: Components get data directly from context, no need to pass props through multiple levels
2. **🎯 Selective Data Access**: Each component only accesses the data it needs from the page context
3. **⚡ Performance Optimized**: Page hook runs only once per page, data is shared efficiently via context
4. **🧩 Pure UI Components**: Components focus solely on rendering, no business logic
5. **🔄 Easy Testability**: Page hooks can be tested independently from UI components
6. **♻️ Reusable Logic**: Page hooks can be reused across different page implementations

### 1. Creating a New Page

#### Step 1: Create Page Hook (Business Logic)
```typescript
// shared/hooks/pages/useExamplePage.ts
import { useState, useMemo } from "react";
import { useApiEndpoint } from "@/shared/api/endpoints/example";

export interface UseExamplePageOptions {
  limit?: number;
  // Add configuration options
}

export function useExamplePage(options: UseExamplePageOptions = {}) {
  const { limit = 20 } = options;

  // ✅ API data fetching
  const { data, isLoading, error } = useApiEndpoint({ limit });
  
  // ✅ Page-specific state
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // ✅ Computed values
  const filteredData = useMemo(() => {
    return data?.filter(item => /* filtering logic */);
  }, [data]);
  
  // ✅ Page actions
  const handleItemSelect = useCallback((item) => {
    setSelectedItem(item);
  }, []);
  
  return {
    // Data
    data: filteredData,
    selectedItem,
    viewMode,
    
    // Actions  
    handleItemSelect,
    setViewMode,
    
    // States
    isLoading,
    error,
  };
}
```

#### Step 2: Create Page Provider (Context Wrapper)
```typescript
// shared/providers/ExamplePageProvider.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useExamplePage } from "@/shared/hooks/pages/useExamplePage";
import type { UseExamplePageOptions } from "@/shared/hooks/pages/useExamplePage";

type ExamplePageContextType = ReturnType<typeof useExamplePage>;
const ExamplePageContext = createContext<ExamplePageContextType | null>(null);

interface ExamplePageProviderProps {
  children: ReactNode;
  options?: UseExamplePageOptions;
}

export function ExamplePageProvider({ children, options = {} }: ExamplePageProviderProps) {
  const examplePageData = useExamplePage(options);

  return (
    <ExamplePageContext.Provider value={examplePageData}>
      {children}
    </ExamplePageContext.Provider>
  );
}

export function useExamplePageContext() {
  const context = useContext(ExamplePageContext);
  if (!context) {
    throw new Error('useExamplePageContext must be used within ExamplePageProvider');
  }
  return context;
}
```

#### Step 3: Create Page Component (Composition)
```typescript
// pages/Example.tsx
import React from "react";
import { ExamplePageProvider, useExamplePageContext } from "@/shared/providers/ExamplePageProvider";
import { ExampleHeader } from "@/components/example/ExampleHeader";
import { ExampleContent } from "@/components/example/ExampleContent";

function ExamplePageContent() {
  const { error, isLoading } = useExamplePageContext();
  
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  
  return (
    <div>
      <ExampleHeader />    {/* Uses useExamplePageContext() */}
      <ExampleContent />   {/* Uses useExamplePageContext() */}
    </div>
  );
}

export function Example() {
  return (
    <ExamplePageProvider options={{ limit: 50 }}>
      <ExamplePageContent />
    </ExamplePageProvider>
  );
}
```

#### Step 4: Create UI Components (Pure Rendering)
```typescript
// components/example/ExampleHeader.tsx
import { useExamplePageContext } from "@/shared/providers/ExamplePageProvider";

export function ExampleHeader() {
  const { viewMode, setViewMode } = useExamplePageContext();
  
  return (
    <Header>
      <ViewToggle value={viewMode} onChange={setViewMode} />
    </Header>
  );
}

// components/example/ExampleContent.tsx
export function ExampleContent() {
  const { data, handleItemSelect, viewMode } = useExamplePageContext();
  
  return (
    <ContentGrid mode={viewMode}>
      {data.map(item => (
        <ItemCard key={item.id} data={item} onClick={handleItemSelect} />
      ))}
    </ContentGrid>
  );
}
```

### 2. Best Practices and Conventions

#### Page Hook Guidelines
- **Single Responsibility**: Each page hook should manage only one page's logic
- **Clear Naming**: Use descriptive names like `useProfilePage`, `useDatasetDetailPage`
- **Export Options Interface**: Always export the options interface for type safety
- **Memoize Expensive Computations**: Use `useMemo` for computed values
- **Callback Optimization**: Use `useCallback` for event handlers

#### Component Guidelines  
- **Pure Components**: UI components should only render, no business logic
- **Selective Context Usage**: Only access the specific data/actions needed
- **Clear Props Interface**: Even though using context, define clear component interfaces
- **Error Boundaries**: Handle errors at appropriate component levels

#### Folder Organization
```
pages/
├── Home.tsx                 # ✅ Simple page component
├── Profile.tsx              # ✅ Simple page component  
└── DatasetDetail.tsx        # ✅ Simple page component

shared/
├── hooks/pages/
│   ├── useHomePage.ts       # ✅ Business logic
│   ├── useProfilePage.ts    # ✅ Business logic
│   └── useDatasetDetailPage.ts # ✅ Business logic
└── providers/
    ├── HomePageProvider.tsx      # ✅ Context wrapper
    ├── ProfilePageProvider.tsx   # ✅ Context wrapper
    └── DatasetDetailPageProvider.tsx # ✅ Context wrapper

components/
├── home/                    # ✅ Page-specific UI components
│   ├── HomeHeader.tsx       # Uses useHomePageContext()
│   ├── HomeGallery.tsx      # Uses useHomePageContext()
│   └── HomePagination.tsx   # Uses useHomePageContext()
├── profile/                 # ✅ Page-specific UI components
└── datasets/                # ✅ Page-specific UI components
```

### 3. Migration from Old Pattern

#### ❌ Old Pattern (Props Drilling)
```typescript
// 😖 Props drilling everywhere
export function Home() {
  const homeData = useHomePage();
  return (
    <>
      <HomeHeader {...homeData} />
      <HomeGallery {...homeData} />
      <HomePagination {...homeData} />
    </>
  );
}
```

#### ✅ New Pattern (Context-Based)
```typescript
// 😍 Clean composition, no props drilling
export function Home() {
  return (
    <HomePageProvider>
      <HomeHeader />     {/* Gets data from context */}
      <HomeGallery />    {/* Gets data from context */}
      <HomePagination /> {/* Gets data from context */}
    </HomePageProvider>
  );
}
```

### 4. Type Safety and Performance

#### Type Safety
```typescript
// ✅ Full type safety throughout the chain
const homePageData: ReturnType<typeof useHomePage> = useHomePage();
// ↓
const context: ReturnType<typeof useHomePage> | null = useContext(HomePageContext);
// ↓
const { selectedAnnotation }: ReturnType<typeof useHomePage> = useHomePageContext();
```

#### Performance Considerations
- **Single Hook Execution**: Page hook runs only once per page load
- **Efficient Context Sharing**: Data shared via context, no re-fetching
- **Selective Renders**: Components only re-render when their specific data changes
- **Memoized Computations**: Expensive operations cached with useMemo

### 5. Error Handling and Loading States

```typescript
// Page hook handles all error states
export function useExamplePage() {
  const { data, isLoading, error } = useApiCall();
  
  return {
    // Always provide loading and error states
    isLoading,
    error,
    // ... other data
  };
}

// Page component handles global page states
function ExamplePageContent() {
  const { isLoading, error } = useExamplePageContext();
  
  if (isLoading) return <PageLoadingState />;
  if (error) return <PageErrorState error={error} />;
  
  // Components focus on success state only
  return <SuccessfulPageContent />;
}
```

## 📊 Pattern Comparison and Benefits

### Before vs After

| Aspect | Old Pattern | New Pattern |
|--------|-------------|-------------|
| **Props Passing** | `<Component {...allData} />` | `<Component />` |
| **Data Access** | Props drilling | `usePageContext()` |
| **Code Lines** | Home: 542 lines | Home: ~105 lines |
| **Component Purity** | Mixed concerns | Pure rendering |
| **Testability** | Coupled to props | Isolated hooks |
| **Performance** | Re-renders entire tree | Selective re-renders |
| **Developer Experience** | Complex prop management | Simple context access |

### 🎯 Implementation Results

#### ✅ Successfully Migrated Pages
- **Home Page**: `useHomePage()` + `HomePageProvider` ✅
- **Profile Page**: `useProfilePage()` + `ProfilePageProvider` ✅  
- **DatasetDetail Page**: `useDatasetDetailPage()` + `DatasetDetailPageProvider` ✅

#### 📁 New Folder Structure Established
- `shared/hooks/pages/` - Business logic hooks ✅
- `shared/providers/` - Context wrappers ✅
- Clean separation of concerns ✅

## 🚀 Quick Reference

### Creating a New Page (Checklist)
- [ ] 1. Create page hook in `shared/hooks/pages/useMyPage.ts`
- [ ] 2. Create provider in `shared/providers/MyPageProvider.tsx`
- [ ] 3. Export both in respective index files
- [ ] 4. Create page component using provider wrapper
- [ ] 5. Create UI components using `useMyPageContext()`
- [ ] 6. Test loading states, error states, and functionality

### File Template Locations
- **Page Hook**: `shared/hooks/pages/useHomePage.ts` (reference implementation)
- **Page Provider**: `shared/providers/HomePageProvider.tsx` (reference implementation)  
- **Page Component**: `pages/Home.tsx` (reference implementation)
- **UI Component**: `components/home/HomeHeader.tsx` (reference implementation)

---

**✨ This pattern provides a clean, scalable, and maintainable architecture for React applications with complex state management needs while keeping components pure and focused on their primary responsibility: rendering UI.**
