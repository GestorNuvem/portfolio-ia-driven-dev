'use client';

import { useEffect, useState } from 'react';

interface ModuleResponse {
  module: string;
  message: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function __CLASS_NAME__Component() {
  const [data, setData] = useState<ModuleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/__MODULE_NAME__`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ModuleResponse>;
      })
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, []);

  if (error) return <p className="text-red-500">Erro ao carregar __MODULE_NAME__: {error}</p>;
  if (!data) return <p>Carregando __MODULE_NAME__...</p>;

  return (
    <section className="rounded-lg border p-6">
      <p className="text-sm text-gray-500">{data.module}</p>
      <p className="text-lg">{data.message}</p>
    </section>
  );
}
