# Chrome 웹스토어 제출 자료

개발자 대시보드(https://chrome.google.com/webstore/devconsole) 탭별로 그대로 복사해 넣는다.
업로드 zip 은 README 의 "웹스토어 패키지" 참고. 이미지는 `store/assets/*.png` (원본 HTML 을 고치면 다시 렌더링).

---

## 1. 패키지

- `dist/unidocu-f8f9-<버전>.zip` 업로드

## 2. 스토어 등록정보 (Store listing)

**설명 (Description)**

```
unidocu 솔루션은 버전마다 F8·F9 단축키 배치가 다릅니다.
(예: 한 버전은 F8 = 디버그, 다른 버전은 F9 = 디버그)
여러 고객사·버전을 오가며 작업하면 손이 헷갈리기 쉬운데, 이 확장은 내가 정한 디버그 키 하나로 어느 버전에서든 같은 동작을 하게 맞춰 줍니다.

■ 사용 방법
1. 확장 아이콘을 눌러 "내 디버그 키"(F8 또는 F9)를 고릅니다.
2. unidocu 사이트에서 "이 사이트에서 사용"을 켜고 권한을 허용합니다. (그 사이트 권한만 요청합니다)
3. 끝. 페이지의 디버그 키를 자동으로 감지해, 내 설정과 다를 때만 F8↔F9 를 맞바꿉니다.

■ 기능
- 자동 감지: 같은 주소(예: localhost)에서 신규·기존 버전을 번갈아 띄워도 페이지마다 알아서 판단
- 직접 지정: 감지가 안 되는 버전은 "F8=F9, F9=F8" 형식으로 직접 매핑
- 사용 중인 사이트 목록 확인·삭제
- 디버그 팝업 창 등 같은 사이트의 새 창·iframe 에서도 동작

■ 개인정보
- 사용자가 직접 켠 사이트에서만 동작합니다.
- 어떤 데이터도 수집하거나 외부로 전송하지 않습니다. 설정은 브라우저 안(chrome.storage.local)에만 저장됩니다.

※ unidocu 솔루션 사용자(개발자·운영자)를 위한 도구입니다.
```

- **카테고리**: 개발자 도구 (Developer Tools)
- **언어**: 한국어
- **아이콘**: 패키지의 `icons/icon128.png` 가 자동 사용됨 (업로드 칸이 있으면 같은 파일)
- **스크린샷 (1280×800)**: `store/assets/screenshot-1.png`, `store/assets/screenshot-2.png`
- **작은 프로모션 타일 (440×280)**: `store/assets/promo-small.png`
- **YouTube 동영상**: https://www.youtube.com/watch?v=nasjU5IvkIo (일부 공개, 아래 7번 순서로 촬영)
- **홈페이지 / 지원 URL**: 선택 — 비워 두거나 GitHub 레포가 공개면 레포 주소

## 3. 개인정보 보호 (Privacy practices)

심사자가 읽는 칸이라 영어로 넣는다. (한국어 해석은 아래 괄호)

**Single purpose (단일 목적)**

```
Remaps the F8/F9 function keys on unidocu web application pages so that the user's preferred debug key works the same across different unidocu solution versions.
```
(unidocu 웹 애플리케이션 페이지에서 F8/F9 키를 바꿔, 솔루션 버전이 달라도 사용자가 정한 디버그 키가 같게 동작하도록 한다.)

**storage**

```
Saves the user's settings (preferred debug key, the list of sites where the user enabled the extension, and per-site key mappings) locally with chrome.storage.local. Nothing is synced or sent anywhere.
```
(내 디버그 키, 켠 사이트 목록, 사이트별 매핑을 브라우저 안에만 저장)

**scripting**

```
Registers the content scripts (bridge.js, remap.js) dynamically, only for the sites the user explicitly enabled in the popup. Also reads a single status attribute from the active tab to show the detection result in the popup.
```
(사용자가 켠 사이트에만 콘텐츠 스크립트를 동적으로 등록, 팝업에 감지 결과를 보여주려고 현재 탭의 상태 값 하나를 읽음)

**activeTab**

```
Reads the URL of the current tab when the user opens the popup, so the user can enable or disable the extension for that site.
```
(팝업을 열었을 때 현재 탭 주소를 읽어 그 사이트를 켜고 끌 수 있게 함)

**Host permissions (optional_host_permissions: \*://\*/\*)**

```
Host access is optional and never granted at install. When the user turns on "Use on this site" in the popup, the extension requests permission for that single host only, then injects the key-remapping script on that host. unidocu is installed on each customer's own server, so the hosts cannot be listed in advance. Turning the site off removes the permission.
```
(설치 시 권한 없음. 사용자가 켠 사이트 하나만 요청. unidocu 는 고객사마다 자체 서버라 도메인을 미리 적을 수 없음. 끄면 권한 회수)

**Remote code (원격 코드)**: **No, I am not using remote code**

**Data usage (데이터 사용)**: 수집 항목 **모두 체크 안 함**, 아래 3개 서약에 체크
- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL**: 수집하는 데이터가 없으면 비워 둠 (필수로 요구되면 README 의 개인정보 문단을 공개 페이지로 올려 링크)

## 4. 배포 (Distribution)

- **공개 범위**: 미등록(Unlisted) — 링크를 아는 사람만 설치. 공개로 바꾸려면 나중에 여기서 변경
- **지역**: 모든 지역 (또는 대한민국만)

## 5. 테스트 안내 (Test instructions)

```
This extension is a tool for developers/operators of "unidocu", an enterprise web application installed on each customer's internal server. Those servers are internal and require company accounts, so we cannot provide a public test URL or credentials.

Please see the demo video linked in the store listing:
https://www.youtube.com/watch?v=nasjU5IvkIo

What the video shows (on a local unidocu page whose debug key is F8):
1. Open the popup and turn on "Use on this site".
2. Chrome asks for permission for that single host only; the user allows it and the page reloads.
3. "My debug key" is F8 (same as the page), so nothing is swapped: pressing F8 opens the unidocu debug panel as usual.
4. In the popup, change "My debug key" to F9.
5. Now pressing F8 no longer opens the debug panel (tried several times).
6. Pressing F9 opens the debug panel - the F8/F9 keys have been swapped for this user.

Behavior and safety notes:
- The content scripts run only on hosts the user explicitly enabled, and do nothing unless the page is a unidocu page (window.$u and jQuery exist).
- To detect which key opens the debug window, remap.js reads the source text of the page's own keydown handler. It is used only in memory for this check and never stored or sent.
- No data is collected or transmitted. No remote code is used. Settings stay in chrome.storage.local.
```

## 6. 제출

모든 탭 저장 → **검토를 위해 제출 (Submit for review)**. 반려되면 사유를 보고 이 문서를 고쳐 다시 제출.

## 7. 데모 영상 촬영 순서 (1~2분)

내부 화면이 나오므로 **개발 서버(localhost)나 테스트 데이터 화면**에서 찍고, 고객사명·주소창의 사내 도메인이 보이면 가리거나 잘라낸다.

디버그 키가 F8 인 localhost 화면 기준 (1.0.1 제출 때 찍은 순서):

1. 확장 아이콘 → **이 사이트에서 사용** 체크
2. 그 호스트 하나만 묻는 **권한 창** → 허용 → 자동 새로고침
3. **F8** → 디버그 요소가 뜨는 것 (내 디버그 키 F8 = 페이지와 같아 그대로)
4. 팝업에서 내 디버그 키를 **F9** 로 변경
5. **F8** → 디버그 요소가 **안** 뜨는 것 (여러 번)
6. **F9** → 디버그 요소가 뜨는 것

- 권한 창이 안 뜨면 크롬이 예전 허용을 기억하는 것 → 확장 삭제 후 다시 로드하고 찍는다
- 키 입력이 영상에 안 보이므로 키 입력 표시 도구(Carnac 등)를 켜고 찍는다
- 녹화는 윈도우 캡처 도구(`Win + Shift + R`)로 충분
업로드: YouTube → 공개 범위 **일부 공개(미등록)**.
