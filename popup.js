document.getElementById('extractCodes').addEventListener('click', () => {
  const button = document.getElementById('extractCodes');
  button.innerText = 'Copied!';
  setTimeout(() => {
    button.innerText = 'Copy Request IDs';
  }, 1000);

  chrome.runtime.sendMessage({ action: 'extractAndCopyCodes' });
});

document.getElementById('openBNLinks').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'openBNLinks' });
});

document.getElementById('openEachBatchNumber').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'openEachBatchNumber' });
});

// Listen for messages to update the popup with results
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'updatePopup') {
    chrome.storage.local.get('codes', (data) => {
      const resultDiv = document.getElementById('result');
      resultDiv.innerText = data.codes || 'No codes found';
      resultDiv.style.display = 'block'; // Show the result div
    });
  }
});
