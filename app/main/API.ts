/// <reference lib="dom" />
import Cookie from 'universal-cookie'
import _ from 'lodash'
import { VectorSaveParams, VectorSimilarParams, QuizParams } from './interface'
import { API_BASE_URL, defaultLimitScore, defaultTopK } from './constants'

const commonOptions: Partial<RequestInit> = {
    method: 'POST',
    // mode: 'no-cors',
    headers: {
        'Content-Type': 'application/json',
    },
}
const apiBaseUrl = `${API_BASE_URL.PROTOCAL}${API_BASE_URL.HOST}:${API_BASE_URL.PORT}`

export const fetchCount = async (amount = 1): Promise<{ data: number }> => {
    const response = await fetch('/api/counter', {
        ...commonOptions,
        body: JSON.stringify({ amount }),
    })
    const result = await response.json()

    return result
}

export const fetchChatList = async (sec: number) => {
    const url = `${apiBaseUrl}/mapi/chat?sec=${sec}`
    const result: any = await fetch(url, { ...commonOptions })

    const resultJson = await result.json()
    return {
        status: true,
        chatList: resultJson,
    }
}

export const fetchVectorSave = async ({ contextList, name }: VectorSaveParams) => {
    const url = `${apiBaseUrl}/mapi/vector-save`
    try {
        const result: any = await fetch(url, {
            ...commonOptions,
            body: JSON.stringify({ contextList, name }),
        })

        const resultJson = await result.json()
        return {
            status: true,
            result: resultJson,
        }
    } catch (e) {
        return {
            status: false,
            error: e,
        }
    }
}

export const fetchVectorSimlar = async ({ text, name, score, topK }: VectorSimilarParams) => {
    const url = `${apiBaseUrl}/mapi/vector-similar`
    try {
        const result: any = await fetch(url, {
            ...commonOptions,
            body: JSON.stringify({ text, name, score: score || defaultLimitScore, topK: topK || defaultTopK }),
        })
        const resultJson = await result.json()
        return {
            status: true,
            result: resultJson,
        }
    } catch (e) {
        return {
            status: false,
            error: e,
        }
    }
}

export const fetchOnceChat = async ({ content, question }: QuizParams) => {
    const url = `${apiBaseUrl}/mapi/quiz`
    try {
        const result: any = await fetch(url, {
            ...commonOptions,
            body: JSON.stringify({ content, question }),
        })

        const resultJson = await result.json()
        return {
            status: true,
            result: resultJson,
        }
    } catch (e) {
        return {
            status: false,
            error: e,
        }
    }
}
