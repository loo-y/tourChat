import _ from 'lodash'
import { NextRequest, NextResponse } from 'next/server'
import { modelChatGPT35Turbo, modelTextDavinci003 } from '../../azure/common'
import { HumanChatMessage, SystemChatMessage } from 'langchain/schema'

export async function GET(request: NextRequest) {
    let response: any = undefined
    const { searchParams } = new URL(request.url)
    const content = searchParams.get('content') || ``
    const question = searchParams.get('question') || ``
    const responseJson = await quiz({
        content,
        question,
    })
    return NextResponse.json(responseJson, { status: 200 })
}

export async function POST(request: NextRequest) {
    const body = await request.json()
    const { content, question } = body || {}
    const responseJson = await quiz({
        content,
        question,
    })
    const response = NextResponse.json({ ...responseJson })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
}

const quiz = async ({ content, question }: { content: string; question: string }) => {
    let status = -1
    let response: any = undefined
    if (!content || !question) {
        return {
            status,
            errorInfo: {
                message: 'content or question is empty',
            },
        }
    }

    const systemMessage =
        new SystemChatMessage(`You are a helpful assistant. Answer the question as truthfully as possible using the provided text, and if the answer is not contained within the text below, say "I don't know". if answer is English, translate it in Chinese.

    Context:
    ${content}`)

    try {
        response = await modelChatGPT35Turbo.call([systemMessage, new HumanChatMessage(question)])
        status = 0
    } catch (e) {
        console.log(`getEmbeddingsFromOpenai error`, e)
    }

    return {
        response,
        status,
    }
}
