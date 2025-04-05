'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebaseConfig';
import { getFirestore, collection, getDocs, query, orderBy, doc, deleteDoc, limit, startAfter } from 'firebase/firestore';
export const dynamic = "force-dynamic";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function Painel() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [router]);
  useEffect(() => {}, []);



  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');

    toast.success("Logout efetuado com sucesso!");
  };


  if (!user) {
    return <p>Carregando...</p>;
  }

  return (
    <SidebarProvider>
      <AppSidebar userEmail={user?.email ?? 'Email não disponível'} handleLogout={handleLogout} />
      <main className="w-full flex h-screen">
        <SidebarTrigger />
       <div className=' w-full flex flex-col items-center justify-center'>
        <h1 className='font-bold'>Eu ainda não fiz essa funcionalidade... mas eu vou fazer!! aguardem</h1>
        <img width="400px" height="500px" src='https://static.wikia.nocookie.net/40f1aae8-9e27-4b29-bfa4-0a679832bb00/scale-to-width/755' />
       </div>
      </main>
    </SidebarProvider>
  );
}
