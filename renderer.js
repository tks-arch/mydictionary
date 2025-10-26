// レンダリング関連の関数を集めたモジュール

// コンテンツをレンダリングする関数
function renderContent(data, vocabulary, words, isHardMode) {
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
    
    // 使用する辞書を決定（モードに応じて切り替え）
    const getDictionary = () => {
        return isHardMode ? words : vocabulary;
    };
    
    // 辞書を前処理：正規化されたマップを作成し長さでソート
    const getVocabEntries = () => {
        const dict = getDictionary();
        return Object.keys(dict).map(word => ({
            original: word,
            normalized: word.toLowerCase(),
            meaning: dict[word],
            length: word.length
        })).sort((a, b) => b.length - a.length);
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
            const colorClass = (index % 2 === 0) ? 'color-1' : 'color-2';
            const multiWordClass = matched.includes(' ') ? 'multi-word' : '';
            const wordClass = `word ${colorClass} ${multiWordClass}`.trim();
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
            .replace(QUOTE_PATTERN, '<span class="quote">"$1"</span>');
        
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
}

// コンテンツを再レンダリングする関数
function reloadContent(vocabulary, words, isHardMode) {
    fetch('data.json')
        .then(response => response.json())
        .then(jsonData => {
            const data = jsonData.text;
            renderContent(data, vocabulary, words, isHardMode);
        })
        .catch(error => {
            document.getElementById('content').innerHTML = 'Error loading JSON file: ' + error.message;
        });
}

