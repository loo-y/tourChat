// it cannot be access in content-script
// It has to inject in main and pass the message from main to content script
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

async function getState ({selectorNode}) {
    const stateNode = findReact(selectorNode);
    const state = stateNode?.props?.view?.props?.value?.state
    let data = {}
    if(state){
        data[selectorNode] = {
            nodeKey: selectorNode,
            state
        }
    }
    return;
}

async function getHTML ({selectorNode}) {
    const documentHTML = document.querySelector(selectorNode)?.innerHTML;
    let data = {}
    if(documentHTML){
        data[selectorNode] = {
            nodeKey: selectorNode,
            htmlcontent: documentHTML
        }
    }
    return data
}


async function getHTMLAndState ({selectorNode}) {
    const documentHTML = document.querySelector(selectorNode)?.innerHTML;
    const stateNode = findReact(selectorNode);
    const state = stateNode?.props?.view?.props?.value?.state
    let data = {}
    if(documentHTML || state){
        data[selectorNode] = {
            nodeKey: selectorNode,
            htmlcontent: documentHTML,
            state
        }
    }

    return data;
}

if(typeof injectScript === 'undefined'){
    window.injectScript = async (requestArgs) => {
        const { command, selector } = requestArgs || {};
        const selectorNode = selector?.nodeKey || ''
        let pageData = {}
        if(command === "getHTML" && selectorNode){
            pageData = await getHTML({ selectorNode });
        }else if(command === "getState" && selectorNode){
            pageData = await getState({ selectorNode });
        }else if(command === "getHTMLAndState" && selectorNode){
            pageData = await getHTMLAndState({ selectorNode });
        }

        console.log(`injectScript get data then post message`, pageData)
        window.postMessage({source: "inject-script", pageData})

        // inject script cannot run chrome runtime
        // chrome.runtime.sendMessage({pageData}, (response) => {
        //     console.log(response);
        // });
    }
}


// injectScript({ command: "getHTMLAndState", selector: {nodeKey: ".imvc-view-item"} })