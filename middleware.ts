import { NextRequest, NextResponse } from 'next/server'
// import bodyParser from 'body-parser'

// const jsonParser = bodyParser.json();

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest, response: NextResponse) {
    console.log(`this.is middleware`, request.body)
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: '/mapi/:path*',
}