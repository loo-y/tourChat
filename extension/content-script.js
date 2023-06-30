// Path: extension/content-script.js
// get content from page and send to service-worker or sidebar page



// request = { data }
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
    console.log(`content-script onMessage====>`, request);
    const { info, source } = request || {}
    const { command, selector } = info || {};
    const selectorNode = selector?.nodeKey || ''
    sendResponse && sendResponse()
    // - postMessage to inject-script
    // window.postMessage({data: request?.data || {}})
    return `return from content-script`
});

// - get message from world MAIN posted by inject-script.js
window.addEventListener("message", function(event) {
    const data = event?.data || {}
    const { source, pageData } = data || {};
    if(source === `inject-script`){
        console.log(`get Message from inject-script`, event)
        chrome.runtime.sendMessage({pageData, source: "content-script", type: "getPageContent"}, (response) => {
            console.log(response);
        });
    }
    return;
})