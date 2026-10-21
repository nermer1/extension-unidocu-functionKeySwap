// 사용자가 켠 사이트 목록(storage.sites)대로 콘텐츠 스크립트를 동적 등록
//   sites = { 'https://qas.a.co.kr:8443': { map: { F8: 'F9', F9: 'F8' } }, ... }  (키 = origin)
//   권한·매치 패턴은 호스트 단위(포트 무관), 매핑은 bridge.js 가 origin(포트 포함)으로 골라 씀

const SCRIPT_IDS = ['fkc-bridge', 'fkc-remap'];

const hostPattern = (origin) => {
    const u = new URL(origin);
    return u.protocol + '//' + u.hostname + '/*';
};

async function sync() {
    const {sites = {}} = await chrome.storage.local.get('sites');
    const patterns = Array.from(new Set(Object.keys(sites).map(hostPattern)));

    const registered = await chrome.scripting.getRegisteredContentScripts({ids: SCRIPT_IDS});
    if (registered.length) await chrome.scripting.unregisterContentScripts({ids: registered.map((s) => s.id)});
    if (!patterns.length) return;

    // 권한을 받은 패턴만 등록 (사용자가 권한을 거절·회수한 사이트는 제외)
    const granted = [];
    for (const p of patterns) if (await chrome.permissions.contains({origins: [p]})) granted.push(p);
    if (!granted.length) return;

    await chrome.scripting.registerContentScripts([
        // 확장 설정(매핑)을 페이지에 전달 — 확장 API 는 격리된 공간(ISOLATED)에서만 쓸 수 있음
        {id: 'fkc-bridge', matches: granted, js: ['bridge.js'], runAt: 'document_start', allFrames: true, world: 'ISOLATED'},
        // 페이지와 같은 공간(MAIN)에서 실행해야 페이지의 jQuery 로 코어 단축키 핸들러를 부를 수 있음
        {id: 'fkc-remap', matches: granted, js: ['remap.js'], runAt: 'document_start', allFrames: true, world: 'MAIN'}
    ]);
}

chrome.runtime.onInstalled.addListener(sync);
chrome.runtime.onStartup.addListener(sync);
chrome.storage.onChanged.addListener((changes) => {
    if (changes.sites) sync();
});
chrome.permissions.onAdded.addListener(sync); // 팝업이 권한 창 때문에 닫혀도 허용되면 여기서 등록
chrome.permissions.onRemoved.addListener(sync);
