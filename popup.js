document.addEventListener('DOMContentLoaded', () => {
  const resetCountButton = document.getElementById('resetCount');
  const countList = document.getElementById('countList');

  // ========================
  // 週の開始日・終了日を取得する関数 (日曜始まり)
  // ========================
  function getWeekRange(date) {
    // 同一日付オブジェクトを複製し、時刻を 0:00:00 にする
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    // start の曜日を取得 (日曜=0, 月曜=1, ...)
    const dayOfWeek = start.getDay();

    // 週の開始日（日曜日）を求める
    // たとえば月曜(1)なら、1日戻せば日曜になる
    start.setDate(start.getDate() - dayOfWeek);

    // 週の終了日は開始日から 6 日後 (土曜日)
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    return [start, end];
  }

  // ========================
  // カウントリストを更新する関数
  // ========================
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

        // リセット日が保存されていない場合を考慮
        if (!data.lastReset) {
          resetSpan.textContent = '';
        } else {
          const resetDate = new Date(data.lastReset);
          const formattedDate = formatDate(resetDate);

          // モデル別にリセット間隔を判定して表示を分ける
          if (model === 'o1' || model === 'o3-mini-high') {
            // 週単位リセットのモデルは「週の開始日～終了日」を表示
            const [weekStart, weekEnd] = getWeekRange(resetDate);
            resetSpan.textContent =
              ` (カウント期間: ${formatDate(weekStart)} ~ ${formatDate(weekEnd)})`;
          } else if (model === 'o3-mini') {
            // 日単位リセットの場合、単純にリセット日を表示
            resetSpan.textContent = ` (カウント日: ${formattedDate})`;
          } else {
            // 4oなど無制限のモデルは特に表示しない
            resetSpan.textContent = '';
          }
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

  // ========================
  // カウントリセットボタンのクリックイベント
  // ========================
  resetCountButton.addEventListener('click', () => {
    chrome.storage.local.set({ promptCount: {} }, () => {
      updateCounts();
      console.log('全てのカウントをリセットしました。');
    });
  });

  // 初期カウントの表示
  updateCounts();
});

// ========================
// 日付を YYYY-MM-DD 形式にフォーマットする関数
// ========================
function formatDate(date) {
  const year = date.getFullYear();
  const month = (`0${date.getMonth() + 1}`).slice(-2); // 月は0から始まるため+1
  const day = (`0${date.getDate()}`).slice(-2);
  return `${year}-${month}-${day}`;
}
