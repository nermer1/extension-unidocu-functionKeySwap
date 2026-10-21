// ISOLATED world: 확장 저장소에서 이 사이트(origin)의 매핑을 읽어 <html data-fkc-map> 으로 페이지에 전달
//   remap.js(MAIN world)는 키를 누를 때마다 이 속성을 읽으므로 로드 순서와 무관하게 동작
(function () {
    const apply = (sites) => {
        const site = (sites || {})[location.origin];
        const el = document.documentElement;
        if (!el) return;
        if (site && site.map) el.dataset.fkcMap = JSON.stringify(site.map);
        else delete el.dataset.fkcMap;
    };
    chrome.storage.local.get('sites').then(({sites}) => apply(sites));
    // 팝업에서 매핑을 바꾸면 새로고침 없이 바로 반영
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.sites) apply(changes.sites.newValue);
    });
})();
