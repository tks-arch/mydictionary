// 辞書データを格納するグローバル変数
let vocabulary = {};
let words = {};

// モード切り替えの設定
let currentMode = 'easy'; // 'easy', 'normal', 'hard'

// ユーザーラベルデータを格納するグローバル変数
let userLabels = {};

// 最後にクリックされたラベルの単語を格納
let lastClickedLabel = null;

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
    // wordはすでに正規化されている
    const entry = userLabels[word];
    return entry ? entry.label : null;
}

// ユーザーラベルを設定する関数
function setUserLabel(word, label) {
    // wordはすでに正規化されている
    if (label && label.trim()) {
        userLabels[word] = {
            original: word,  // 正規化されたテキストを保存
            label: label.trim()
        };
    } else {
        delete userLabels[word];
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
    let currentOriginalWord = null;  // オリジナルの単語（表示用）
    let currentMeaning = null;  // 元の意味（辞書の訳）
    
    // モーダルを表示
    function showModal(word, element, originalWord = null, meaning = null) {
        currentWord = word;
        currentElement = element;
        currentOriginalWord = originalWord || word;
        currentMeaning = meaning;
        // 受け取ったテキストはすでに正規化されているのでそのまま表示
        selectedWordDiv.textContent = currentOriginalWord;
        
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
    
    // モーダルを開く関数をグローバルに公開
    window.openUserLabelModal = function(normalizedWord, originalWord = null, meaning = null) {
        showModal(normalizedWord, null, originalWord, meaning);
    };
    
    // 訳領域を更新する関数
    function updateTranslationArea() {
        if (currentWord && currentOriginalWord) {
            const translationDiv = document.getElementById('translation');
            const userLabel = getUserLabel(currentWord);
            
            // メモがある場合は訳を上書き、ない場合は通常の訳を表示
            const displayContent = userLabel 
                ? `<span class="translation-meaning">${userLabel}</span>`
                : `<span class="translation-meaning">${currentMeaning || ''}</span>`;
            
            // イージーモードのときにラベル編集ボタンを追加
            const editButtonHTML = currentMode === 'easy' 
                ? `<button class="edit-label-button" data-normalized-word="${currentWord}" data-original-word="${currentOriginalWord}" data-meaning="${currentMeaning || ''}">✏️ 編集</button>`
                : '';
            
            // フォーマットされた翻訳表示を作成
            const translationHTML = `
                <div class="translation-item">
                    <strong class="translation-word">${currentOriginalWord}</strong>
                    ${editButtonHTML}
                    <br>
                    ${displayContent}
                </div>
            `;
            
            // 翻訳エリアを更新
            translationDiv.innerHTML = translationHTML;
            
            // イージーモードのときにボタンにイベントリスナーを追加
            if (currentMode === 'easy') {
                const editButton = translationDiv.querySelector('.edit-label-button');
                if (editButton) {
                    editButton.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        const normalizedWord = this.getAttribute('data-normalized-word');
                        const originalWord = this.getAttribute('data-original-word');
                        const meaning = this.getAttribute('data-meaning');
                        if (window.openUserLabelModal) {
                            window.openUserLabelModal(normalizedWord, originalWord, meaning);
                        }
                    });
                }
            }
        }
    }
    
    // 保存ボタン
    btnSave.addEventListener('click', function() {
        if (currentWord) {
            setUserLabel(currentWord, input.value);
            // レンダリングを更新
            reloadContent(vocabulary, words, currentMode, userLabels);
            // 訳領域を更新
            updateTranslationArea();
        }
        hideModal();
    });
    
    // 削除ボタン
    btnDelete.addEventListener('click', function() {
        if (currentWord) {
            setUserLabel(currentWord, '');
            // 削除の場合は最後にクリックされたラベルをクリア
            if (lastClickedLabel === currentWord) {
                lastClickedLabel = null;
            }
            // レンダリングを更新
            reloadContent(vocabulary, words, currentMode, userLabels);
            // 訳領域を更新
            updateTranslationArea();
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
        // 将来の拡張用
    };
}

