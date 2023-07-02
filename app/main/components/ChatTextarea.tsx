'use client'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { getMainState, findSimilarContent, getOnceChat } from '../slice'
import _ from 'lodash'
import { useRef, useState } from 'react'
import { OnceChatStatus, VectorSaveStatus } from '../interface'
import LoadingSVG from './LoadingSVG'

const ChatTextarea = () => {
    const dispatch = useAppDispatch()
    const state = useAppSelector(getMainState)
    const { onceChatStatus, vetcorSaveStatus } = state
    console.log(`onceChatStatus`, onceChatStatus)
    const textareaRef = useRef(null)
    const [replicatedValue, setReplicatedValue] = useState<string>(' ')
    const handleTextareaChange = (sender?: any) => {
        // @ts-ignore
        const textAreaValue = (textareaRef?.current?.value || '') + ' '
        if (textAreaValue) {
            setReplicatedValue(textAreaValue)
        }
    }

    const handleClickSendQuestion = () => {
        if (replicatedValue && onceChatStatus !== OnceChatStatus.loading) {
            // dispatch(findSimilarContent({ text: replicatedValue }))
            dispatch(getOnceChat({ question: replicatedValue }))
        }
    }

    if (vetcorSaveStatus != VectorSaveStatus.success) {
        return null
    }

    return (
        <>
            <div className="w-full left-0 bottom-0 px-[2.25rem] h-[6rem] pt-2 pb-4"></div>
            <div
                className="w-full fixed left-0 bottom-0 px-[2.25rem] pt-2 pb-4"
                style={{ backgroundColor: 'rgb(var(--background-start-rgb))' }}
            >
                <div className="mx-auto w-full max-w-6xl ">
                    <div className="flex w-full mt-3 bg-white leading-[1.1rem] rounded-xl  ">
                        <div
                            data-replicated-value={replicatedValue}
                            className="grow grid  pl-2 pt-3 pb-3 after:content-[attr(data-replicated-value)] after:whitespace-pre-wrap after:invisible after:max-h-24 after:overflow-hidden after:row-start-1 after:row-end-2 after:col-start-1 after:col-end-2"
                        >
                            <textarea
                                ref={textareaRef}
                                placeholder="take a question"
                                className={`w-full text-sm leading-[1rem] max-h-24 row-start-1 row-end-2 col-start-1 col-end-2 overflow-y-auto outline-none border-none resize-none focus:outline-none focus:border-transparent`}
                                rows={1}
                                onChange={handleTextareaChange}
                                disabled={onceChatStatus == OnceChatStatus.loading ? true : undefined}
                            />
                        </div>
                        <div
                            className="flex mb-1 mr-2 mt-1 flex-row text-center justify-center items-end"
                            onClick={handleClickSendQuestion}
                        >
                            <button
                                type="button"
                                disabled={onceChatStatus == OnceChatStatus.loading ? true : undefined}
                                className={`w-[56px] leading-9 rounded-md align-bottom bg-indigo-600 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-[56px] relative `}
                            >
                                {onceChatStatus == OnceChatStatus.loading ? (
                                    <LoadingSVG customClass={'align-top'} />
                                ) : (
                                    'send'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChatTextarea
