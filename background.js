// background.js

// カウントを初期化または取得
chrome.storage.local.get(['promptCount'], (result) => {
    if (result.promptCount === undefined) {
      chrome.storage.local.set({ promptCount: {} }, () => {
        console.log('初期プロンプトカウントを0に設定しました。');
      });
    }
});
  
// メッセージをリッスン
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'incrementPromptCount') {
    const { model }  = message;
    chrome.storage.local.get(['promptCount'], (result) => {
      let counts = result.promptCount || {};
      counts[model] = (counts[model] || 0) + 1;
      chrome.storage.local.set({ promptCount: counts }, () => {
        console.log(`モデル "${model}" のプロンプトが送信されました: ${counts[model]}`);
        sendResponse({ success: true, count: counts[model], model: model });
      });
    });
    // 非同期で応答するためにtrueを返す
    return true;
  }
});
  