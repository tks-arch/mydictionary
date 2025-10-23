            // --- ここからがJavaScriptの本体です ---

            // 2つのファイル（辞書とテキスト）を同時に非同期で読み込む
            Promise.all([
                // './' は「このHTMLファイルと同じ階層」を明示的に示す
                fetch('./ejdict.json').then(response => {
                    if (!response.ok) throw new Error('ejdict.jsonの読み込みに失敗しました');
                    return response.json();
                }),
                fetch('./text.txt').then(response => {
                    if (!response.ok) throw new Error('text.txtの読み込みに失敗しました');
                    return response.text();
                })
            ])
            .then(([dictData, textData]) => {
                // 両方のファイルの読み込みが成功したら実行される
                dictionary = dictData;
                initializeText(textData);
            })
            .catch(error => {
                // どちらかのファイル読み込みに失敗したらエラーを表示
                console.error('データの読み込みに失敗しました:', error);
                textContainer.textContent = 'データの読み込みに失敗しました。ファイル名やパスが正しいか確認してください。';
            });

            function initializeText(text) {
                textContainer.innerHTML = '';
                // 単語、句読点、スペースに分割するための正規表現
                const regex = /\w+|[^\s\w]+|\s+/g;
                const parts = text.match(regex) || [];

                parts.forEach(part => {
                    if (/\w/.test(part)) { // partが単語の場合
                        const span = document.createElement('span');
                        span.textContent = part;
                        textContainer.appendChild(span);
                    } else { // スペースや句読点の場合
                        textContainer.appendChild(document.createTextNode(part));
                    }
                });
            }

            textContainer.addEventListener('click', (event) => {
                const target = event.target;
                if (target.tagName === 'SPAN') { // クリックされたのが単語(<span>)の場合
                    const cleanWord = target.textContent.toLowerCase();
                    if (dictionary[cleanWord]) {
                        showPanel(dictionary[cleanWord]);
                    } else {
                        hidePanel();
                    }
                } else { // 単語以外の背景部分などをクリックした場合
                    hidePanel();
                }
            });

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
