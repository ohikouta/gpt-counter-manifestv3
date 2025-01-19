// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const sendPromptButton = document.getElementById('sendPrompt');
    const countDisplay = document.getElementById('count');
  
    // ボタンがクリックされたときにカウントを増やす
    sendPromptButton.addEventListener('click', () => {
      // 実際のChatGPTへのプロンプト送信ロジックをここに追加できます。
      // ここでは単純にカウントを増やすアクションをシミュレートします。
  
      chrome.runtime.sendMessage({ type: 'incrementPromptCount' }, (response) => {
        if (response && response.success) {
          countDisplay.textContent = `現在のカウント: ${response.count}`;
        } else {
          console.error('カウントの更新に失敗しました。');
        }
      });
    });
  
    // 初期カウントの表示
    chrome.storage.local.get(['promptCount'], (result) => {
      const count = result.promptCount || 0;
      countDisplay.textContent = `現在のカウント: ${count}`;
    });
  });
  