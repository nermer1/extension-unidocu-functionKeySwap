// ISOLATED world: 확장 저장소의 설정을 <html data-fkc-config> 로 페이지(MAIN world)에 전달
//   { mode: 'auto'|'custom', map: {F8:'F9',...}, preferred: 'F8'|'F9' }
//   remap.js 는 키를 누를 때마다 이 속성을 읽으므로 로드 순서와 무관하게 동작
(function () {
    const apply = (sites, preferred) => {
        const el = document.documentElement;
        if (!el) return;
        const site = (sites || {})[location.origin];
        if (!site) return delete el.dataset.fkcConfig;
        el.dataset.fkcConfig = JSON.stringify({
            mode: site.mode === 'custom' ? 'custom' : 'auto', // mode 없는 예전 항목은 자동 감지로
            map: site.map || {},
            preferred: preferred === 'F9' ? 'F9' : 'F8'
        });
    };
    const load = () => chrome.storage.local.get(['sites', 'preferredDebugKey']).then((s) => apply(s.sites, s.preferredDebugKey));
    load();
    // 팝업에서 설정을 바꾸면 새로고침 없이 바로 반영
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.sites || changes.preferredDebugKey) load();
    });
})();
