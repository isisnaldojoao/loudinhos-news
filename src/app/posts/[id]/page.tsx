
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { format } from 'date-fns';
import Head from 'next/head';


interface Post {
    title: string;
    content: string;
    imageUrl: string;
    createdAt: { seconds: number } | null;
    author: string;
    source: string;
    category: string[];
    writtenFor: string;
    revisedFor: string;
}

// Definindo tipos corretos para parâmetros assíncronos
interface Params {
    id: string;
}

// Função auxiliar para formatação do nome do autor
function getAuthor(auth: string) {
    const authorName = auth.split('@')[0];
    return authorName.charAt(0).toUpperCase() + authorName.slice(1);
}

// Função para calcular tempo de leitura
function calculateTime(text: string, velocity = 200) {
    const words = text.split(/\s+/).length;
    return Math.ceil(words / velocity);
}

// Função para gerar metadados dinâmicos
export async function generateMetadata({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const docRef = doc(db, 'posts', id);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) {
    return {
      title: 'Post não encontrado',
    };
  }
 

  const post = snapshot.data() as Post;
  const processedContent = post.content.replace(/\n/g, '<br />');

  return {
    title: post.title,
    description: processedContent.slice(0, 150),
    openGraph: {
      'og:url': `https://${process.env.NEXT_PUBLIC_DOMAIN}/post/${id}`,
      'og:title': post.title,
      'og:description': processedContent.slice(0, 150),
      'og:image': post.imageUrl,
      'og:image:width': '800',
      'og:image:height': '400',
      'og:image:alt': post.title,
      'og:image:type': 'image/jpeg',
      'cache-control': 'public, max-age=31536000'
    },
    twitter: {
      card: 'summary_large_image',
      site: '@seusite',
      title: post.title,
      description: processedContent.slice(0, 150),
      image: post.imageUrl
    },
    
    
  };
}

// Componente principal da página de detalhes do post
export default async function PostPage({ params }: { params: Promise<Params> }) {
    const { id } = await params;
    const docRef = doc(db, 'posts', id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) return notFound();

    const post = snapshot.data() as Post;

    // Formatando o conteúdo e data
    const formattedContent = post.content.replace(/\n/g, '<br />');
    const formattedDate = post.createdAt 
        ? format(new Date(post.createdAt.seconds * 1000), 'dd/MM/yyyy')
        : '';
    console.log('post',post.imageUrl)

    return (
        <main className="w-full min-h-screen bg-black text-white">

          <Head>
            {/* Meta tags Open Graph */}
            <meta property="og:title" content={post.title} />
            <meta property="og:description" content={post.content.slice(0, 150)} />
            <meta property="og:image" content={post.imageUrl} />
            
            <meta property="og:image:width" content="800" />
            <meta property="og:image:height" content="400" />
            
            {/* Meta tags Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="loudinhos.com.br" />
            <meta name="twitter:title" content={post.title} />
            <meta name="twitter:description" content={post.content.slice(0, 150)} />
            <meta name="twitter:image" content={`${post.imageUrl}?${new Date().getTime()}`} />
            
            {/* Meta tags adicionais */}
            <meta name="description" content={post.content.slice(0, 150)} />
          </Head>
            <header
                style={{
                    backgroundImage: "url('https://i.imgur.com/m9cwWY8.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
                className="flex flex-col sm:flex-row sm:justify-between justify-between items-center text-center p-5"
            >
                <Link href="/">
                    <img className="w-auto h-8" src="/logo.png" alt="Logo" />
                </Link>
                <section className="p-4 flex justify-center items-center">
                    <form action="/search" method="GET" className="flex">
                        <input
                            type="text"
                            name="q"
                            placeholder="Digite para buscar..."
                            className="p-2 rounded-l-md w-full max-w-md border-none focus:outline-none text-black"
                        />
                        <button
                            type="submit"
                            className="bg-green-700 text-white p-2 rounded-r-md"
                        >
                            <Search />
                        </button>
                    </form>
                </section>
            </header>

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
                    <p>
                        Reprodução: <strong>{post.source}</strong>
                    </p>
                )}

                <div className="w-full flex flex-col justify-between mt-2">
                    <div className="w-full flex justify-between mt-2">
                        <div className="flex-3">
                            <h1 className="font-bold">
                                {Array.isArray(post.category) 
                                    ? post.category.join(', ') 
                                    : post.category}
                            </h1>
                        </div>
                        <div className="flex-2">
                            {post.content && (
                                <p className="text-sm text-white mb-2">
                                    <strong>
                                        {calculateTime(post.content)}{' '}
                                        {calculateTime(post.content) > 1 
                                            ? 'minutos' 
                                            : 'minuto'} de leitura
                                    </strong>
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="w-full flex items-center">
                        <div className="h-[3px] bg-green-600 w-1/4"></div>
                        <div className="h-px bg-green-300 w-3/4"></div>
                    </div>
                </div>

                {/* Conteúdo formatado diretamente do servidor */}
                <div
                    className="content mt-4 leading-relaxed"
                    dangerouslySetInnerHTML={{
                        __html: formattedContent,
                    }}
                />

                <div className="w-full flex flex-col justify-start mt-6">
                    {post.createdAt && (
                        <p className="text-sm text-white">
                            {formattedDate}
                        </p>
                    )}
                    
                    {post.author && (
                        <p className="text-sm text-white mb-2">
                            Por: <strong>{getAuthor(post.author)}</strong>
                        </p>
                    )}

                    {post.writtenFor && (
                        <p className="text-sm text-white mb-2">
                            Escrito: <strong>{post.writtenFor}</strong>
                        </p>
                    )}

                    {post.revisedFor && (
                        <p className="text-sm text-white mb-2">
                            Revisado por: <strong>{post.revisedFor}</strong>
                        </p>
                    )}
                </div>
            </div>

            <footer className="flex flex-col sm:flex-row sm:justify-between bg-zinc-950 p-5 items-center">
                <img className="w-[150px] h-[25px] mr-5" src="/logo.png" alt="Logo" />
                
                <div className="flex gap-20 my-5">
                    <Link href="https://www.tiktok.com/@loudinhosofc/">
                        <img
                            className="bg-zinc-900 rounded-full p-5 cursor-pointer hover:bg-green-600"
                            src="/tiktok.svg"
                            alt="TikTok"
                        />
                    </Link>
                    
                    <Link href="https://www.instagram.com/loudinhos/">
                        <img
                            className="bg-zinc-900 rounded-full p-4 cursor-pointer hover:bg-green-600"
                            src="/instagram.svg"
                            alt="Instagram"
                        />
                    </Link>
                    
                    <Link href="https://x.com/loudinhos/">
                        <img
                            className="bg-zinc-900 rounded-full p-5 cursor-pointer hover:bg-green-600"
                            src="/twitter-x.svg"
                            alt="X"
                        />
                    </Link>
                </div>
            </footer>
        </main>
    );
}