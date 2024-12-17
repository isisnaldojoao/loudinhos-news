'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Import para acessar os parâmetros da URL
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../../lib/firebaseConfig'; 
import { getFirestore, doc, getDoc, updateDoc, addDoc, serverTimestamp, collection } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

const db = getFirestore();
const storage = getStorage();

export default function PostForm() {
  const [user, setUser] = useState<User | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams(); // Para acessar o `postId` na URL
  const postId = searchParams.get('postId'); // Obtém o `postId` da URL

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

  // Carrega os dados do post para edição, se `postId` existir
  useEffect(() => {
    if (postId) {
      setIsEditing(true);
      const fetchPost = async () => {
        try {
          const docRef = doc(db, 'posts', postId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const postData = docSnap.data();
            setTitle(postData.title);
            setContent(postData.content);
            setImageUrl(postData.imageUrl || '');
          } else {
            console.error('Post não encontrado!');
          }
        } catch (error) {
          console.error('Erro ao carregar o post: ', error);
        }
      };

      fetchPost();
    }
  }, [postId]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImageUrl('');
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setImage(null);
  };

  const savePost = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let finalImageUrl = imageUrl;
      if (image && !imageUrl) {
        const imageRef = ref(storage, `images/${image.name}`);
        await uploadBytes(imageRef, image);
        finalImageUrl = await getDownloadURL(imageRef);
      }

      if (isEditing && postId) {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          title,
          content,
          imageUrl: finalImageUrl,
        });
        console.log('Postagem atualizada!');
        setTitle('');
        setContent('');
        setImageUrl('');
      } else {
        const newPost = {
          title,
          content,
          imageUrl: finalImageUrl,
          createdAt: serverTimestamp(),
        };
        setTitle('');
        setContent('');
        setImageUrl('');
        const docRef = await addDoc(collection(db, 'posts'), newPost);
        console.log('Postagem criada com ID: ', docRef.id);
      }

      router.push('/painel');
    } catch (error) {
      console.error('Erro ao salvar postagem: ', error);
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
        <div className="w-full h-screen flex flex-col items-center">
          <form onSubmit={savePost} className="mt-6 w-full max-w-2xl">
            <h2 className="w-full text-4xl rounded-lg mb-4  font-bold text-center">
              {isEditing ? 'Editar Postagem' : 'Criar Postagem'}
            </h2>
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
              {isEditing ? 'Salvar Alterações' : 'Enviar'}
            </button>
          </form>
        </div>
      </main>
    </SidebarProvider>
  );
}
