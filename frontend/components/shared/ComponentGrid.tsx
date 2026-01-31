'use client';

import { ReactNode } from 'react';

interface ComponentGridProps {
  children: ReactNode;
}

export default function ComponentGrid({ children }: ComponentGridProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  );
}
