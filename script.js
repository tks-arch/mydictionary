<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Text Reader</title>
    <style>
        body {
            font-family: sans-serif;
            line-height: 1.8;
        }
        #text-container {
            padding: 1em;
            border: 1px solid #ccc;
            border-radius: 4px;
            /* CJK以外の言語で、単語の途中での改行を防ぎます */
            word-break: keep-all;
            /* overflow-wrapと合わせて、コンテナ幅を超える場合やwbrタグの位置で改行させます */
            overflow-wrap: break-word;
        }
        #text-container span:hover {
            background-color: #e0e0e0;
            cursor: pointer;
        }
        #translation-panel {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            max-width: 600px;
            padding: 1em;
            background-color: #333;
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            transition: opacity 0.3s, visibility 0.3s;
        }
        #translation-panel.hidden {
            opacity: 0;
            visibility: hidden;
        }
    </style>
</head>
<body>

    <div id="text-container"></div>
    <div id="translation-panel" class="hidden"></div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const textContainer = document.getElementById('text-container');
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

            /**
             * テキストを単語や熟語に分割し、コンテナに表示します。
             * 指定された記号の後、およびテキストがコンテナの幅を超える場合にのみ改行するように調整します。
             * @param {string} text 表示するテキスト
             */
            function initializeText(text) {
                textContainer.innerHTML = ''; // コンテナをクリア
                const dictKeys = Object.keys(dictionary);
                const idioms = dictKeys.filter(key => key.includes(' '));
                idioms.sort((a, b) => b.length - a.length);

                let currentIndex = 0;
                while (currentIndex < text.length) {
                    let foundMatch = false;

                    // 1. 熟語を優先的にマッチング（大文字・小文字を区別しない）
                    for (const idiom of idioms) {
                        if (text.substring(currentIndex).toLowerCase().startsWith(idiom)) {
                            // 表示は元のテキストの大文字・小文字を維持
                            const originalIdiom = text.substring(currentIndex, currentIndex + idiom.length);
                            const span = document.createElement('span');
                            span.textContent = originalIdiom;
                            textContainer.appendChild(span);
                            currentIndex += idiom.length;
                            foundMatch = true;
                            break;
                        }
                    }

                    // 2. 熟語にマッチしない場合、単語、記号、空白を処理
                    if (!foundMatch) {
                        let nextSpace = text.indexOf(' ', currentIndex);
                        let nextNewline = text.indexOf('\n', currentIndex);
                        if (nextSpace === -1) nextSpace = text.length;
                        if (nextNewline === -1) nextNewline = text.length;

                        const endOfChunk = Math.min(nextSpace, nextNewline, text.length);

                        if (endOfChunk > currentIndex) {
                            const chunk = text.substring(currentIndex, endOfChunk);
                            // チャンクを単語と連続した記号に分割
                            const parts = chunk.match(/\w+|[^\w\s]+/g) || [chunk];

                            parts.forEach(part => {
                                if (/\w/.test(part)) { // 単語の場合
                                    const span = document.createElement('span');
                                    span.textContent = part;
                                    textContainer.appendChild(span);
                                } else { // 記号の場合
                                    textContainer.appendChild(document.createTextNode(part));
                                    // partの末尾が指定記号なら、改行の機会(<wbr>)を挿入
                                    const lastChar = part.slice(-1);
                                    if (/[.,";]/.test(lastChar)) {
                                        textContainer.appendChild(document.createElement('wbr'));
                                    }
                                }
                            });
                            currentIndex = endOfChunk;
                        } else { // 空白または改行文字を処理
                            const char = text[currentIndex];
                            if (char === '\n') {
                                textContainer.appendChild(document.createElement('br'));
                            } else {
                                textContainer.appendChild(document.createTextNode(char));
                            }
                            currentIndex++;
                        }
                    }
                }
            }

            // 単語クリック時と、コンテナ背景クリック時の処理
            textContainer.addEventListener('click', (event) => {
                const target = event.target;
                if (target.tagName === 'SPAN') {
                    const rawWord = target.textContent;
                    const cleanWord = rawWord.toLowerCase();
                    if (cleanWord && dictionary[cleanWord]) {
                        showPanel(dictionary[cleanWord]);
                    } else {
                        hidePanel();
                    }
                } else if (target.id === 'text-container') {
                    // SPAN以外のコンテナ自身がクリックされたらパネルを隠す
                    hidePanel();
                }
            });

            // パネル表示/非表示の関数
            function showPanel(text) {
                translationPanel.textContent = text;
                translationPanel.classList.remove('hidden');
            }

            function hidePanel() {
                translationPanel.classList.add('hidden');
            }
        });
    </script>
</body>
</html>
