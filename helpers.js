// ヘルパー関数と定数を集めたモジュール

// 単語境界と単語文字のパターン定数
// ハイフン（-）は単語境界として扱う
// 感嘆符（!）と疑問符（?）は文字として扱う（意味を持つ記号）
// アンダースコアは単語の一部ではなく境界文字として扱う
const BOUNDARY_CHARS = /[\s,;:.()\[\]{}"'_\-]/;  // !? を除外、ハイフンを追加
const WORD_CHARS = /[a-zA-Z0-9]/;
const MEANINGFUL_SYMBOLS = /[!?]/;  // 意味を持つ記号（文字として扱う）
const SENTENCE_ENDINGS = ['.', '!', '?'];

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
    const currentChar = text[position];
    
    // 現在の文字が単語文字または意味記号(!?)でなければ、単語境界ではない
    if (!WORD_CHARS.test(currentChar) && !MEANINGFUL_SYMBOLS.test(currentChar)) {
        return false;
    }
    
    // 位置0で、かつ現在の文字が単語文字なら単語境界
    if (position === 0) {
        return true;
    }
    
    const prevChar = text[position - 1];
    
    // 前の文字が境界文字で、現在の文字が単語文字または意味記号かをチェック
    return (BOUNDARY_CHARS.test(prevChar) || prevChar === '>');
}

// 特定の位置で辞書の単語とマッチングを試みるヘルパー関数
function tryMatchAtPosition(text, startPos, vocabEntry) {
    // 辞書の単語は既に正規化済み
    const normalizedDict = vocabEntry.normalized;
    
    // マッチング開始位置から十分な長さのテキストを抽出
    // 辞書の長さ + 記号分の余裕を見て抽出
    const maxLength = normalizedDict.length * 2 + 10;
    const textSegment = text.substring(startPos, startPos + maxLength);
    
    // テキストを正規化
    // 1. 記号をスペースに変換（A-Z, a-z, -, スペース以外）
    // 2. 連続スペース削除
    // 3. 小文字化
    const normalizedText = textSegment
        .replace(/[^a-zA-Z\s-]/g, ' ')  // 1. 記号→スペース
        .replace(/\s+/g, ' ')            // 2. 連続スペース削除
        .toLowerCase();                  // 3. 小文字化
    
    // 正規化されたテキストが辞書の単語で始まるかチェック
    if (!normalizedText.startsWith(normalizedDict)) {
        return null;
    }
    
    // 辞書の単語の後が単語境界かチェック（スペースまたは終端）
    const afterMatch = normalizedText[normalizedDict.length];
    if (afterMatch !== undefined && afterMatch !== ' ') {
        return null; // 単語境界にない
    }
    
    // 元のテキストでマッチした部分の終端位置を計算
    // 正規化されたマッチ長に対応する元のテキストの範囲を特定
    let endPos = startPos;
    let currentNormalized = '';
    
    // 元のテキストを1文字ずつ正規化しながら、辞書の長さ分に達するまで進む
    while (currentNormalized.length < normalizedDict.length && endPos < text.length) {
        const char = text[endPos];
        
        // 1文字を正規化
        let normalizedChar;
        if (/[a-zA-Z-]/.test(char)) {
            // A-Z, a-z, - はそのまま（小文字化）
            normalizedChar = char.toLowerCase();
        } else if (/\s/.test(char)) {
            // スペース・改行はスペース
            normalizedChar = ' ';
        } else {
            // その他の記号はスペース
            normalizedChar = ' ';
        }
        
        // 正規化した文字を追加
        if (currentNormalized.length === 0 || currentNormalized[currentNormalized.length - 1] !== ' ' || normalizedChar !== ' ') {
            // 連続スペースを防ぐ：前の文字がスペースで今の文字もスペースならスキップ
            if (!(currentNormalized[currentNormalized.length - 1] === ' ' && normalizedChar === ' ')) {
                currentNormalized += normalizedChar;
            }
        }
        
        endPos++;
    }
    
    const matched = text.substring(startPos, endPos);
    
    return {
        start: startPos,
        end: endPos,
        matched: matched,
        meaning: vocabEntry.meaning
    };
}

