# OpenGraph Client - 권한 제어 시스템

## 개요

OpenGraph 클라이언트는 페이지별 권한 제어 시스템을 통해 사용자의 지갑 연결 상태에 따라 특정 페이지에 대한 접근을 제한합니다.

## 권한 설정

### 페이지별 권한 레벨

- **public**: 지갑 연결 없이 접근 가능한 페이지
- **wallet-required**: 지갑 연결이 필요한 페이지

### 현재 권한 설정

#### Public Pages (지갑 연결 불필요)
- `/` - 홈페이지
- `/challenges` - 챌린지 목록
- `/challenges/:id` - 챌린지 상세

#### Wallet Required Pages (지갑 연결 필요)
- `/models` - 모델 목록
- `/models/upload` - 모델 업로드
- `/models/:id` - 모델 상세
- `/datasets` - 데이터셋 목록
- `/datasets/upload` - 데이터셋 업로드
- `/datasets/:id` - 데이터셋 상세
- `/challenges/:challengeId/annotate` - 어노테이션 워크스페이스
- `/challenges/:challengeId/validate` - 검증 워크스페이스
- `/annotator` - 어노테이터
- `/profile` - 프로필

## 레이아웃 시스템

### Header 높이 고려 레이아웃

Header 높이(56px)를 자동으로 고려하여 적절한 높이를 설정하는 레이아웃 시스템을 제공합니다.

#### 1. 레이아웃 상수 (`shared/constants/layout.ts`)
```typescript
export const LAYOUT_CONSTANTS = {
  HEADER_HEIGHT: '56px',
  HEADER_HEIGHT_NUMBER: 56,
  // ...
};
```

#### 2. PageLayout 컴포넌트
```typescript
import { PageLayout } from '@/shared/components/PageLayout';

// 전체 높이 사용 (Header 고려)
<PageLayout height="full" center>
  <YourContent />
</PageLayout>

// 콘텐츠 영역만 (기본값)
<PageLayout height="content">
  <YourContent />
</PageLayout>

// 자동 높이
<PageLayout height="auto">
  <YourContent />
</PageLayout>
```

#### 3. FullHeightLayout 컴포넌트
```typescript
import { FullHeightLayout } from '@/shared/components/FullHeightLayout';

// 중앙 정렬된 전체 높이 레이아웃
<FullHeightLayout center background="linear-gradient(...)">
  <YourContent />
</FullHeightLayout>
```

#### 4. CSS 변수 활용
```css
/* CSS에서 직접 사용 */
.my-component {
  min-height: calc(100vh - var(--header-height));
  height: calc(100vh - var(--header-height));
}
```

### 레이아웃 타입

- **full**: 전체 화면 높이 (Header 고려, 고정 높이)
- **content**: 콘텐츠 영역만 (Header 고려, 최소 높이)
- **auto**: 자동 높이 (콘텐츠에 따라 조정)

## 구현 구조

### 1. 타입 정의 (`shared/types/auth.ts`)
```typescript
export type PagePermission = 'public' | 'wallet-required';
export interface RouteConfig {
  path: string;
  permission: PagePermission;
  redirectTo?: string;
}
```

### 2. 권한 설정 (`shared/config/routePermissions.ts`)
- 페이지별 권한 설정
- 동적 라우트 패턴 매칭
- 권한 검증 함수

### 3. 권한 훅 (`shared/hooks/useAuth.ts`)
- `useAuth()`: 지갑 연결 상태 관리
- `useRoutePermission()`: 현재 라우트 권한 검증

### 4. 보호된 라우트 컴포넌트 (`shared/components/ProtectedRoute.tsx`)
- 권한이 없는 사용자에게 접근 제한 페이지 표시
- 지갑 연결 버튼 제공
- 리다이렉트 기능

## 사용법

### 새로운 페이지 추가 시

1. **권한 설정 추가** (`shared/config/routePermissions.ts`)
```typescript
{ path: '/new-page', permission: 'wallet-required', redirectTo: '/' }
```

2. **라우트에 ProtectedRoute 적용** (`app/App.tsx`)
```typescript
<Route 
  path="/new-page" 
  element={
    <ProtectedRoute>
      <NewPage />
    </ProtectedRoute>
  } 
/>
```

3. **레이아웃 적용** (페이지 컴포넌트에서)
```typescript
import { PageLayout } from '@/shared/components/PageLayout';

export function NewPage() {
  return (
    <PageLayout height="full" center>
      <YourContent />
    </PageLayout>
  );
}
```

### 권한 검증이 필요한 컴포넌트에서

```typescript
import { useAuth, useRoutePermission } from '@/shared/hooks/useAuth';

function MyComponent() {
  const { isWalletConnected } = useAuth();
  const { hasPermission, needsWallet } = useRoutePermission();
  
  // 권한 검증 로직
}
```

## 네비게이션

헤더의 네비게이션 링크는 자동으로 권한에 따라 비활성화됩니다:
- 지갑이 연결되지 않은 상태에서 권한이 필요한 링크는 회색으로 표시되고 클릭 불가
- 지갑 연결 후 자동으로 활성화

## 보안 고려사항

- 클라이언트 사이드 권한 제어는 UX를 위한 것이며, 서버 사이드 검증도 필요
- 지갑 연결 상태는 `@mysten/dapp-kit`의 `useCurrentWallet` 훅을 통해 검증
- 모든 블록체인 트랜잭션은 실제 지갑 서명을 통해 보안 강화 