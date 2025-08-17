## 1인칭 시점 이미지 생성 기능

1인칭 이미지를 촬영한 뒤, 해당 이미지를 서버에 전송하여 저장하는 기능입니다.
이 기능은 사용자가 1인칭 시점에서 촬영한 이미지를 서버에 업로드하고, 이를 통해 다양한 용도로 활용할 수 있도록 합니다.

## 기능 설명
**이미지 촬영**: 사용자는 1인칭 시점에서 이미지를 촬영할 수 있습니다.
- [ ] `client/src/pages/FirstPersonCapture.tsx` 에서 이미지를 촬영합니다.
- [ ] 유저는 이미지 촬영 전 `client/src/pages/SpaceSelection.tsx` 에서 정해진 task를 선택해야 합니다.
- [ ] task에 맞게 이미지 촬영 후, "Use Photo" 버튼을 클릭하면 이미지를 서버에 전송합니다.

**이미지 저장 API**: 촬영된 이미지는 서버에 저장됩니다.
- [ ] API 엔드포인트는 `server/app/routers/image_router.py`의 add_image() 입니다.
- [ ] 서버는 이미지를 받아 GCP GCS 에 저장하고, 메타데이터는 서버 DB PostgreSQL에 저장합니다.
- [ ] GCS bucket 이름은 "noyes_test" 입니다.
- [ ] Bucket 은 비공개 버킷입니다. 
- [ ] 이미지는 status 를 가지며, "APPROVED", "PENDING", "REJECTED" 중 하나입니다. 기본값은 "PENDING" 입니다.
- [ ] 이미지는 task_id 를 가지며, 이는 `client/src/components/robot-vision/types.ts` 에 하드코딩된 task 목록 중 하나입니다.
- [ ] DB 테이블에 Tasks 테이블을 추가하여, 하드코딩된 task 목록을 관리합니다. task_id 는 Tasks 테이블의 id 를 참조합니다.

**이미지 조회**: 저장된 이미지는 서버에서 조회할 수 있습니다.
- [ ] API 엔드포인트는 `server/app/routers/image_router.py`의 get_images(), get_image() 입니다.
- [ ] 이미지는 서버에서 내려준 Signed URL을 통해 접근할 수 있습니다.
- [ ] `client/src/pages/Home.tsx` 에서 이미지를 조회할 수 있습니다.
- [ ] 홈 화면은 현재 `Image Data` `Video Data` 2가지로 구성되어 있는데, 기존의 `Image Data` 는 `Object Detection` 으로, `Video Data` 는 `Action Video` 로 변경해줘.
- [ ] 새롭게 추가되는 1인칭 시점 이미지는 Raw Image만 보여줄거고 이는 `First Person Image` 탭으로 표현해줘. 즉, 홈 화면은 이제 3개의 탭으로 구성됩니다: `First Person Image`, `Object Detection`, `Action Video`.
- [ ] `First Person Image` 탭에서는 사용자가 촬영한 1인칭 시점 이미지 중 APPROVED 상태의 이미지만 보여주고, Task 별로 필터링해서 볼 수 있습니다.