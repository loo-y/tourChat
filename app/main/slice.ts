import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { AppState, AppThunk } from '../store'
import * as API from './API'
import { fetchCount } from './API'
import { MainState } from './interface'
import _ from 'lodash'
import type { AsyncThunk } from '@reduxjs/toolkit'

// define a queue to store api request
type APIFunc = (typeof API)[keyof typeof API]
type APIFuncName = keyof typeof API
export const getMainState = (state: AppState) => state.main

type RequestCombo = {
    apiRequest: APIFunc
    asyncThunk?: AsyncThunk<any, any, any>
}
const apiRequestQueue: Array<RequestCombo> = []
// define a thunk action to wrap api request
export const makeApiRequestInQueue = createAsyncThunk(
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
    chatList: [],
}

export const mainSlice = createSlice({
    name: 'mainSlice',
    initialState,
    reducers: {
        setRequestInQueueFetching: (state, action: PayloadAction<boolean>) => {
            state.requestInQueueFetching = action.payload
        },
    },
    extraReducers: builder => {},
})

export default mainSlice.reducer
