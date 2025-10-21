document.addEventListener('DOMContentLoaded', () => {
    const textContainer = document.getElementById('text-container');
    const popup = document.getElementById('popup');
    let dictionary = {};

    // 1. 辞書データと本文の両方を読み込む
    Promise.all([
        fetch('ejdict.json').then(response => {
            if (!response.ok) throw new Error('ejdict.jsonの読み込みに失敗しました');
            return response.json();
        }),
        fetch('text.txt').then(response => {
            if (!response.ok) throw new Error('text.txtの読み込みに失敗しました');
            return response.text();
        })
    ])
    .then(([dictData, textData]) => {
        dictionary = dictData;
        initializeText(textData);
    })
    .catch(error => {
        console.error('データの読み込みに失敗しました:', error);
        textContainer.textContent = 'データの読み込みに失敗しました。ページを再読み込みしてください。';
    });

    /**
     * 新しい本文処理関数
     * 熟語を優先的にスキャンし、残りを単語として処理する
     */
    function initializeText(text) {
        textContainer.innerHTML = ''; // コンテナを初期化

        // 辞書のキー（単語・熟語）を取得
        const dictKeys = Object.keys(dictionary);

        // 熟語（スペースを含むキー）を抽出し、文字数が長い順にソートする
        const idioms = dictKeys.filter(key => key.includes(' '));
        idioms.sort((a, b) => b.length - a.length);

        let currentIndex = 0;
        while (currentIndex < text.length) {
            let foundMatch = false;

            // --- 1. 熟語のマッチングを試みる ---
            for (const idiom of idioms) {
                if (text.substring(currentIndex).startsWith(idiom)) {
                    // 熟語が見つかった
                    const span = document.createElement('span');
                    span.textContent = idiom;
                    textContainer.appendChild(span);

                    currentIndex += idiom.length;
                    foundMatch = true;
                    break; // 熟語が見つかったので、この位置の処理は終了
                }
            }

            // --- 2. 熟語が見つからなかった場合、単語または記号として処理 ---
            if (!foundMatch) {
                // 次のスペースまたは改行までの部分を「塊」として切り出す
                let nextSpace = text.indexOf(' ', currentIndex);
                let nextNewline = text.indexOf('\n', currentIndex);
                
                // 見つからない場合は末尾のインデックスを設定
                if (nextSpace === -1) nextSpace = text.length;
                if (nextNewline === -1) nextNewline = text.length;

                const endOfChunk = Math.min(nextSpace, nextNewline, text.length);
                
                if (endOfChunk > currentIndex) {
                    const chunk = text.substring(currentIndex, endOfChunk);
                    // 句読点を分離する
                    const parts = chunk.match(/\w+|[^\w\s]/g) || [chunk];

                    parts.forEach(part => {
                        if (part.match(/\w/)) { // 英数字が含まれる部分のみspanで囲む
                            const span = document.createElement('span');
                            span.textContent = part;
                            textContainer.appendChild(span);
                        } else { // 句読点など
                            textContainer.appendChild(document.createTextNode(part));
                        }
                    });

                    currentIndex = endOfChunk;

                } else { // スペースや改行文字自体の処理
                    const char = text[currentIndex];
                    textContainer.appendChild(document.createTextNode(char));
                    currentIndex++;
                }
            }
        }
    }

    // --- これ以降のイベントリスナー関連のコードは変更なし ---

    // 3. 単語(<span>)がクリックされたときの処理
    textContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'SPAN') {
            // クリックされた単語・熟語を整形する（小文字化）
            const rawWord = event.target.textContent;
            const cleanWord = rawWord.toLowerCase();

            if (cleanWord && dictionary[cleanWord]) {
                const translation = dictionary[cleanWord];
                showPopup(event, translation);
            } else {
                hidePopup();
            }
        }
    });

    // 4. ポップアップを表示する処理
    function showPopup(event, text) {
        popup.textContent = text;
        popup.classList.remove('hidden');
        popup.style.left = `${event.pageX}px`;
        popup.style.top = `${event.pageY + 15}px`;
    }

    // 5. ポップアップを隠す処理
    function hidePopup() {
        popup.classList.add('hidden');
    }

    // 画面のどこかをクリックしたらポップアップを隠す
    document.addEventListener('click', (event) => {
        if (!event.target.closest('#text-container span') && !event.target.closest('#popup')) {
            hidePopup();
        }
    });
});
