// content.js

// プロンプト送信をカウントする関数
function incrementPromptCount() {
    chrome.runtime.sendMessage({ type: 'incrementPromptCount' }, (response) => {
      if (response && response.success) {
        console.log(`プロンプトカウントが更新されました: ${response.count}`);
      }
    });
  }
  
  // 監視対象の親要素を特定
  const chatContainer = document.querySelector('main'); // <main>タグを使用
  
  if (chatContainer) {
    // MutationObserverの設定
    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // ユーザーメッセージ要素の特定条件
              if (
                node.matches('article[data-testid^="conversation-turn-"][data-scroll-anchor="false"]')
              ) {
                console.log('ユーザーメッセージが検出されました。');
                incrementPromptCount();
              }
            }
          });
        }
      }
    });
  
    // 監視の開始
    observer.observe(chatContainer, { childList: true, subtree: true });
  } else {
    console.error('チャットコンテナが見つかりません。セレクターを確認してください。');
  }
  