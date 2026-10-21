// 아이콘 팝업: 내 디버그 키(전체), 현재 사이트 켜기/끄기·모드(자동 감지/직접 지정), 사용 중인 사이트 목록
const $ = (id) => document.getElementById(id);
const SWAP = {F8: 'F9', F9: 'F8'};

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
const getAll = () => chrome.storage.local.get(['sites', 'preferredDebugKey']);
const modeOf = (site) => (site && site.mode === 'custom' ? 'custom' : 'auto'); // mode 없는 예전 항목은 자동

(async () => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    let origin = '';
    try {
        const u = new URL(tab.url);
        if (u.protocol === 'http:' || u.protocol === 'https:') origin = u.origin;
    } catch (e) {}

    // ── 내 디버그 키 (전체 설정) ──
    const all = await getAll();
    $('pref').value = all.preferredDebugKey === 'F9' ? 'F9' : 'F8';
    $('pref').addEventListener('change', async () => {
        await chrome.storage.local.set({preferredDebugKey: $('pref').value});
        say('내 디버그 키: ' + $('pref').value + ' — 바로 적용됩니다.');
        renderStatus();
    });

    // 사이트 끄기: 목록에서 빼고, 같은 호스트의 다른 포트가 남아 있지 않을 때만 권한 회수
    const removeSite = async (target) => {
        const {sites: cur = {}} = await getAll();
        delete cur[target];
        await chrome.storage.local.set({sites: cur});
        const host = new URL(target).hostname;
        const stillUsed = Object.keys(cur).some((o) => new URL(o).hostname === host);
        if (!stillUsed) await chrome.permissions.remove({origins: [new URL(target).protocol + '//' + host + '/*']});
    };

    // ── 사용 중인 사이트 목록 ──
    const renderList = async () => {
        const {sites: cur = {}} = await getAll();
        const keys = Object.keys(cur).sort((a, b) => (a === origin ? -1 : b === origin ? 1 : a.localeCompare(b))); // 현재 사이트 맨 위
        const ul = $('list');
        ul.innerHTML = '';
        if (!keys.length) {
            ul.innerHTML = '<li class="empty">아직 켠 사이트가 없습니다.</li>';
            return;
        }
        keys.forEach((o) => {
            const li = document.createElement('li');
            const name = document.createElement('span');
            name.className = 'o' + (o === origin ? ' cur' : '');
            name.textContent = o;
            const m = document.createElement('span');
            m.className = 'm';
            m.textContent = modeOf(cur[o]) === 'custom' ? toText(cur[o].map) : '자동';
            const del = document.createElement('button');
            del.textContent = '삭제';
            del.addEventListener('click', async () => {
                await removeSite(o);
                if (o === origin) {
                    $('enabled').checked = false;
                    $('siteOpts').classList.add('hidden');
                    say('꺼짐 — 페이지를 새로고침합니다.');
                    setTimeout(() => chrome.tabs.reload(tab.id), 300);
                } else say(o + ' 삭제됨 — 그 사이트는 새로고침하면 원래대로 돌아갑니다.');
            });
            li.append(name, m, del);
            ul.appendChild(li);
        });
    };
    renderList();
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.sites) renderList();
    });

    if (!origin) {
        $('site').textContent = '이 페이지에서는 사용할 수 없습니다.';
        $('enabled').disabled = true;
        return;
    }
    const pattern = new URL(origin).protocol + '//' + new URL(origin).hostname + '/*';
    $('site').textContent = origin;

    // ── 현재 사이트 ──
    const showSite = (site) => {
        $('enabled').checked = !!site;
        $('siteOpts').classList.toggle('hidden', !site);
        $('mode').value = modeOf(site);
        $('customRow').classList.toggle('hidden', modeOf(site) !== 'custom');
        $('map').value = toText(site && site.map && Object.keys(site.map).length ? site.map : SWAP);
    };
    showSite((all.sites || {})[origin]);

    // 감지 결과 표시 (페이지가 <html data-fkc-detected> 로 남긴 값을 읽음)
    const renderStatus = async () => {
        const st = $('status');
        if ($('mode').value === 'custom') {
            st.className = 'status';
            st.textContent = '직접 지정한 매핑대로 바꿉니다.';
            return;
        }
        let det = null;
        try {
            const [r] = await chrome.scripting.executeScript({target: {tabId: tab.id}, func: () => document.documentElement.dataset.fkcDetected || ''});
            det = r && r.result;
        } catch (e) {}
        const pref = $('pref').value;
        if (det === 'F8' || det === 'F9') {
            st.className = 'status';
            st.textContent = '감지: 이 페이지 디버그 = ' + det + (det === pref ? ' → 내 설정과 같아 그대로' : ' → F8↔F9 맞바꿈');
        } else {
            st.className = 'status none';
            st.textContent = det === 'none' ? '감지 실패 → 바꾸지 않음 (필요하면 직접 지정)' : '감지 대기 중… (페이지 로드 후 다시 열어보세요)';
        }
    };
    if ($('enabled').checked) renderStatus();

    const saveSite = async (patch) => {
        const {sites: cur = {}} = await getAll();
        cur[origin] = Object.assign({mode: 'auto', map: {}}, cur[origin] || {}, patch);
        await chrome.storage.local.set({sites: cur});
    };

    $('enabled').addEventListener('change', async () => {
        if ($('enabled').checked) {
            // 사이트를 먼저 저장 → 권한 창 때문에 팝업이 닫혀도 background 가 권한 허용 시(onAdded) 등록 후 새로고침
            await saveSite({mode: $('mode').value || 'auto'});
            const had = await chrome.permissions.contains({origins: [pattern]});
            const ok = had || (await chrome.permissions.request({origins: [pattern]}));
            if (!ok) {
                await removeSite(origin);
                showSite(null);
                return say('권한을 허용해야 사용할 수 있습니다.', true);
            }
            showSite((await getAll()).sites[origin]);
            if (!had) return say('켜짐 — 페이지가 새로고침됩니다.');
            say('켜짐 — 페이지를 새로고침합니다.');
        } else {
            await removeSite(origin);
            showSite(null);
            say('꺼짐 — 페이지를 새로고침합니다.');
        }
        setTimeout(() => chrome.tabs.reload(tab.id), 300);
    });

    $('mode').addEventListener('change', async () => {
        const mode = $('mode').value;
        $('customRow').classList.toggle('hidden', mode !== 'custom');
        const patch = {mode: mode};
        if (mode === 'custom') {
            const map = fromText($('map').value);
            patch.map = Object.keys(map).length ? map : SWAP;
        }
        await saveSite(patch);
        say(mode === 'custom' ? '직접 지정으로 바뀜 — 바로 적용됩니다.' : '자동 감지로 바뀜 — 바로 적용됩니다.');
        renderStatus();
    });

    $('save').addEventListener('click', async () => {
        const map = fromText($('map').value);
        if (!Object.keys(map).length) return say('매핑 형식을 확인하세요. 예) F8=F9, F9=F8', true);
        $('map').value = toText(map);
        await saveSite({mode: 'custom', map: map});
        say('저장됨 — 바로 적용됩니다.');
    });
})();
