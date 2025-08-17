# Generic API Migration Plan

## Overview
Complete migration from `@/shared/api/generated/` to generic CRUD endpoints in `@/shared/api/endpoints/`

## Completed 
- [x] Created generic endpoints: `datasets.ts`, `images.ts`, `annotations.ts`, `users.ts`
- [x] Migrated some pages to use new endpoints

## Remaining Tasks

### 1. Pages Migration =Ä
Replace generated API imports with new generic endpoints:

#### High Priority Pages
- [ ] **AnnotationWorkspace.tsx** - Core annotation functionality
- [ ] **DatasetDetail.tsx** - Dataset detail page  
- [ ] **Datasets.tsx** - Dataset listing page
- [ ] **Profile.tsx** - User profile page

#### Medium Priority Pages  
- [ ] **Home.tsx** - Landing page
- [ ] **Earn.tsx** - Earning/rewards page
- [ ] **TrajectoryDrawingWorkspace.tsx** - Drawing workspace

#### Low Priority Pages
- [ ] **AuthError.tsx** - Auth error handling
- [ ] **AuthSuccess.tsx** - Auth success handling  
- [ ] **Login.tsx** - Login page
- [ ] **FirstPersonCapture.tsx** - Capture functionality
- [ ] **SpaceSelection.tsx** - Space selection

### 2. Context Migration =

#### Data Contexts (Core API logic)
- [ ] **AnnotationsContext.tsx** P **SPECIAL HANDLING REQUIRED**
  - Remove `status`, `sourceType` from `AnnotationsConfig`
  - Keep only `mode` in config
  - Implement mode-based filter injection logic
  - Context should inject appropriate filters based on mode
- [ ] **DatasetsContext.tsx** - Dataset management context
- [ ] **DatasetsListContext.tsx** - Dataset listing context  
- [ ] **ImagesContext.tsx** - Image management context
- [ ] **CategoriesContext.tsx** - Category management context
- [ ] **AuthContext.tsx** - User authentication context
- [ ] **ZkLoginContext.tsx** - ZK login functionality

#### Page Contexts (Page-specific state)
- [ ] **AnnotationWorkspaceContext.tsx** - Annotation workspace state
- [ ] **DatasetDetailPageContext.tsx** - Dataset detail page state
- [ ] **DatasetsPageContext.tsx** - Datasets page state
- [ ] **HomePageContext.tsx** - Home page state
- [ ] **ProfilePageContext.tsx** - Profile page state
- [ ] **TrajectoryWorkspaceContext.tsx** - Trajectory workspace state

### 3. AnnotationsContext.tsx Special Requirements <¯

#### Current Config (to be simplified):
```typescript
interface AnnotationsConfig {
  status: string;
  sourceType: string; 
  mode: string;
}
```

#### Target Config (simplified):
```typescript
interface AnnotationsConfig {
  mode: string; // Only keep mode
}
```

#### Mode-based Filter Logic:
```typescript
// Context should inject filters based on mode:
switch (mode) {
  case 'review':
    // Inject: status: 'pending', sourceType: 'user'
  case 'training':
    // Inject: status: 'approved', sourceType: 'ai'
  case 'all':
    // Inject: no filters
}
```

### 4. Import Updates =æ

#### Replace imports:
```typescript
// OLD - Remove these
import { AnnotationsApi, DatasetsApi, ImagesApi, UsersApi } from '@/shared/api/generated';

// NEW - Use these  
import { useAnnotations, useCreateAnnotation } from '@/shared/api/endpoints/annotations';
import { useDatasets, useCreateDataset } from '@/shared/api/endpoints/datasets';
import { useImages, useCreateImage } from '@/shared/api/endpoints/images';  
import { useCurrentUser, useUser } from '@/shared/api/endpoints/users';
```

### 5. Verification Checklist 

#### Before Completion:
- [ ] Search codebase for remaining `@/shared/api/generated` imports
- [ ] Verify all generated API calls are replaced
- [ ] Test major user flows still work
- [ ] Ensure consistent error handling across all endpoints
- [ ] Validate type safety is maintained

#### Final Cleanup:
- [ ] Remove unused generated API files (if desired)
- [ ] Update any documentation referencing old API structure  
- [ ] Run linting and type checking

## Work Strategy

### Phase 1: Critical Contexts
1. Start with `AnnotationsContext.tsx` (most complex)
2. Update `DatasetsContext.tsx` and `ImagesContext.tsx`
3. Verify data flow works correctly

### Phase 2: Core Pages  
1. Update `AnnotationWorkspace.tsx`
2. Update `DatasetDetail.tsx` and `Datasets.tsx`
3. Test user workflows

### Phase 3: Remaining Files
1. Complete all remaining contexts
2. Complete all remaining pages
3. Final verification and cleanup

## Notes
- Maintain backward compatibility during migration
- Focus on consistent error handling patterns
- Preserve existing UI behavior and user experience
- Use generic CRUD hooks consistently across all components