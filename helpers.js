// ヘルパー関数と定数を集めたモジュール

// 単語境界と単語文字のパターン定数
// ハイフン（-）は単語の一部として扱う（Rabbit-Holeなど）
// 感嘆符（!）と疑問符（?）は文字として扱う（意味を持つ記号）
// アンダースコアは単語の一部ではなく境界文字として扱う
const BOUNDARY_CHARS = /[\s,;:.()\[\]{}"'_]/;  // !? を除外
const WORD_CHARS = /[a-zA-Z0-9-]/;
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
// アルファベットと意味記号(!?)を文字として扱い、他の記号は境界として扱う
function tryMatchAtPosition(text, startPos, vocabEntry) {
    // 辞書の単語からアルファベットと!?のみを抽出（他の記号を削除）
    const normalizedDict = vocabEntry.original.toLowerCase().replace(/[^a-zA-Z!?]/g, '');
    
    // テキストから候補を抽出
    let endPos = startPos;
    let extractedText = '';
    let dictIndex = 0;
    
    // 辞書の単語を1文字ずつマッチング
    while (dictIndex < normalizedDict.length && endPos < text.length) {
        const textChar = text[endPos];
        const dictChar = normalizedDict[dictIndex];
        
        // アルファベットの場合：マッチング
        if (/[a-zA-Z]/.test(textChar)) {
            if (textChar.toLowerCase() === dictChar.toLowerCase()) {
                extractedText += textChar;
                endPos++;
                dictIndex++;
            } else {
                // マッチしない
                return null;
            }
        }
        // 意味記号(!?)の場合：マッチング
        else if (MEANINGFUL_SYMBOLS.test(textChar)) {
            if (textChar === dictChar) {
                extractedText += textChar;
                endPos++;
                dictIndex++;
            } else {
                // 記号が一致しない → マッチ失敗
                return null;
            }
        }
        // その他の記号・スペースの場合：スキップ（境界として扱う）
        else {
            extractedText += textChar;
            endPos++;
            // dictIndexは進めない（辞書の同じ位置で次の文字を待つ）
        }
    }
    
    // 単語全体がマッチしたかをチェック
    if (dictIndex !== normalizedDict.length) {
        return null;
    }
    
    // マッチが単語境界で終わるかをチェック
    if (endPos < text.length) {
        const nextChar = text[endPos];
        
        // 次の文字は境界文字またはHTMLタグであるべき
        // 意味記号(!?)は単語の一部として扱うので、ここではチェックしない
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

// 選択テキストが有効かチェック
// 辞書チェックは行わず、空でなければOK（完全自由モード）
function checkIfMultipleWords(text, currentMode, vocabulary, words) {
    const normalizedText = text.toLowerCase().trim();
    
    // 空の文字列でなければOK
    if (!normalizedText) {
        return null;
    }
    
    return text;
}

