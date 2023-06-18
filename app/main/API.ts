import Cookie from 'universal-cookie'
import _ from 'lodash'

const commonOptions = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
}

export const fetchCount = async (amount = 1): Promise<{ data: number }> => {
    const response = await fetch('/api/counter', {
        ...commonOptions,
        body: JSON.stringify({ amount }),
    })
    const result = await response.json()

    return result
}

export const fetchChatList = async (sec: number) => {
    const result: any = await fetch('http://localhost:3000/mapi/chat', { mode: 'no-cors' })
    const resultJson = await result.json()
    return {
        status: true,
        chatList: resultJson,
    }
}
