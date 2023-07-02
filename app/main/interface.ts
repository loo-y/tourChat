export * from '../mapi/interface'

export interface MainState {
    chatList: ChatItem[]
    productId: number
    requestInQueueFetching: boolean
    onceChatContent?: string
    nameForSpace: string
    onceChatAnswer: string
    vetcorSaveStatus: VectorSaveStatus
    onceChatStatus: OnceChatStatus
}

export enum OnceChatStatus {
    loading = 'onceChatStatus_loading',
    idle = 'onceChatStatus_idle',
}
export enum VectorSaveStatus {
    loading = 'vectorSaveStatus_loading',
    success = 'vectorSaveStatus_success',
    fail = 'vectorSaveStatus_fail',
    unset = 'vectorSaveStatus_unset',
}
export interface ChatItem {
    ai: string
    human: string
    timestamp: number
}
