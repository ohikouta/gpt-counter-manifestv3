// background.js

// 初期化時にカウントと登録済みモデルを設定
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['promptCount', 'registeredModels', 'modelLimits'], (result) => {
    const defaultModels = ['4o', 'o1', 'o3-mini', 'o3-mini-high'];
    const defaultLimits = {
      '4o': null,        // 無制限
      'o1': 50,           // 1週あたり
      'o3-mini': 150,     // 1日あたり
      'o3-mini-high': 50,     // 1週あたり
    };

    const defaultResetIntervals = {
      '4o': null,
      'o1': 'week',
      'o3-mini': 'day',
      'o3-mini-high': 'week',
    }

    // promptCount の初期化
    if (result.promptCount === undefined) {
      const initialPromptCount = {};
      defaultModels.forEach(model => {
        initialPromptCount[model] = {
          count: 0,
          lastReset: null
        };
      });
      chrome.storage.local.set({ promptCount: initialPromptCount }, () => {
        console.log('初期プロンプトカウントを設定しました。');
      });
    }

    // registeredModels の初期化
    if (result.registeredModels === undefined) {
      chrome.storage.local.set({ registeredModels: defaultModels }, () => {
        console.log('初期登録モデルを設定しました。');
      });
    }

    // modelLimits の初期化
    if (result.modelLimits === undefined) {
      chrome.storage.local.set({ modelLimits: defaultLimits }, () => {
        console.log('モデル別のカウント上限を設定しました。');
      });
    }
  });
});

// メッセージをリッスン
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'incrementPromptCount') {
    const { model } = message;
    console.log(`Received 'incrementPromptCount' for model: ${model}`);

    (async () => {
      try {
        // プロンプトカウント、上限、リセット間隔の取得
        const [countResult, limitsResult, resetIntervalsResult] = await Promise.all([
          new Promise((resolve, reject) => {
            chrome.storage.local.get(['promptCount'], (res) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(res.promptCount || {});
              }
            });
          }),
          new Promise((resolve, reject) => {
            chrome.storage.local.get(['modelLimits'], (res) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(res.modelLimits || {});
              }
            });
          }),
          new Promise((resolve, reject) => {
            chrome.storage.local.get(['modelResetIntervals'], (res) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(res.modelResetIntervals || {});
              }
            });
          })
        ]);

        const modelLimit = limitsResult[model];
        const resetInterval = resetIntervalsResult[model];

        if (modelLimit === undefined || resetInterval === undefined) {
          throw new Error(`モデル "${model}" の設定が正しくされていません。`);
        }

        const currentTime = new Date();
        const modelData = countResult[model] || { count: 0, lastReset: null };

        // リセットが必要かをチェック（resetInterval が null の場合はリセット不要）
        if (resetInterval !== null && needsReset(modelData.lastReset, resetInterval)) {
          modelData.count = 0;
          modelData.lastReset = currentTime.toISOString();
          console.log(`モデル "${model}" のカウントをリセットしました。`);
        }

        // 上限に達しているかをチェック（null の場合は無制限）
        if (modelLimit !== null && modelData.count >= modelLimit) {
          console.warn(`モデル "${model}" のプロンプト上限に達しました。`);
          sendResponse({ success: false, message: 'プロンプト上限に達しました。' });
          return;
        }

        // カウントを増加
        modelData.count += 1;
        countResult[model] = modelData;

        // カウントの保存
        await new Promise((resolve, reject) => {
          chrome.storage.local.set({ promptCount: countResult }, () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        });

        console.log(`モデル "${model}" のプロンプトが送信されました: ${modelData.count}`);
        sendResponse({ success: true, count: modelData.count, model: model });
      } catch (error) {
        console.error(`Error incrementing prompt count for model "${model}":`, error);
        sendResponse({ success: false, message: 'カウントの増加中にエラーが発生しました。' });
      }
    })();

    // 非同期で応答するために true を返す
    return true;
  }
});


// 日付が同じ日かをチェック
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

// 日付が同じ週かをチェック（週の始まりを日曜日とする）
function isSameWeek(date1, date2) {
  const startOfWeek = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay(); // 0 (Sunday) to 6 (Saturday)
    d.setDate(d.getDate() - day);
    return d;
  };

  const week1 = startOfWeek(date1);
  const week2 = startOfWeek(date2);

  return week1.getTime() === week2.getTime();
}

// 汎用的なリセット判定関数
function needsReset(lastResetISO, intervalType) {
  if (!lastResetISO || !intervalType) return true;
  const lastResetDate = new Date(lastResetISO);
  const currentTime = new Date();

  if (intervalType === 'day') {
    return !isSameDay(currentTime, lastResetDate);
  } else if (intervalType === 'week') {
    return !isSameWeek(currentTime, lastResetDate);
  }
  return false;
}