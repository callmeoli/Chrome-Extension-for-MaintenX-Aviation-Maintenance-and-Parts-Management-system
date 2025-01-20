chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractAndCopyCodes') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const tabId = tabs[0].id;
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: extractAndCopyCodes
        }).then((results) => {
          const codes = results[0].result;
          chrome.storage.local.set({ codes: codes }); // Store result in local storage
          chrome.runtime.sendMessage({ action: 'updatePopup' });
        }).catch(err => {
          console.error('Failed to execute script:', err);
        });
      } else {
        console.error('No active tab found.');
      }
    });
  }

  if (message.action === 'openBNLinks') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const tabId = tabs[0].id;
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: findAndOpenBNLinks
        }).then(() => {
          console.log('BN links processed');
        }).catch(err => {
          console.error('Failed to execute script:', err);
        });
      } else {
        console.error('No active tab found.');
      }
    });
  }

  if (message.action === 'openEachBatchNumber') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const tabId = tabs[0].id;
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: openEachBatchNumber
        }).then(() => {
          console.log('Batch numbers processed');
        }).catch(err => {
          console.error('Failed to execute script:', err);
        });
      } else {
        console.error('No active tab found.');
      }
    });
  }

  if (message.action === 'openInNewTab') {
    chrome.tabs.create({ url: message.url }, (tab) => {
      console.log('Opened new tab with URL:', message.url);
    });
  }

  if (message.action === 'processFileLinks') {
    chrome.scripting.executeScript({
      target: { tabId: message.tabId },
      func: handleFileLinks
    }).then(() => {
      console.log('File links processed in tab:', message.tabId);
    }).catch(err => {
      console.error('Failed to process file links:', err);
    });
  }
});

function extractAndCopyCodes() {
  const regex = /RSV0500[A-Z0-9]+/g;
  const links = document.querySelectorAll('a.navigable');
  const codes = [];

  links.forEach(link => {
    const match = link.textContent.match(regex);
    if (match) {
      codes.push(...match);
    }
  });

  const codesString = codes.join(',');

  if (codes.length > 0) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(codesString).then(() => {
        console.log('Codes copied to clipboard:', codesString);
      }).catch(err => {
        console.error('Failed to copy codes:', err);
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = codesString;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          console.log('Codes copied to clipboard using fallback method:', codesString);
        } else {
          console.error('Failed to copy codes using fallback method.');
        }
      } catch (err) {
        console.error('Failed to execute copy command:', err);
      }
      document.body.removeChild(textarea);
    }

    return codesString;
  } else {
    console.log('No codes found.');
    return 'No codes found';
  }
}

function findAndOpenBNLinks() {
  const bnLinks = document.querySelectorAll('a');
  bnLinks.forEach(link => {
    if (link.textContent.startsWith('bn') || link.textContent.startsWith('BN')) {
      const href = link.getAttribute('href');
      chrome.runtime.sendMessage({ action: 'openInNewTab', url: href });
    }
  });
}

function openEachBatchNumber() {
  const batchLinks = document.querySelectorAll('a.navigable');
  batchLinks.forEach(link => {
    if (link.textContent.startsWith('BN ')) {
      const href = link.getAttribute('href');
      chrome.runtime.sendMessage({ action: 'openInNewTab', url: href });
    }
  });
}
