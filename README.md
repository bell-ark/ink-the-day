# Ink the Day

일기장(빛줍기), 가계부(살림결), 식단 기록(끼니결)을 한곳에서 쓰는 개인 기록 사이트입니다.
데이터는 Firebase(Firestore)에 저장되어 PC와 휴대폰이 자동으로 동기화되고, 인터넷이 없을 때도 기기에 저장했다가 연결되면 올립니다.

## 폴더 구성
- `index.html` 시작 화면(로그인, 앱 바로가기, 공통 설정)
- `diary/` 일기장
- `shared/` 공통 모듈(로그인·동기화·잠금·디자인), Firebase 설정(`config.js`)
- `fonts/` 글꼴(모두 SIL 오픈 폰트 라이선스)
- `sw.js`, `manifest.webmanifest`, `icons/` 휴대폰 설치·오프라인 실행용

## GitHub Pages에 올리기
1. GitHub에서 새 저장소를 만듭니다(Public). 이름 예: `ink-the-day`
2. 저장소 화면의 Add file > Upload files에 이 폴더 안의 내용 전체를 끌어다 놓고 Commit changes를 누릅니다.
3. Settings > Pages에서 Source를 Deploy from a branch, Branch를 main / (root)로 고르고 Save를 누릅니다.
4. 1~2분 뒤 `https://아이디.github.io/ink-the-day/` 주소로 열립니다.
5. Firebase 콘솔 Authentication > 설정 > 승인된 도메인에 `아이디.github.io`를 추가합니다.

## 휴대폰에 설치
- 아이폰: Safari로 주소를 열고 공유 버튼 > 홈 화면에 추가
- 안드로이드: Chrome으로 주소를 열고 메뉴 > 홈 화면에 추가(또는 앱 설치)

## 참고
- 페이지 코드는 공개 저장소에 있지만, 기록은 로그인한 본인만 읽을 수 있도록 Firestore 보안 규칙으로 막혀 있습니다.
- 주소 끝에 `?mock=1`을 붙이면 Firebase 없이 이 브라우저 안에서만 동작하는 테스트 모드로 열립니다.
