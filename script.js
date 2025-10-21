document.addEventListener('DOMContentLoaded', () => {
    const textContainer = document.getElementById('text-container');
    const popup = document.getElementById('popup');
    let dictionary = {};

    // 1. 辞書データ(ejdict.json)と本文(text.txt)の両方を読み込む
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
        // 両方の読み込みが成功した後の処理
        dictionary = dictData;
        initializeText(textData); // 読み込んだ本文を渡して初期化
    })
    .catch(error => {
        // どちらかの読み込みに失敗した場合
        console.error('データの読み込みに失敗しました:', error);
        textContainer.textContent = 'データの読み込みに失敗しました。ページを再読み込みしてください。';
    });

    // 2. 英文を単語ごとに分割して<span>タグで囲む
    function initializeText(englishText) {
        // text.txt内の改行を<br>タグに変換して、HTMLで改行が反映されるようにする
        const formattedText = englishText.replace(/\n/g, '<br>');
        textContainer.innerHTML = ''; // コンテナを一度空にする

        // 単語とそれ以外の記号などを分ける正規表現
        const words = formattedText.split(/(\s+|<br>|[.,!?"“”:;()])/);

        words.forEach(word => {
            if (word === '<br>') {
                textContainer.appendChild(document.createElement('br'));
            } else if (word.trim() !== '') {
                // 空白でない単語のみ<span>で囲む
                const span = document.createElement('span');
                span.textContent = word;
                textContainer.appendChild(span);
            } else {
                // 空白や句読点はそのまま追加
                textContainer.appendChild(document.createTextNode(word));
            }
        });
    }

    // 3. 単語(<span>)がクリックされたときの処理
    textContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'SPAN') {
            const rawWord = event.target.textContent;
            const cleanWord = rawWord.toLowerCase().replace(/[^a-z]/g, '');

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
