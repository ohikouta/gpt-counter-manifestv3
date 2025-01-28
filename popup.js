// popup.js

document.addEventListener('DOMContentLoaded', () => {
  const resetCountButton = document.getElementById('resetCount');
  const countList = document.getElementById('countList');

  // カウントリストを更新する関数
  function updateCounts() {
    chrome.storage.local.get(['promptCount', 'modelLimits'], (result) => {
      const counts = result.promptCount || {};
      const modelLimits = result.modelLimits || {};
      countList.innerHTML = ''; // 既存のリストをクリア

      for (const [model, data] of Object.entries(counts)) {
        const div = document.createElement('div');
        div.className = 'model-count';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'model-name';
        nameSpan.textContent = model;

        const countSpan = document.createElement('span');
        countSpan.textContent = data.count;

        const resetSpan = document.createElement('span');
        resetSpan.className = 'reset-info';
        const formattedDate = formatDate(new Date(data.lastReset));

        // モデルに応じたリセット情報を表示
        if (model === 'o1-mini') {
          resetSpan.textContent = ` (リセット日: ${formattedDate})`;
        } else if (model === 'o1') {
          const weekNumber = getWeekNumber(new Date(data.lastReset));
          resetSpan.textContent = ` (リセット週: 第${weekNumber}週)`;
        } else {
          resetSpan.textContent = ''; // 他のモデルには不要な場合
        }

        div.appendChild(nameSpan);
        div.appendChild(countSpan);
        div.appendChild(resetSpan);
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

// 日付を YYYY-MM-DD 形式にフォーマットする関数
function formatDate(date) {
  const year = date.getFullYear();
  const month = (`0${date.getMonth() + 1}`).slice(-2); // 月は0から始まるため+1
  const day = (`0${date.getDate()}`).slice(-2);
  return `${year}-${month}-${day}`;
}

// 年と週番号を取得する関数（週の始まりを日曜日とする）
function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000; // ミリ秒を日に変換
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
