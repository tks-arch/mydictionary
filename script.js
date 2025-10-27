// 辞書データを格納するグローバル変数
let vocabulary = {};
let words = {};

// モード切り替えの設定
let currentMode = 'easy'; // 'easy', 'normal', 'hard'

// ユーザーラベルデータを格納するグローバル変数
let userLabels = {};

// ユーザーラベルをlocalStorageから読み込む
function loadUserLabels() {
    const saved = localStorage.getItem('userLabels');
    if (saved) {
        try {
            userLabels = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load user labels:', e);
            userLabels = {};
        }
    }
}

// ユーザーラベルをlocalStorageに保存する
function saveUserLabels() {
    localStorage.setItem('userLabels', JSON.stringify(userLabels));
}

// ユーザーラベルを取得する関数（正規化されたキーで検索）
function getUserLabel(word) {
    // 記号とスペースを削除して正規化（アルファベットのみ）
    const normalizedWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
    const entry = userLabels[normalizedWord];
    return entry ? entry.label : null;
}

// ユーザーラベルを設定する関数
function setUserLabel(word, label) {
    // 記号とスペースを削除して正規化（アルファベットのみ）
    const normalizedWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
    if (label && label.trim()) {
        userLabels[normalizedWord] = {
            original: word,  // 元のテキストを保存
            label: label.trim()
        };
    } else {
        delete userLabels[normalizedWord];
    }
    saveUserLabels();
}

// ユーザーラベルモーダルの設定
function setupUserLabelModal() {
    const modal = document.getElementById('userLabelModal');
    const selectedWordDiv = document.getElementById('selectedWord');
    const input = document.getElementById('userLabelInput');
    const btnSave = document.getElementById('btnSaveLabel');
    const btnDelete = document.getElementById('btnDeleteLabel');
    const btnCancel = document.getElementById('btnCancelLabel');
    
    let currentWord = null;
    let currentElement = null;
    
    // モーダルを表示
    function showModal(word, element) {
        currentWord = word;
        currentElement = element;
        selectedWordDiv.textContent = word;
        
        const existingLabel = getUserLabel(word);
        input.value = existingLabel || '';
        
        modal.classList.add('show');
        input.focus();
    }
    
    // モーダルを非表示
    function hideModal() {
        modal.classList.remove('show');
        currentWord = null;
        currentElement = null;
        input.value = '';
    }
    
    // 保存ボタン
    btnSave.addEventListener('click', function() {
        if (currentWord) {
            setUserLabel(currentWord, input.value);
            // レンダリングを更新
            reloadContent(vocabulary, words, currentMode, userLabels);
        }
        hideModal();
    });
    
    // 削除ボタン
    btnDelete.addEventListener('click', function() {
        if (currentWord) {
            setUserLabel(currentWord, '');
            // レンダリングを更新
            reloadContent(vocabulary, words, currentMode, userLabels);
        }
        hideModal();
    });
    
    // キャンセルボタン
    btnCancel.addEventListener('click', hideModal);
    
    // Enterキーで保存
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            btnSave.click();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            hideModal();
        }
    });
    
    // モーダル背景をクリックで閉じる
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideModal();
        }
    });
    
    // 単語要素にイベントを追加する関数（グローバルに公開）
    window.attachUserLabelEvents = function() {
        // 右クリック編集機能は削除されました
        // ラベルの追加・編集はフローティングボタンのみで行います
    };
    
    // 選択テキストからの保存はフローティングボタンのみで行う
    // （右クリック、Shift+S、長押しは無効化）
    
    // フローティングボタンの設定
    const floatingButton = document.getElementById('floatingSaveButton');
    let selectionCheckTimer = null;
    
    // 選択テキストの変化を監視
    function checkSelection() {
        const selectedText = getSelectedText();
        
        if (selectedText && selectedText.length > 0) {
            // 選択範囲の位置を取得
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();
                
                // ボタンを選択範囲の近くに表示
                floatingButton.style.top = (rect.bottom + window.scrollY + 10) + 'px';
                floatingButton.style.left = (rect.right + window.scrollX - 56) + 'px';
                floatingButton.classList.add('show');
            }
        } else {
            floatingButton.classList.remove('show');
        }
    }
    
    // 選択変更イベント
    document.addEventListener('selectionchange', function() {
        clearTimeout(selectionCheckTimer);
        selectionCheckTimer = setTimeout(checkSelection, 100);
    });
    
    // フローティングボタンのクリックイベント
    floatingButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const selectedText = getSelectedText();
        if (selectedText) {
            // 段落をまたいでいるかチェック
            if (isSelectionCrossingParagraphs()) {
                alert('エラー: 段落をまたいだラベル付けはできません。\n1つの段落内でテキストを選択してください。');
                return;
            }
            
            // 選択テキストが有効かチェック（空でなければOK）
            const validatedText = checkIfMultipleWords(selectedText, currentMode, vocabulary, words);
            if (validatedText) {
                showModal(validatedText, null);
                // ボタンを非表示
                floatingButton.classList.remove('show');
            }
        }
    });
    
    // モーダルを閉じたら選択を解除してボタンを非表示
    const originalHideModal = hideModal;
    hideModal = function() {
        originalHideModal();
        window.getSelection().removeAllRanges();
        floatingButton.classList.remove('show');
    };
}

