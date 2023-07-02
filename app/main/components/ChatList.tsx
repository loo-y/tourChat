'use client'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { getMainState } from '../slice'
import { useCallback, useEffect, useState } from 'react'
import { VectorSaveParams } from '../interface'
import _ from 'lodash'
declare var chrome: any

const ChatList = () => {
    const dispatch = useAppDispatch()
    const state = useAppSelector(getMainState)
    const { chatList } = state || {}
    useEffect(() => {}, [])

    console.log(`chatList===>`, chatList)
    if (_.isEmpty(chatList)) {
        return null
    }

    return (
        <>
            <div className="mx-auto w-full max-w-6xl mb-1 rounded-2xl p-2 bg-white mt-2">
                {_.map(chatList, (chat, index) => {
                    const { timestamp, ai, human } = chat || {}
                    return (
                        <div key={`chatlist_${timestamp}_${index}`}>
                            <div className="flex flex-row">
                                <div className="flex flex-col">{human}</div>
                            </div>
                            <div className="flex flex-row">
                                <div className="flex flex-col">
                                    <div
                                        className="whitespace-pre-line"
                                        dangerouslySetInnerHTML={{ __html: ai.replace(/\n/g, '<br />') }}
                                    />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )
}

export default ChatList

// ********** helper **********
