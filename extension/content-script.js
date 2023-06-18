// Path: extension/content-script.js
// get content from page and send to service-worker or sidebar page


const sendHTMLMessage = async ({selectorNode})=>{
    const documentHTML = document.querySelector(selectorNode)?.innerHTML;
    if(documentHTML){
        let data = {}
        data[selectorNode] = {
            nodeKey: selectorNode,
            htmlcontent: documentHTML
        }
        chrome.runtime.sendMessage({data}, (response) => {
            console.log(response);
        });
    }
}

// TODO it cannot be access in content-script
// need to inject in main and pass the message from main to content script
// more discussion: https://github.com/PlasmoHQ/plasmo/discussions/174
function findReact (selectorNode, traverseUp = 0) {
    const dom = document.querySelector(selectorNode)
    if(!dom) return null
    const key = Object.keys(dom).find(key=>{
        console.log(`key`, key)
        return key.startsWith("__reactFiber$") // react 17+
            || key.startsWith("__reactInternalInstance$") // react <17
            || key.startsWith("__reactContainere$")
    });
    const domFiber = dom[key];
    console.log(`domFiber,`, domFiber, key, dom)
    if (domFiber == null) return null;

    // react <16
    if (domFiber._currentElement) {
        let compFiber = domFiber._currentElement._owner;
        for (let i = 0; i < traverseUp; i++) {
            compFiber = compFiber._currentElement._owner;
        }
        return compFiber._instance;
    }

    // react 16+
    const GetCompFiber = fiber=>{
        //return fiber._debugOwner; // this also works, but is __DEV__ only
        let parentFiber = fiber.return;
        console.log(`parentFiber`, parentFiber)
        while (parentFiber && !parentFiber?.type?.displayName) {
            parentFiber = parentFiber.return;
        }
        console.log(`parentFiber`, parentFiber)
        if(!parentFiber) return fiber.return
        return parentFiber;
    };
    let compFiber = GetCompFiber(domFiber);
    for (let i = 0; i < traverseUp; i++) {
        compFiber = GetCompFiber(compFiber);
    }
    return compFiber && compFiber.stateNode;
}

const sendStateMessage = async ({selectorNode})=>{
    const stateNode = findReact(selectorNode);
    const state = stateNode?.props?.view?.props?.value?.state
    if(state){
        let data = {}
        data[selectorNode] = {
            nodeKey: selectorNode,
            state
        }
        chrome.runtime.sendMessage({data}, (response) => {
            console.log(response);
        });
    }
}

const sendHTMLAndStateMessage = async ({selectorNode})=>{
    const documentHTML = document.querySelector(selectorNode)?.innerHTML;
    const stateNode = findReact(selectorNode);
    const state = stateNode?.props?.view?.props?.value?.state
    if(documentHTML || state){
        let data = {}
        data[selectorNode] = {
            nodeKey: selectorNode,
            htmlcontent: documentHTML,
            state
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
    const selectorNode = selector?.nodeKey || ''
    if(command === "getHTML" && selectorNode){
        sendHTMLMessage({ selectorNode });
    }else if(command === "getState" && selectorNode){
        sendStateMessage({ selectorNode });
    }else if(command === "getHTMLAndState" && selectorNode){
        sendHTMLAndStateMessage({ selectorNode });
    }
});