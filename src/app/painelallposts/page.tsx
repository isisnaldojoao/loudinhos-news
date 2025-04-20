'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebaseConfig';
import { getFirestore, collection, getDocs, query, orderBy, doc, deleteDoc, limit, startAfter } from 'firebase/firestore';
export const dynamic = "force-dynamic";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

import { Trash,Pencil } from "lucide-react";


import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const db = getFirestore();

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: { seconds: number };
}

interface FavItem {
  id: string;
  image: string;
  title: string;
  url: string;
  collection: 'fav1' | 'fav2' | 'fav3';
}

export default function Painel() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null); // Para armazenar o último documento carregado
  const [hasMore, setHasMore] = useState(true); // Indica se há mais posts para carregar
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (isLoadMore = false) => {
    try {
      setLoading(true);

      let postQuery;
      if (isLoadMore && lastDoc) {
        postQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc), // Começa após o último documento
          limit(10)
        );
      } else {
        postQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
      }

      const postSnapshot = await getDocs(postQuery);
      const postsList: Post[] = [];
      postSnapshot.forEach((doc) => {
        postsList.push({ id: doc.id, ...doc.data() } as Post);
      });

      if (isLoadMore) {
        setPosts((prevPosts) => [...prevPosts, ...postsList]); // Adiciona aos posts existentes
      } else {
        setPosts(postsList); // Define os posts iniciais
      }

      // Atualiza o último documento carregado
      if (!postSnapshot.empty) {
        setLastDoc(postSnapshot.docs[postSnapshot.docs.length - 1]);
      }

      // Verifica se há mais documentos para carregar
      setHasMore(!postSnapshot.empty && postSnapshot.docs.length === 10);
    } catch (error) {
      console.error('Erro ao buscar posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');

    toast.success("Logout efetuado com sucesso!");
  };

  const deletePost = async (id: string) => {
    try {
      const postRef = doc(db, 'posts', id);
      await deleteDoc(postRef);
      setPosts(posts.filter(post => post.id !== id));
      toast.success("Postagem excluida com sucesso!");
    } catch (error) {
      console.error('Erro ao deletar post:', error);
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
          <div className="container mt-8">
            <h1 className="text-3xl font-bold text-center my-4">Últimas Postagens</h1>
            {loading && posts.length === 0 ? (
              <p>Carregando...</p>
            ) : (
              <div>
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <div key={post.id} className="post mb-4 p-4 border rounded">
                      <h2 className="text-2xl font-semibold">{post.title}</h2>
                      <p className="clamp-2 text-ellipsis">{post.content}</p>
                      <p className="text-sm text-gray-500">
                        Publicado em {new Date(post.createdAt.seconds * 1000).toLocaleDateString()}
                      </p>
                      <div className='flex items-center gap-2 py-2'>
                        <button
                          onClick={() => deletePost(post.id)}
                          className="flex justify-center h-10 items-center w-[150px]  mt-2 bg-red-500 text-white  rounded hover:bg-red-600"
                        >
                          Deletar
                          <Trash/>
                        </button>
                        <button
                          onClick={() => router.push(`/painel?postId=${post.id}`)}
                          className="flex justify-center h-10 items-center w-[150px] mt-2  bg-blue-500 text-white  rounded hover:bg-blue-600"
                        >
                          Editar
                          <Pencil/>
                        </button>
                      </div>
                      
                    </div>
                  ))
                ) : (
                  <p>Nenhum post encontrado</p>
                )}
                {hasMore && (
                  <button
                    onClick={() => fetchPosts(true)} // Chama o fetch com isLoadMore = true
                    className="mt-4 bg-green-500 text-white py-2 px-6 rounded hover:bg-gray-600"
                  >
                    Mostrar Mais
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}
