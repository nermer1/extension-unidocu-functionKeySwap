// MAIN world: unidocu 플러그인 functionKeyCompat 과 같은 방식
//   window 캡처 단계에서 먼저 받아 매핑된 키만 막고, 바꾼 키 코드로 jQuery keydown 을 발생시켜 코어 단축키 로직을 그대로 실행
//   - unidocu 페이지($u 와 jQuery 가 있는 페이지)에서만 동작
//   - 매핑에 없는 키, Ctrl/Alt/Shift/Meta 조합은 통과
//   - document_start 에 등록돼 페이지·unidocu 플러그인보다 먼저 받으므로 stopImmediatePropagation 으로 중복 변환 방지
(function () {
    if (window.__fkcExtension) return;
    window.__fkcExtension = true;

    const keyCodeOf = (k) => {
        if (typeof k === 'number') return k;
        const m = /^F(\d{1,2})$/i.exec(String(k).trim());
        if (m && Number(m[1]) >= 1 && Number(m[1]) <= 12) return 111 + Number(m[1]);
        const n = Number(k);
        return isNaN(n) ? null : n;
    };
    const currentMap = () => {
        let raw = {};
        try {
            raw = JSON.parse(document.documentElement.dataset.fkcMap || '{}');
        } catch (e) {
            return {};
        }
        const out = {};
        Object.keys(raw).forEach((from) => {
            const f = keyCodeOf(from);
            const t = keyCodeOf(raw[from]);
            if (f !== null && t !== null && f !== t) out[f] = t;
        });
        return out;
    };

    window.addEventListener(
        'keydown',
        (e) => {
            if (!window.$u || !window.jQuery) return; // unidocu 페이지가 아니면 아무것도 안 함
            if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return;
            const to = currentMap()[e.keyCode];
            if (!to) return;
            e.stopImmediatePropagation(); // 원래 키는 코어·다른 리스너까지 안 감
            e.preventDefault();
            window.jQuery(document).trigger(window.jQuery.Event('keydown', {which: to, keyCode: to}));
        },
        true
    );
})();
