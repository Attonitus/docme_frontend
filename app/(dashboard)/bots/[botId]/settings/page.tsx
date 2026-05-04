'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    ArrowLeft, Save, Loader2, Trash2,
    Key, Plus, Copy, Check, Eye, EyeOff,
    Bot, Sliders, Globe, Shield, AlertTriangle,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Card, CardContent, CardHeader,
    CardTitle, CardDescription,
} from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { APIKey } from '@/types/types';
import { useBot, useUpdateBot } from '@/features/useDocMe';
import { api } from '@/lib/api.axios';
import { Switch } from '@/components/ui/switch';

// ─────────────────────────────────────────────────────
// Schema de validación
// ─────────────────────────────────────────────────────
const schema = z.object({
    name: z.string().min(2).max(60),
    description: z.string().max(300).optional(),
    systemPrompt: z.string().min(10, 'El prompt debe tener al menos 10 caracteres'),
    model: z.enum(['gpt-4o', 'gpt-4o-mini']),
    temperature: z.number().min(0).max(2),
    maxTokens: z.number().min(256).max(4096),
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color hex inválido'),
    welcomeMessage: z.string().min(1),
    isPublic: z.boolean(),
});

type FormData = z.infer<typeof schema>;

// ─────────────────────────────────────────────────────
// Tabs
// ─────────────────────────────────────────────────────
type Tab = 'general' | 'ai' | 'appearance' | 'api-keys' | 'danger';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'general', label: 'General', icon: Bot },
    { id: 'ai', label: 'IA', icon: Sliders },
    { id: 'appearance', label: 'Apariencia', icon: Globe },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'danger', label: 'Zona peligro', icon: Shield },
];

