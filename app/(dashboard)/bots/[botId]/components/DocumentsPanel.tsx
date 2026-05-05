'use client';
 
import { useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  FileText, Upload, Trash2, CheckCircle2,
  Loader2, XCircle, Clock, AlertCircle,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useDeleteDocument, useDocuments, useUploadDocument } from '@/features/useDocMe';
import { DocumentType } from '@/types/types';
 
interface DocumentsPanelProps {
  botId: string;
  accentColor: string;
}
 
const STATUS = {
  PENDING:    { icon: Clock,          label: 'En cola',     class: 'text-amber-500'  },
  PROCESSING: { icon: Loader2,        label: 'Procesando',  class: 'text-blue-500'   },
  READY:      { icon: CheckCircle2,   label: 'Listo',       class: 'text-emerald-500'},
  FAILED:     { icon: XCircle,        label: 'Error',       class: 'text-red-500'    },
} as const;
 
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
 
export function DocumentsPanel({ botId, accentColor }: DocumentsPanelProps) {
  const { data: documents, isLoading, refetch } = useDocuments(botId);
  const upload = useUploadDocument(botId);
  const remove = useDeleteDocument(botId);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const processing = documents?.some(
      (d) => d.status === 'PENDING' || d.status === 'PROCESSING',
    );
    if (processing && !intervalRef.current) {
      intervalRef.current = setInterval(refetch, 3000);
    } else if (!processing && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [documents, refetch]);
 
  const onDrop = async (files: File[]) => {
    for (const file of files) {
      await upload.mutateAsync(file);
    }
  };
 
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    maxSize: 20 * 1024 * 1024,
    multiple: true,
  });
 
  const readyCount = documents?.filter((d) => d.status === 'READY').length ?? 0;
  const total = documents?.length ?? 0;
 
  return (
    <div className="flex flex-col h-full w-80">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Documentos
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {readyCount} de {total} listos
          </p>
        </div>
 
        {/* Barra de progreso compacta */}
        {total > 0 && (
          <div className="h-1.5 w-16 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${total > 0 ? (readyCount / total) * 100 : 0}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
        )}
      </div>
 
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
 
          {/* Drop zone */}
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200',
              isDragActive && !isDragReject
                ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950 scale-[0.98]'
                : isDragReject
                  ? 'border-red-400 bg-red-50 dark:bg-red-950'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800',
            )}
          >
            <input {...getInputProps()} />
            {upload.isPending ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
                <p className="text-xs text-gray-500">Subiendo...</p>
              </div>
            ) : isDragReject ? (
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-400" />
                <p className="text-xs text-red-500">Tipo no soportado</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'h-9 w-9 rounded-xl flex items-center justify-center transition-colors',
                    isDragActive
                      ? 'bg-indigo-100 dark:bg-indigo-900'
                      : 'bg-gray-100 dark:bg-gray-800',
                  )}
                >
                  <Upload
                    className={cn(
                      'h-4 w-4 transition-colors',
                      isDragActive ? 'text-indigo-500' : 'text-gray-400',
                    )}
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {isDragActive ? 'Suelta aquí' : 'Arrastra o haz clic'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    PDF, DOCX, TXT, MD · máx. 20MB
                  </p>
                </div>
              </div>
            )}
          </div>
 
          {/* Lista de documentos */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          ) : documents?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
              <FileText className="h-8 w-8 text-gray-200 dark:text-gray-700" />
              <p className="text-xs text-gray-400">
                Sin documentos aún.<br />Sube archivos para entrenar el bot.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {documents?.map((doc) => (
                <DocumentItem
                  key={doc.id}
                  doc={doc}
                  onDelete={() => remove.mutate(doc.id)}
                  accentColor={accentColor}
                />
              ))}
            </ul>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
 
// ─────────────────────────────────────────────────────
// DocumentItem
// ─────────────────────────────────────────────────────
function DocumentItem({
  doc,
  onDelete,
  accentColor,
}: {
  doc: DocumentType;
  onDelete: () => void;
  accentColor: string;
}) {
  const { icon: Icon, label, class: iconClass } = STATUS[doc.status];
  const isProcessing = doc.status === 'PENDING' || doc.status === 'PROCESSING';
 
  return (
    <li className="group relative flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
      {/* Icono */}
      <div className="h-9 w-9 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
        <FileText className="h-4 w-4 text-gray-400" />
      </div>
 
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate leading-tight">
          {doc.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatBytes(doc.fileSize)}
          {doc.chunkCount > 0 && ` · ${doc.chunkCount} chunks`}
        </p>
 
        {/* Barra de progreso mientras procesa */}
        {isProcessing && (
          <div className="mt-1.5 h-1 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full animate-pulse w-full"
              style={{ backgroundColor: accentColor }}
            />
          </div>
        )}
 
        {/* Status */}
        <div className={cn('flex items-center gap-1 mt-1.5', iconClass)}>
          <Icon className={cn('h-3 w-3', isProcessing && 'animate-spin')} />
          <span className="text-xs">{label}</span>
        </div>
      </div>
 
      {/* Eliminar (solo visible en hover, solo si no está procesando) */}
      {!isProcessing && (
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 h-6 w-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </li>
  );
}
 