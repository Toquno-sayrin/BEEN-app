# BEEN mobile prototype

다녀온 하루를 사진과 지도에 남기는 외출 기록 앱의 1차 프론트엔드 프로토타입입니다.

## 현재 구현 범위

- 앱 실행 시 `내 피드` 표시
- 샘플 사진 2장을 하나의 외출 기록으로 표시
- 내 피드 → 기록 상세 → 나만의 지도 이동
- 기록 상세 상단에 지도·번호 마커·코스선·장소 카드 표시
- 모바일 Google 지도와 PC 웹용 지도 대체 화면 제공
- 하단 메뉴를 통한 홈·지도·기록·내 피드·설정 이동
- 기록 작성 후 로컬 상태에 추가하고 피드·상세·지도에 반영
- 공개 범위를 직접 선택해야 저장 가능
- 다른 사용자의 공개 기록 홈 샘플

모바일 지도는 `react-native-maps`를 사용합니다. 샘플 장소 좌표와 직선 코스가 들어 있으며 실제 장소 검색·도로 경로 API와 백엔드는 아직 연결하지 않았습니다. PC 웹에서는 모바일 구조를 확인하기 위한 지도 대체 화면이 표시됩니다.

## VS Code에서 실행

1. VS Code에서 `BEEN-app` 폴더를 엽니다.
2. 터미널을 열고 패키지를 설치합니다.

```bash
npm install
```

3. Expo 개발 서버를 실행합니다.

```bash
npm start
```

4. 휴대폰의 Expo Go로 QR 코드를 읽거나, 웹 확인은 다음 명령을 사용합니다.

```bash
npm run web
```

## 검증 명령

```bash
npx tsc --noEmit
CI=1 npx expo export --platform web --output-dir dist
```

## 핵심 파일

- `App.tsx`: 화면 상태와 기록 데이터 흐름
- `src/screens/ProfileScreen.tsx`: 내 피드
- `src/screens/CreateRecordScreen.tsx`: 기록 작성
- `src/screens/RecordDetailScreen.tsx`: 기록 상세
- `src/screens/MapScreen.tsx`: 나만의 지도 목업
- `src/components/CourseMap.native.tsx`: 모바일 Google 지도
- `src/components/CourseMap.tsx`: PC 웹 지도 대체 화면
- `src/screens/HomeScreen.tsx`: 공개 기록 홈
- `src/data/sampleRecords.ts`: 샘플 외출 데이터
