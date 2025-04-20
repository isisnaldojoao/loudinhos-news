'use client';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';	
import { auth } from '@/lib/firebaseConfig';
export const dynamic = "force-dynamic";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async(e: React.FormEvent)=>{
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth,email,password);
            router.push('/painel');
            toast.success("Login Efetuado com sucesso!");
        }catch(error){
            console.log('Erro ao logar',error);
            alert('Falha no login.Email ou senha errados')
        }
    };

    return(
        <main className="flex justify-center items-center h-screen">
            <form 
            onSubmit={handleLogin}
            className="flex flex-col w-full max-w-md items-center">
                <h1 className="text-2xl font-bold mb-4">Login</h1>
                <div className="w-full px-4">
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email:</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e)=> setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    required
                />
                <label htmlFor="password" className="block text-sm font-medium mb-1">Password:</label>
                <input
                    id="password"
                    type="password"
                    onChange={(e)=> setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    required
                />
                <button 
                type='submit'
                className="w-full py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 focus:ring-2 focus:ring-blue-400">
                    Entrar
                </button>
                </div>
            </form>
        </main>

    )
}