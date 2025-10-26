// 翻訳表示関連の関数を集めたモジュール

// 画面下部エリアに翻訳を表示する関数
function showTranslation(element, meaning) {
    const translationDiv = document.getElementById('translation');
    const word = element.getAttribute('data-word') || element.textContent;
    
    // ユーザーラベルをチェック
    const userLabel = getUserLabel(word);
    
    // メモがある場合は訳を上書き、ない場合は通常の訳を表示
    const displayContent = userLabel 
        ? `<span class="translation-meaning">${userLabel}</span>`
        : `<span class="translation-meaning">${meaning}</span>`;
    
    // フォーマットされた翻訳表示を作成
    const translationHTML = `
        <div class="translation-item">
            <strong class="translation-word">${word}</strong><br>
            ${displayContent}
        </div>
    `;
    
    // 翻訳エリアの上部に追加
    translationDiv.innerHTML = translationHTML + translationDiv.innerHTML;
}

