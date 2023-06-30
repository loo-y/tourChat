import { NextRequest, NextResponse } from 'next/server'
import { PaLMCall } from '../../PaLM/connect'

export async function GET(request: NextRequest) {
    const resultJson = await chat()
    const response = NextResponse.json({ ...resultJson })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
}

export async function POST(request: NextRequest) {
    const resultJson = await chat()
    const response = NextResponse.json({ ...resultJson })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
}

const chat = async () => {
    const result = await PaLMCall()
    return result
}
