// MAIN world: unidocu 플러그인 functionKeyCompat 과 같은 방식으로 키를 바꿔 코어 단축키 로직을 그대로 실행
//   window 캡처 단계에서 먼저 받아 매핑된 키만 막고, 바꾼 키 코드로 jQuery keydown 을 발생시킴
//
// 자동 감지(mode: auto):
//   코어 $(document).keydown 핸들러 소스에서 $debug.onF8KeyDown() 을 부르는 키 코드를 찾아 이 페이지의 디버그 키를 알아냄
//   (압축돼도 전역·속성 이름과 숫자는 그대로라 같은 규칙으로 찾힘)
//   → 내 디버그 키(preferred)와 같으면 그대로, F8/F9 중 다른 쪽이면 F8↔F9 맞바꿈, 감지 실패면 안 바꿈
//
//   - unidocu 페이지($u 와 jQuery 가 있는 페이지)에서만 동작
//   - 매핑에 없는 키, Ctrl/Alt/Shift/Meta 조합은 통과
//   - document_start 에 등록돼 페이지·unidocu 플러그인보다 먼저 받으므로 stopImmediatePropagation 으로 중복 변환 방지
(function () {
    if (window.__fkcExtension) return;
    window.__fkcExtension = true;

    const F8 = 119;
    const F9 = 120;
    const keyCodeOf = (k) => {
        if (typeof k === 'number') return k;
        const m = /^F(\d{1,2})$/i.exec(String(k).trim());
        if (m && Number(m[1]) >= 1 && Number(m[1]) <= 12) return 111 + Number(m[1]);
        const n = Number(k);
        return isNaN(n) ? null : n;
    };
    const keyName = (code) => (code >= 112 && code <= 123 ? 'F' + (code - 111) : String(code));
    // unidocu 는 jQuery 를 $ 로만 노출하기도 해서 둘 다 확인
    const jqOf = () => window.jQuery || (window.$ && window.$.fn && window.$.fn.jquery ? window.$ : null);

    // 이 페이지의 디버그 키 감지 (못 찾으면 null)
    let detected; // undefined = 아직 안 해봄
    const detectDebugKey = () => {
        const jq = jqOf();
        if (!jq || typeof jq._data !== 'function') return null;
        const events = jq._data(document, 'events');
        const handlers = (events && events.keydown) || [];
        for (let i = 0; i < handlers.length; i++) {
            const src = String(handlers[i].handler);
            const at = src.indexOf('onF8KeyDown');
            if (at < 0) continue;
            // 호출 바로 앞에서 마지막으로 비교한 펑션키 코드(112~123) — ===120 / 120=== / == 120 모두
            const before = src.slice(Math.max(0, at - 400), at);
            const re = /(?:==+\s*(11[2-9]|12[0-3])\b)|(?:\b(11[2-9]|12[0-3])\s*==+)/g;
            let m;
            let last = null;
            while ((m = re.exec(before))) last = Number(m[1] || m[2]);
            if (last) return last;
        }
        return null;
    };
    const report = () => {
        // 팝업 표시용
        const el = document.documentElement;
        if (el) el.dataset.fkcDetected = detected ? keyName(detected) : 'none';
    };
    const ensureDetected = () => {
        if (detected) return detected;
        detected = detectDebugKey();
        report();
        return detected;
    };
    // 코어 핸들러가 등록될 때쯤 미리 감지해서 팝업에 결과를 보여줌 (키를 누를 때도 다시 시도)
    [500, 1500, 4000].forEach((ms) =>
        setTimeout(() => {
            if (!detected && window.$u) ensureDetected();
        }, ms)
    );

    const config = () => {
        try {
            return JSON.parse(document.documentElement.dataset.fkcConfig || 'null');
        } catch (e) {
            return null;
        }
    };
    // 실제로 쓸 매핑 {원래 키 코드: 바꿀 키 코드}
    const currentMap = () => {
        const cfg = config();
        if (!cfg) return {};
        const out = {};
        if (cfg.mode === 'custom') {
            Object.keys(cfg.map || {}).forEach((from) => {
                const f = keyCodeOf(from);
                const t = keyCodeOf(cfg.map[from]);
                if (f !== null && t !== null && f !== t) out[f] = t;
            });
            return out;
        }
        const det = ensureDetected();
        const want = cfg.preferred === 'F9' ? F9 : F8;
        if (!det || det === want || (det !== F8 && det !== F9)) return out; // 같거나 감지 실패면 그대로
        out[F8] = F9;
        out[F9] = F8;
        return out;
    };

    window.addEventListener(
        'keydown',
        (e) => {
            const jq = jqOf();
            if (!window.$u || !jq) return; // unidocu 페이지가 아니면 아무것도 안 함
            if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return;
            const to = currentMap()[e.keyCode];
            if (!to) return;
            e.stopImmediatePropagation(); // 원래 키는 코어·다른 리스너까지 안 감
            e.preventDefault();
            jq(document).trigger(jq.Event('keydown', {which: to, keyCode: to}));
        },
        true
    );
    console.log('[functionKeyCompat 확장] 로드됨');
})();
