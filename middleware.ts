import { NextRequest, NextResponse } from 'next/server'
// import bodyParser from 'body-parser'

// const jsonParser = bodyParser.json();

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
    console.log(`this.is middleware`, request.body)
    
    if(request.method === 'OPTIONS'){
        const response = new NextResponse;
        console.log(`this.is middleware OPTIONS`, request.body)
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return response;
    }
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: '/mapi/:path*',
}