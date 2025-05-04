'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, Search as SearchIcon } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: { seconds: number };
  imageUrl: string;
  category: string[];
  videoUrl: string;
}

export default function Search() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('q') || '';
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [visibleCount, setVisibleCount] = useState(5); // Número inicial de posts visíveis
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      if (!searchTerm) return;

      try {
        const postSnapshot = await getDocs(collection(db, 'posts'));
        const results: Post[] = [];
        postSnapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() } as Post);
        });

        setPosts(results);
      } catch (error) {
        console.error('Erro ao buscar posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm) {
      document.title = `${searchTerm}`;  // Atualiza o título da página
    } else {
      document.title = "Pesquisar";  // Título padrão quando não há termo de pesquisa
    }
  }, [searchTerm]);  // O título será atualizado sempre que searchTerm mudar

  const handleSearch = () => {
    if (localSearchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(localSearchTerm)}`);
    }
  };

  const showMorePosts = () => {
    setVisibleCount((prev) => prev + 5); // Aumenta o limite em 5
  };

  // Filtro local para busca por termo no título (independente de onde está)
  const filteredPosts = posts.filter((post) =>
    post.title && post.title.toLowerCase().includes(localSearchTerm.toLowerCase())
  );

  return (
    <main className="w-full min-h-screen bg-black flex flex-col">
      <header
        style={{
          backgroundImage: "url('https://i.imgur.com/m9cwWY8.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="flex flex-col sm:flex-row sm:justify-between items-center text-center p-5"
      >
        <Link href={'/'}>
          <img className="w-auto h-12" src="/logo.png" alt="Logo" />
        </Link>

        <section className="p-4 flex justify-center items-center">
          <input
            type="text"
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            placeholder="Digite para buscar..."
            className="p-2 rounded-l-md w-full max-w-md border-none focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-green-700 text-white p-2 rounded-r-md"
          >
            <SearchIcon />
          </button>
        </section>
      </header>

      <h1 className="text-white text-center text-2xl m-4">Resultados para: "{localSearchTerm}"</h1>
      {loading ? (
        <p className="text-white">Carregando...</p>
      ) : filteredPosts.length > 0 ? (
        <div className="p-4 flex flex-col items-center justify-center flex-grow">
          {/* Versão Desktop */}
          <div className="hidden md:block">
            {filteredPosts.slice(0, visibleCount).map((post) => (
              <div
                key={post.id}
                className="flex flex-col w-full md:w-[1200px] flex post mb-4 p-4 text-white rounded bg-black border-green-600 border-2"
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
                    <span className="absolute bottom-0 left-0 p-2 text-sm bg-black text-white border-b-2 border-green-600 m-[50px]">
                      {post.category}
                    </span>
                  </div>
                  <div className="flex flex-col justify-center gap-5">
                    <h2 className="sm:text-2xl font-semibold text-green-600">{post.title}</h2>

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
          </div>

          {/* Versão Mobile */}
          <div className="block md:hidden">
            {filteredPosts.slice(0, visibleCount).map((post) => (
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
          </div>

          {visibleCount < filteredPosts.length && (
            <button
              onClick={showMorePosts}
              className="bg-green-700 text-white p-2 rounded mt-4"
            >
              Mostrar Mais
            </button>
          )}
        </div>
      ) : (
        <p className="text-white">Nenhum resultado encontrado.</p>
      )}
      <footer className="flex flex-col sm:flex-row sm:justify-between bg-zinc-950 p-5 items-center mt-auto">
        <img className="w-[150px] h-[25px] mr-5" src="/logo.png" />
        <div className="flex gap-20 my-5">
          <Link href={"https://www.tiktok.com/@loudinhosofc/"}>
            <img className="bg-zinc-900 rounded-full p-5 cursor-pointer hover:bg-green-600" src="/tiktok.svg" />
          </Link>
          <Link href={"https://www.instagram.com/loudinhos/"}>
            <img className="bg-zinc-900 rounded-full p-4 cursor-pointer hover:bg-green-600" src="/instagram.svg" />
          </Link>
          <Link href={"https://x.com/loudinhos/"}>
            <img className="bg-zinc-900 rounded-full p-5 cursor-pointer hover:bg-green-600" src="/twitter-x.svg" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
