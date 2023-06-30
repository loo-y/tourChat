'use client'
import type { NextPage, GetServerSideProps } from 'next'
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { getMainState } from './slice'
import { useCallback } from 'react'
import './style/index.css'
import ChatList from './components/ChatList'
import PageContent from './components/PageContent'
import ChatTextarea from './components/ChatTextarea'
import { Provider } from 'react-redux'
import store from '../store'

const Main: NextPage<{ serverSideData: any }, any> = ({ serverSideData }: { serverSideData: any }) => {
    return (
        <div className="main">
            <div className="px-5 w-full pt-4">
                <div className="w-full px-4">
                    <div className="mx-auto w-full max-w-6xl rounded-2xl bg-white p-2 mb-4">
                        <div className="lg:flex lg:items-center lg:justify-between">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                                    Tour-Chat Main
                                </h2>
                            </div>
                            <br />
                        </div>
                    </div>
                    <PageContent />
                    <ChatTextarea />
                </div>
            </div>
        </div>
    )
}

export default function MainPage() {
    return (
        <Provider store={store}>
            <Main serverSideData={null} />
        </Provider>
    )
}
