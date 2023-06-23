'use client'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { getMainState, chatListAsync, updateProductId, saveContentToVector } from '../slice'
import { useCallback, useEffect, useState } from 'react'
import { VectorSaveParams } from '../interface'
import _ from 'lodash'
declare var chrome: any

const ChatList = () => {
    const dispatch = useAppDispatch()
    const state = useAppSelector(getMainState)
    const [documentHtml, setDocumentHtml] = useState<string>('')
    const [selectorNodeKey, setSelectorNodeKey] = useState<string>('.imvc-view-item')
    useEffect(() => {
        chrome?.runtime?.onMessage?.addListener(function (
            request: any,
            sender: any,
            sendResponse: (args: any) => void
        ) {
            console.log(request)
            sendResponse('message received from ChatList')
            const { pageData, source } = request || {}
            const selector = (pageData || {})[selectorNodeKey]
            const { htmlcontent, state: pageState } = selector || {}
            // htmlcontent && setDocumentHtml(htmlcontent)
            htmlcontent && setDocumentHtml('<h2>Get Page Html Succeed!!</h2>')
            console.log(`get State from Page===>`, pageState)
            const { contextList, productId } = regonizePagestateToContent(pageState)
            const { introductionInfo } = contextList || {}
            console.log(`introductionInfo=====>`, introductionInfo)

            dispatch(updateProductId(productId))
            dispatch(saveContentToVector({ contextList: introductionInfo, name: `Product_${productId}` }))
        })
    }, [])

    const handleTest = () => {
        console.log(`this is handleTest`)
        // sendMessage to service-worker.js
        chrome?.runtime?.sendMessage(
            { source: 'mainstatic', info: { command: 'getHTMLAndState', selector: { nodeKey: selectorNodeKey } } },
            function (response: (args: any) => void) {
                console.log(response)
            }
        )
        // dispatch(chatListAsync(1))
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

// ********** helper **********
const regonizePagestateToContent = (
    pageState: any
): { productId: number; contextList: { [index: string]: VectorSaveParams['contextList'] } } => {
    let introductionInfo: VectorSaveParams['contextList'] = []
    const { itineraryInfo, productId } = pageState || {}
    const { IntroductionInfoList } = itineraryInfo || {}

    introductionInfo = _.map(IntroductionInfoList || [], IntroductionInfo => {
        const { DailyList, Desc, FewDay = 0 } = IntroductionInfo || {}
        const dailyInfo = _.map(DailyList, Daily => {
            const { TakeTime, DepartTime, Desc: DailyDesc } = Daily || {}
            return `时间:${DepartTime}, ${DailyDesc}, ${TakeTime || ''};`
        })
        return {
            pageContent: `Day${FewDay}: ${Desc}, 当日安排: ${dailyInfo}`,
            metadata: { day: FewDay },
        }
    })

    return {
        productId: Number(productId) || 0,
        contextList: {
            introductionInfo,
        },
    }
}
