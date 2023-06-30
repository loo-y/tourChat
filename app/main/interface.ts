export * from '../mapi/interface'

export interface MainState {
    chatList: ChatItem[]
    productId: number
    requestInQueueFetching: boolean
    onceChatContent?: string
}

export interface ChatItem {
    ai: string
    human: string
    timestamp: number
}
