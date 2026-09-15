# BeENoN 화면 개편

## 반영 내용

- BeENoN 텍스트 로고, 연두·초록·민트 강조색. 강조색 알파 값은 0.8(색이 80% 보임).
- 시작 화면: 장소 검색, 선택 코스 지도, 장소 상세, 내 코스/글 보기.
- 발견 화면: 공개 샘플 피드, 코스/지역/테마 검색, 라이딩·러닝·카페공부·데이트·산책 필터.
- 상세 화면: 웹/모바일 네이버 지도 컴포넌트, 장소 선택 동기화, 카테고리, 네이버 지도 앱 열기, 코스 텍스트와 장소 링크 공유.
- 기록 작성: 테마 선택. 기존 샘플 장소 입력 방식은 유지.

## 네이버 지도 설정 — 등록 정보 반영

제공받은 공개 Client ID와 `https://toquno-sayrin.github.io`를 Git 제외 파일 `.env.local`에 저장했습니다. Client Secret은 저장하지 않았습니다. Android package와 iOS bundleIdentifier는 등록값 `com.beenin.app`으로 설정했습니다.

등록 도메인 문맥에서 로컬 브라우저에 지도 테스트 문서를 주입하여 실제 SDK 인증, 지도 이미지 33개 로딩, 번호 마커 2개, 선택 마커 1개를 확인했습니다. 이 검증은 배포가 아닙니다. 등록 도메인의 루트가 404이므로 해당 오류 페이지의 CSP만 테스트 브라우저에서 제외했습니다. 배포된 앱 및 Expo Go 실기기 검증은 아직 하지 않았습니다.

웹의 `about:srcdoc` 안에서 SDK를 초기화하면 인증 URL이 잘못되고 HTTP 요청이 발생하는 문제를 발견해, `CourseMap.tsx`를 실제 웹 페이지에서 SDK를 직접 로드하는 방식으로 수정했습니다. 로컬 웹 테스트 주소를 쓰려면 그 주소도 네이버 콘솔에 등록해야 합니다.

`.env.example`을 `.env.local`로 복사하고 다음 공개 설정을 입력한 뒤 Expo를 다시 시작합니다.

- `EXPO_PUBLIC_NAVER_MAP_CLIENT_ID`: NAVER Cloud Maps의 공개 ncpKeyId.
- `EXPO_PUBLIC_NAVER_MAP_BASE_URL`: 등록된 웹 서비스 URL. 모바일 WebView의 baseUrl로 사용.

웹은 실제 실행 주소를 NAVER Cloud에 등록해야 합니다. 모바일 WebView의 인증과 지도 타일 로딩은 발급된 ID 및 URL로 실기기 확인이 필요합니다. Client Secret은 앱에 넣지 않습니다.

설정이 없으면 실제 지도를 가장하지 않고 장소 선택 목록을 표시합니다. SDK 로딩 실패·인증 오류·시간 초과는 지도 영역에 안내합니다. 연결선은 장소 순서이며 실제 도로 길찾기 경로가 아닙니다.

네이버 앱 열기는 Expo Go 호스트 식별자를 사용합니다. 독립 앱 배포 전 `src/naverMaps.ts`의 식별자를 실제 bundle ID/applicationId로 바꿔야 합니다. 모바일에서 앱 열기가 실패하면 웹 검색으로 이동합니다. 웹에서는 네이버 웹 지도 검색을 엽니다.

공식 자료: [지도 JavaScript SDK](https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html), [네이버 지도 앱 연동](https://guide.ncloud-docs.com/docs/en/maps-url-scheme), [Expo WebView](https://docs.expo.dev/versions/latest/sdk/webview/).

## 검증 결과

- `npx tsc --noEmit`: 통과.
- `node verify-discovery.cjs`: 검색 모드, 테마 필터, 빈/잘못된 좌표, SDK 모의 객체 기반 마커 선택 메시지, 스크립트 문자열 안전 처리, 네이버 앱 미설치 웹 대체 동작 통과.
- `npx expo export --platform all --output-dir dist-course-detail`: 웹·Android·iOS 번들 생성 통과.
- `node verify-course.cjs`: Chrome 153에서 발견 화면 이동, 검색 결과 없음, 상세 장소 선택, 브라우저 저장 유지, 390/768/1440px 가로 넘침 없음 통과.
- 최종 CSS 수정 후 웹 export와 브라우저 검증 재실행 통과.
- 등록 도메인 문맥의 실제 NAVER 인증·타일 표시 확인. Expo Go 실기기 실행·앱 전환 및 배포된 앱은 미검증.

브라우저 검증은 ChromeDriver가 필요합니다. `CHROMEDRIVER_PATH`를 설정하거나 `artifacts/browser`에 설치합니다. 별도로 포트 9516에서 드라이버를 실행한 경우 `CHROMEDRIVER_EXTERNAL=1`을 사용합니다.

## 현재 데이터 범위

발견 피드는 샘플 데이터이며 실제 사용자 서버와 연결하지 않았습니다. 내 기록은 기존 앱 메모리 상태를 사용하므로 재시작 후 보존되지 않습니다. 상세의 브라우저 저장은 해당 브라우저에만 저장합니다. 장소 검색은 내 기록 검색과 네이버 검색 열기를 지원하며 네이버 검색 결과를 앱 안으로 가져오는 API는 연결하지 않았습니다.

## 변경 파일

- `App.tsx`, `app.json`: 시작 화면 및 앱 이름.
- `src/theme.ts`, `src/components/Brand.tsx`, `src/components/BottomNav.tsx`: 색상·로고·탭.
- `src/screens/MyMapScreen.tsx`, `src/screens/HomeScreen.tsx`: 메인·발견 화면.
- `src/screens/CreateRecordScreen.tsx`: 테마 선택.
- `src/screens/RecordDetailScreen.tsx`, `src/screens/RecordDetailScreen.web.tsx`, `src/screens/recordDetailStyles.ts`: 상세 화면 및 공유/지도 연결.
- `src/components/CourseMap.tsx`, `src/components/CourseMap.native.tsx`, `src/components/MapFallback.tsx`, `src/components/naverMapDocument.ts`: 네이버 지도 및 미설정 상태.
- `src/naverMaps.ts`, `src/recordSearch.ts`, `src/shareCourse.ts`: 앱 열기·검색·공유.
- `src/types.ts`, `src/data/sampleRecords.ts`: 카테고리·테마.
- `package.json`, `package-lock.json`, `.env.example`: WebView 의존성·설정 예시.
- `verify-discovery.cjs`, `verify-course.cjs`: 검증 코드.
- `IMPLEMENTATION-NOTES.md`: 구현 범위·설정·검증 보고.
