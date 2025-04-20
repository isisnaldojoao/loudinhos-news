'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation'; // Importe o hook useParams
import Link from 'next/link';
import { Clock,Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

import Head from 'next/head'; 

import { Metadata } from 'next'; // Importação do Metadata do Next.js

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: { seconds: number } | null;
  imageUrl: string;
  author: string;
  source:string;
  category: string[];
  writtenFor: string;
  revisedFor: string;
}

type Props = {
  params: { id: string };
};



export default function DetailPost() {
  const params = useParams(); 
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (params?.id && typeof params.id === 'string') { // Certifique-se de que o id está disponível
          const postRef = doc(db, 'posts', params.id); // Busca o post pelo ID
          const postSnapshot = await getDoc(postRef);

          if (postSnapshot.exists()) {
            const postData = postSnapshot.data();
            console.log('Dados do post:', postData);
            setPost({
              id: postSnapshot.id,
              title: postData.title,
              content: postData.content,
              createdAt: postData.createdAt || null,
              imageUrl: postData.imageUrl || '',
              author: postData.author || 'Autor desconhecido', // Garantir que o campo imageUrl seja atribuído
              source:postData.source,
              category: postData.category || [],
              writtenFor: postData.writtenFor || '',
              revisedFor: postData.revisedFor || '',
            });

            document.title = `${postData.title} - Blog`;
          } else {
            setError('Post não encontrado.');
          }
        } else {
          setError('ID do post não fornecido.');
        }
      } catch (err) {
        setError('Erro ao buscar o post.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params]);

  function getAuthor(auth: string){
    const author = auth;
    const authorName = author.split("@")[0];
    return authorName.charAt(0).toUpperCase() + authorName.slice(1);
  }

  function calculateTime(text:String,velocity = 200){
    const textForNews = text.split(/\s+/).length; 
    const timeMinutes = textForNews / velocity; 
    return Math.ceil(timeMinutes);
  }

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };
  

  

  return (
    

    <main className="w-full min-h-screen bg-black">
      {post && (
        <Head>
          <title>{post.title}</title>
          <meta name="description" content={`post.content`} />
          <meta name="keywords" content="loud, loudgg, loudlol, loudvalorant" />
          <meta property="og:title" content={`post.title`} />
          <meta property="og:description" content={`post.content`} />
          <meta property="og:image" content={`post.imageUrl`} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image" content={`post.imageUrl`} />
        </Head>
      )}
     <header 
           style={{
             backgroundImage: "url('https://i.imgur.com/m9cwWY8.png')",
             backgroundSize: "cover",
             backgroundPosition: "center",
           }}
           className="flex flex-col sm:flex-row sm:justify-between  justify-between items-center text-center p-5">
             <Link href={'/'}>
              <img className="w-auto h-8 h-8" src="/logo.png" alt="Logo" />
              </Link>
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
      {post ? (
        <div className="flex flex-col post-details text-white justify-center items-center p-6 rounded-lg">
          <h1 className="text-3xl text-green-600 font-bold mb-4">{post.title}</h1>
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-[700px] h-auto rounded mt-4"
            />
          )}
          {post.source && (
            <p>Reprodução: <strong>{post.source}</strong> </p>
          )}
          <div className='w-full flex flex-col justify-between mt-2'>
            
            <div className='w-full flex justify-between mt-2'>
              <div className='flex-3'>
                  <h1 className='font-bold'>{post.category}</h1>
              </div>
              <div className='flex-2'>
                {post.content && (
                  <p className=" text-sm text-white mb-2"> <strong>
                  {calculateTime(post.content)}
                  {calculateTime(post.content) > 1 ? ' minutos' : ' minuto'} de leitura
                  </strong></p>
                )}
              </div>
            </div>

            <div className='w-full flex items-center'>
              <div className="h-[3px] bg-green-600 w-1/4"></div> 
              <div className="h-px bg-green-300 w-3/4"></div> 
            </div>

          </div>
          
          <p
            className="content"
            dangerouslySetInnerHTML={{
              __html: post.content.replace(/\n/g, '<br />'), 
            }}
          />
          <div className='w-full flex flex-col justify-start'>
            {post.createdAt && (
              <p className="text-sm text-white">
                {' '}
                {new Date(post.createdAt.seconds * 1000).toLocaleDateString()}
              </p>
            )}
            {post.author && (
              <p className=" text-sm text-white mb-2">Por: <strong>{getAuthor(post.author)}</strong></p>
            )}
            {post.writtenFor && (
              <p className=" text-sm text-white mb-2">Escrito: <strong>{post.writtenFor}</strong></p>
            )}
            {post.revisedFor && (
              <p className=" text-sm text-white mb-2">Revisado por: <strong>{post.revisedFor}</strong></p>
            )}
          </div>
        </div>
      ) : (
        <p>Post não encontrado.</p>
      )}
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