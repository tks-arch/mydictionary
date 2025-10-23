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
            font-size: 1.2em; /* 文字を少し大きくして見やすくします */
        }
        #text-container {
            padding: 1em;
            border: 1px solid #ccc;
            border-radius: 4px;
            /* 単語の途中での改行を防ぎます */
            word-break: keep-all;
            /* コンテナ幅を超える場合やwbrタグの位置で改行させます */
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
             * テキストを単語、記号、空白に分割してコンテナに表示します。
             * @param {string} text 表示するテキスト
             */
            function initializeText(text) {
                textContainer.innerHTML = ''; // コンテナをクリア

                // テキストを「単語」「記号の連続」「空白の連続」に分割する正規表現
                const regex = /\w+|[^\s\w]+|\s+/g;
                const parts = text.match(regex) || [];

                parts.forEach(part => {
                    // Part 1: 単語かどうかを判定
                    if (/\w/.test(part)) {
                        const span = document.createElement('span');
                        span.textContent = part;
                        textContainer.appendChild(span);
                    } 
                    // Part 2: それ以外（記号または空白）
                    else {
                        // 記号または空白をそのままテキストとして追加
                        textContainer.appendChild(document.createTextNode(part));
                        
                        // 末尾の文字が指定の記号であれば、改行の機会<wbr>を挿入
                        const lastChar = part.slice(-1);
                        if (/[.,";]/.test(lastChar)) {
                            textContainer.appendChild(document.createElement('wbr'));
                        }
                    }
                });
            }

            // クリックイベントのリスナー（変更なし）
            textContainer.addEventListener('click', (event) => {
                const target = event.target;
                if (target.tagName === 'SPAN') {
                    const rawWord = target.textContent;
                    // 単語のみを小文字化して辞書を引く
                    const cleanWord = rawWord.toLowerCase().match(/\w+/g)?.[0];
                    if (cleanWord && dictionary[cleanWord]) {
                        showPanel(dictionary[cleanWord]);
                    } else {
                        hidePanel();
                    }
                } else if (target.id === 'text-container') {
                    hidePanel();
                }
            });

            // パネル表示/非表示の関数（変更なし）
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
