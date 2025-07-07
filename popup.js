document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggleEnabled");
  const domainInput = document.getElementById("domainInput");
  const addDomainBtn = document.getElementById("addDomain");
  const whitelistList = document.getElementById("whitelist");
  const exportBtn = document.getElementById("exportSettings");
  const importBtn = document.getElementById("importSettings");
  const importFile = document.getElementById("importFile");

  chrome.storage.local.get(["enabled", "whitelist"], (data) => {
    toggle.checked = data.enabled ?? true;
    const whitelist = data.whitelist ?? [];
    whitelist.forEach(addDomainToUI);
  });

  toggle.addEventListener("change", () => {
    chrome.storage.local.set({ enabled: toggle.checked });
  });

  addDomainBtn.addEventListener("click", () => {
    const domain = domainInput.value.trim();
    if (!domain) return;

    chrome.storage.local.get(["whitelist"], (data) => {
      let whitelist = data.whitelist ?? [];
      if (!whitelist.includes(domain)) {
        whitelist.push(domain);
        chrome.storage.local.set({ whitelist });
        addDomainToUI(domain);
      }
      domainInput.value = "";
    });
  });

  function addDomainToUI(domain) {
    const li = document.createElement("li");
    li.textContent = domain;
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";
    removeBtn.onclick = () => {
      chrome.storage.local.get(["whitelist"], (data) => {
        const whitelist = data.whitelist.filter(d => d !== domain);
        chrome.storage.local.set({ whitelist }, () => {
          whitelistList.innerHTML = "";
          whitelist.forEach(addDomainToUI);
        });
      });
    };
    li.appendChild(removeBtn);
    whitelistList.appendChild(li);
  }

  exportBtn.addEventListener("click", () => {
    chrome.storage.local.get(["enabled", "whitelist"], (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "BrowserTabHibernator-settings.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  importBtn.addEventListener("click", () => {
    const file = importFile.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        chrome.storage.local.set(imported, () => {
          location.reload();
        });
      } catch (err) {
        alert("Invalid settings file.");
      }
    };
    reader.readAsText(file);
  });
});