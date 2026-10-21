// 아이콘 팝업: 현재 탭 사이트를 켜고 끄고, 사이트별 매핑을 저장
const $ = (id) => document.getElementById(id);
const DEFAULT_MAP = {F8: 'F9', F9: 'F8'};

const toText = (map) =>
    Object.keys(map || {})
        .map((k) => k + '=' + map[k])
        .join(', ');
const fromText = (text) => {
    const out = {};
    String(text || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((pair) => {
            const [from, to] = pair.split('=').map((s) => (s || '').trim().toUpperCase());
            if (/^F([1-9]|1[0-2])$/.test(from) && /^F([1-9]|1[0-2])$/.test(to)) out[from] = to;
        });
    return out;
};
const say = (text, isErr) => {
    $('msg').textContent = text;
    $('msg').className = 'msg' + (isErr ? ' err' : '');
};

(async () => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    let origin = '';
    try {
        const u = new URL(tab.url);
        if (u.protocol === 'http:' || u.protocol === 'https:') origin = u.origin;
    } catch (e) {}
    if (!origin) {
        $('site').textContent = '이 페이지에서는 사용할 수 없습니다.';
        $('enabled').disabled = true;
        $('save').disabled = true;
        return;
    }
    const pattern = new URL(origin).protocol + '//' + new URL(origin).hostname + '/*';
    $('site').textContent = origin;

    const {sites = {}} = await chrome.storage.local.get('sites');
    const site = sites[origin];
    $('enabled').checked = !!site;
    $('map').value = toText(site ? site.map : DEFAULT_MAP);

    const saveSites = (next) => chrome.storage.local.set({sites: next});

    $('enabled').addEventListener('change', async () => {
        const {sites: cur = {}} = await chrome.storage.local.get('sites');
        if ($('enabled').checked) {
            // 사이트를 먼저 저장 → 권한 창 때문에 팝업이 닫혀도 background 가 권한 허용 시(onAdded) 등록함
            const map = fromText($('map').value);
            cur[origin] = {map: Object.keys(map).length ? map : DEFAULT_MAP};
            await saveSites(cur);
            // 이 사이트(호스트) 권한만 요청 — 팝업의 사용자 클릭 안에서 호출해야 권한 창이 뜸
            const ok = await chrome.permissions.request({origins: [pattern]});
            if (!ok) {
                delete cur[origin];
                await saveSites(cur);
                $('enabled').checked = false;
                return say('권한을 허용해야 사용할 수 있습니다.', true);
            }
            say('켜짐 — 페이지를 새로고침합니다.');
        } else {
            delete cur[origin];
            await saveSites(cur);
            // 같은 호스트의 다른 포트가 남아 있지 않을 때만 권한 회수
            const stillUsed = Object.keys(cur).some((o) => new URL(o).hostname === new URL(origin).hostname);
            if (!stillUsed) await chrome.permissions.remove({origins: [pattern]});
            say('꺼짐 — 페이지를 새로고침합니다.');
        }
        setTimeout(() => chrome.tabs.reload(tab.id), 300); // 스크립트 등록이 끝난 뒤 새로고침
    });

    $('save').addEventListener('click', async () => {
        const map = fromText($('map').value);
        if (!Object.keys(map).length) return say('매핑 형식을 확인하세요. 예) F8=F9, F9=F8', true);
        $('map').value = toText(map);
        if (!$('enabled').checked) return say('매핑은 이 사이트를 켜야 저장됩니다.', true);
        const {sites: cur = {}} = await chrome.storage.local.get('sites');
        cur[origin] = {map: map};
        await saveSites(cur);
        say('저장됨 — 바로 적용됩니다.');
    });
})();
