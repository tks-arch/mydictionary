// アプリケーションの初期化処理を集めたモジュール

// アプリケーション初期化のメイン関数
function initializeApp() {
    // ユーザーラベルをlocalStorageから読み込む
    loadUserLabels();
    
    // データを読み込んでレンダリング
    loadAndRenderContent();
    
    // UI初期化（DOMContentLoaded後に実行）
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeUI);
    } else {
        // すでにDOMが読み込まれている場合
        initializeUI();
    }
}

// データを読み込んで初回レンダリングを実行
function loadAndRenderContent() {
    fetch('data.json')
        .then(response => response.json())
        .then(jsonData => {
            const data = jsonData.text;
            vocabulary = jsonData.vocab || {};
            words = jsonData.words || {};
            
            // renderer.jsのrenderContent関数を呼び出し
            renderContent(data, vocabulary, words, currentMode, userLabels);
        })
        .catch(error => {
            document.getElementById('content').innerHTML = 'Error loading JSON file: ' + error.message;
        });
}

// UIの初期化（モードボタン、イベントリスナーなど）
function initializeUI() {
    // モード切り替えボタンの初期化
    initializeModeButtons();
    
    // キーボードショートカットの設定
    setupKeyboardShortcuts();
    
    // ユーザーラベルモーダルの設定
    setupUserLabelModal();
}

// モードボタンの初期化
function initializeModeButtons() {
    const modeButtons = document.querySelectorAll('.mode-button');
    
    // 保存されたモード設定を読み込む
    const savedMode = localStorage.getItem('readingMode') || 'easy';
    currentMode = savedMode;
    
    // モードに応じたCSSクラスを追加
    document.body.classList.remove('normal-mode', 'hard-mode');
    if (currentMode === 'normal') {
        document.body.classList.add('normal-mode');
    } else if (currentMode === 'hard') {
        document.body.classList.add('hard-mode');
    }
    
    // ボタンのアクティブ状態を設定
    modeButtons.forEach(btn => {
        if (btn.dataset.mode === currentMode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // 保存されたハイライト設定を読み込む
    const showHardHighlights = localStorage.getItem('showHardHighlights');
    if (showHardHighlights === 'true') {
        document.body.classList.add('show-hard-highlights');
    }
    
    // モード切り替えイベントリスナーを追加
    modeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const newMode = this.dataset.mode;
            
            if (newMode === currentMode) return;
            
            currentMode = newMode;
            
            // すべてのボタンからactiveを削除
            modeButtons.forEach(btn => btn.classList.remove('active'));
            // クリックされたボタンにactiveを追加
            this.classList.add('active');
            
            // bodyのクラスを更新
            document.body.classList.remove('normal-mode', 'hard-mode');
            if (currentMode === 'normal') {
                document.body.classList.add('normal-mode');
            } else if (currentMode === 'hard') {
                document.body.classList.add('hard-mode');
            }
            
            // モードを保存
            localStorage.setItem('readingMode', currentMode);
            
            // コンテンツを再レンダリング
            reloadContent(vocabulary, words, currentMode, userLabels);
        });
    });
}

// キーボードショートカットの設定
function setupKeyboardShortcuts() {
    // 隠し機能: Ctrl+Shift+Dでノーマルモードの灰色ハイライトをトグル
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            
            // Normalモードの時のみ有効
            if (currentMode === 'normal') {
                if (document.body.classList.contains('show-hard-highlights')) {
                    document.body.classList.remove('show-hard-highlights');
                    localStorage.setItem('showHardHighlights', 'false');
                } else {
                    document.body.classList.add('show-hard-highlights');
                    localStorage.setItem('showHardHighlights', 'true');
                }
            }
        }
    });
}

// アプリケーションを初期化
initializeApp();

