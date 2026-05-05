'use client';
import { useState } from 'react';
import { Copy, Check, Bot, Code2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Bot as BotType } from '@/types/types';
import { useBots } from '@/features/useDocMe';


const POSITIONS = [
  { value: 'bottom-right', label: 'Inferior derecho' },
  { value: 'bottom-left', label: 'Inferior izquierdo' },
  { value: 'top-right', label: 'Superior derecho' },
  { value: 'top-left', label: 'Superior izquierdo' },
];

export default function WidgetPage() {
  const { data: bots } = useBots();
  const [selectedBotId, setSelectedBotId] = useState('');
  const [position, setPosition] = useState('bottom-right');
  const [copied, setCopied] = useState(false);

  const selectedBot = bots?.find((b: BotType) => b.id === selectedBotId) ?? bots?.[0];
  const apiUrl = process.env.BACKEND_BASE_URL ?? 'http://localhost:3001/api';
  const widgetUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/widget/${selectedBot?.id}`
    : '';

  const iframeCode = selectedBot
    ? `<!-- ChatBot Widget -->
<iframe
  src="${widgetUrl}?key=TU_API_KEY"
  width="400"
  height="620"
  style="
    position: fixed;
    ${position.includes('bottom') ? 'bottom: 24px;' : 'top: 24px;'}
    ${position.includes('right') ? 'right: 24px;' : 'left: 24px;'}
    border: none;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.16);
    z-index: 9999;
  "
/>`.trim()
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-[1400px]">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Widget</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Embebe tu chatbot en cualquier sitio web
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config */}
        <div className="lg:col-span-2 space-y-5">

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">1. Selecciona un bot</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedBotId || selectedBot?.id}
                onValueChange={setSelectedBotId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Elige un bot..." />
                </SelectTrigger>
                <SelectContent>
                  {bots?.map((b: BotType) => (
                    <SelectItem key={b.id} value={b.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full flex-shrink-0"
                          style={{ background: b.primaryColor }}
                        />
                        {b.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedBot && (
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedBot._count.documents} documentos indexados ·{' '}
                  {selectedBot._count.conversations} conversaciones
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">2. Posición</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {POSITIONS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPosition(p.value)}
                    className={`p-3 rounded-lg border text-sm text-left transition-colors ${position === p.value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        : 'border-border hover:bg-muted text-foreground'
                      }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">3. Obtén tu API key</CardTitle>
              <CardDescription className="text-xs">
                Ve a la configuración del bot → API Keys para generar una
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedBot ? (
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-2 text-xs"
                  onClick={() =>
                    window.open(`/bots/${selectedBot.id}?tab=settings`, '_blank')
                  }
                >
                  Ir a API Keys del bot →
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground">Selecciona un bot primero</p>
              )}
            </CardContent>
          </Card>

          {/* Embed code */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Code2 className="h-4 w-4" />
                    Código de embed
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Pega esto en el {'<body>'} de tu sitio web
                  </CardDescription>
                </div>
                <Button
                  variant="tertiary"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!selectedBot}
                  className="gap-2 h-8 text-xs"
                >
                  {copied ? (
                    <><Check className="h-3.5 w-3.5" /> Copiado</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5" /> Copiar</>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedBot ? (
                <pre className="bg-muted rounded-lg p-4 text-xs text-foreground overflow-x-auto leading-relaxed font-mono">
                  <code>{iframeCode}</code>
                </pre>
              ) : (
                <div className="bg-muted rounded-lg p-8 text-center text-xs text-muted-foreground">
                  Selecciona un bot para ver el código de embed
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-5">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Vista previa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border overflow-hidden bg-background h-[380px] flex flex-col">
                {/* Header */}
                <div
                  className="px-4 py-3 text-white"
                  style={{ backgroundColor: selectedBot?.primaryColor ?? '#6366f1' }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-none">
                        {selectedBot?.name ?? 'Mi Bot'}
                      </p>
                      <p className="text-xs text-white/70 mt-0.5">En línea</p>
                    </div>
                  </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex gap-2 items-start">
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: (selectedBot?.primaryColor ?? '#6366f1') + '20' }}
                    >
                      <Bot className="h-3.5 w-3.5" style={{ color: selectedBot?.primaryColor ?? '#6366f1' }} />
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-foreground shadow-sm max-w-[80%]">
                      {selectedBot?.welcomeMessage ?? '¡Hola! ¿En qué puedo ayudarte hoy?'}
                    </div>
                  </div>
                </div>

                {/* Input */}
                <div className="border-t border-border p-3 flex gap-2 items-center bg-background">
                  <input
                    type="text"
                    disabled
                    placeholder="Escribe un mensaje..."
                    className="flex-1 text-xs bg-muted rounded-lg px-3 py-2 text-muted-foreground outline-none"
                  />
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: selectedBot?.primaryColor ?? '#6366f1' }}
                  >
                    <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                </div>
              </div>

              <Badge variant="secondary" className="mt-3 w-full justify-center text-xs">
                Posición: {POSITIONS.find((p) => p.value === position)?.label}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}