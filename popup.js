// popup.js

document.addEventListener('DOMContentLoaded', () => {
  const resetCountButton = document.getElementById('resetCount');
  const countList = document.getElementById('countList');

  // カウントリストを更新する関数
  function updateCounts() {
    chrome.storage.local.get(['promptCount'], (result) => {
      const counts = result.promptCount || {};
      countList.innerHTML = ''; // 既存のリストをクリア

      for (const [model, count] of Object.entries(counts)) {
        const div = document.createElement('div');
        div.className = 'model-count';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'model-name';
        nameSpan.textContent = model;

        const countSpan = document.createElement('span');
        countSpan.textContent = count;

        div.appendChild(nameSpan);
        div.appendChild(countSpan);
        countList.appendChild(div);
      }

      if (Object.keys(counts).length === 0) {
        countList.innerHTML = '<p>カウントがありません。</p>';
      }
    });
  }

  // カウントリセットボタンのクリックイベント
  resetCountButton.addEventListener('click', () => {
    chrome.storage.local.set({ promptCount: {} }, () => {
      updateCounts();
      console.log('全てのカウントをリセットしました。');
    });
  });

  // 初期カウントの表示
  updateCounts();
});
