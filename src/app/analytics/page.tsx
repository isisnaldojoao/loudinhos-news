"use client";
import React, { useEffect, useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/ui/app-sidebar';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Clock } from 'lucide-react';
import { auth } from '../../lib/firebaseConfig';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface VisitData {
  date: string;
  visits: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<VisitData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Verifica autenticação e seta usuário
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

  // Dados mockados
  useEffect(() => {
    const fakeData: VisitData[] = [
      { date: '2025-05-10', visits: 120 },
      { date: '2025-05-11', visits: 135 },
      { date: '2025-05-12', visits: 142 },
      { date: '2025-05-13', visits: 158 },
      { date: '2025-05-14', visits: 165 },
      { date: '2025-05-15', visits: 172 },
      { date: '2025-05-16', visits: 180 },
    ];
    setData(fakeData);
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
    toast.success('Logout efetuado com sucesso!');
  };

  const totalVisits = data.reduce((sum, item) => sum + item.visits, 0);
  const average = data.length ? Math.round(totalVisits / data.length) : 0;
  const recent = data.length ? data[data.length - 1] : null;

  return (
    <SidebarProvider>
      {user && <AppSidebar userEmail={user.email || ''} handleLogout={handleLogout} />}
      <main className="w-full flex h-screen bg-gray-100">
        <SidebarTrigger />
        <div className="flex-1 p-6 space-y-6">
          <h1 className="text-2xl font-bold">Dashboard de Visitas</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card Total de Visitas */}
            <div className="p-4 bg-white rounded shadow">
              <h2 className="text-lg font-medium mb-2">Total de Visitas</h2>
              <p className="text-3xl font-semibold">{totalVisits}</p>
            </div>
            {/* Card Visitas Recentes */}
            <div className="p-4 bg-white rounded shadow">
              <h2 className="text-lg font-medium mb-2">Visitas Recentes</h2>
              <p className="text-3xl font-semibold">{recent ? recent.visits : 0}</p>
              <p className="text-sm text-gray-500">{recent ? recent.date : '-'}</p>
            </div>
            {/* Card Média Diária */}
            <div className="p-4 bg-white rounded shadow">
              <h2 className="text-lg font-medium mb-2">Média Diária</h2>
              <p className="text-3xl font-semibold">{average}</p>
            </div>
          </div>

          <div className="p-4 bg-white rounded shadow mt-6">
            <h2 className="text-lg font-medium mb-4">Visitas nos Últimos Dias</h2>
            {loading ? (
              <p>Carregando gráfico...</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="visits" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}
