import { modelTextEmbeddingAda002 } from './common'
import _ from 'lodash'
import * as dotenv from 'dotenv'
dotenv.config()

export const getEmbeddings = async ({
    textList,
    retry,
}: {
    textList: string[]
    retry?: number
}): Promise<number[][]> => {
    retry = !retry || isNaN(retry) ? 3 : retry
    if (!(retry > 0)) {
        console.log(`getEmbeddings failed, retry:`, retry)
        return []
    }

    try {
        const response = await modelTextEmbeddingAda002.embedDocuments(textList)

        if (!_.isEmpty(response)) return response
    } catch (e) {
        retry--
        console.log(`getEmbeddingsFromOpenai error, retry`, retry)
        return getEmbeddings({ textList, retry })
    }

    return []
}
