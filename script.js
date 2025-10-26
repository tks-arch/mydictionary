// 現在位置のコンテナステータスをチェックする関数
function getContainerStatus(text, currentIndex) {
    let quoteCount = 0;
    let parenDepth = 0;
    
    for (let i = 0; i < currentIndex; i++) {
        if (text[i] === '"') {
            quoteCount++;
        } else if (text[i] === '(') {
            parenDepth++;
        } else if (text[i] === ')') {
            parenDepth--;
        }
    }
    
    return {
        inQuotes: quoteCount % 2 === 1,
        inParentheses: parenDepth > 0,
        inAnyContainer: (quoteCount % 2 === 1) || (parenDepth > 0)
    };
}

// 辞書データを格納するグローバル変数
let vocabulary = {};
let words = {};

// モード切り替えの設定
let isHardMode = false;

// 単語境界と単語文字のパターン定数
// アンダースコアは単語の一部ではなく境界文字として扱う
const BOUNDARY_CHARS = /[\s,;:.!?()\[\]{}"\'-_]/;
const WORD_CHARS = /[a-zA-Z0-9]/;
const SENTENCE_ENDINGS = ['.', '!', '?'];

// テキストフォーマット用の正規表現
const QUOTE_PATTERN = /"([^"]*)"/g;

// 位置がHTMLタグ内にあるかをチェックするヘルパー関数
function isInsideHtmlTag(text, position) {
    // '<'または'>'を後方検索
    for (let i = position - 1; i >= 0; i--) {
        if (text[i] === '>') {
            return false; // 閉じタグが先に見つかった場合、タグ内ではない
        }
        if (text[i] === '<') {
            return true; // 開きタグが先に見つかった場合、タグ内
        }
    }
    return false;
}

// 位置が単語境界にあるかをチェックするヘルパー関数
function isAtWordBoundary(text, position) {
    if (position === 0) return true;
    
    const prevChar = text[position - 1];
    const currentChar = text[position];
    
    // 前の文字が境界文字で、現在の文字が単語文字かをチェック
    // アンダースコアは単語の一部ではなく境界文字として扱う
    return (BOUNDARY_CHARS.test(prevChar) || prevChar === '>') && 
           WORD_CHARS.test(currentChar);
}

// 特定の位置で辞書の単語とマッチングを試みるヘルパー関数
function tryMatchAtPosition(text, startPos, vocabEntry) {
    // 辞書の単語から_を削除して正規化
    const wordToMatch = vocabEntry.original.replace(/_/g, '');
    
    // テキストから候補を抽出
    let endPos = startPos;
    let extractedText = '';
    let wordIndex = 0;
    
    // 辞書の単語を1文字ずつマッチング
    while (wordIndex < wordToMatch.length && endPos < text.length) {
        const textChar = text[endPos];
        
        // テキスト中の_はスキップ
        if (textChar === '_') {
            extractedText += textChar;
            endPos++;
            continue;
        }
        
        const wordChar = wordToMatch[wordIndex];
        
        // 文字をマッチング（大文字小文字を区別しない）
        if (textChar.toLowerCase() === wordChar.toLowerCase()) {
            extractedText += textChar;
            endPos++;
            wordIndex++;
        } else {
            // マッチしない
            return null;
        }
    }
    
    // 単語全体がマッチしたかをチェック
    if (wordIndex !== wordToMatch.length) {
        return null;
    }
    
    // マッチが単語境界で終わるかをチェック
    if (endPos < text.length) {
        const nextChar = text[endPos];
        
        // 次の文字は境界文字（アンダースコアを含む）またはHTMLタグであるべき
        if (WORD_CHARS.test(nextChar)) {
            return null; // 単語境界にない
        }
    }
    
    return {
        start: startPos,
        end: endPos,
        matched: extractedText,
        meaning: vocabEntry.meaning
    };
}

// JSONファイルを読み込んで内容を表示
fetch('data.json')
    .then(response => response.json())
    .then(jsonData => {
        const data = jsonData.text;
        vocabulary = jsonData.vocab || {};
        words = jsonData.words || {};
        
        // レンダリング関数を呼び出し
        renderContent(data, vocabulary, words, isHardMode);
    })
    .catch(error => {
        document.getElementById('content').innerHTML = 'Error loading JSON file: ' + error.message;
    });

// 画面下部エリアに翻訳を表示する関数
function showTranslation(element, meaning) {
    const translationDiv = document.getElementById('translation');
    const word = element.textContent;
    
    // フォーマットされた翻訳表示を作成
    const translationHTML = `
        <div class="translation-item">
            <strong class="translation-word">${word}</strong><br>
            <span class="translation-meaning">${meaning}</span>
        </div>
    `;
    
    // 翻訳エリアの上部に追加
    translationDiv.innerHTML = translationHTML + translationDiv.innerHTML;
}


// モード切り替えの初期化
window.addEventListener('DOMContentLoaded', function() {
    const modeToggle = document.getElementById('modeToggle');
    
    // 保存されたモード設定を読み込む
    const savedMode = localStorage.getItem('readingMode');
    if (savedMode === 'hard') {
        modeToggle.checked = true;
        document.body.classList.add('hard-mode');
        isHardMode = true;
    }
    
    // 保存されたハイライト設定を読み込む
    const showHardHighlights = localStorage.getItem('showHardHighlights');
    if (showHardHighlights === 'true') {
        document.body.classList.add('show-hard-highlights');
    }
    
    // モード切り替えイベント
    modeToggle.addEventListener('change', function() {
        isHardMode = this.checked;
        
        if (isHardMode) {
            document.body.classList.add('hard-mode');
            localStorage.setItem('readingMode', 'hard');
        } else {
            document.body.classList.remove('hard-mode');
            localStorage.setItem('readingMode', 'easy');
        }
        
        // コンテンツを再レンダリング
        reloadContent(vocabulary, words, isHardMode);
    });
    
    // 隠し機能: Ctrl+Shift+Dでハードモードの灰色ハイライトをトグル
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            
            if (document.body.classList.contains('show-hard-highlights')) {
                document.body.classList.remove('show-hard-highlights');
                localStorage.setItem('showHardHighlights', 'false');
            } else {
                document.body.classList.add('show-hard-highlights');
                localStorage.setItem('showHardHighlights', 'true');
            }
        }
    });
});

