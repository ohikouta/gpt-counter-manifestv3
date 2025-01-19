// options.js

document.addEventListener('DOMContentLoaded', () => {
    const newModelInput = document.getElementById('new-model');
    const addModelButton = document.getElementById('add-model');
    const modelList = document.getElementById('model-list');
    
    // モデルリストの表示
    loadModels();
  
    addModelButton.addEventListener('click', () => {
      const modelName = newModelInput.value.trim();
      if (modelName) {
        chrome.storage.local.get("registeredModels", (data) => {
          let models = data.registeredModels || [];
          if (!models.includes(modelName)) {
            models.push(modelName);
            chrome.storage.local.set({ registeredModels: models }, () => {
              newModelInput.value = '';
              loadModels();
            });
          }
        });
      }
    });
  
    function loadModels() {
      chrome.storage.local.get("registeredModels", (data) => {
        const models = data.registeredModels || [];
        modelList.innerHTML = '';
        models.forEach(model => {
          const li = document.createElement('li');
          li.textContent = model;
          
          // 削除ボタンを追加
          const removeBtn = document.createElement('button');
          removeBtn.textContent = '削除';
          removeBtn.className = 'remove';
          removeBtn.addEventListener('click', () => {
            removeModel(model);
          });
          
          li.appendChild(removeBtn);
          modelList.appendChild(li);
        });
      });
    }
  
    function removeModel(model) {
      chrome.storage.local.get("registeredModels", (data) => {
        let models = data.registeredModels || [];
        models = models.filter(m => m !== model);
        chrome.storage.local.set({ registeredModels: models }, () => {
          loadModels();
        });
      });
    }
  });
  