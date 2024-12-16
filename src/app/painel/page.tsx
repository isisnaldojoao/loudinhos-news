'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebaseConfig'; 
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"

const db = getFirestore();
const storage = getStorage();

export default function Painel() {
  const [user, setUser] = useState<User | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null); // Estado para armazenar a imagem
  const [imageUrl, setImageUrl] = useState(''); // Estado para armazenar o link da imagem
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login'); // Redireciona para login se não autenticado
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file); // Atualiza o estado com a imagem selecionada
      setImageUrl(''); // Limpa o campo do link de imagem, caso o usuário tenha trocado para upload
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value); // Atualiza o estado com o link da imagem
    setImage(null); // Limpa o campo de imagem caso o usuário tenha colado um link
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault(); // Impede o recarregamento da página

    try {
      // Se houver uma imagem, faz o upload
      let finalImageUrl = imageUrl;
      if (image && !imageUrl) {
        const imageRef = ref(storage, `images/${image.name}`);
        await uploadBytes(imageRef, image);
        finalImageUrl = await getDownloadURL(imageRef); // Usa o URL gerado pelo Firebase Storage
      }

      // Criar o post no Firestore
      const newPost = {
        title: title,
        content: content,
        imageUrl: finalImageUrl, // Adiciona a URL da imagem
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'posts'), newPost);
      console.log('Postagem criada com ID: ', docRef.id);
      setTitle(''); // Limpar os campos após a criação
      setContent('');
      setImage(null); // Limpar a imagem após o envio
      setImageUrl(''); // Limpar o link de imagem após o envio
    } catch (error) {
      console.error('Erro ao criar postagem: ', error);
    }
  };

  if (!user) {
    return <p>Carregando...</p>;
  }

  return (
    <SidebarProvider>
      <AppSidebar userEmail={user?.email ?? 'Email não disponível'} handleLogout={handleLogout} />
      <main className="w-full flex h-screen">
        <SidebarTrigger />
        <div className="w-full h-screen  flex flex-col items-center ">
          <form onSubmit={createPost} className="mt-6 w-full max-w-2xl">
            <h2 className="w-full text-4xl rounded-lg mb-4 uppercase font-bold text-center">Criar postagem</h2>
            <div className="mb-4 w-full">
              <label htmlFor="title" className="block text-left">Título</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título"
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4 w-full">
              <label htmlFor="imageUrl" className="block text-left">URL da Imagem (opcional)</label>
              <input
                id="imageUrl"
                type="text"
                value={imageUrl}
                onChange={handleImageUrlChange}
                placeholder="Cole o link da imagem"
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4 w-full">
              <label htmlFor="content" className="block text-left">Conteúdo</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Digite o conteúdo"
                className="w-full h-[400px] p-2 border rounded"
              />
            </div>
            
            
            <button
              type="submit"
              className="w-full bg-blue-500 rounded-lg text-white py-2 hover:scale-105 transition duration-200"
            >
              Enviar
            </button>
          </form>
        </div>
      </main>
    </SidebarProvider>
  );
}
