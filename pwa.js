// PWA用のService Worker登録スクリプト

// Service Workerの登録
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' })
      .then(registration => {
        console.log('Service Worker registered successfully:', registration.scope);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

// インストールプロンプトの処理
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // デフォルトのインストールプロンプトを防ぐ
  e.preventDefault();
  // 後で使えるようにイベントを保存
  deferredPrompt = e;
  console.log('PWA install prompt ready');
  
  // カスタムインストールボタンを表示する場合はここで処理
  // 今回は自動的にブラウザのプロンプトに任せます
});

window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  deferredPrompt = null;
});

// オフライン/オンライン状態の監視
window.addEventListener('online', () => {
  console.log('Back online');
});

window.addEventListener('offline', () => {
  console.log('Connection lost');
});

