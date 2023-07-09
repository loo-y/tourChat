const Match_URL = 'ctrip.com'

const mainPage = './dist/main.html'

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
    if (!tab.url) return
    const url = new URL(tab.url)
    if (url.origin.includes(Match_URL)) {
        await chrome.sidePanel.setOptions({
            tabId,
            path: mainPage,
            enabled: true,
        })
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(error => console.error(error));
    } else {
        // Disables the side panel on all other sites
        await chrome.sidePanel.setOptions({
            tabId,
            enabled: false,
        })
    }
})

chrome.tabs.onActivated.addListener(async ({tabId}) => {
    const tab = await chrome.tabs.get(tabId);
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
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(error => console.error(error));
    } else {
        // Disables the side panel on all other sites
        await chrome.sidePanel.setOptions({
            tabId,
            enabled: false,
        })
    }
})

chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    const {
        source,
        info,
        type,
    } = request || {}
    sendResponse({message: "service-worker tell you"})
    // only trrigered by mainstatic
    if(source !== `mainstatic`){
        return;
    }

    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const url = new URL(tab.url)

    if(type == "getUrl"){
        chrome.runtime.sendMessage({url: tab.url, type, message: "service-worker tell you about this page",}, function(response) {
            console.log(response);
        });
        return;
    }

    // Enables the side panel on google.com
    if (url.origin.includes(Match_URL)) {
        const response = await chrome.tabs.sendMessage(tab.id, {data: {greeting: "hello from service worker", ...request.data}});
        // do something with response here, not outside the function
        console.log(response);
        const { command, selector } = info || {};

        const tabId = tab.id;
        // inject script in page first
        chrome.scripting.executeScript({
            target: { tabId }, 
            world: "MAIN", 
            files: ['./inject-script.js']
        }, () => {
            // after inject function in page window, then call it in page window
            chrome.scripting.executeScript({
              target: { tabId },
              world: "MAIN", 
              args: [{ command, selector }],
              func: (...args) => injectScript(...args),
            });
        });
    }
});
