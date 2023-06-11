'use client'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { getMainState } from '../slice'
import { useCallback } from 'react'

const ChatList = () => {
    const dispatch = useAppDispatch()
    const state = useAppSelector(getMainState)

    const handleTest = () => {
        console.log(`this is handleTest`)
    }
    return (
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
    )
}

export default ChatList
