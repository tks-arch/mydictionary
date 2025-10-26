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

// ユーザーラベルデータを格納するグローバル変数
let userLabels = {};

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
    const normalizedWord = word.toLowerCase().trim();
    return userLabels[normalizedWord] || null;
}

// ユーザーラベルを設定する関数
function setUserLabel(word, label) {
    const normalizedWord = word.toLowerCase().trim();
    if (label && label.trim()) {
        userLabels[normalizedWord] = label.trim();
    } else {
        delete userLabels[normalizedWord];
    }
    saveUserLabels();
}

// JSONファイルを読み込んで内容を表示
loadUserLabels();

fetch('data.json')
    .then(response => response.json())
    .then(jsonData => {
        const data = jsonData.text;
        vocabulary = jsonData.vocab || {};
        words = jsonData.words || {};
        
        // レンダリング関数を呼び出し
        renderContent(data, vocabulary, words, isHardMode, userLabels);
    })
    .catch(error => {
        document.getElementById('content').innerHTML = 'Error loading JSON file: ' + error.message;
    });

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
        reloadContent(vocabulary, words, isHardMode, userLabels);
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
    
    // ユーザーラベルモーダルの設定
    setupUserLabelModal();
});

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
            reloadContent(vocabulary, words, isHardMode, userLabels);
        }
        hideModal();
    });
    
    // 削除ボタン
    btnDelete.addEventListener('click', function() {
        if (currentWord) {
            setUserLabel(currentWord, '');
            // レンダリングを更新
            reloadContent(vocabulary, words, isHardMode, userLabels);
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
    
    // 選択テキストが辞書の複数の単語を含むかチェック
    function checkIfMultipleWords(text) {
        const normalizedText = text.toLowerCase().trim();
        
        // 現在のモードに応じた辞書を取得
        const dict = isHardMode ? words : vocabulary;
        
        // 辞書の単語でマッチするものを探す
        let matchedWords = [];
        let currentPos = 0;
        
        while (currentPos < normalizedText.length) {
            let found = false;
            
            // 辞書の各単語をチェック（長い順にソート）
            const sortedWords = Object.keys(dict).sort((a, b) => b.length - a.length);
            
            for (const word of sortedWords) {
                const normalizedWord = word.toLowerCase();
                const remainingText = normalizedText.substring(currentPos);
                
                if (remainingText.startsWith(normalizedWord)) {
                    // 単語境界をチェック
                    const endPos = currentPos + normalizedWord.length;
                    const nextChar = normalizedText[endPos];
                    
                    if (!nextChar || /[\s,;:.!?()\[\]{}"\'-_]/.test(nextChar)) {
                        matchedWords.push(word);
                        currentPos = endPos;
                        // 空白をスキップ
                        while (currentPos < normalizedText.length && /\s/.test(normalizedText[currentPos])) {
                            currentPos++;
                        }
                        found = true;
                        break;
                    }
                }
            }
            
            if (!found) {
                // マッチしない文字があった場合は失敗
                return null;
            }
        }
        
        // 1つ以上の単語がマッチした場合は成功
        return matchedWords.length >= 1 ? text : null;
    }
    
    // 単語要素にイベントを追加する関数（グローバルに公開）
    window.attachUserLabelEvents = function() {
        // ユーザーラベルが付いた単語のみ右クリックで編集可能
        document.querySelectorAll('.word.has-user-label').forEach(wordElement => {
            wordElement.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                const word = this.getAttribute('data-word') || this.textContent.trim();
                showModal(word, this);
            });
        });
    };
    
    // コンテンツエリア全体での右クリック（選択テキスト用）
    const contentArea = document.getElementById('content');
    if (contentArea) {
        contentArea.addEventListener('contextmenu', function(e) {
            const selectedText = getSelectedText();
            if (selectedText) {
                // 段落をまたいでいるかチェック
                if (isSelectionCrossingParagraphs()) {
                    e.preventDefault();
                    alert('エラー: 段落をまたいだラベル付けはできません。\n1つの段落内でテキストを選択してください。');
                    return;
                }
                
                // 記号が含まれているかチェック
                if (containsSymbols(selectedText)) {
                    e.preventDefault();
                    alert('エラー: 記号が含まれています。\nアルファベットとスペースのみを選択してください。');
                    return;
                }
                
                // 選択テキストが辞書の単語を含むかチェック
                const validatedText = checkIfMultipleWords(selectedText);
                if (validatedText) {
                    e.preventDefault();
                    showModal(validatedText, null);
                }
            }
        });
    }
    
    // Shift+Sキーで選択テキストをユーザー辞書に保存
    document.addEventListener('keydown', function(e) {
        if (e.shiftKey && e.key === 'S') {
            const selectedText = getSelectedText();
            if (selectedText) {
                // 段落をまたいでいるかチェック
                if (isSelectionCrossingParagraphs()) {
                    e.preventDefault();
                    alert('エラー: 段落をまたいだラベル付けはできません。\n1つの段落内でテキストを選択してください。');
                    return;
                }
                
                // 記号が含まれているかチェック
                if (containsSymbols(selectedText)) {
                    e.preventDefault();
                    alert('エラー: 記号が含まれています。\nアルファベットとスペースのみを選択してください。');
                    return;
                }
                
                // 選択テキストが辞書の単語を含むかチェック
                const validatedText = checkIfMultipleWords(selectedText);
                if (validatedText) {
                    e.preventDefault();
                    showModal(validatedText, null);
                }
            }
        }
    });
}

