'use client'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { getMainState, findSimilarContent, getOnceChat } from '../slice'
import _ from 'lodash'
import { useRef, useState } from 'react'

const ChatTextarea = () => {
    const dispatch = useAppDispatch()
    const state = useAppSelector(getMainState)
    const { productId } = state
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
        <div className="flex w-full mt-3 bg-white leading-[1.1rem] rounded-xl  ">
            <div
                data-replicated-value={replicatedValue}
                className="grow grid  pl-2 pt-3 pb-3 after:content-[attr(data-replicated-value)] after:whitespace-pre-wrap after:invisible after:max-h-24 after:overflow-hidden after:row-start-1 after:row-end-2 after:col-start-1 after:col-end-2"
            >
                <textarea
                    ref={textareaRef}
                    placeholder="take a question"
                    className="w-full text-sm leading-[1rem] max-h-24 row-start-1 row-end-2 col-start-1 col-end-2 overflow-y-auto outline-none border-none resize-none focus:outline-none focus:border-transparent"
                    rows={1}
                    onChange={handleTextareaChange}
                />
            </div>
            <div
                className="flex mb-1 mr-2 mt-1 flex-row text-center justify-center items-end"
                onClick={handleClickSendQuestion}
            >
                <button
                    type="button"
                    className="w-auto leading-9 rounded-md align-bottom bg-violet-600 px-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 sm:ml-3 sm:w-auto"
                >
                    send
                </button>
            </div>
        </div>
    )
}

export default ChatTextarea