// 選択されたテキストを取得する関数
function getSelectedText() {
    const selection = window.getSelection();
    return selection.toString().trim();
}

// テキストに記号が含まれているかチェックする関数
function containsSymbols(text) {
    // アルファベットとスペース以外の文字が含まれているかチェック
    return /[^a-zA-Z\s]/.test(text);
}

// 選択範囲が複数の段落にまたがっているかチェックする関数
function isSelectionCrossingParagraphs() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return false;
    
    const range = selection.getRangeAt(0);
    let node = range.startContainer;
    
    // 開始ノードから親の.sentence要素を探す
    let startSentence = null;
    let currentNode = node;
    while (currentNode && currentNode !== document.body) {
        if (currentNode.classList && currentNode.classList.contains('sentence')) {
            startSentence = currentNode;
            break;
        }
        currentNode = currentNode.parentNode;
    }
    
    // 終了ノードから親の.sentence要素を探す
    node = range.endContainer;
    let endSentence = null;
    currentNode = node;
    while (currentNode && currentNode !== document.body) {
        if (currentNode.classList && currentNode.classList.contains('sentence')) {
            endSentence = currentNode;
            break;
        }
        currentNode = currentNode.parentNode;
    }
    
    // 両方が見つかり、異なる段落の場合はtrue
    return startSentence && endSentence && startSentence !== endSentence;
}

// 選択テキストを段階的にマッチングして最適なテキストを返す
function checkIfMultipleWords(text, currentMode, vocabulary, words) {
    const normalizedText = text.toLowerCase().trim();
    
    // 空の文字列の場合はnullを返す
    if (!normalizedText) {
        return null;
    }
    
    // contentエリアからプレーンテキストを取得
    const contentDiv = document.getElementById('content');
    if (!contentDiv) {
        return text; // contentが見つからない場合は元のテキストを返す
    }
    
    // HTMLから実際のテキストを抽出（正規化）
    // ハイフンは保持、その他の記号はスペースに変換、連続スペースを削除
    const actualText = contentDiv.textContent
        .replace(/[^a-zA-Z\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .toLowerCase();
    
    // テキストを正規化してから単語に分割
    const normalizedSelectedText = text
        .replace(/[^a-zA-Z\s-]/g, ' ')  // 記号→スペース
        .replace(/\s+/g, ' ')            // 連続スペース削除
        .toLowerCase()
        .trim();
    
    const wordArray = normalizedSelectedText.split(/\s+/);
    
    // マッチした結果を保存（より長いマッチで上書き）
    let bestMatch = null;
    
    // 中央の単語インデックス
    const centerIndex = Math.floor(wordArray.length / 2);
    
    // 幅（単語数）ごとに検索
    for (let width = 1; width <= wordArray.length; width++) {
        // 中央から左右にずらしながら検索
        for (let start = 0; start <= wordArray.length - width; start++) {
            const end = start + width;
            const normalizedTrimmed = wordArray.slice(start, end).join(' ');
            
            if (isTextMatchWithWordBoundary(actualText, normalizedTrimmed)) {
                // マッチした結果を正規化して保存（より長いものを優先）
                bestMatch = normalizedTrimmed;
            }
        }
    }
    
    // 最終的に見つかった最大のマッチを返す（正規化後のテキスト）
    return bestMatch;
}

// 単語境界を意識してテキストがマッチするかチェックする関数
function isTextMatchWithWordBoundary(actualText, searchText) {
    if (!searchText) return false;
    
    // 検索テキストを正規化（連続するスペースを1つにまとめる）
    const normalizedSearchText = searchText.trim().replace(/\s+/g, ' ');
    
    // 実際のテキストを単語に分割
    const actualWords = actualText.split(/\s+/);
    const searchWords = normalizedSearchText.split(/\s+/);
    
    // 検索テキストの単語数
    const searchLength = searchWords.length;
    
    // スライディングウィンドウで検索
    for (let i = 0; i <= actualWords.length - searchLength; i++) {
        let match = true;
        for (let j = 0; j < searchLength; j++) {
            if (actualWords[i + j] !== searchWords[j]) {
                match = false;
                break;
            }
        }
        if (match) {
            return true;
        }
    }
    
    return false;
}


