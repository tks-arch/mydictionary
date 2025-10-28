// 翻訳表示関連の関数を集めたモジュール

// 画面下部エリアに翻訳を表示する関数
function showTranslation(element, meaning) {
    const translationDiv = document.getElementById('translation');
    const word = element.getAttribute('data-word') || element.textContent;
    
    // 正規化されたキーを取得（ハイフン保持、他記号はスペース、連続スペース削除）
    const normalizedWord = word
        .replace(/[^a-zA-Z\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .trim();
    
    // ユーザーラベルをチェック
    const userLabel = getUserLabel(normalizedWord);
    
    // メモがある場合は訳を上書き、ない場合は通常の訳を表示
    const displayContent = userLabel 
        ? `<span class="translation-meaning">${userLabel}</span>`
        : `<span class="translation-meaning">${meaning}</span>`;
    
    // イージーモードのときにラベル編集ボタンを追加
    const editButtonHTML = currentMode === 'easy' 
        ? `<button class="edit-label-button" data-normalized-word="${normalizedWord}">✏️ 編集</button>`
        : '';
    
    // フォーマットされた翻訳表示を作成
    const translationHTML = `
        <div class="translation-item">
            <strong class="translation-word">${word}</strong>
            ${editButtonHTML}
            <br>
            ${displayContent}
        </div>
    `;
    
    // 翻訳エリアを最新の1つだけに置き換え
    translationDiv.innerHTML = translationHTML;
    
    // イージーモードのときにボタンにイベントリスナーを追加
    if (currentMode === 'easy') {
        const editButton = translationDiv.querySelector('.edit-label-button');
        if (editButton) {
            editButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const normalizedWord = this.getAttribute('data-normalized-word');
                // モーダルを開く（script.jsで定義されているshowModal関数を使用）
                if (window.openUserLabelModal) {
                    window.openUserLabelModal(normalizedWord);
                }
            });
        }
    }
}

