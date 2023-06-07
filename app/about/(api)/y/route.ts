import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const data = { text: 'Hello World!' }

    return NextResponse.json({ data })
}

export async function POST(request: Request) {
    const data = { text: 'Hello World!' }

    return NextResponse.json({ data })
}
