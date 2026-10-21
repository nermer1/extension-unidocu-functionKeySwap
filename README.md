# functionKeyCompat (크롬 확장)

unidocu 솔루션 버전마다 다른 펑션키(F8·F9 등) 배치를 **사이트별로** 맞추는 크롬 확장 프로그램.
unidocu 플러그인 `functionKeyCompat`(고객사 config 기준)과 같은 동작을 **사용자 브라우저 기준**으로 제공한다.
여러 고객사를 오가는 개발자가 어느 사이트에서든 같은 손 감각으로 키를 쓰는 용도.

## 설치 (압축해제된 확장 로드)

1. 크롬 주소창에 `chrome://extensions` 입력
2. 오른쪽 위 **개발자 모드** 켜기
3. **압축해제된 확장 프로그램을 로드합니다** → 이 폴더 선택

## 사용

1. unidocu 사이트를 연 상태에서 확장 아이콘 클릭
2. **이 사이트에서 사용** 체크 → 권한 창에서 허용 (그 사이트 권한만 요청)
3. 매핑 확인 후 필요하면 수정 → **저장** (기본값 `F8=F9, F9=F8`)
4. 팝업 아래 **사용 중인 사이트** 목록에서 켠 사이트·매핑 확인, [삭제]로 끄기

- 사이트(origin)마다 켜기/끄기와 매핑을 따로 저장한다.
- 권한 창 때문에 팝업이 닫히면, 권한을 허용한 뒤 페이지를 직접 새로고침하면 된다.
- 디버그 팝업 등 같은 사이트의 새 창·iframe에서도 동작한다.

## 동작

| 파일 | 역할 |
|---|---|
| `background.js` | 켠 사이트 목록대로 콘텐츠 스크립트를 동적 등록 (권한 받은 호스트만) |
| `bridge.js` | ISOLATED world. 저장된 매핑을 `<html data-fkc-map>` 으로 페이지에 전달 |
| `remap.js` | MAIN world. window 캡처 단계에서 매핑된 키를 막고 바꾼 키로 `jQuery(document).trigger('keydown')` → 코어 단축키 로직 그대로 실행 |
| `popup.html/js` | 현재 사이트 켜기/끄기, 매핑 편집 |

- unidocu 페이지(`window.$u` 와 jQuery 가 있는 페이지)에서만 키를 바꾼다.
- 매핑에 없는 키, Ctrl/Alt/Shift/Meta 조합은 통과.
- unidocu 플러그인 `functionKeyCompat` 이 같이 설치돼 있어도 확장이 먼저 처리하고(`stopImmediatePropagation`) 중복 변환하지 않는다.
- 크롬 111 이상 (`world: "MAIN"` 콘텐츠 스크립트).
