// プロンプト送信をカウントする関数
async function incrementPromptCount(model) {
  try {
    console.log(`Attempting to increment prompt count for model: ${model}`);
    const response = await chrome.runtime.sendMessage({ type: 'incrementPromptCount', model: model });
    
    if (response && response.success) {
      console.log(`モデル "${response.model}" のプロンプトカウントが更新されました: ${response.count}`);
    } else if (response && !response.success) {
      console.warn(`プロンプトカウントの更新に失敗しました: ${response.message}`);
      // 必要に応じてユーザーに通知する処理を追加
      alert(`プロンプトカウントの更新に失敗しました: ${response.message}`);
    } else {
      console.warn('予期しないレスポンスが返されました。');
    }
  } catch (error) {
    console.error(`メッセージ送信エラー: ${error}`);
    // 必要に応じてユーザーに通知する処理を追加
    alert(`メッセージ送信エラー: ${error}`);
  }
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
        // モデル名とバージョンを分割
        const modelName = modelMatch[1].trim(); // 'ChatGPT'
        const modelVersion = modelMatch[2].trim(); // '4o' 
        // バージョンのみを返す
        const modelIdentifier = `${modelVersion}`;
        console.log('getCurrentModel: modelIdentifier:', modelIdentifier);
        return modelIdentifier;
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

  const observer = new MutationObserver((mutationsList) => {
    try {
      console.log('MutationObserverが呼び出されました。');
      for (let mutation of mutationsList) {
        console.log('mutation.type:', mutation.type);
        console.log('mutation.addedNodes.length:', mutation.addedNodes.length);
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node, index) => {
            console.log(`追加されたノード[${index}]:`, node);
            if (node.nodeType === Node.ELEMENT_NODE) {
              // 2つのセレクタを組み合わせる
              if (node.matches('article[data-testid^="conversation-turn-"]')) {
                // 追加された article の子孫をチェックして
                const userDiv = node.querySelector('div[data-message-author-role="user"]');
                if (userDiv) {
                  console.log('ユーザーメッセージが検出されました。');
                  const currentModel = getCurrentModel();
                  if (currentModel !== 'Unknown Model') {
                    incrementPromptCount(currentModel);
                  } else {
                    console.warn('不明なモデルのため、カウントを増やしません。');
                  }
                } else {
                  // ここはAIの応答か、その他の要素
                  console.log('AI応答または別要素のため、カウントしません。');
                }
              }
            } else {
              console.log('ノードはELEMENT_NODEではありません。');
            }
          });
        }
      }
    } catch (error) {
      console.error(`MutationObserver エラー: ${error}`);
    }
  });

  // 監視の開始
  observer.observe(chatContainer, { childList: true, subtree: true });
  console.log('MutationObserverが開始されました。');
} else {
  console.error('チャットコンテナが見つかりません。セレクターを確認してください。');
}
