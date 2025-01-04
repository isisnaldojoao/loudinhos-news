'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
export const dynamic = "force-dynamic";
import AOS from 'aos';
import 'aos/dist/aos.css'; 

import Head from 'next/head';  

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
    AOS.init({
      duration: 1000, // Defina a duração da animação
      easing: 'ease-in-out', // Tipo de easing
      once: true, // A animação ocorrerá apenas uma vez
    });
  
    // Limpeza para quando o componente for desmontado
    return () => {
      AOS.refresh(); // Atualiza as animações no caso de mudanças de DOM
    };
  }, []);
  

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
      <title>LOUDinhos</title>
      <Head>
        <meta name="description" content="Site sobre a LOUD e seus conteúdos" />
        <meta name="keywords" content="loud, loudgg, loudlol, loudvalorant" />
        <meta property="og:title" content="LOUDinhos" />
        <meta property="og:description" content="Site sobre a LOUD e seus conteúdos" />
        <meta property="og:image" content={`/loudinhos_news.png`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      
      <header className="flex bg-green-600 justify-center items-center text-center p-5">
        <img className='w-auto h-12'  src='/logo.png' />
      </header>

      {/* Exibição dos favoritos como slide contínuo */}
      <section 
      className="p-4 flex items-center justify-center" 
      data-aos="fade-down">
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-[800px] h-[533px] m-1">
          <Link href={favItems.length > 1 ? favItems[0]?.url : '/'}>
            <img
              className="w-full h-full object-cover"
              src={favItems.length > 1 ? favItems[0]?.image : '/default-image.jpg'}
              alt={favItems.length > 1 ? favItems[0]?.title : 'Imagem padrão'}
            />
            <h2
              className="absolute bottom-0 left-0 w-full p-2 text-white bg-black bg-opacity-50 text-3xl font-bold"
              style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}
            >
              {favItems.length > 1 ? favItems[0]?.title : 'Título padrão'}
            </h2>
          </Link>
        </div>
        <div className="flex flex-col w-full md:w-[400px]">
          <div className="relative w-full h-[260px] m-1">
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
            <div className="relative w-full h-[265px] m-1">
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

      <section className="p-4 flex flex-col items-center justify-center">

        {loading ? (
          <p className="text-center text-white">Carregando...</p>
        ) : (
          <>
            {posts.length > 0 ? (
              <>
                {posts.slice(0, visiblePosts).map((post) => (
                  <div key={post.id} 
                  className="flex flex-col w-full md:w-[1200px] flex post mb-4 p-4 text-white rounded bg-zinc-800"
                  data-aos="fade-up"
                  >
                    <Link className="flex" href={`/posts/${post.id}`}>
                      {post.imageUrl && (
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          style={{width: '200px', height: '150px',objectFit: 'cover'}}
                          className="w-[100px] h-[80px] rounded m-5 sm:w-[250px] sm:h-[150px] sm:w-max-[250px]"
                        />
                      )}
                      <div className="flex flex-col justify-center gap-5  ">
                        <h2 className="sm:text-2xl font-semibold hover:text-green-600">
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
      <footer className='flex flex-col bg-zinc-950 p-5 jusify-center items-center'>
        <img className='w-[100px] h-auto' src='/LOUDINHOS.png' />
        <div className='flex gap-20 my-5'>
          <Link href={'https://www.tiktok.com/@loudinhosofc/'}>
            <img className='bg-zinc-900 rounded-full p-5 cursor-pointer hover:bg-green-600' src='/tiktok.svg'/>
          </Link>
          <Link href={'https://www.instagram.com/loudinhos/'}>
            <img className='bg-zinc-900 rounded-full p-4 cursor-pointer hover:bg-green-600' src='/instagram.svg' />
          </Link>
          <Link href={'https://x.com/loudinhos/'}>
            <img className='bg-zinc-900 rounded-full p-5 cursor-pointer hover:bg-green-600' src='/twitter-x.svg'/>
          </Link>
          
        </div>
      </footer>
    </main>
  );
}
