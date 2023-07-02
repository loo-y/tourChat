import { createAsyncThunk, createSlice, original, PayloadAction } from '@reduxjs/toolkit'
import type { AppState, AppThunk } from '../store'
import * as API from './API'
import { fetchCount, fetchChatList, fetchVectorSave, fetchVectorSimlar, fetchOnceChat } from './API'
import { MainState, VectorSaveParams, QuizParams, VectorSaveStatus, OnceChatStatus } from './interface'
import _ from 'lodash'
import type { AsyncThunk } from '@reduxjs/toolkit'
import { vectorNameSpace } from './constants'

// define a queue to store api request
type APIFunc = (typeof API)[keyof typeof API]
type APIFuncName = keyof typeof API
export const getMainState = (state: AppState): MainState => state.main

type RequestCombo = {
    apiRequest: APIFunc
    asyncThunk?: AsyncThunk<any, any, any>
}
const apiRequestQueue: Array<RequestCombo> = []
// define a thunk action to wrap api request
const makeApiRequestInQueue = createAsyncThunk(
    'mainSlice/makeApiRequestInQueue',
    async (requestCombo: RequestCombo, { dispatch, getState }: any) => {
        const mainState = getMainState(getState())
        const { requestInQueueFetching } = mainState || {}

        // 将接口请求添加到队列中，并设置isFetching为true
        apiRequestQueue.push(requestCombo)

        if (requestInQueueFetching) {
            // if there is a request in progress, return a resolved Promise
            return Promise.resolve()
        }

        const { setRequestInQueueFetching } = mainSlice.actions
        dispatch(setRequestInQueueFetching(true))

        // loop through the queue and process each request
        while (apiRequestQueue.length > 0) {
            const nextRequestCombo = apiRequestQueue.shift()
            if (nextRequestCombo) {
                const { apiRequest, asyncThunk } = nextRequestCombo || {}

                // send api request
                try {
                    // @ts-ignore
                    asyncThunk && dispatch(asyncThunk.pending())
                    // @ts-ignore
                    dispatch(makeApiRequestInQueue.pending())
                    // @ts-ignore
                    const response = await apiRequest()
                    // @ts-ignore
                    asyncThunk && dispatch(asyncThunk.fulfilled(response))
                    // @ts-ignore
                    dispatch(makeApiRequestInQueue.fulfilled(response))
                } catch (error) {
                    // @ts-ignore
                    asyncThunk && dispatch(asyncThunk.rejected(error))
                    // @ts-ignore
                    dispatch(makeApiRequestInQueue.rejected(error))
                }
            }
        }

        // set RequestInQueueFetching to false when all requests are processed
        dispatch(setRequestInQueueFetching(false))
    }
)

const initialState: MainState = {
    requestInQueueFetching: false,
    onceChatAnswer: '',
    chatList: [],
    productId: 0,
    nameForSpace: ``,
    vetcorSaveStatus: VectorSaveStatus.unset,
    onceChatStatus: OnceChatStatus.idle,
}

export const saveContentToVector = createAsyncThunk(
    'mainSlice/saveContentToVector',
    async (params: VectorSaveParams, { dispatch, getState }: any) => {
        dispatch(updateState({ vetcorSaveStatus: VectorSaveStatus.loading }))
        dispatch(
            makeApiRequestInQueue({
                apiRequest: fetchVectorSave.bind(null, {
                    contextList: params?.contextList || [],
                    name: params?.name || vectorNameSpace,
                }),
                asyncThunk: saveContentToVector,
            })
        )
    }
)

export const findSimilarContent = createAsyncThunk(
    'mainSlice/findSimilarContent',
    async (params: { text: string; name?: string }, { dispatch, getState }: any) => {
        const mainState: MainState = getMainState(getState())
        dispatch(updateState({ onceChatStatus: OnceChatStatus.loading }))
        dispatch(
            makeApiRequestInQueue({
                apiRequest: fetchVectorSimlar.bind(null, {
                    name: params?.name || mainState?.nameForSpace || vectorNameSpace,
                    ...params,
                }),
                asyncThunk: findSimilarContent,
            })
        )
    }
)

