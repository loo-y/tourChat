'use client'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { getMainState, findSimilarContent, getOnceChat } from '../slice'
import _ from 'lodash'
import { useRef, useState } from 'react'
import { OnceChatStatus } from '../interface'

const ChatTextarea = () => {
    const dispatch = useAppDispatch()
    const state = useAppSelector(getMainState)
    const { onceChatStatus } = state
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
        if (replicatedValue) {
            dispatch(findSimilarContent({ text: replicatedValue }))
            dispatch(getOnceChat({ question: replicatedValue }))
        }
    }
    return (
        <div className="w-full fixed left-0 bottom-4 px-[2.25rem]">
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
                                <LoadingSVG customClass={'align-top mt-2'} />
                            ) : (
                                'send'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatTextarea

const LoadingSVG = ({ customClass }: { customClass?: string }) => {
    return (
        <div className={`inline-block mx-1 ${customClass || ''}`}>
            <svg
                className="animate-spin  h-5 w-5 text-indigo-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
            </svg>
        </div>
    )
}
