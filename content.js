// content.js

function handleFileLinks() {
  const links = document.querySelectorAll('a');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href.startsWith('file:////')) {
      const modifiedHref = href.replace(/^file:\/{4}/, 'file://');
      link.setAttribute('href', modifiedHref);
      // Optionally open the modified link
      window.location.href = modifiedHref;
    }
  });
}

// Listen for messages from background.js to process file links
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'processFileLinks') {
    handleFileLinks();
  }
});
