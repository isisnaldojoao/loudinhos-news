'use client';

import  Link  from 'next/link';
export const dynamic = "force-dynamic";

export default function NotFound() {
    return (
        <main className='bw-full min-h-screen bg-zinc-900'>
            <header className="flex bg-green-600 justify-center items-center text-center p-5">
                <Link href="/">
                <img className='w-auto h-12'  src='/logo.png' />
                </Link>
            </header>

            <div className='h-screen flex justify-center items-center'>
                <div className='flex flex-col justify-center items-center'>
                    <h1 className='text-2xl text-white font-bold'>
                        404... A página que você busca não existe
                    </h1>
                    <Link className='bg-green-600 text-white py-2 px-4 rounded transition-all transition-duration-300 hover:scale-105' href={"/"}>
                        Voltar para a home
                    </Link>
                </div>
            </div>
        </main>
    )
}