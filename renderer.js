// レンダリング関連の関数を集めたモジュール
// ヘルパー関数はhelpers.jsで定義されています

// コンテンツをレンダリングする関数
function renderContent(data, vocabulary, words, currentMode, userLabels = {}) {
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
                
                // 次の文字が ; や , の場合、それらも現在の文に含める
                let nextIndex = i + 1;
                while (nextIndex < data.length) {
                    const nextChar = data[nextIndex];
                    if (nextChar === ';' || nextChar === ',') {
                        currentSentence += nextChar;
                        i = nextIndex; // インデックスを進める
                        nextIndex++;
                    } else {
                        break; // ; , 以外が来たら終了
                    }
                }
                
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
            
            // 次の文字が ; や , の場合、それらも現在の文に含める
            let nextIndex = i + 1;
            while (nextIndex < data.length) {
                const nextChar = data[nextIndex];
                if (nextChar === ';' || nextChar === ',') {
                    currentSentence += nextChar;
                    i = nextIndex; // インデックスを進める
                    nextIndex++;
                } else {
                    break; // ; , 以外が来たら終了
                }
            }
            
            saveSentence(sentences, currentSentence);
            currentSentence = '';
        } else if (SENTENCE_ENDINGS.includes(char) && !status.inAnyContainer) {
            // 文の終わり - 次の文字を確認
            currentSentence += char;
            
            // 次の文字が ; や , の場合、それらも現在の文に含める
            let nextIndex = i + 1;
            while (nextIndex < data.length) {
                const nextChar = data[nextIndex];
                if (nextChar === ';' || nextChar === ',') {
                    currentSentence += nextChar;
                    i = nextIndex; // インデックスを進める
                    nextIndex++;
                } else {
                    break; // ; , 以外が来たら終了
                }
            }
            
            saveSentence(sentences, currentSentence);
            currentSentence = '';
        } else {
            // 現在の文に文字を追加（改行も含めてすべて処理）
            currentSentence += char;
        }
    }
    
    // 交互背景でHTMLを作成
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '';
    
    // 使用する辞書を決定（モードに応じて切り替え）
    const getDictionary = () => {
        if (currentMode === 'easy') {
            return vocabulary;
        } else if (currentMode === 'normal') {
            return words;
        } else {
            // Hardモード: 空の辞書（ユーザーラベルのみ表示）
            return {};
        }
    };
    
    // 辞書を前処理：正規化されたマップを作成し長さでソート
    const getVocabEntries = () => {
        const dict = getDictionary();
        
        // ユーザーラベルを辞書に統合
        const combinedDict = { ...dict };
        Object.keys(userLabels).forEach(normalizedKey => {
            const userLabelEntry = userLabels[normalizedKey];
            // ユーザーラベルのoriginalをキーとして追加
            combinedDict[userLabelEntry.original] = userLabelEntry.label;
        });
        
        return Object.keys(combinedDict).map(word => {
            // 記号とスペースを削除して正規化（アルファベットのみ）
            const normalizedWord = word.replace(/[^a-zA-Z]/g, '');
            return {
                original: word,
                normalized: normalizedWord.toLowerCase(),
                meaning: combinedDict[word],
                length: normalizedWord.length  // 正規化後の長さでソート
            };
        }).sort((a, b) => b.length - a.length);
    };
    
    // 文中の辞書マッチを検索する関数
    const findMatches = (text) => {
        const vocabEntries = getVocabEntries();
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
        matches.forEach((match, index) => {
            const matched = text.substring(match.start, match.end);
            const multiWordClass = matched.includes(' ') ? 'multi-word' : '';
            
            // ユーザーラベルをチェック（記号とスペースを削除して正規化）
            const normalizedWord = matched.replace(/[^a-zA-Z]/g, '').toLowerCase();
            const userLabelEntry = userLabels[normalizedWord];
            
            // ユーザーラベルがある場合は緑色、ない場合は青色
            let wordClass;
            if (userLabelEntry) {
                // ユーザーラベルがある場合：緑色ハイライト
                wordClass = `word ${multiWordClass} has-user-label`.trim();
            } else {
                // ユーザーラベルがない場合：青色ハイライト
                wordClass = `word ${multiWordClass}`.trim();
            }
            
            const replacement = `<span class="${wordClass}" data-meaning="${match.meaning}" data-word="${matched}">${matched}</span>`;
            
            text = text.substring(0, match.start) + replacement + text.substring(match.end);
        });
        return text;
    };
    
    // 各文を処理
    sentences.forEach((sentence, index) => {
        const div = document.createElement('div');
        div.className = 'sentence ' + (index % 2 === 0 ? 'bg-light' : 'bg-dark');
        
        // テキストフォーマットを適用
        let processedSentence = sentence;
        
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
    
    // ユーザーラベルイベントを追加
    if (window.attachUserLabelEvents) {
        window.attachUserLabelEvents();
    }
}

// コンテンツを再レンダリングする関数
function reloadContent(vocabulary, words, currentMode, userLabels = {}) {
    fetch('data.json')
        .then(response => response.json())
        .then(jsonData => {
            const data = jsonData.text;
            renderContent(data, vocabulary, words, currentMode, userLabels);
        })
        .catch(error => {
            document.getElementById('content').innerHTML = 'Error loading JSON file: ' + error.message;
        });
}

