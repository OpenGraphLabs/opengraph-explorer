## 데이터셋 기여 유저에 대한 보상 시스템 및 프로필 대시보드 구축

Robotics Data Engine "OpenGraph"에 기여하는 유저에 대한 보상 체계를 구축합니다. 
기여도에 따라 OpenGraph 포인트를 부여하는 시스템을 설계합니다. 
또한, 유저가 자신의 기여 내역과 포인트 현황을 한눈에 확인할 수 있는 프로필 대시보드를 개발합니다.

### 현재 상태
- 유저는 `client/src/pages/Earn.tsx` 페이지에서 원하는 형태의 기여 방식을 골라서 데이터 기여를 하고 보상을 받아갈 수 있습니다. 현재로서는 FirstPersonImage 촬영 방식만 제공합니다.
- 유저는 `client/src/components/robot-vision/` 폴더에 구현된 컴포넌트를 통해 1인칭 시점 이미지를 촬영합니다.
- 유저가 촬영/제출한 이미지는 `server/app/routers/image_router.py` add_first_person_image() 함수를 통해 PostgreSQL DB 및 GCS 버킷에 저장됩니다. 이 때 이미지의 상태는 "PENDING"으로 설정됩니다.
- 관리자는 `client/src/pages/AdminDashboard.tsx` 관리자 페이지에서 유저가 제출한 이미지를 검토하고 승인 또는 거부할 수 있습니다. 승인된 이미지는 상태가 "APPROVED"로 변경되고, 거부된 이미지는 "REJECTED"로 변경됩니다.
- Approved 된 이미지는 `client/src/pages/Home.tsx` 홈 페이지에서 다른 유저들이 볼 수 있습니다.

### 요구 사항
- [ ] `client/src/pages/Profile.tsx` 프로필 페이지에서 유저는 자신의 기여 내역(제출한 이미지 수, 승인된 이미지 수 등)과 현재 보유한 OpenGraph 포인트를 확인할 수 있어야 합니다.
- [ ] `client/src/pages/Profile.tsx` 프로필 페이지에서 유저는 자신이 제출한 이미지 중 Approved 된 이미지를 보면서 어떤 이미지가 보상으로 이어졌는지, 어떤 식으로 양질의 데이터를 쌓을 수 있는지 확인할 수 있어야 합니다.
- [ ] `client/src/pages/Earn.tsx`, `client/src/pages/TaskSelection.tsx` 에서 선택한 Earn, Task 방식에 따라 기여도 점수를 다르게 부여할 수 있어야 합니다. (예: FirstPersonImage 촬영은 10점, SegmentationMask 생성은 20점 등 & FirstPersonImage 촬영 중에서도 "냉장고 열기"는 8점, "책상 위 물건 집기"는 12점 등)
- [ ] 이미지가 Pending 상태일 때는 리워드가 부여되지 않고, 관리자가 `client/src/pages/AdminDashboard.tsx` 에서 Approved 상태로 변경할 때 리워드가 부여되어야 합니다.
- [ ] 유저들의 기여도에 따라 리더보드(Top Contributors) 기능을 추가하여, 가장 많은 포인트를 획득한 유저들을 상위에 노출시킬 수 있어야 합니다. (예: `client/src/pages/Leaderboard.tsx` 페이지 추가)