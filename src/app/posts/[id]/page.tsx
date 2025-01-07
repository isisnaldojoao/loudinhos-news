'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation'; // Importe o hook useParams
import Link from 'next/link';

import Head from 'next/head';  

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: { seconds: number } | null;
  imageUrl: string;
  author: string;
  source:string;
}

export default function DetailPost() {
  const params = useParams(); 
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

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
            });
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

  return (
    

    <main className="w-full min-h-screen bg-black">
      {post && (
        <Head>
          <title>{post.title}</title>
          <meta name="description" content={post.content} />
          <meta name="keywords" content="loud, loudgg, loudlol, loudvalorant" />
          <meta property="og:title" content={post.title} />
          <meta property="og:description" content={post.content} />
          <meta property="og:image" content={post.imageUrl} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image" content={post.imageUrl} />
        </Head>
      )}
      <header className="flex bg-green-600 justify-center items-center text-center p-5">
        <Link href="/">
          <img className='w-auto h-12' src='/logo.png' />
        </Link>
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
                  <h1 className='font-bold'>League of Legends</h1>
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
          </div>
        </div>
      ) : (
        <p>Post não encontrado.</p>
      )}
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
