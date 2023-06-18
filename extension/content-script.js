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

(async () => {
    const response = await chrome.runtime.sendMessage({data: {greeting: "hello"}});
    // do something with response here, not outside the function
    console.log(response);
  })();

// demo
const demo = ()=>{

    const article = document.querySelector("#js_itinerary_daily");

    // `document.querySelector` may return null if the selector doesn't match anything.
    if (article) {
      const text = article.textContent;
      const wordMatchRegExp = /[^\s]+/g; // Regular expression
      const words = text.matchAll(wordMatchRegExp);
      // matchAll returns an iterator, convert to array to get word count
      const wordCount = [...words].length;
      const readingTime = Math.round(wordCount / 200);
      const badge = document.createElement("p");
      // Use the same styling as the publish information in an article's header
      badge.classList.add("color-secondary-text", "type--caption");
      badge.textContent = `⏱️ ${readingTime} min read`;
    
      // Support for API reference docs
      const heading = article.querySelector("h1");
      // Support for article docs with date
      const date = article.querySelector("time")?.parentNode;
    
      (date ?? article).insertAdjacentElement("afterend", badge);
    }
}