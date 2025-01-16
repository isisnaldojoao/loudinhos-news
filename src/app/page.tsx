'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';
export const dynamic = "force-dynamic";
import AOS from 'aos';
import 'aos/dist/aos.css'; 
import { Clock,Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

import Head from 'next/head';  

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: { seconds: number };
  imageUrl: string;
  category: string[];
  videoUrl:string;
}

interface FavItem {
  id: string;
  image: string;
  title: string;
  url: string;
  category: string;
  videoUrl:string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [favItems, setFavItems] = useState<FavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

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

  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };



  return (
    <main className="w-full min-h-screen bg-black">
      <title>LOUDinhos</title>
      <Head>
        <meta name="description" content="Site sobre a LOUD e seus conteúdos" />
        <meta name="keywords" content="loud, loudgg, loudlol, loudvalorant" />
        <meta property="og:title" content="LOUDinhos" />
        <meta property="og:description" content="Site sobre a LOUD e seus conteúdos" />
        <meta property="og:image" content={`/loudinhos_news.png`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      
      <header 
      style={{
        backgroundImage: "url('https://i.imgur.com/m9cwWY8.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="flex flex-col sm:flex-row sm:justify-between  items-center text-center p-5">
        <img 
        
        className='w-auto h-8' src='/logo.png' />
        {/* Campo de pesquisa */}
        <section className="p-4 flex justify-center items-center ">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite para buscar..."
            className="p-2 rounded-l-md w-full max-w-md border-none focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-green-700 text-white p-2 rounded-r-md"
          >
            <Search/>
          </button>
        </section>

      {/* ...restante do código */}
      </header>

      {/* Exibição dos favoritos como slide contínuo */}
      <section className="p-4 flex items-center justify-center" data-aos="fade-down">
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-[800px] h-[533px] m-1">
            <Link href={favItems.length > 0 ? favItems[0]?.url : '/'}>
              <img
                className="w-full h-full object-cover"
                src={favItems.length > 0 ? favItems[0]?.image : '/default-image.jpg'}
                alt={favItems.length > 0 ? favItems[0]?.title : 'Imagem padrão'}
              />
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-full p-2 text-white font-bold">
                <span className="text-sm bg-black p-2 border-b-2 border-green-600">
                  {favItems.length > 0 ? favItems[0]?.category : 'Categoria padrão'}
                </span>
                <br />
                <h2 className='mt-2 text-2xl'>
                  {favItems.length > 0 ? favItems[0]?.title : 'Título padrão'}
                </h2>
              </div>
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
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-full p-2 text-white font-bold">
                  <span className="text-sm bg-black p-2 border-b-2 border-green-600">
                    {favItems.length > 1 ? favItems[1]?.category : 'Categoria padrão'}
                  </span>
                  <br />
                  <h2 className='mt-2'>
                    {favItems.length > 1 ? favItems[1]?.title : 'Título padrão'}
                  </h2>
                </div>
              </Link>
            </div>
            <Link href={favItems.length > 2 ? favItems[2]?.url : '/'}>
              <div className="relative w-full h-[265px] m-1">
                <img
                  className="w-full h-full object-cover"
                  src={favItems.length > 2 ? favItems[2]?.image : '/default-image.jpg'}
                  alt={favItems.length > 2 ? favItems[2]?.title : 'Imagem padrão'}
                />
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-full p-2 text-white font-bold">
                  <span className="text-sm bg-black p-2 border-b-2 border-green-600">
                    {favItems.length > 2 ? favItems[2]?.category : 'Categoria padrão'}
                  </span>
                  <br />
                  <h2 className='mt-2'>
                    {favItems.length > 2 ? favItems[2]?.title : 'Título padrão'}
                  </h2>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Exibição das últimas postagens */}
      <section className="p-4 flex flex-col items-center justify-center">
  {loading ? (
    <p className="text-center text-white">Carregando...</p>
  ) : (
    <>
      <h1 className="uppercase text-green-600 m-5 font-bold text-[1.2rem] sm:text-[2.5rem]">
        Confiram nossas últimas postagens
      </h1>

      {/* Versão para Desktop */}
      <div className="hidden md:block">
        {posts.length > 0 ? (
          <>
            {posts
              .filter(post => post.category && !post.category.includes("VIDEOS")) // Verifica se "category" existe e se não é "VIDEOS"
              .slice(0, 2) // Limita a 2 postagens
              .map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col w-full md:w-[1200px] post mb-4 p-4 text-white rounded bg-black border-green-600 border-2"
                  data-aos="fade-up"
                >
                  <Link className="flex" href={`/posts/${post.id}`}>
                    <div className="relative">
                      {post.imageUrl && (
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-[100px] h-[80px] rounded m-5 sm:min-w-[250px] sm:h-[150px] sm:w-max-[250px]"
                        />
                      )}
                      <span className="w-[100px]/4 sm:absolute bottom-0 left-0 p-2 text-sm bg-black text-white border-b-2 border-green-600 m-[30px]">
                        {post.category}
                      </span>
                    </div>
                    <div className="flex flex-col justify-center gap-5">
                      <h2 className="ml-8 text-xs sm:ml-0 sm:text-2xl font-semibold text-green-600">
                        {post.title}
                      </h2>

                      {post.content && (
                        <p className="hidden text-sm text-white sm:line-clamp-3 sm:overflow-hidden">
                          {post.content}
                        </p>
                      )}

                      <div className="flex gap-2 items-center">
                        <p className="flex gap-2 items-center text-sm">
                          <Clock />{' '}
                          {new Date(post.createdAt.seconds * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
          </>
        ) : (
          <p className="text-center text-white">Nenhuma postagem encontrada.</p>
        )}
      </div>

      {/* Versão para Mobile */}
      <div className="block md:hidden">
        {posts.length > 0 ? (
          <>
            {posts
              .filter(post => post.category && !post.category.includes("VIDEOS")) // Verifica se "category" existe e se não é "VIDEOS"
              .slice(0, 2) // Limita a 2 postagens
              .map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col w-full post mb-4 p-4 text-white rounded bg-black border-green-500 border"
                  data-aos="fade-up"
                >
                  <Link className="flex flex-col" href={`/posts/${post.id}`}>
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-[150px] object-cover rounded mb-4"
                      />
                    )}
                    <h2 className="text-lg font-semibold text-green-500 mb-2">
                      {post.title}
                    </h2>
                    {post.content && (
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {post.content}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <p className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <span className="w-full sm:absolute bottom-0 left-0 p-2 text-sm bg-black text-green-600 ">
                          {post.category}
                        </span>
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
          </>
        ) : (
          <p className="text-center text-white">Nenhuma postagem encontrada.</p>
        )}
      </div>
    </>
  )}
</section>


        <section className="w-full p-4 flex items-center justify-center min-h-screen">
  <div className="w-full sm:w-[1200px] flex flex-col items-center justify-center">
    {loading ? (
      <p className="text-center text-white">Carregando...</p>
    ) : (
      <>
        <div className="w-full sm:w-[1200px] flex justify-between mt-2">
          <div className="flex-3">
            <h1 className="uppercase text-green-600 m-5 font-bold text-[1.2rem] sm:text-[2.5rem]">NOSSOS VIDEOS</h1>
          </div>
          <div className="flex-2">
            <p className="text-sm text-white mb-2">
              <strong></strong>
            </p>
          </div>
        </div>

        <div className="w-full sm:w-[1200px] flex items-center">
          <div className="h-[3px] bg-green-600 w-1/4"></div>
          <div className="h-px bg-green-300 w-3/4"></div>
        </div>

        {posts.length > 0 ? (
          <>
            <div className="flex sm:flex-row flex-col">
              {posts
                .filter((post) => post.category && post.category.includes("VIDEOS")) // Filtragem por categoria
                .slice(0, 2) // Limita a exibição a duas postagens
                .map((post) => (
                  <div
                    key={post.id}
                    className="flex flex-col w-full p-4 text-white rounded bg-black"
                    data-aos="fade-up"
                  >
                    <Link href={post.videoUrl ? post.videoUrl : "/"} passHref>
                      <div className="flex flex-col w-full p-4 text-white rounded bg-black">
                        <div className="relative">
                          {post.imageUrl && (
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-3/4 h-auto sm:w-[450px] sm:h-[250px] rounded m-5 object-cover"
                            />
                          )}
                          <span className="absolute bottom-[50px] left-[40px] p-2 text-sm bg-black text-white border-b-2 border-green-600">
                            {post.category}
                          </span>
                        </div>
                        <div className="ml-3">
                          <h2 className="text-xl font-bold">{post.title}</h2>
                        </div>
                      </div>
                    </Link>

                  </div>
                ))}
            </div>
          </>
        ) : (
          <p className="text-center text-white">Nenhum post encontrado.</p>
        )}
      </>
    )}
  </div>
</section>



      <footer className='flex flex-col sm:flex-row sm:justify-between bg-zinc-950 p-5  items-center'>
        <img className='w-[150px]  h-[25px] mr-5' src='/logo.png' />
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
