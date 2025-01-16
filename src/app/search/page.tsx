// pages/search/page.tsx
'use client';

import React, { Suspense } from 'react';
import Search from '@/components/search/search';

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="text-white">Carregando...</p>}>
      <Search />
    </Suspense>
  );
}
