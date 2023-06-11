const Match_URL = 'ctrip.com'

console.log(`test===>`, Match_URL)
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
    console.log(`tab`, tab, tab.url)
    if (!tab.url) return
    const url = new URL(tab.url)
    // Enables the side panel on google.com
    if (url.origin.includes(Match_URL)) {
        await chrome.sidePanel.setOptions({
            tabId,
            path: 'sidepanel.html',
            enabled: true,
        })
        console.log(`chrome.sidePanel`)
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(error => console.error(error))
    } else {
        // Disables the side panel on all other sites
        await chrome.sidePanel.setOptions({
            tabId,
            path: 'sidepanel.html',
            enabled: false,
        })
    }
})