// ─────────────────────────────────────────────────────
// Página principal
// ─────────────────────────────────────────────────────
export default function BotSettingsPage({
    params,
}: {
    params: Promise<{ botId: string }>;
}) {
    const { botId } = use(params);
    const router = useRouter();
    const { data: bot, isLoading } = useBot(botId);
    const updateBot = useUpdateBot(botId);
    const [tab, setTab] = useState<Tab>('general');

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        values: bot
            ? {
                name: bot.name,
                description: bot.description ?? '',
                systemPrompt: bot.systemPrompt,
                model: bot.model as 'gpt-4o' | 'gpt-4o-mini',
                temperature: bot.temperature,
                maxTokens: bot.maxTokens,
                primaryColor: bot.primaryColor,
                welcomeMessage: bot.welcomeMessage,
                isPublic: bot.isPublic,
            }
            : undefined,
    });

    const { register, handleSubmit, watch, setValue, formState: { errors, isDirty, isSubmitting } } = form;

    const onSubmit = async (data: FormData) => {
        await updateBot.mutateAsync(data);
    };

    if (isLoading) {
        return (
            <div className="p-8 space-y-4 max-w-3xl">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-[500px] w-full rounded-xl" />
            </div>
        );
    }

    if (!bot) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="max-w-3xl mx-auto px-8 py-8">

                {/* Back + título */}
                <div className="flex items-center gap-3 mb-8">
                    <Button
                        variant="tertiary"
                        size="icon"
                        className="h-8 w-8 text-gray-400"
                        onClick={() => router.push(`/bots/${botId}`)}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div
                            className="h-9 w-9 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: bot.primaryColor + '20' }}
                        >
                            <Bot className="h-4.5 w-4.5" style={{ color: bot.primaryColor }} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-none">
                                {bot.name}
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">Configuración del bot</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Tabs laterales */}
                    <nav className="w-44 flex-shrink-0">
                        <ul className="space-y-0.5">
                            {TABS.map(({ id, label, icon: Icon }) => (
                                <li key={id}>
                                    <button
                                        onClick={() => setTab(id)}
                                        className={cn(
                                            'w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left',
                                            tab === id
                                                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-800'
                                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-gray-900/50',
                                            id === 'danger' && 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50',
                                        )}
                                    >
                                        <Icon className="h-4 w-4 flex-shrink-0" />
                                        {label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                        <form onSubmit={handleSubmit(onSubmit)}>

                            {/* ── GENERAL ── */}
                            {tab === 'general' && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">General</CardTitle>
                                        <CardDescription>Nombre, descripción y visibilidad</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <div className="space-y-1.5">
                                            <Label>Nombre</Label>
                                            <Input {...register('name')} />
                                            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Descripción <span className="text-gray-400">(opcional)</span></Label>
                                            <Textarea
                                                {...register('description')}
                                                rows={2}
                                                className="resize-none"
                                                placeholder="Para qué sirve este bot..."
                                            />
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Widget público</p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    Permite embeber el chat en cualquier sitio web
                                                </p>
                                            </div>
                                            <Switch
                                                checked={watch('isPublic')}
                                                onCheckedChange={(v) => setValue('isPublic', v, { shouldDirty: true })}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* ── IA ── */}
                            {tab === 'ai' && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Configuración de IA</CardTitle>
                                        <CardDescription>System prompt, modelo y parámetros</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <div className="space-y-1.5">
                                            <Label>System Prompt</Label>
                                            <Textarea
                                                {...register('systemPrompt')}
                                                rows={6}
                                                className="resize-none font-mono text-sm"
                                                placeholder="Eres un asistente de soporte de [empresa]..."
                                            />
                                            <p className="text-xs text-gray-400">
                                                Define la personalidad y restricciones del bot
                                            </p>
                                            {errors.systemPrompt && (
                                                <p className="text-xs text-red-500">{errors.systemPrompt.message}</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label>Modelo</Label>
                                                <Select
                                                    value={watch('model')}
                                                    onValueChange={(v) => setValue('model', v as 'gpt-4o' | 'gpt-4o-mini', { shouldDirty: true })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="gpt-4o-mini">
                                                            <div>
                                                                <p className="font-medium">GPT-4o Mini</p>
                                                                <p className="text-xs text-gray-400">Rápido y económico</p>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="gpt-4o">
                                                            <div>
                                                                <p className="font-medium">GPT-4o</p>
                                                                <p className="text-xs text-gray-400">Más capaz y preciso</p>
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label>Máx. tokens <span className="text-gray-400">({watch('maxTokens')})</span></Label>
                                                <Input type="number" min={256} max={4096} {...register('maxTokens')} />
                                                <p className="text-xs text-gray-400">256 – 4096</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>
                                                Temperatura{' '}
                                                <span className="text-gray-400 font-normal">({Number(watch('temperature')).toFixed(1)})</span>
                                            </Label>
                                            <input
                                                type="range"
                                                min={0} max={2} step={0.1}
                                                {...register('temperature')}
                                                className="w-full accent-indigo-600"
                                            />
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>0 — Preciso</span>
                                                <span>1 — Balanceado</span>
                                                <span>2 — Creativo</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* ── APARIENCIA ── */}
                            {tab === 'appearance' && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Apariencia</CardTitle>
                                        <CardDescription>Color, mensaje de bienvenida y vista previa</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <div className="space-y-1.5">
                                            <Label>Color principal</Label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    {...register('primaryColor')}
                                                    className="h-10 w-14 rounded-lg border border-gray-200 cursor-pointer p-1"
                                                />
                                                <Input
                                                    {...register('primaryColor')}
                                                    className="w-32 font-mono text-sm"
                                                    placeholder="#6366f1"
                                                />
                                            </div>
                                            {errors.primaryColor && (
                                                <p className="text-xs text-red-500">{errors.primaryColor.message}</p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label>Mensaje de bienvenida</Label>
                                            <Textarea
                                                {...register('welcomeMessage')}
                                                rows={2}
                                                className="resize-none"
                                                placeholder="¡Hola! ¿En qué puedo ayudarte hoy?"
                                            />
                                        </div>

                                        {/* Preview compacto */}
                                        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                                            <div
                                                className="px-4 py-3 text-white text-sm font-medium flex items-center gap-2"
                                                style={{ backgroundColor: watch('primaryColor') ?? '#6366f1' }}
                                            >
                                                <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                                                    <Bot className="h-3.5 w-3.5 text-white" />
                                                </div>
                                                {watch('name')}
                                            </div>
                                            <div className="p-4 bg-gray-50 dark:bg-gray-900">
                                                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-gray-700 dark:text-gray-200 shadow-sm inline-block max-w-[80%]">
                                                    {watch('welcomeMessage') || '¡Hola! ¿En qué puedo ayudarte?'}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* ── API KEYS (no tiene submit) ── */}
                            {tab === 'api-keys' && (
                                <ApiKeysTab botId={botId} />
                            )}

                            {/* ── ZONA PELIGROSA (no tiene submit) ── */}
                            {tab === 'danger' && (
                                <DangerZoneTab botId={botId} botName={bot.name} />
                            )}

                            {/* Save button — solo en tabs con form */}
                            {tab !== 'api-keys' && tab !== 'danger' && (
                                <div className="flex justify-end mt-4">
                                    <Button
                                        type="submit"
                                        disabled={!isDirty || isSubmitting}
                                        className="gap-2"
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
                                        ) : (
                                            <><Save className="h-4 w-4" /> Guardar cambios</>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────
// ApiKeysTab
// ─────────────────────────────────────────────────────
function ApiKeysTab({ botId }: { botId: string }) {
    const qc = useQueryClient();
    const [newKeyLabel, setNewKeyLabel] = useState('');
    const [revealedKey, setRevealedKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showCreate, setShowCreate] = useState(false);

    const { data: keys, isLoading } = useQuery<APIKey[]>({
        queryKey: ['api-keys', botId],
        queryFn: () => api.get(`/bots/${botId}/api-keys`).then((r) => r.data),
    });

    const createKey = useMutation({
        mutationFn: (label: string) =>
            api.post(`/bots/${botId}/api-keys`, { label }).then((r) => r.data),
        onSuccess: (data) => {
            setRevealedKey(data.key);
            setNewKeyLabel('');
            setShowCreate(false);
            qc.invalidateQueries({ queryKey: ['api-keys', botId] });
        },
    });

    const revokeKey = useMutation({
        mutationFn: (keyId: string) =>
            api.delete(`/bots/${botId}/api-keys/${keyId}`).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['api-keys', botId] }),
    });

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const timeAgo = (dateStr?: string) => {
        if (!dateStr) return 'Nunca';
        const diff = Date.now() - new Date(dateStr).getTime();
        const days = Math.floor(diff / 86400000);
        if (days < 1) return 'Hoy';
        if (days === 1) return 'Ayer';
        return `Hace ${days} días`;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base">API Keys</CardTitle>
                        <CardDescription>
                            Úsalas para autenticar el widget en tu sitio web
                        </CardDescription>
                    </div>
                    <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setShowCreate(true)}>
                        <Plus className="h-3.5 w-3.5" /> Nueva key
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">

                {/* Key revelada al crear */}
                {revealedKey && (
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 p-4 space-y-3">
                        <div className="flex items-start gap-2">
                            <Key className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                                    ¡Copia esta key ahora!
                                </p>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                                    No podrás verla de nuevo después de cerrar este mensaje
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg border border-emerald-200 dark:border-emerald-800 px-3 py-2">
                            <code className="text-xs font-mono text-gray-700 dark:text-gray-300 flex-1 truncate">
                                {revealedKey}
                            </code>
                            <button
                                onClick={() => handleCopy(revealedKey)}
                                className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 flex-shrink-0"
                            >
                                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                {copied ? 'Copiado' : 'Copiar'}
                            </button>
                        </div>
                        <Button
                            size="sm"
                            variant="tertiary"
                            className="h-7 text-xs text-emerald-600"
                            onClick={() => setRevealedKey(null)}
                        >
                            Entendido, ya la copié
                        </Button>
                    </div>
                )}

                {/* Lista de keys */}
                {isLoading ? (
                    <div className="space-y-2">
                        {[1, 2].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                    </div>
                ) : keys?.length === 0 ? (
                    <div className="text-center py-8 text-sm text-gray-400">
                        Sin API keys — crea una para usar el widget
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {keys?.map((key) => (
                            <li
                                key={key.id}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950"
                            >
                                <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center flex-shrink-0">
                                    <Key className="h-4 w-4 text-indigo-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{key.label}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        Último uso: {timeAgo(key.lastUsedAt.toDateString())} · Creada {timeAgo(key.createdAt.toDateString())}
                                    </p>
                                </div>
                                <Button
                                    size="sm"
                                    variant="tertiary"
                                    className="h-7 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 gap-1"
                                    onClick={() => revokeKey.mutate(key.id)}
                                    disabled={revokeKey.isPending}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Revocar
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>

            {/* Modal crear key */}
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nueva API Key</DialogTitle>
                        <DialogDescription>
                            Dale un nombre descriptivo para identificarla después
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div className="space-y-1.5">
                            <Label>Nombre de la key</Label>
                            <Input
                                placeholder="Widget producción, Widget staging..."
                                value={newKeyLabel}
                                onChange={(e) => setNewKeyLabel(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && createKey.mutate(newKeyLabel)}
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="destroy" onClick={() => setShowCreate(false)}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={() => createKey.mutate(newKeyLabel)}
                                disabled={!newKeyLabel.trim() || createKey.isPending}
                                className="gap-2"
                            >
                                {createKey.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                Crear key
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

// ─────────────────────────────────────────────────────
// DangerZoneTab
// ─────────────────────────────────────────────────────
function DangerZoneTab({ botId, botName }: { botId: string; botName: string }) {
    const router = useRouter();
    const qc = useQueryClient();
    const [confirm, setConfirm] = useState('');
    const [showDialog, setShowDialog] = useState(false);

    const deleteBot = useMutation({
        mutationFn: () => api.delete(`/bots/${botId}`).then((r) => r.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['bots'] });
            router.replace('/bots');
        },
    });

    const clearDocs = useMutation({
        mutationFn: () =>
            api.get(`/bots/${botId}/documents`).then(async (r) => {
                for (const doc of r.data) {
                    await api.delete(`/bots/${botId}/documents/${doc.id}`);
                }
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['documents', botId] });
        },
    });

    return (
        <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
                <CardTitle className="text-base text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Zona peligrosa
                </CardTitle>
                <CardDescription>Estas acciones son irreversibles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

                {/* Borrar documentos */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Borrar todos los documentos
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Elimina todos los documentos y embeddings del bot
                        </p>
                    </div>
                    <Button
                        variant="destroy"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-100 dark:hover:bg-red-950 h-8 text-xs flex-shrink-0 ml-4"
                        onClick={() => clearDocs.mutate()}
                        disabled={clearDocs.isPending}
                    >
                        {clearDocs.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            'Borrar docs'
                        )}
                    </Button>
                </div>

                {/* Eliminar bot */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Eliminar bot permanentemente
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Borra el bot, todos sus documentos y conversaciones
                        </p>
                    </div>
                    <Button
                        variant="destroy"
                        size="sm"
                        className="h-8 text-xs flex-shrink-0 ml-4"
                        onClick={() => setShowDialog(true)}
                    >
                        Eliminar bot
                    </Button>
                </div>
            </CardContent>

            {/* Confirm dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            ¿Eliminar {botName}?
                        </DialogTitle>
                        <DialogDescription>
                            Esta acción es irreversible. Se borrarán todos los documentos,
                            embeddings y conversaciones del bot.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-2">
                        <div className="space-y-1.5">
                            <Label className="text-sm">
                                Escribe <span className="font-mono font-bold">{botName}</span> para confirmar
                            </Label>
                            <Input
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                placeholder={botName}
                                className="border-red-200 dark:border-red-800 focus-visible:ring-red-400"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setShowDialog(false)}>
                                Cancelar
                            </Button>
                            <Button
                                variant="destroy"
                                disabled={confirm !== botName || deleteBot.isPending}
                                onClick={() => deleteBot.mutate()}
                                className="gap-2"
                            >
                                {deleteBot.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                Eliminar para siempre
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}