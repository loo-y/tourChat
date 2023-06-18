'use client'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { getMainState, chatListAsync } from '../slice'
import { useCallback, useEffect, useState } from 'react'
declare var chrome: any

const ChatList = () => {
    const dispatch = useAppDispatch()
    const state = useAppSelector(getMainState)
    const [documentHtml, setDocumentHtml] = useState<string>('')
    const [selectorText, setSelectorText] = useState<string>('#js_ItineraryInfo')
    useEffect(() => {
        chrome.runtime.onMessage.addListener(function (request: any, sender: any, sendResponse: (args: any) => void) {
            console.log(request.data)
            sendResponse('message received from ChatList')
            const selector = (request.data || {})[selectorText]
            const { htmlcontent } = selector || {}
            setDocumentHtml(htmlcontent)
        })
    }, [])

    const handleTest = () => {
        console.log(`this is handleTest`)
        // alert(`this is handleTest`)
        chrome.runtime.sendMessage(
            { data: { command: 'getHTML', selector: { text: selectorText } } },
            function (response: (args: any) => void) {
                console.log(response)
            }
        )
        dispatch(chatListAsync(1))
    }

    return (
        <>
            <div className="mx-auto w-full max-w-6xl rounded-2xl bg-white p-2">
                <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 sm:ml-3 sm:w-auto"
                    onClick={() => {
                        handleTest()
                    }}
                >
                    GetChatList
                </button>
            </div>
            {documentHtml && (
                <div className="mx-auto w-full max-w-6xl rounded-2xl bg-white p-2">
                    <div dangerouslySetInnerHTML={{ __html: documentHtml }} />
                </div>
            )}
        </>
    )
}

export default ChatList
