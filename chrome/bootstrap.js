(function(enabled) {
  function html() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", chrome.extension.getURL("index.html"), false);
    xhr.send(null);
    return xhr.responseText.replace(/assets\//g, chrome.extension.getURL("assets/"));
  }

  if (enabled) {
    document.open();
    document.write( html() );
    document.close();

    // Fix broken images
    document.addEventListener("error", function (event) {
      var el = event.target, src = el.getAttribute("src");

      if (el.tagName === "IMG" && src && src.indexOf(chrome.extension.getURL("/")) < 0) {
        el.setAttribute("src", chrome.extension.getURL(src));
      }
    }, true);

    chrome.runtime.onMessage.addListener(
      function(request, sender) {
        if (request === "toggle" && !sender.tab) {
          window.sessionStorage.setItem("disable-hn-reader", true);
          window.location.reload();
        }
      }
    );

    chrome.runtime.sendMessage("enabled");
  } else {
    chrome.runtime.onMessage.addListener(
      function(request, sender) {
        if (request === "toggle" && !sender.tab) {
          window.sessionStorage.removeItem("disable-hn-reader");
          window.location.reload();
        }
      }
    );

    chrome.runtime.sendMessage("disabled");
  }
})(
  window.location.search.indexOf("hn-reader=0") < 0 &&
  !window.sessionStorage.getItem("disable-hn-reader")
);