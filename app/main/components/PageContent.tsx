'use client'
// get and load page content from tab
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { getMainState, updateProductId, saveContentToVector } from '../slice'
import { useCallback, useEffect, useState } from 'react'
import { VectorSaveParams, PageType, CommandType } from '../interface'
import _ from 'lodash'
declare var chrome: any

const PageContent = () => {
    const dispatch = useAppDispatch()
    const state = useAppSelector(getMainState)
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
                let matchFirstPath = url && url.match(/\/([^\/\.]+)\//)
                matchFirstPath = matchFirstPath?.[1]
                console.log(`matchFirstPath`, url, matchFirstPath)
                if (matchFirstPath) {
                    switch (matchFirstPath) {
                        case 'list':
                            setPageType(PageType.list)
                            break
                        case 'detail':
                            setPageType(PageType.detail)
                            break
                        case 'orderv3':
                            setPageType(PageType.order)
                            break
                        default:
                            break
                    }
                }
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
                            dispatch(saveContentToVector(listPageContent.contentBlock))
                            break
                        case PageType.detail:
                            const detailPageContent = getDetailPageContent(pageState)
                            dispatch(updateProductId(detailPageContent.productId))
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
            <div>pageType: {pageType}</div>
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

const getDetailPageContent = (pageState: any) => {
    let contentBlock: VectorSaveParams
    const { contextList, productId } = regonizePagestateToContent(pageState)
    const { introductionInfo } = contextList || {}
    contentBlock = {
        contextList: introductionInfo,
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
