export * from '../mapi/interface'

export interface MainState {
    chatList: ChatItem[]
    requestInQueueFetching: boolean
}

export interface ChatItem {
    ai: string
    human: string
    timestamp: number
}
