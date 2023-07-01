import _ from 'lodash'
import { NextRequest, NextResponse } from 'next/server'
import { sha256_16bit } from '../../util'
import { getIndex, createIndex, insert, findSimilar, deleteAllVectors } from '../../pinecone/connect'
import { getEmbeddings as getEmbeddingsAzure } from '../../azure/connect'
import { inputTokenLimitation } from '../../azure/common'
import { getEmbeddingsFromHfInference as getEmbeddingsHF } from '../../huggingFace/connnect'
import { VectorSaveParams } from '../../interface'
import { openaiPineconeIndex } from '../../pinecone/constants'
import { GPTTokens } from 'gpt-tokens'
const tokenCalcModel = `gpt-3.5-turbo`

interface VectorSaveStream extends ReadableStream<Uint8Array>, VectorSaveParams {}

export async function POST(request: NextRequest) {
    const body: VectorSaveParams = await request.json()
    const resultJson = await vectorSave(body)
    const response = NextResponse.json({ ...resultJson })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
}

const vectorSave = async (params: VectorSaveParams) => {
    const { contextList, name } = params || {}
    const sha256_namespace = sha256_16bit(name)

    if (_.isEmpty(contextList)) {
        return { satus: -1 }
    }

    const chunkedContextList = chunkContextListByTokenLimitation({
        contextList,
        tokenLimitation: inputTokenLimitation.embeddings,
    })
    // delete first
    await deleteAllVectors({ index: openaiPineconeIndex, namespace: sha256_namespace })
    let upsertedTotalCount = 0,
        vectorsTotal = 0
    const textList = _.map(chunkedContextList, (ctx: any) => {
        const { pageContent, metadata } = ctx || {}
        return pageContent
    })
    const vectors: number[][] = await getEmbeddingsAzure({
        textList,
    })
    if (_.isEmpty(vectors)) {
        return { upsertedTotalCount, vectorsTotal, namespace: sha256_namespace }
    }

    vectorsTotal += vectors?.length || 0
    const completedVectors = _.map(vectors, (vector, index: number) => {
        const { pageContent, metadata } = chunkedContextList[index] || {}
        const saveToVectorMetadata = { ...metadata, pageContent }
        return {
            id: `${sha256_namespace}-${index}`,
            values: vector,
            metadata: saveToVectorMetadata,
        }
    })
    console.log(`vertors from getEmbeddings completedVectors`, completedVectors)
    let upsertedCount = await insert({
        index: openaiPineconeIndex,
        vectors: completedVectors,
        namespace: sha256_namespace,
    })
    upsertedTotalCount += upsertedCount || 0

    return { upsertedTotalCount, vectorsTotal, namespace: sha256_namespace, completedVectors }
}

const chunkContextListByTokenLimitation = ({
    contextList,
    tokenLimitation,
}: Pick<VectorSaveParams, 'contextList'> & {
    tokenLimitation: number
}): VectorSaveParams['contextList'] => {
    if (!(tokenLimitation > 0)) {
        return contextList
    }
    try {
        let chunkedContextList: VectorSaveParams['contextList'] = []
        _.map(contextList, (ctx: any) => {
            const { pageContent, metadata } = ctx || {}
            if (pageContent) {
                const pageContentTokenItem = new GPTTokens({
                    messages: [
                        {
                            role: 'system',
                            content: pageContent,
                        },
                    ],
                    model: tokenCalcModel,
                })
                const { usedTokens } = pageContentTokenItem || {}
                console.log(`usedTokens`, usedTokens)
                if (usedTokens <= tokenLimitation) {
                    chunkedContextList.push(ctx)
                } else {
                    const chunkedPageContent = _.chunk(
                        pageContent,
                        Math.floor(pageContent.length / Math.ceil(usedTokens / tokenLimitation))
                    )
                    _.map(chunkedPageContent, (chunkedPageContentItem, index) => {
                        const splitedPageContent = chunkedPageContentItem.join('')
                        const splitedPageContentTokenItem = new GPTTokens({
                            messages: [
                                {
                                    role: 'system',
                                    content: splitedPageContent,
                                },
                            ],
                            model: tokenCalcModel,
                        })
                        chunkedContextList.push({
                            pageContent: splitedPageContent,
                            metadata: {
                                ...metadata,
                                token: splitedPageContentTokenItem?.usedTokens || 0,
                                chunkIndex: index,
                                chunkTotal: chunkedPageContent.length,
                            },
                        })
                    })
                }
            }
        })
        return chunkedContextList
    } catch (e) {
        console.log(`chunkContextListByTokenLimitation error`, e)
    }

    return contextList
}
