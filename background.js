// background.js

// カウントを初期化または取得
chrome.storage.local.get(['promptCount'], (result) => {
    if (result.promptCount === undefined) {
      chrome.storage.local.set({ promptCount: 0 }, () => {
        console.log('初期プロンプトカウントを0に設定しました。');
      });
    }
  });
  
  // メッセージをリッスン
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'incrementPromptCount') {
      chrome.storage.local.get(['promptCount'], (result) => {
        let count = result.promptCount || 0;
        count += 1;
        chrome.storage.local.set({ promptCount: count }, () => {
          console.log(`プロンプトが送信されました。現在のカウント: ${count}`);
          sendResponse({ success: true, count: count });
        });
      });
      // 非同期で応答するためにtrueを返す
      return true;
    }
  });
  