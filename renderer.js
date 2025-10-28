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
            // 辞書のキーは既に正規化済み（小文字、ハイフン保持、スペース区切り）
            return {
                original: word,
                normalized: word.toLowerCase(),  // 念のため小文字化
                meaning: combinedDict[word],
                length: word.length  // 長さでソート
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
            if (markedPositions.has(i) || !isAtWordBoundary(text, i)) {
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
    
    // イタリック部分を検出して記録する関数
    const detectItalics = (text) => {
        const italicRanges = [];
        const regex = /_([^_]+)_/g;
        let match;
        
        while ((match = regex.exec(text)) !== null) {
            italicRanges.push({
                start: match.index,
                end: regex.lastIndex,
                content: match[1]  // アンダースコアを除いた内容
            });
        }
        
        return italicRanges;
    };
    
    // アンダースコアを除去する関数
    const removeUnderscores = (text) => {
        return text.replace(/_/g, '');
    };
    
    // イタリック位置を調整する関数（アンダースコア除去後の位置に変換）
    const adjustItalicPositions = (italicRanges) => {
        return italicRanges.map((range, index) => {
            // 各イタリック範囲の前にあるアンダースコアの数を計算
            const underscoresBeforeStart = index * 2;  // 前のイタリック範囲の_2つ分
            
            return {
                start: range.start - underscoresBeforeStart,  // 開始アンダースコア分を減算
                end: range.end - underscoresBeforeStart - 2,  // 開始+終了アンダースコア分を減算
                content: range.content
            };
        });
    };
    
    // マッチをテキストに適用する関数
    const applyMatches = (text, matches) => {
        matches.sort((a, b) => b.start - a.start);
        matches.forEach((match, index) => {
            const matched = text.substring(match.start, match.end);
            const multiWordClass = matched.includes(' ') ? 'multi-word' : '';
            
            // ユーザーラベルをチェック（ハイフン保持、他記号はスペース、連続スペース削除）
            const normalizedWord = matched
                .replace(/[^a-zA-Z\s-]/g, ' ')
                .replace(/\s+/g, ' ')
                .toLowerCase()
                .trim();
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
    
    // イタリック範囲をHTMLテキストに適用する関数（最適化版）
    const applyItalicsToHtml = (htmlText, italicRanges) => {
        if (italicRanges.length === 0) return htmlText;
        
        // 1回の走査で全てのイタリック範囲のHTML位置を計算
        const htmlPositions = [];
        let plainTextPos = 0;
        let htmlPos = 0;
        let rangeIndex = 0;
        
        // イタリック範囲を開始位置でソート
        const sortedRanges = [...italicRanges].sort((a, b) => a.start - b.start);
        
        // HTML全体を1回だけ走査
        while (htmlPos < htmlText.length && rangeIndex < sortedRanges.length) {
            // HTMLタグをスキップ
            if (htmlText[htmlPos] === '<') {
                const tagEnd = htmlText.indexOf('>', htmlPos);
                if (tagEnd !== -1) {
                    htmlPos = tagEnd + 1;
                    continue;
                }
            }
            
            const currentRange = sortedRanges[rangeIndex];
            
            // 開始位置を記録
            if (plainTextPos === currentRange.start) {
                if (!htmlPositions[rangeIndex]) {
                    htmlPositions[rangeIndex] = {};
                }
                htmlPositions[rangeIndex].start = htmlPos;
            }
            
            // 終了位置を記録
            if (plainTextPos === currentRange.end) {
                if (!htmlPositions[rangeIndex]) {
                    htmlPositions[rangeIndex] = {};
                }
                htmlPositions[rangeIndex].end = htmlPos;
                rangeIndex++; // 次のイタリック範囲へ
            }
            
            htmlPos++;
            plainTextPos++;
        }
        
        // 見つからなかった終了位置を補完
        for (let i = 0; i < htmlPositions.length; i++) {
            if (htmlPositions[i] && !htmlPositions[i].end) {
                htmlPositions[i].end = htmlText.length;
            }
        }
        
        // 後ろから前へイタリックタグを挿入（位置がずれないように）
        let result = htmlText;
        for (let i = htmlPositions.length - 1; i >= 0; i--) {
            const pos = htmlPositions[i];
            if (pos && pos.start !== undefined) {
                result = result.substring(0, pos.start) + 
                        '<em>' + 
                        result.substring(pos.start, pos.end) + 
                        '</em>' + 
                        result.substring(pos.end);
            }
        }
        
        return result;
    };
    
    // 各文を処理
    sentences.forEach((sentence, index) => {
        const div = document.createElement('div');
        div.className = 'sentence ' + (index % 2 === 0 ? 'bg-light' : 'bg-dark');
        
        // 1. イタリック部分を検出して記録
        const italicRanges = detectItalics(sentence);
        
        // 2. アンダースコアを除去
        const textWithoutUnderscores = removeUnderscores(sentence);
        
        // 3. イタリック位置を調整（アンダースコア除去後の位置に）
        const adjustedItalicRanges = adjustItalicPositions(italicRanges);
        
        // 4. 辞書マッチを検索（アンダースコアなしのテキストで実行）
        const matches = findMatches(textWithoutUnderscores);
        
        // 5. マッチをテキストに適用
        let processedSentence = applyMatches(textWithoutUnderscores, matches);
        
        // 6. イタリックを最後に適用
        processedSentence = applyItalicsToHtml(processedSentence, adjustedItalicRanges);
        
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
function reloadContent(vocabulary, words, currentMode, userLabels = {}, callback = null) {
    fetch('data.json')
        .then(response => response.json())
        .then(jsonData => {
            const data = jsonData.text;
            renderContent(data, vocabulary, words, currentMode, userLabels);
            
            // レンダリング完了後にコールバックを実行
            if (callback && typeof callback === 'function') {
                // DOMが更新されるまで少し待つ
                setTimeout(callback, 50);
            }
        })
        .catch(error => {
            document.getElementById('content').innerHTML = 'Error loading JSON file: ' + error.message;
        });
}

