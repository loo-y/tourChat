'use client'
// get and load page content from tab
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { getMainState, updateNameForSpace, saveContentToVector } from '../slice'
import { useCallback, useEffect, useState } from 'react'
import { VectorSaveParams, PageType, CommandType } from '../interface'
import _ from 'lodash'
declare var chrome: any

const PageContent = () => {
    const dispatch = useAppDispatch()
    const state = useAppSelector(getMainState)
    const { vetcorSaveStatus, onceChatAnswer } = state || {}
    const [documentHtml, setDocumentHtml] = useState<string>('')
    const [selectorNodeKey, setSelectorNodeKey] = useState<string>('.imvc-view-item')
    const [pageType, setPageType] = useState<string>('')
    const [requestFromChrome, setRequestFromChrome] = useState<any>(null)
    useEffect(() => {
        sendCommandToServiceWorker()
        chrome?.runtime?.onMessage?.addListener(function (
            request: any,
            sender: any,
            sendResponse: (args: any) => void
        ) {
            console.log(request)
            sendResponse('message received from PageContent')
            setRequestFromChrome(request)
        })
    }, [])

    useEffect(() => {
        if (!_.isEmpty(requestFromChrome)) {
            const { pageData, source, type, url } = requestFromChrome || {}
            console.log(`type`, type)
            if (type == CommandType.getUrl) {
                const matchPathList = url ? url.match(/(?<=\/)([^\/\.\?]+)/g) || [] : []
                _.find(matchPathList, path => {
                    switch (path) {
                        case 'list':
                            setPageType(PageType.list)
                            return true
                        case 'detail':
                            setPageType(PageType.detail)
                            return true
                        case 'orderv3':
                            setPageType(PageType.order)
                            return true
                        default:
                            break
                    }
                })
            } else if (type == CommandType.getPageContent) {
                const selector = (pageData || {})[selectorNodeKey]
                const { htmlcontent, state: pageState } = selector || {}
                // htmlcontent && setDocumentHtml(htmlcontent)
                htmlcontent && setDocumentHtml('<h2>Get Page Html Succeed!!</h2>')
                console.log(`get htmlcontent from Page===>`, htmlcontent)
                console.log(`get State from Page===>`, pageState)
                if (pageType) {
                    switch (pageType) {
                        case PageType.list:
                            const listPageContent = getListPageContent(pageState)
                            const listPageNameForSpace = listPageContent?.contentBlock?.name || ''
                            dispatch(updateNameForSpace(listPageNameForSpace))
                            dispatch(saveContentToVector(listPageContent.contentBlock))
                            break
                        case PageType.detail:
                            const detailPageContent = getDetailPageContent(pageState)
                            const detailPageNameForSpace = detailPageContent?.contentBlock?.name || ''
                            dispatch(updateNameForSpace(detailPageNameForSpace))
                            dispatch(saveContentToVector(detailPageContent.contentBlock))
                            break
                        case PageType.order:
                            break
                        default:
                            break
                    }
                }
            }
        }
    }, [requestFromChrome])

    const handleGetPageContent = () => {
        console.log(`Try to GetPageContent`)
        // sendMessage to service-worker.js
        chrome?.runtime?.sendMessage(
            { source: 'mainstatic', info: { command: 'getHTMLAndState', selector: { nodeKey: selectorNodeKey } } },
            (response: any) => {
                console.log(`handleGetPageContent get your message,`, response)
            }
        )
    }

    return (
        <>
            <div className="mx-auto w-full max-w-6xl mb-1">
                Please try to get page content first.
                <br />
                Current page type is {pageType}
                {vetcorSaveStatus ? (
                    <>
                        <br />
                        <span className="text-green-500">Save to vector succeed!</span>
                    </>
                ) : null}
            </div>
            <div className="mx-auto w-full max-w-6xl rounded-2xl bg-white p-2">
                <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 sm:ml-3 sm:w-auto"
                    onClick={() => {
                        handleGetPageContent()
                    }}
                >
                    GetPageContent
                </button>
            </div>
            {documentHtml && (
                <div className="mx-auto w-full max-w-6xl rounded-2xl bg-white p-2">
                    <div dangerouslySetInnerHTML={{ __html: documentHtml }} />
                </div>
            )}
            {onceChatAnswer ? <div className="mx-auto w-full max-w-6xl mb-1">{onceChatAnswer}</div> : null}
        </>
    )
}

export default PageContent

// ********** helper **********

const sendCommandToServiceWorker = (message?: string) => {
    chrome?.runtime?.sendMessage({ source: 'mainstatic', message: message, type: CommandType.getUrl })
}

const regonizePagestateToContent = (
    pageState: any
): { productId: number; contextList: VectorSaveParams['contextList'] } => {
    let introductionInfo: { pageContent: string; metadata?: { [index: string]: any } }
    const { itineraryInfo, productId } = pageState || {}
    const { IntroductionInfoList } = itineraryInfo || {}
    let introductionInfoMetadata = { type: 'introductionInfo' }
    const introductionInfoPageContent = _.map(IntroductionInfoList || [], IntroductionInfo => {
        const { DailyList, Desc, FewDay = 0 } = IntroductionInfo || {}
        const dailyInfo = _.map(DailyList, Daily => {
            const { TakeTime, DepartTime, Desc: DailyDesc } = Daily || {}
            return `时间:${DepartTime}, ${DailyDesc}, ${TakeTime || ''};`
        })
        return `Day${FewDay}: ${Desc}, 当日安排: ${dailyInfo}`
    }).join(';\n')

    introductionInfo = {
        pageContent: introductionInfoPageContent,
        metadata: introductionInfoMetadata,
    }

    return {
        productId: Number(productId) || 0,
        contextList: [introductionInfo],
    }
}

const getDetailPageContent = (pageState: any) => {
    let contentBlock: VectorSaveParams
    const { contextList, productId } = regonizePagestateToContent(pageState)
    contentBlock = {
        contextList: contextList,
        name: `Product_${productId}`,
    }

    return {
        contentBlock,
        productId,
    }
}

const getListPageContent = (pageState: any) => {
    let contentBlock: VectorSaveParams
    const { products, search, departureCity } = pageState || {}
    const cityId = departureCity?.cityId || departureCity?.saleCityId || 2
    const keyword = search?.keyword || ''
    const name = `City_${cityId}_Keyword_${keyword}`

    let listPageContent = _.map(products, product => {
        const { basicInfo, priceInfo, tags, vendorInfo } = product || {}
        const { name = '', subName = '', id = 0 } = basicInfo || {}
        const { marketing, normal } = tags || {}
        const tagList = _.concat(marketing, normal)
        const tagListStr = _.map(tagList, tag => {
            return tag?.tagTitle || ''
        }).join('-')
        const productContent = `产品名称: ${name}, 副标题: ${subName}, 产品ID: ${id}, 产品价格: ${priceInfo?.price}, 供应商: ${vendorInfo?.brandName}, 相关标签: ${tagListStr}`
        return productContent
    }).join(';\n')

    contentBlock = {
        contextList: [
            {
                pageContent: listPageContent,
                metadata: { cityId, keyword },
            },
        ],
        name,
    }
    return {
        contentBlock,
    }
}
