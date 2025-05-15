'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebaseConfig'; 
import { getFirestore, collection, setDoc, doc, serverTimestamp, getDocs } from 'firebase/firestore';
export const dynamic = "force-dynamic";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ui/app-sidebar";

import { Pencil } from "lucide-react";


import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const db = getFirestore();

interface FavItem {
  id: string;
  image: string;
  title: string;
  url: string;
  category: string;
}

export default function Painel() {
  const [user, setUser] = useState<User | null>(null);
  const [image, setImage] = useState('');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [fav1Item, setFav1Item] = useState<FavItem | null>(null);
  const [fav2Item, setFav2Item] = useState<FavItem | null>(null);
  const [fav3Item, setFav3Item] = useState<FavItem | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [editingFav, setEditingFav] = useState<null | 'fav1' | 'fav2' | 'fav3'>(null);
  const [category, setCategory] = useState('');

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
    const fetchFavItems = async () => {
      try {
        // Fetch o item para cada coleção, garantindo que haja apenas um item por coleção
        const fav1Snapshot = await getDocs(collection(db, 'fav1'));
        const fav2Snapshot = await getDocs(collection(db, 'fav2'));
        const fav3Snapshot = await getDocs(collection(db, 'fav3'));

        setFav1Item(fav1Snapshot.empty ? null : { id: fav1Snapshot.docs[0].id, ...fav1Snapshot.docs[0].data() } as FavItem);
        setFav2Item(fav2Snapshot.empty ? null : { id: fav2Snapshot.docs[0].id, ...fav2Snapshot.docs[0].data() } as FavItem);
        setFav3Item(fav3Snapshot.empty ? null : { id: fav3Snapshot.docs[0].id, ...fav3Snapshot.docs[0].data() } as FavItem);
      } catch (error) {
        console.error('Erro ao buscar itens favoritos: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavItems();
  }, []); 

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');

    toast.success("Logout efetuado com sucesso!");
  };

  const handleAddItem = async (favCollection: 'fav1' | 'fav2' | 'fav3') => {
    try {
      const docRef = doc(db, favCollection, 'item'); // Usaremos um único documento com a ID "item" para substituir os dados

      
      await setDoc(docRef, {
        image,
        title,
        url,
        category,
        createdAt: serverTimestamp(),
      });

      // Atualiza o estado com o novo item
      const newItem: FavItem = { id: 'item', image, title, url,category };

      if (favCollection === 'fav1') {
        setFav1Item(newItem);
      } else if (favCollection === 'fav2') {
        setFav2Item(newItem);
      } else {
        setFav3Item(newItem);
      }

      // Limpar campos após o envio
      setImage('');
      setTitle('');
      setUrl('');
    } catch (error) {
      console.error('Erro ao adicionar item: ', error);
    }
  };

  const handleEditItem = (favCollection: 'fav1' | 'fav2' | 'fav3') => {
    const favItem = favCollection === 'fav1' ? fav1Item : favCollection === 'fav2' ? fav2Item : fav3Item;
  
    if (favItem) {
      setImage(favItem.image);
      setTitle(favItem.title);
      setUrl(favItem.url);
      setEditingFav(favCollection);
      setCategory(favItem.category);  // Carregar a categoria ao editar
    }
  };
  
  const handleSaveItem = async () => {
    if (!editingFav) return;
  
    try {
      const docRef = doc(db, editingFav, 'item');
  
      await setDoc(docRef, {
        image,
        title,
        url,
        createdAt: serverTimestamp(),
      });
  
      const updatedItem: FavItem = { id: 'item', image, title, url,category };
  
      if (editingFav === 'fav1') {
        setFav1Item(updatedItem);
      } else if (editingFav === 'fav2') {
        setFav2Item(updatedItem);
      } else if (editingFav === 'fav3') {
        setFav3Item(updatedItem);
      }
  
      setEditingFav(null);
      setImage('');
      setTitle('');
      setUrl('');
    } catch (error) {
      console.error('Erro ao salvar item: ', error);
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
            <h1 className="text-3xl font-bold text-center my-4">Adicionar aos Destaques</h1>
            
            {/* Formulário para adicionar itens aos favoritos */}
            <div className="mb-4">
                <div className='flex justify-center items-center'>
                <img src='./text.svg' className='m-2'/>
                <input 
                type="text" 
                placeholder="Título" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="border p-2 rounded mb-2 w-full" 
              />
            </div>
              
            <div className='flex justify-center items-center'>
            <img src='./link.svg' className='m-2'/>
            <input 
                type="text" 
                placeholder="URL" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                className="border p-2 rounded mb-2 w-full" 
              />

            </div>
              
            <div className='flex justify-center items-center'>
            <img src='./image.svg' className='m-2'/>
            <input 
                type="text" 
                placeholder="Imagem (URL)" 
                value={image} 
                onChange={(e) => setImage(e.target.value)} 
                className="border p-2 rounded mb-4 w-full" 
              />

            </div>

            <div className='flex justify-center items-center'>
              <img src='./chart-bar-stacked.svg' className='m-2'/>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border p-2 rounded mb-4 w-full"
              >
                <option value="">Selecione uma categoria</option>
                <option value="FREE FIRE">FREE FIRE</option>
                <option value="LEAGUE OF LEGENDS">LEAGUE OF LEGENDS</option>
                <option value="VALORANT">VALORANT</option>
                <option value="KINGS LEAGUE">KINGS LEAGUE</option>
                <option value="BRAWL STARS">BRAWL STARS</option>
                <option value="RAINBOW SIX">RAINBOW SIX</option>
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

              
              <button 
                onClick={() => handleAddItem('fav1')} 
                className="bg-blue-500 text-white p-2 rounded mr-2"
              >
                Destaque Principal
              </button>
              <button 
                onClick={() => handleAddItem('fav2')} 
                className="bg-green-500 text-white p-2 rounded mr-2"
              >
                Segundo Destaque
              </button>
              <button 
                onClick={() => handleAddItem('fav3')} 
                className="bg-yellow-500 text-white p-2 rounded"
              >
                Terceiro Destaque
              </button>
            </div>

            {loading ? (
              <p>Carregando...</p>
            ) : (
              <div>
                {/* Exibindo os itens favoritos */}
                {(['fav1', 'fav2', 'fav3']as const).map((favCollection) => {
                  const favItem = favCollection === 'fav1' ? fav1Item : favCollection === 'fav2' ? fav2Item : fav3Item;
                  return (
                    <div key={favCollection} className="mb-6">
                      <h2 className="text-xl font-semibold">{favCollection.toUpperCase()}</h2>
                      {favItem ? (
                        <div className="p-4 border rounded mb-2">
                          <img src={favItem.image} alt={favItem.title} className="w-16 h-16 object-cover mb-2" />
                          <h3 className="font-bold">{favItem.title}</h3>
                          <p>{favItem.category}</p>  {/* Exibindo a categoria */}
                          <p>{favItem.url}</p>
                          <button
                            onClick={() => handleEditItem(favCollection)}
                            className="flex bg-blue-500 text-white p-2 rounded mt-2"
                          >
                            Editar
                            <Pencil/>
                          </button>
                        </div>
                      ) : (
                        <p>Nenhum item encontrado.</p>
                      )}
                    </div>
                  );
                })}

              </div>
            )}
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}