export const getOnceChat = createAsyncThunk(
    'mainSlice/getOnceChat',
    async (params: Partial<QuizParams> & Pick<QuizParams, 'question'>, { dispatch, getState }: any) => {
        const mainState: MainState = getMainState(getState())
        const { chatList, nameForSpace } = mainState || {}
        const { content, question } = params || {}
        let onceChatContent = content
        let newChatList = [...chatList]
        newChatList.push({
            ai: ``,
            human: question,
            timestamp: Date.now(),
        })
        console.log(`newchatlist`, newChatList)
        // remove last answer
        dispatch(
            updateState({
                onceChatAnswer: '',
                onceChatStatus: OnceChatStatus.loading,
                chatList: newChatList,
            })
        )

        if (!onceChatContent) {
            const simlarcontentResult = await fetchVectorSimlar({
                name: nameForSpace || vectorNameSpace,
                text: question,
            })
            const { status, result, error } = (simlarcontentResult as any) || {}
            if (status && result?.content) {
                onceChatContent = result.content
                dispatch(updateState({ onceChatContent }))
            }
        }

        dispatch(
            makeApiRequestInQueue({
                apiRequest: fetchOnceChat.bind(null, {
                    content: onceChatContent || '',
                    question: question,
                }),
                asyncThunk: getOnceChat,
            })
        )
    }
)

export const mainSlice = createSlice({
    name: 'mainSlice',
    initialState,
    reducers: {
        updateNameForSpace: (state, action: PayloadAction<string>) => {
            state.nameForSpace = action.payload
        },
        updateProductId: (state, action: PayloadAction<number>) => {
            state.productId = action.payload
        },
        setRequestInQueueFetching: (state, action: PayloadAction<boolean>) => {
            state.requestInQueueFetching = action.payload
        },
        updateState: (state, action: PayloadAction<Partial<MainState>>) => {
            return { ...state, ...action.payload }
        },
    },
    extraReducers: builder => {
        builder
            .addCase(saveContentToVector.fulfilled, (state, action) => {
                console.log(`saveContentToVector.fulfilled`, action.payload)
                if (action.payload as any) {
                    const { status } = (action.payload as any) || {}
                    state.vetcorSaveStatus = status ? VectorSaveStatus.success : VectorSaveStatus.fail
                } else {
                    return { ...state }
                }
            })
            .addCase(findSimilarContent.fulfilled, (state, action) => {
                console.log(`findSimilarContent.fulfilled`, action.payload)
                const { status, result, error } = (action.payload as any) || {}
                let onceChatContent = state?.onceChatContent || ``
                if (status && result?.content) {
                    onceChatContent = result.content
                }
                return { ...state, onceChatContent }
            })
            .addCase(getOnceChat.fulfilled, (state, action) => {
                console.log(`getOnceChat.fulfilled`, action.payload)
                const { status, result, error } = (action.payload as any) || {}
                if (!_.isEmpty(result)) {
                    const chatList = original(state)?.chatList || []
                    let newChatList = [...chatList]
                    const answerContent = status && result?.response?.data?.content
                    if (answerContent && newChatList?.length > 0) {
                        newChatList[newChatList.length - 1] = {
                            ...newChatList[newChatList.length - 1],
                            ai: answerContent,
                        }
                    }
                    let onceChatAnswer = answerContent || state?.onceChatAnswer || ``
                    let onceChatStatus = OnceChatStatus.idle
                    return { ...state, onceChatAnswer, onceChatStatus, chatList: newChatList }
                } else {
                    return { ...state }
                }
            })
    },
})

// export actions
export const { updateProductId, updateNameForSpace, updateState } = mainSlice.actions
export default mainSlice.reducer
