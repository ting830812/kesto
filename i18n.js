const I18N_DATA = {
    zh: {
        title: "Kesto",
        subtitle: "滑動黃色方塊，完美覆蓋藍色區域",
        nav_creator: "設計自訂關卡",
        banner_custom: "🎮 正在遊玩自訂關卡",
        banner_back: "返回設計工坊",
        stat_moves: "步數",
        stat_target: "目標覆蓋",
        btn_undo: "上一步",
        btn_reset: "重置",
        footer: "使用 鍵盤方向鍵 或是 螢幕滑動 手勢來進行操作",
        victory_title: "恭喜通關！",
        victory_msg: "你用了 {moves} 步解開了謎題！",
        btn_play_again: "再玩一次",

        // Creator Mode
        creator_title: "自訂關卡工坊",
        creator_subtitle: "自由設計專屬關卡，一鍵匯出並分享",
        nav_play: "返回遊戲首頁",
        label_grid_size: "版面大小 (Grid Size)",
        tool_yellow: "黃色方塊",
        tool_obstacle: "障礙物",
        tool_target: "目標區域",
        tool_eraser: "橡皮擦",
        stat_yellow_count: "黃色方塊",
        stat_target_count: "目標區域",
        btn_clear: "清空版面",
        btn_test: "測試此關卡",
        btn_share: "複製關卡分享連結",

        // Alerts
        alert_clear_confirm: "確定要清空整張設計畫布嗎？",
        alert_error_no_block: "⚠️ 自訂關卡失敗：必須放置至少一個黃色方塊！",
        alert_error_no_target: "⚠️ 自訂關卡失敗：必須放置至少一個目標區域！",
        alert_error_mismatch: "⚠️ 自訂關卡失敗：黃色方塊的數量 ({blocks}) 必須「等於」目標區域的數量 ({targets})！",
        alert_share_success: "🎉 關卡連結已成功複製到剪貼簿！快分享給朋友挑戰吧！",
        alert_share_fallback: "請複製下方關卡分享網址：",
        source_attribution: "原創遊戲出處："
    },
    en: {
        title: "Kesto",
        subtitle: "Slide yellow blocks to cover blue targets perfectly",
        nav_creator: "Level Designer",
        banner_custom: "🎮 Playing Custom Level",
        banner_back: "Back to Editor",
        stat_moves: "Moves",
        stat_target: "Coverage",
        btn_undo: "Undo",
        btn_reset: "Reset",
        footer: "Use Arrow Keys or swipe gestures to control yellow blocks",
        victory_title: "Victory!",
        victory_msg: "You solved the puzzle in {moves} moves!",
        btn_play_again: "Play Again",

        // Creator Mode
        creator_title: "Level Designer",
        creator_subtitle: "Design custom levels, test and share with friends",
        nav_play: "Back to Home",
        label_grid_size: "Grid Size",
        tool_yellow: "Yellow Block",
        tool_obstacle: "Obstacle",
        tool_target: "Target",
        tool_eraser: "Eraser",
        stat_yellow_count: "Yellow Blocks",
        stat_target_count: "Target Areas",
        btn_clear: "Clear Board",
        btn_test: "Test Level",
        btn_share: "Copy Share URL",

        // Alerts
        alert_clear_confirm: "Are you sure you want to clear the designer canvas?",
        alert_error_no_block: "⚠️ Validation Failed: You must place at least one yellow block!",
        alert_error_no_target: "⚠️ Validation Failed: You must place at least one target zone!",
        alert_error_mismatch: "⚠️ Validation Failed: The number of yellow blocks ({blocks}) must equal target zones ({targets})!",
        alert_share_success: "🎉 Level share URL copied to clipboard! Send it to your friends!",
        alert_share_fallback: "Please copy the level URL below:",
        source_attribution: "Original game by: "
    },
    ja: {
        title: "Kesto",
        subtitle: "黄色ブロックをスライドして、青色ターゲットをぴったり覆います",
        nav_creator: "ステージ作成",
        banner_custom: "🎮 カスタムステージをプレイ中",
        banner_back: "作成画面に戻る",
        stat_moves: "手数",
        stat_target: "ターゲット",
        btn_undo: "一手戻る",
        btn_reset: "リセット",
        footer: "キーボードの矢印キーまたはスワイプで操作します",
        victory_title: "クリア！",
        victory_msg: "パズルを {moves} 手で解きました！",
        btn_play_again: "もう一度遊ぶ",

        // Creator Mode
        creator_title: "ステージデザイナー",
        creator_subtitle: "オリジナルステージを作成し、共有できます",
        nav_play: "ホームに戻る",
        label_grid_size: "グリッドサイズ",
        tool_yellow: "黄色ブロック",
        tool_obstacle: "障害物",
        tool_target: "ターゲット",
        tool_eraser: "消しゴム",
        stat_yellow_count: "黄色ブロック",
        stat_target_count: "ターゲットゾーン",
        btn_clear: "クリア",
        btn_test: "テストプレイ",
        btn_share: "共有URLをコピー",

        // Alerts
        alert_clear_confirm: "キャンバスをクリアしてもよろしいですか？",
        alert_error_no_block: "⚠️ 保存失敗：黄色ブロックを少なくとも1つ配置してください！",
        alert_error_no_target: "⚠️ 保存失敗：ターゲットゾーンを少なくとも1つ配置してください！",
        alert_error_mismatch: "⚠️ 保存失敗：黄色ブロックの数 ({blocks}) はターゲット数 ({targets}) と等しくなければなりません！",
        alert_share_success: "🎉 共有URLがクリップボードにコピーされました！友達に送ってみましょう！",
        alert_share_fallback: "以下のURLをコピーしてください：",
        source_attribution: "元ゲームの出典："
    }
};

