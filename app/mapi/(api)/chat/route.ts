import { NextRequest, NextResponse } from 'next/server'
import { PaLMCall } from '../../palm/common'

export async function GET(request: NextRequest) {
    const result = await PaLMCall()
    return NextResponse.json({ ...result })
}

export async function POST(request: NextRequest) {
    const result = await PaLMCall()
    return NextResponse.json({ ...result })
}
