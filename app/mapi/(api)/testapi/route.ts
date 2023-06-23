import _ from 'lodash'
import { NextRequest, NextResponse } from 'next/server'
import { modelGPT35Turbo, modelTextEmbeddingAda002 } from '../../azure/common'
import { getEmbeddings as azureEmbeddings } from '../../azure/connect'
import { getEmbeddingsFromRestapi as huggingFaceEmbeddings } from '../../huggingFace/connnect'

export async function GET(request: NextRequest) {
    let response: any = undefined
    try {
        response = await huggingFaceEmbeddings({ textList: ['Hello world', 'Bye bye', '我也不知道为什么呀'] })
        // response = await modelTextEmbeddingAda002.embedQuery("I enjoy walking with my cute dog.")
    } catch (e) {
        console.log(`getEmbeddingsFromOpenai error`, e)
    }

    return NextResponse.json({ satus: 0, response }, { status: 200 })
}

export async function POST(request: NextRequest) {
    let response: any = undefined
    try {
        response = await modelTextEmbeddingAda002.embedDocuments(['Hello world', 'Bye bye'])
        // response = await modelTextEmbeddingAda002.embedQuery("I enjoy walking with my cute dog.")
    } catch (e) {
        console.log(`getEmbeddingsFromOpenai error`, e)
    }

    return NextResponse.json({ satus: 0, response }, { status: 200 })
}
