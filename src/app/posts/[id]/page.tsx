'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation'; // Importe o hook useParams
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: { seconds: number } | null;
  imageUrl: string; // Adiciona o campo imageUrl
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
            setPost({
              id: postSnapshot.id,
              title: postData.title,
              content: postData.content,
              createdAt: postData.createdAt || null,
              imageUrl: postData.imageUrl || '', // Garantir que o campo imageUrl seja atribuído
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

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main className="w-full min-h-screen bg-zinc-900">
      <header className="flex bg-green-600 justify-center items-center text-center p-5">
        <Link href="/">
          <img className='w-auto h-12'  src='/logo.png' />
        </Link>
      </header>
      {post ? (
        <div className="flex flex-col post-details text-white justify-center items-center p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          {post.createdAt && (
            <p className="text-sm text-gray-500">
              Publicado em{' '}
              {new Date(post.createdAt.seconds * 1000).toLocaleDateString()}
            </p>
          )}
          
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-[700px] h-auto rounded mt-4"
            />
          )}
          <p className="w-[800px] text-white mb-4">{post.content}</p>
        </div>
      ) : (
        <p>Post não encontrado.</p>
      )}
    </main>
  );
}
