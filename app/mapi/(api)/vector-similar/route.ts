import _ from 'lodash'
import { NextRequest, NextResponse } from 'next/server'
import { VectorSimilarParams } from '../../interface'
import { getEmbeddings } from '../../azure/connect'
import { findSimilar } from '../../pinecone/connect'
import { openaiPineconeIndex } from '../../pinecone/constants'
import { sha256_16bit } from '../../util'

export async function POST(request: NextRequest) {
    const body: VectorSimilarParams = await request.json()
    const resultJson = await vectorSimilar({ ...body })
    const response = NextResponse.json({ ...resultJson })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
}
const defaultLimitScore = 0.1
const vectorSimilar = async (body: VectorSimilarParams) => {
    const { text, name, topK } = body || {}
    const namespace = sha256_16bit(name)
    const limitScore = body?.score || defaultLimitScore
    const returnResuslt = {
        status: -1,
        error: {
            message: ``,
        },
    }
    if (!text || !namespace)
        return {
            ...returnResuslt,
            error: {
                ...returnResuslt.error,
                message: `text or namespace is requried.`,
            },
        }

    const queryVectors = await getEmbeddings({
        textList: [text],
    })
    const queryVector = queryVectors?.[0]
    if (_.isEmpty(queryVector)) {
        return {
            ...returnResuslt,
            error: {
                ...returnResuslt.error,
                message: `fail to get query vector`,
            },
        }
    }

    const result = await findSimilar({
        index: openaiPineconeIndex,
        namespace,
        vector: queryVector,
        topK,
    })
    console.log(`similar result,`, namespace, result)

    if (_.isEmpty(result?.[0])) {
        console.log(`is empty`, returnResuslt)
        return {
            ...returnResuslt,
            error: {
                ...returnResuslt.error,
                message: `there is no result.`,
            },
            result,
        }
    }
    console.log(`🐹🐹🐹original result🐹🐹🐹`, result)

    const getAllContentOverScore = _.compact(
        _.map(result, r => {
            const { metadata, score } = r || {}
            if (score > limitScore && metadata?.pageContent) {
                return metadata.pageContent
            } else {
                return null
            }
        })
    )

    console.log(`getAllContentOverScore`, getAllContentOverScore)
    if (!getAllContentOverScore?.length) {
        return {
            ...returnResuslt,
            error: {
                ...returnResuslt.error,
                message: `there is no similar content over`,
            },
            result,
        }
    }

    return {
        status: 0,
        content: getAllContentOverScore.join('\n'),
    }
}
