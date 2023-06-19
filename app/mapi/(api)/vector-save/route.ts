import _ from 'lodash'
import { NextRequest, NextResponse } from 'next/server'
import { sha256_16bit } from '../../util'
import { getIndex, createIndex, insert, findSimilar, deleteAllVectors } from '../../pinecone/connect'
import { getEmbeddings } from '../../azure/connect'

const openaiPineconeIndex = 'openai'
interface VectorSaveStream extends ReadableStream<Uint8Array> {
    name: string
    contextList: { pageContent: string; metadata: { [index: string]: any } }[]
}
export async function POST(req: NextRequest) {
    const { contextList, name } = (req?.body as VectorSaveStream) || {}
    const sha256_namespace = sha256_16bit(name)

    if (_.isEmpty(contextList)) {
        return NextResponse.json({ satus: -1 })
    }

    // delete first
    await deleteAllVectors({ index: openaiPineconeIndex, namespace: sha256_namespace })

    const chunkContextList = _.chunk(contextList, 5)
    console.log(`🐹🐹🐹chunkDocs total: 🐹🐹🐹`, chunkContextList.length)
    let upsertedTotalCount = 0,
        vectorsTotal = 0
    await Promise.all(
        _.map(chunkContextList, (chunkContext, chunkIndex) => {
            return (async () => {
                const textList = _.map(chunkContext, (ctx: any) => {
                    const { pageContent, metadata } = ctx || {}
                    return pageContent
                })
                const vectors: number[][] = await getEmbeddings({
                    textList,
                })
                vectorsTotal += vectors?.length || 0
                const completedVectors = _.map(vectors, (vector, index: number) => {
                    return {
                        id: `pdf-${chunkIndex}-${index}`,
                        values: vector,
                        metadata: chunkContext[index]?.metadata || {},
                    }
                })
                console.log(`vertors from getEmbeddings completedVectors`, completedVectors)
                let upsertedCount = await insert({
                    index: openaiPineconeIndex,
                    vectors: completedVectors,
                    namespace: sha256_namespace,
                })
                upsertedTotalCount += upsertedCount || 0
            })()
        })
    )

    return NextResponse.json({ upsertedTotalCount, vectorsTotal, namespace: sha256_namespace }, { status: 200 })
}
