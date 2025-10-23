document.addEventListener('DOMContentLoaded', () => {
    const textContainer = document.getElementById('text-container');
    // IDの変更に合わせて変数名も変更
    const translationPanel = document.getElementById('translation-panel'); 
    let dictionary = {};

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

    // この関数は変更ありません
    function initializeText(text) {
        textContainer.innerHTML = ''; 
        const dictKeys = Object.keys(dictionary);
        const idioms = dictKeys.filter(key => key.includes(' '));
        idioms.sort((a, b) => b.length - a.length);

        let currentIndex = 0;
        while (currentIndex < text.length) {
            let foundMatch = false;
            for (const idiom of idioms) {
                if (text.substring(currentIndex).startsWith(idiom)) {
                    const span = document.createElement('span');
                    span.textContent = idiom;
                    textContainer.appendChild(span);
                    currentIndex += idiom.length;
                    foundMatch = true;
                    break; 
                }
            }
            if (!foundMatch) {
                let nextSpace = text.indexOf(' ', currentIndex);
                let nextNewline = text.indexOf('\n', currentIndex);
                if (nextSpace === -1) nextSpace = text.length;
                if (nextNewline === -1) nextNewline = text.length;
                const endOfChunk = Math.min(nextSpace, nextNewline, text.length);
                if (endOfChunk > currentIndex) {
                    const chunk = text.substring(currentIndex, endOfChunk);
                    const parts = chunk.match(/\w+|[^\w\s]/g) || [chunk];
                    parts.forEach(part => {
                        if (part.match(/\w/)) {
                            const span = document.createElement('span');
                            span.textContent = part;
                            textContainer.appendChild(span);
                        } else {
                            textContainer.appendChild(document.createTextNode(part));
                        }
                    });
                    currentIndex = endOfChunk;
                } else {
                    const char = text[currentIndex];
                    textContainer.appendChild(document.createTextNode(char));
                    currentIndex++;
                }
            }
        }
    }

    // 単語クリック時の処理 (呼び出す関数名を変更)
    textContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'SPAN') {
            const rawWord = event.target.textContent;
            const cleanWord = rawWord.toLowerCase();
            if (cleanWord && dictionary[cleanWord]) {
                const translation = dictionary[cleanWord];
                // 変更: showPanelを呼び出す
                showPanel(translation); 
            } else {
                // 変更: hidePanelを呼び出す
                hidePanel(); 
            }
        }
    });

    // ▼▼▼▼▼ パネル表示/非表示の関数 (シンプルに変更) ▼▼▼▼▼
    function showPanel(text) {
        translationPanel.textContent = text;
        translationPanel.classList.remove('hidden');
    }

    function hidePanel() {
        translationPanel.classList.add('hidden');
    }

    // パネルの外側(本文エリア)をクリックしたらパネルを隠す
    textContainer.addEventListener('click', (event) => {
        if (event.target.id === 'text-container') {
             hidePanel();
        }
    });
});
