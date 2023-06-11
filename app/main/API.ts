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
    const result: any = await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                chatList: [
                    {
                        ai: '你好人类',
                        human: '你好ai',
                        timestamp: 1629782400000,
                    },
                    {
                        ai: '你好',
                        human: '你好',
                        timestamp: 1629782410000,
                    },
                ],
            })
        }, (sec || 1) * 1000)
    })

    return {
        status: true,
        chatList: result.chatList,
    }
}
