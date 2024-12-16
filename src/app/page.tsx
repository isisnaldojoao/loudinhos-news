'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: { seconds: number };
  imageUrl: string;
}

interface FavItem {
  id: string;
  image: string;
  title: string;
  url: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [favItems, setFavItems] = useState<FavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [visiblePosts, setVisiblePosts] = useState(10);
  const [currentFavIndex, setCurrentFavIndex] = useState(0);

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
        const favCollections = ['fav1', 'fav2', 'fav3']; // Atualize conforme necessário
        const favItemsList: FavItem[] = [];

        for (const favCollection of favCollections) {
          const favSnapshot = await getDocs(collection(db, favCollection));
          favSnapshot.forEach((doc) => {
            // Prefixar o ID com o nome da coleção para evitar duplicação
            favItemsList.push({ id: `${favCollection}_${doc.id}`, ...doc.data() } as FavItem);
          });
        }

        setFavItems(favItemsList);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostsAndFavs();
  }, []);


  const handleShowMore = () => {
    setVisiblePosts((prev) => prev + 10);
  };

  return (
    <main className="w-full min-h-screen bg-zinc-900">
      <header className="flex bg-green-600 justify-center items-center text-center p-5">
        <img className='w-auto h-12'  src='/logo.png' />
      </header>

      {/* Exibição dos favoritos como slide contínuo */}
      <section className="p-4 flex items-center justify-center">
      
        <div className='flex'>
          <div className="relative w-[800px] h-[533px] m-1">
            <Link href={favItems.length > 1 ? favItems[0]?.url : '/'}>
              <img
                className="w-full h-full object-cover"
                src={favItems.length > 1 ? favItems[0]?.image : '/default-image.jpg'}
                alt={favItems.length > 1 ? favItems[0]?.title : 'Imagem padrão'}
              />
              <h2 className="absolute bottom-0 left-0 w-full p-2 text-white bg-black bg-opacity-50 text-3xl font-bold" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
                {favItems.length > 1 ? favItems[0]?.title : 'Título padrão'}
              </h2>
            </Link>
            </div>
            <div className='flex flex-col'>
            <div className="relative w-[400px] h-[260px] m-1">
            <Link href={favItems.length > 1 ? favItems[1]?.url : '/'}>
              <img
                className="w-full h-full object-cover"
                src={favItems.length > 1 ? favItems[1]?.image : '/default-image.jpg'}
                alt={favItems.length > 1 ? favItems[1]?.title : 'Imagem padrão'}
              />
              <h2 className="absolute bottom-0 left-0 w-full p-2 text-white bg-black bg-opacity-50 font-bold">
                {favItems.length > 1 ? favItems[1]?.title : 'Título padrão'}
              </h2>
            </Link>
            </div>
            <Link href={favItems.length > 1 ? favItems[2]?.url : '/'}>
              <div className="relative w-[400px] h-[265px] m-1">
              <img
                className="w-full h-full object-cover"
                src={favItems.length > 1 ? favItems[2]?.image : '/default-image.jpg'}
                alt={favItems.length > 1 ? favItems[2]?.title : 'Imagem padrão'}
              />
              <h2 className="absolute bottom-0 left-0 w-full p-2 text-white bg-black bg-opacity-50 font-bold">
                {favItems.length > 1 ? favItems[2]?.title : 'Título padrão'}
              </h2>
              
            </div>
            </Link>
            </div>
        </div>
      </section>

      <section className="p-4">
        <h1 className="text-3xl font-bold text-center text-white mb-4">Últimas postagens</h1>
        {loading ? (
          <p className="text-center text-white">Carregando...</p>
        ) : (
          <>
            {posts.length > 0 ? (
              <>
                {posts.slice(0, visiblePosts).map((post) => (
                  <div key={post.id} className="post mb-4 p-4 text-white rounded bg-zinc-800">
                    <Link className="flex" href={`/posts/${post.id}`}>
                      {post.imageUrl && (
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-[300px] h-[200px] rounded m-5"
                        />
                      )}
                      <div className="flex flex-col justify-between mt-4">
                        <h2 className="text-2xl font-semibold hover:text-green-600">
                          {post.title}
                        </h2>
                        <p className="text-sm">
                          Publicado em{' '}
                          {new Date(post.createdAt.seconds * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}

                {visiblePosts < posts.length && (
                  <div className="text-center mt-4">
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      onClick={handleShowMore}
                    >
                      Mostrar mais
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-white">Nenhum post encontrado.</p>
            )}
          </>
        )}
      </section>
    </main>
  );
}
