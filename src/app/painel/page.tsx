'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../../lib/firebaseConfig';
import { getFirestore, doc, getDoc, updateDoc, addDoc, serverTimestamp, collection } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const db = getFirestore();
const storage = getStorage();

import Editor from "../../components/editor/editor";

function PostForm() {
  const [user, setUser] = useState<User | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState(''); // Adiciona categoria
  const [videoUrl, setVideoUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [source, setSource] = useState('');
  const [writtenFor,setWrittenFor] = useState('');
  const [revisedFor, setRevisedFor] = useState('');
  const router = useRouter();

  const postId = useSearchParams()?.get('postId');

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
    if (postId) {
      setIsEditing(true);
      const fetchPost = async () => {
        
        try {
          const docRef = doc(db, 'posts', postId);
          const docSnap = await getDoc(docRef);

          

          if (docSnap.exists()) {
            const postData = docSnap.data();
            setTitle(postData.title);
            setContent(postData.content);
            setImageUrl(postData.imageUrl || '');
            setCategory(postData.category || ''); // Carrega categoria
          } else {
            console.error('Post não encontrado!');
          }
        } catch (error) {
          console.error('Erro ao carregar o post: ', error);
        }
      };

      fetchPost();
    }
  }, [postId]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');

    toast.success("Logout efetuado com sucesso!");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImageUrl('');
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setImage(null);
  };

  const savePost = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let finalImageUrl = imageUrl;
      if (image && !imageUrl) {
        const imageRef = ref(storage, `images/${image.name}`);
        await uploadBytes(imageRef, image);
        finalImageUrl = await getDownloadURL(imageRef);
      }

      if (isEditing && postId) {
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, {
          title,
          content,
          imageUrl: finalImageUrl,
          category, // Atualiza categoria
        });
        console.log('Postagem atualizada!');
      } else {
        const newPost = {
          title,
          content,
          imageUrl: finalImageUrl,
          category, // Salva categoria
          videoUrl, // Salva o link do vídeo
          createdAt: serverTimestamp(),
          author: user?.email || 'Usuário desconhecido',
          source,
          writtenFor,
          revisedFor
        };

        console.log('Dados sendo salvos:', newPost);
        toast.success("Postagem adicionada com sucesso!");
        const docRef = await addDoc(collection(db, 'posts'), newPost);
        console.log('Postagem criada com ID: ', docRef.id);
      }

      setTitle('');
      setContent('');
      setImageUrl('');
      setCategory('');
      setSource('');
      setRevisedFor('');
      setWrittenFor('');
      router.push('/painel');
    } catch (error) {
      console.error('Erro ao salvar postagem: ', error);
    }
  };

  if (!user) {
    return null; // Evita renderização até que o redirecionamento ocorra
  }

  return (
    <div className="w-full flex h-screen">
      <SidebarProvider>
        <AppSidebar userEmail={user?.email ?? 'Email não disponível'} handleLogout={handleLogout} />
        <SidebarTrigger />
        <main className="w-full h-screen flex flex-col items-center">
          <div className="w-full h-screen flex flex-col items-center">
            <form onSubmit={savePost} className="mt-6 w-full max-w-2xl flex-col">
              <div className='flex flex-col '>
                <div className='flex'>
                  <h2 className="w-full text-4xl rounded-lg mb-4 font-bold text-center ">
                    {isEditing ? 'Editar Postagem' : 'Criar Postagem'}
                  </h2>

                </div>
                
                <div className='grid grid-cols-2 gap-4'>
                <div className="mb-4 w-full">
                  <label htmlFor="title" className="block text-left">Título</label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Digite o título"
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div className=" w-full">
                  <label htmlFor="imageUrl" className="block text-left">URL da Imagem</label>
                  <input
                    id="imageUrl"
                    type="text"
                    value={imageUrl}
                    onChange={handleImageUrlChange}
                    placeholder="Cole o link da imagem"
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div className="w-full">
                  <label htmlFor="source" className="block text-left">Fonte</label>
                  <input
                    id="source"
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="Digite a fonte da imagem"
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div className="w-full">
                  <label htmlFor="source" className="block text-left">Escrito por:</label>
                  <input
                    id="writtenFor"
                    type="text"
                    value={writtenFor}
                    onChange={(e) => setWrittenFor(e.target.value)}
                    placeholder="Digite a pessoa que revisou"
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div className="w-full">
                  <label htmlFor="source" className="block text-left">Revisado por:</label>
                  <input
                    id="revisedFor"
                    type="text"
                    value={revisedFor}
                    onChange={(e) => setRevisedFor(e.target.value)}
                    placeholder="Digite a pessoa que revisou"
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div className="mb-4 w-full">
                <label htmlFor="videoUrl" className="block text-left">Link do Vídeo (opcional)</label>
                <input
                  id="videoUrl"
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Cole o link do vídeo"
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>

              </div>
                  
                </div>
                <div className=" w-full">
                  <label htmlFor="category" className="block text-left">Categoria</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="FREE FIRE">FREE FIRE</option>
                    <option value="LEAGUE OF LEGENDS">LEAGUE OF LEGENDS</option>
                    <option value="VALORANT">VALORANT</option>
                    <option value="VIDEOS">VIDEOS</option>
                    <option value="KINGS LEAGUE">KINGS LEAGUE</option>
                    <option value="BRAWL STARS">BRAWL STARS </option>
                    <option value="COREANO">COREANO</option>
                    <option value="RENATO VICENTE">RENATO VICENTE</option>
                    <option value="DARLAN SOUZA">DARLAN SOUZA</option>
                    <option value="YAYAH">YAYAH</option>
                    <option value="CAROLINA VOLTAN">CAROLINA VOLTAN</option>
                    <option value="NAYU">NAYU</option>
                    <option value="GABEPEIXE">GABEPEIXE</option>
                    <option value="OCASTRIN">OCASTRIN</option>
                    <option value="BRABOX">BRABOX</option>
                    <option value="VINICIUS JR">VINICIUS JR</option>
                    <option value="CORINGA">CORINGA</option>
                    <option value="BABI">BABI</option>
                    <option value="CAIOX">CAIOX</option>
                    <option value="SKAR">SKAR</option>
                  </select>
                </div>
              
                <hr className='mt-5'/>
              </div>
              
             


            <div className="m-4 w-full">
              <label htmlFor="content" className="block text-left mb-2"></label>
              <Editor 
              content={content} 
              onChange={setContent}
              />

            </div>

              <button
                type="submit"
                className="w-full bg-blue-500 rounded-lg text-white py-2 hover:scale-105 transition duration-200 mb-4"
              >
                {isEditing ? 'Salvar Alterações' : 'Enviar'}
              </button>
            </form>
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}

export default function PanelPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <PostForm />
    </Suspense>
  );
}