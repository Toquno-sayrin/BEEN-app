# 앱 내부 장소 검색·저장

- 메인 검색은 Cloudflare의 `/search?q=`를 호출하고 결과를 앱 지도와 목록에 표시합니다.
- 검색/저장 장소에는 경로 연결선을 표시하지 않습니다. 내 코스에는 기존 연결선을 유지합니다.
- 장소 저장, 중복 저장 방지, 메모·분류 수정, 분류별 조회, 삭제 확인을 지원합니다.
- AsyncStorage로 현재 기기에 저장합니다. 계정 간 동기화와 저장 장소로 코스 작성은 이번 범위에 포함하지 않습니다.
- 검색 결과는 네이버 지역 API 기준 최대 5곳입니다.
- 검색 중 상태, 시간 초과, 이전 요청 취소, 빈 결과, 저장소 읽기·쓰기 오류를 처리합니다.

## 변경 파일

- `src/components/PlaceExplorer.tsx`: 검색·지도·저장 장소 관리 화면.
- `src/placeLibrary.ts`: 검색 요청·저장 데이터 검증.
- `src/screens/MyMapScreen.tsx`: 기존 메인에 장소 탐색 연결.
- `src/components/CourseMap.tsx`, `CourseMap.native.tsx`, `naverMapDocument.ts`: 검색/저장 결과 경로선 제외, 웹 SDK 정리 오류 격리.
- `package.json`, `package-lock.json`: AsyncStorage 추가.
- `server/place-search/worker.mjs`, `worker.test.mjs`: 검색 서버와 테스트.
- `verify-places.cjs`: 브라우저 검색·저장·수정·복원·삭제 검사. TEST_URL 미지정 시 로컬 검색 응답 fixture 사용.

## 검증

- TypeScript 통과.
- 웹·Android·iOS Expo export 통과. Expo Go 실기기 미검증.
- 검색 서버 테스트 3개 및 기존 검색/지도 단위 검증 통과.
- 로컬 브라우저에서 검색·저장·메모/분류 수정·새로고침 복원·삭제·빈 목록 통과.
