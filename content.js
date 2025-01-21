
// プロンプト送信をカウントする関数
function incrementPromptCount(model) {
  chrome.runtime.sendMessage({ type: 'incrementPromptCount', model:model }, (response) => {
    if (response && response.success) {
      console.log(`モデル "${response.model}" のプロンプトカウントが更新されました: ${response.count}`);
    }
  });
}


// モデル名を取得する関数
function getCurrentModel() {
  const modelButton = document.querySelector('[data-testid="model-switcher-dropdown-button"]');
  console.log('getCurrentModel: modelButton:', modelButton);
  
  if (modelButton) {
    const modelDiv = modelButton.querySelector('.text-token-text-secondary');
    console.log('getCurrentModel: modelDiv:', modelDiv);
    
    if (modelDiv) {
      let rawText = modelDiv.textContent;
      console.log('getCurrentModel: rawText before cleanup:', rawText);
      
      // 不要なプレフィックスと引用符を除去（必要に応じて）
      rawText = rawText.replace(/==\s*\$0\s*/, '').replace(/"/g, '').trim();
      console.log('getCurrentModel: rawText after removing prefix and quotes:', rawText);
      
      // 修正後の正規表現を使用
      const modelMatch = rawText.match(/^"?(\w+)"?\s+([\w-]+)$/);
      console.log('getCurrentModel: modelMatch:', modelMatch);
      
      if (modelMatch) {
        const modelName = modelMatch[1].trim(); // 'ChatGPT'
        const modelVersion = modelMatch[2].trim(); // '4o' や '4ga'
        const fullModelName = `${modelName} ${modelVersion}`;
        console.log('getCurrentModel: fullModelName:', fullModelName);
        return fullModelName;
      } else {
        console.warn('getCurrentModel: モデル名の正規表現マッチに失敗しました。');
      }
    } else {
      console.warn('getCurrentModel: modelDiv が見つかりませんでした。');
    }
  } else {
    console.warn('getCurrentModel: modelButton が見つかりませんでした。');
  }
  
  return 'Unknown Model';
}


// 監視対象の親要素を特定
const chatContainer = document.querySelector('main'); // <main>タグを使用

if (chatContainer) {
  console.log('MutationObserverを初期化します。');

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
              const currentModel = getCurrentModel();
              incrementPromptCount(currentModel);
            }
          }
        });
      }
    }
  });

  // 監視の開始
  observer.observe(chatContainer, { childList: true, subtree: true });
  console.log('MutationObserverが開始されました。');
} else {
  console.error('チャットコンテナが見つかりません。セレクターを確認してください。');
}
  