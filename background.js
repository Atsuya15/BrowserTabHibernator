chrome.tabs.onActivated.addListener(() => {
  chrome.storage.local.get(["enabled", "whitelist"], (data) => {
    const enabled = data.enabled ?? true;
    const whitelist = data.whitelist ?? [];

    if (!enabled) return;

    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        const url = tab.url || "";
        const isWhitelisted = whitelist.some(domain => url.includes(domain));

        if (
          !tab.active &&
          !tab.pinned &&
          !tab.discarded &&
          !url.startsWith("chrome://") &&
          !isWhitelisted
        ) {
          chrome.tabs.discard(tab.id, (discarded) => {
            console.log(`Discarded: ${discarded.title} [${discarded.url}]`);
          });
        } else if (isWhitelisted) {
          console.log(`Preserved whitelisted tab: ${tab.title} [${url}]`);
        }
      });
    });
  });
});