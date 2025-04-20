

import { NextRequest, NextResponse } from "next/server";
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig';


export function middleware(request: NextRequest){

    //const authenticade = request.cookies.get('authToken');

    //if(request.nextUrl.pathname.startsWith('/painel') && !authenticade){
        //return NextResponse.redirect(new URL('/login', request.url));
    //}

    //return NextResponse.next();
}