const Match_URL = 'ctrip.com'

console.log(`test===>`, Match_URL)
const mainPage = './dist/main.html'
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
    console.log(`tab`, tab, tab.url)
    if (!tab.url) return
    const url = new URL(tab.url)
    // Enables the side panel on google.com
    if (url.origin.includes(Match_URL)) {
        await chrome.sidePanel.setOptions({
            tabId,
            path: mainPage,
            enabled: true,
        })
        console.log(`chrome.sidePanel`)
        // setTimeout(()=>{
        //     chrome.runtime.sendMessage({data: "data from service-worker"}, function(response) {
        //         console.log(response);
        //     });
        // }, 1000)

        
        // runtime message: https://developer.chrome.com/docs/extensions/reference/runtime/#event-onMessage
        // mainPage send message to service-worker, 
        // service-worker get message from mainPage, then send message to content-script


        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(error => console.error(error));


    } else {
        // Disables the side panel on all other sites
        await chrome.sidePanel.setOptions({
            tabId,
            path: mainPage,
            enabled: false,
        })
    }
})

chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    console.log(request.data);
    sendResponse("message received from service-worker");
    const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
    const url = new URL(tab.url)
    // Enables the side panel on google.com
    if (url.origin.includes(Match_URL)) {
        const response = await chrome.tabs.sendMessage(tab.id, {data: {greeting: "hello from service worker", ...request.data}});
        // do something with response here, not outside the function
        console.log(response);
    }
});