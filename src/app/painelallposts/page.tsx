'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebaseConfig'; 
import { getFirestore, collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"

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
  collection: 'fav1' | 'fav2' | 'fav3'; // Adicionando uma propriedade para a coleção
}

export default function Painel() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]); 
  const [favItems, setFavItems] = useState<FavItem[]>([]); // Para armazenar os favoritos
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchPostsAndFavs = async () => {
      try {
        // Fetch posts
        const postQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const postSnapshot = await getDocs(postQuery);
        const postsList: Post[] = [];
        postSnapshot.forEach((doc) => {
          postsList.push({ id: doc.id, ...doc.data() } as Post);
        });

        setPosts(postsList);

        // Fetch favoritos
        const favCollections: ('fav1' | 'fav2' | 'fav3')[] = ['fav1', 'fav2', 'fav3'];
        const favItemsList: FavItem[] = [];

        for (const favCollection of favCollections) {
          const favSnapshot = await getDocs(collection(db, favCollection));
          if (!favSnapshot.empty) {
            favSnapshot.forEach((doc) => {
              favItemsList.push({ id: doc.id, ...doc.data(), collection: favCollection } as FavItem);
            });
          }
        }

        setFavItems(favItemsList);
      } catch (error) {
        console.error('Erro ao buscar dados: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostsAndFavs();
  }, []); 

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const deletePost = async (id: string) => {
    try {
      const postRef = doc(db, 'posts', id);
      await deleteDoc(postRef);
      setPosts(posts.filter(post => post.id !== id)); // Atualiza a lista localmente
    } catch (error) {
      console.error('Erro ao deletar post: ', error);
    }
  };

  const deleteFav = async (id: string, collectionName: 'fav1' | 'fav2' | 'fav3') => {
    try {
      const favRef = doc(db, collectionName, id);
      await deleteDoc(favRef);
      setFavItems(favItems.filter(fav => fav.id !== id)); // Atualiza a lista localmente
    } catch (error) {
      console.error('Erro ao deletar favorito: ', error);
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
            
            {loading ? (
              <p>Carregando...</p>
            ) : (
              <div>
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <div key={post.id} className="post mb-4 p-4 border rounded">
                      <h2 className="text-2xl font-semibold">{post.title}</h2>
                      <p>{post.content}</p>
                      <p className="text-sm text-gray-500">
                        Publicado em {new Date(post.createdAt.seconds * 1000).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => deletePost(post.id)}
                        className="mt-2 bg-red-500 text-white py-1 px-4 rounded hover:bg-red-600"
                      >
                        Deletar
                      </button>
                    </div>
                  ))
                ) : (
                  <p>Nenhum post encontrado</p>
                )}

                
              </div>
            )}
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}
