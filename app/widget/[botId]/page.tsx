'use client';

import { use } from 'react';
import { WidgetChat } from './components/WidgetChat';

export default function WidgetPage({
  params,
  searchParams,
}: {
  params: Promise<{ botId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { botId } = use(params);
  const { key: apiKey } = use(searchParams);

  if (!apiKey || typeof apiKey !== 'string') {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <p className="text-sm text-gray-500">API key requerida.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden">
      <WidgetChat botId={botId} apiKey={apiKey} />
    </div>
  );
}
