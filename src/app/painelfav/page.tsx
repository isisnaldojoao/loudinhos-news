'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebaseConfig'; 
import { getFirestore, collection, setDoc, doc, serverTimestamp, getDocs } from 'firebase/firestore';

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"

const db = getFirestore();

interface FavItem {
  id: string;
  image: string;
  title: string;
  url: string;
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
  };

  const handleAddItem = async (favCollection: 'fav1' | 'fav2' | 'fav3') => {
    try {
      const docRef = doc(db, favCollection, 'item'); // Usaremos um único documento com a ID "item" para substituir os dados

      
      await setDoc(docRef, {
        image,
        title,
        url,
        createdAt: serverTimestamp(),
      });

      // Atualiza o estado com o novo item
      const newItem: FavItem = { id: 'item', image, title, url };

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
            <h2 className=" font-bold text-center my-4">(o site foi feito para trabalhar somente três destaques)</h2>
            
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
                {['fav1', 'fav2', 'fav3'].map((favCollection) => {
                  const favItem = favCollection === 'fav1' ? fav1Item : favCollection === 'fav2' ? fav2Item : fav3Item;
                  return (
                    <div key={favCollection} className="mb-6">
                      <h2 className="text-xl font-semibold">{favCollection.toUpperCase()}</h2>
                      {favItem ? (
                        <div className="p-4 border rounded mb-2">
                          <img src={favItem.image} alt={favItem.title} className="w-16 h-16 object-cover mb-2" />
                          <h3 className="font-bold">{favItem.title}</h3>
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