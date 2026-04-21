'use client';

import { useState } from 'react';
import { CarExtrasSelector } from '@/components/cars/CarExtrasSelector';

const extraOptions = [
  { name: 'GPS', price: 5 },
  { name: 'Child Seat', price: 7 },
  { name: 'Insurance', price: 12 },
  { name: 'Additional Driver', price: 9 },
];

export function CarExtrasPanel() {
  const [selected, setSelected] = useState<Array<{ name: string; price: number }>>([]);

  return <CarExtrasSelector extras={extraOptions} selected={selected} onChange={setSelected} />;
}
