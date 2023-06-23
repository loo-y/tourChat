import _ from 'lodash'
import { modelHuggingFaceEmbeddings, modelHuggingFaceInference, modelHuggingFaceRest, embeddingModel } from './common'
// TODO need to setup proxy for HF request

export const getEmbeddingsFromLangchain = async ({
    textList,
    retry,
}: {
    textList: string[]
    retry?: number
}): Promise<number[] | number[][]> => {
    retry = retry === undefined || isNaN(retry) ? 1 : retry
    let response: number[] | number[][] = []
    if (!(retry > 0)) {
        console.log(`getEmbeddingsFromLangchain failed, retry:`, retry)
        return response
    }

    try {
        response = await modelHuggingFaceEmbeddings.embedDocuments(textList)
        console.log(`getEmbeddingsFromLangchain response`, response)
        if (!_.isEmpty(response)) return response
    } catch (e) {
        retry--
        console.log(`getEmbeddingsFromLangchain error, retry`, retry, e)
        return getEmbeddingsFromLangchain({ textList, retry })
    }

    return response
}

export const getEmbeddingsFromHfInference = async ({ textList, retry }: { textList: string[]; retry?: number }) => {
    retry = retry === undefined || isNaN(retry) ? 1 : retry
    let response: number[] | number[][] = []
    if (!(retry > 0)) {
        console.log(`getEmbeddingsFromHfInference failed, retry:`, retry)
        return response
    }

    try {
        response = (await modelHuggingFaceInference.featureExtraction({
            model: embeddingModel.distilbertBaseNliMeanTokens,
            inputs: textList,
        })) as number[] | number[][]

        console.log(`getEmbeddingsFromHfInference response`, response)
        if (!_.isEmpty(response)) return response
    } catch (e) {
        retry--
        console.log(`getEmbeddingsFromHfInference error, retry`, retry, e)
        return getEmbeddingsFromLangchain({ textList, retry })
    }

    return response
}

export const getEmbeddingsFromRestapi = async ({
    textList,
    retry,
}: {
    textList: string[]
    retry?: number
}): Promise<number[] | number[][]> => {
    let response: number[] | number[][] = []
    const { url, params } = modelHuggingFaceRest || {}
    const body = {
        inputs: textList,
    }
    retry = retry === undefined || isNaN(retry) ? 1 : retry
    if (!(retry > 0)) {
        console.log(`getEmbeddingsFromRestapi failed, retry:`, retry)
        return response
    }

    try {
        const responseFetch = await fetch(`${url}${embeddingModel.distilbertBaseNliMeanTokens}`, {
            ...params,
            body: JSON.stringify(body),
        })

        if (responseFetch.status === 503) {
            console.log(`getEmbeddingsFromRestapi 503, retry`, retry)
            // retry--
            return getEmbeddingsFromRestapi({ textList, retry })
        }
        response = await responseFetch.json()
        if (!_.isEmpty(response)) return response
    } catch (e) {
        retry--
        console.log(`getEmbeddingsFromRestapi error, retry`, retry, e)
        return getEmbeddingsFromRestapi({ textList, retry })
    }

    return response
}
