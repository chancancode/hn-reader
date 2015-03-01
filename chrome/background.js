chrome.runtime.onMessage.addListener(
  function(request, sender) {
    if (request === "enabled") {
      chrome.pageAction.show(sender.tab.id);
      chrome.pageAction.setTitle({
        tabId: sender.tab.id,
        title: "Click to disable HN Reader"
      });
      chrome.pageAction.setIcon({
        tabId: sender.tab.id,
        path: {
          "19": "icon19.png",
          "38": "icon38.png"
        }
      });
    } else if (request === "disabled") {
      chrome.pageAction.show(sender.tab.id);
      chrome.pageAction.setTitle({
        tabId: sender.tab.id,
        title: "Click to enable HN Reader"
      });
      chrome.pageAction.setIcon({
        tabId: sender.tab.id,
        path: {
          "19": "icon19a.png",
          "38": "icon38a.png"
        }
      });
    }
  }
);

chrome.pageAction.onClicked.addListener(
  function(tab) {
    chrome.tabs.sendMessage(tab.id, "toggle");
  }
);
