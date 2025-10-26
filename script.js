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

// 単語境界と単語文字のパターン定数
// アンダースコアは単語の一部ではなく境界文字として扱う
const BOUNDARY_CHARS = /[\s,;:.!?()\[\]{}"\'-_]/;
const WORD_CHARS = /[a-zA-Z0-9]/;
const SENTENCE_ENDINGS = ['.', '!', '?'];

// テキストフォーマット用の正規表現
const QUOTE_PATTERN = /"([^"]*)"/g;
const ITALIC_PATTERN = /_([^_]*?[,.!?])/g;

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
    const wordToMatch = vocabEntry.original;
    
    // テキストから候補を抽出
    let endPos = startPos;
    let extractedText = '';
    let wordIndex = 0;
    
    // 辞書の単語を1文字ずつマッチング
    while (wordIndex < wordToMatch.length && endPos < text.length) {
        const textChar = text[endPos];
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
        
        // 現在の文を保存して新しい文を開始するヘルパー
        const saveSentence = (sentences, sentence) => {
            if (sentence.trim()) {
                sentences.push(sentence.trim());
            }
        };
        
        // 引用符、改行、交互背景を処理するためにテキストを処理
        let sentences = [];
        let currentSentence = '';
        
        for (let i = 0; i < data.length; i++) {
            const char = data[i];
            const status = getContainerStatus(data, i);
            
            if (char === '"' && !status.inParentheses) {
                // 開き引用符 - 現在の文を保存して新しい文を開始
                if (!status.inAnyContainer) {
                    saveSentence(sentences, currentSentence);
                    currentSentence = char;
                } 
                // 閉じ引用符 - 現在の文に追加して保存
                else {
                    currentSentence += char;
                    saveSentence(sentences, currentSentence);
                    currentSentence = '';
                }
            } else if (char === '(') {
                // 開き括弧 - 現在の文を保存して新しい文を開始
                saveSentence(sentences, currentSentence);
                currentSentence = char;
            } else if (char === ')') {
                // 閉じ括弧 - 現在の文に追加して保存
                currentSentence += char;
                saveSentence(sentences, currentSentence);
                currentSentence = '';
            } else if (SENTENCE_ENDINGS.includes(char) && !status.inAnyContainer) {
                // 文の終わり - 保存
                currentSentence += char;
                saveSentence(sentences, currentSentence);
                currentSentence = '';
            } else if (char !== '\n' && char !== '\r') {
                // 現在の文に文字を追加（改行はスキップ）
                currentSentence += char;
            }
        }
        
        // 交互背景でHTMLを作成
        const contentDiv = document.getElementById('content');
        contentDiv.innerHTML = '';
        
        // 辞書を前処理：正規化されたマップを作成し長さでソート
        const vocabEntries = Object.keys(vocabulary).map(word => ({
            original: word,
            normalized: word.toLowerCase(),
            meaning: vocabulary[word],
            length: word.length
        })).sort((a, b) => b.length - a.length);
        
        // 文中の辞書マッチを検索する関数
        const findMatches = (text) => {
            const markedPositions = new Set();
            const matches = [];
            
            const hasOverlap = (start, end) => {
                for (let j = start; j < end; j++) {
                    if (markedPositions.has(j)) return true;
                }
                return false;
            };
            
            const markRange = (start, end) => {
                for (let j = start; j < end; j++) {
                    markedPositions.add(j);
                }
            };
            
            for (let i = 0; i < text.length; i++) {
                if (markedPositions.has(i) || isInsideHtmlTag(text, i) || !isAtWordBoundary(text, i)) {
                    continue;
                }
                
                for (const vocabEntry of vocabEntries) {
                    const matchResult = tryMatchAtPosition(text, i, vocabEntry);
                    
                    if (matchResult && !hasOverlap(matchResult.start, matchResult.end)) {
                        markRange(matchResult.start, matchResult.end);
                        matches.push(matchResult);
                        break;
                    }
                }
            }
            
            return matches;
        };
        
        // マッチをテキストに適用する関数
        const applyMatches = (text, matches) => {
            matches.sort((a, b) => b.start - a.start);
            matches.forEach(match => {
                const matched = text.substring(match.start, match.end);
                const wordClass = matched.includes(' ') ? 'word multi-word' : 'word';
                const replacement = `<span class="${wordClass}" data-meaning="${match.meaning}">${matched}</span>`;
                
                text = text.substring(0, match.start) + replacement + text.substring(match.end);
            });
            return text;
        };
        
        // 各文を処理
        sentences.forEach((sentence, index) => {
            const div = document.createElement('div');
            div.className = 'sentence ' + (index % 2 === 0 ? 'bg-light' : 'bg-dark');
            
            // テキストフォーマットを適用
            let processedSentence = sentence
                .replace(QUOTE_PATTERN, '<span class="quote">"$1"</span>')
                .replace(ITALIC_PATTERN, '<span class="italic-text">_$1</span>');
            
            // 辞書マッチを検索して適用
            const matches = findMatches(processedSentence);
            processedSentence = applyMatches(processedSentence, matches);
            
            div.innerHTML = processedSentence;
            contentDiv.appendChild(div);
        });

        // 辞書単語にクリックイベントリスナーを追加
        document.querySelectorAll('.word').forEach(wordElement => {
            wordElement.addEventListener('click', function(e) {
                e.preventDefault();
                const meaning = this.getAttribute('data-meaning');
                showTranslation(this, meaning);
            });
        });
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