// Default language setup (checks localStorage first, then URL parameter as a creator language fallback)
let currentLang = (() => {
    const saved = localStorage.getItem('kesto_lang');
    if (saved && ['zh', 'en', 'ja'].includes(saved)) return saved;

    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && ['zh', 'en', 'ja'].includes(urlLang)) {
        localStorage.setItem('kesto_lang', urlLang);
        return urlLang;
    }

    return 'zh'; // fallback
})();

// Format translation strings replacing variables like {moves}
function t(key, variables = {}) {
    const langDict = I18N_DATA[currentLang] || I18N_DATA['zh'];
    let translation = langDict[key] || I18N_DATA['zh'][key] || key;

    Object.keys(variables).forEach(varName => {
        translation = translation.replace(`{${varName}}`, variables[varName]);
    });

    return translation;
}

// Apply translations to all elements with data-i18n attribute
function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = t(key);

        // If element has children (like SVG icons), only update the text node part
        if (el.children.length > 0) {
            // Find the text node and update it
            let textNodeFound = false;
            for (let i = 0; i < el.childNodes.length; i++) {
                if (el.childNodes[i].nodeType === Node.TEXT_NODE && el.childNodes[i].nodeValue.trim() !== '') {
                    el.childNodes[i].nodeValue = ` ${text}`;
                    textNodeFound = true;
                    break;
                }
            }
            // If no text node, append one
            if (!textNodeFound) {
                el.appendChild(document.createTextNode(` ${text}`));
            }
        } else {
            el.textContent = text;
        }
    });
}

// Set up language selector dropdown
function initLangSelector() {
    const selectEl = document.getElementById('lang-select');
    if (selectEl) {
        selectEl.value = currentLang;
        selectEl.addEventListener('change', (e) => {
            currentLang = e.target.value;
            localStorage.setItem('kesto_lang', currentLang);
            applyTranslations();

            // Call callback hook if defined (e.g., to update active game stats display)
            if (window.onLanguageChange) {
                window.onLanguageChange();
            }
        });
    }
    applyTranslations();
}

// Trigger initialization once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initLangSelector();
});
