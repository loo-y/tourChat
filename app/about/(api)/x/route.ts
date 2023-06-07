import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const data = { text: 'Hello World!' }

    return NextResponse.json({ data })
}
