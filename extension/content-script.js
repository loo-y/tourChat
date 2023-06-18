// Path: extension/content-script.js
// get content from page and send to service-worker or sidebar page


const sendHTMLMessage = async ({selectorText})=>{
    const documentHTML = document.querySelector(selectorText)?.innerHTML;
    if(documentHTML){
        let data = {}
        data[selectorText] = {
            text: selectorText,
            htmlcontent: documentHTML
        }
        chrome.runtime.sendMessage({data}, (response) => {
            console.log(response);
        });
    }
}

// request = { data }
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse){
    console.log(`content-script onMessage====>`, request.data);
    
    const { command, selector } = request?.data || {};
    if(command === "getHTML" && selector){
        sendHTMLMessage({selectorText: selector.text});
    }
});