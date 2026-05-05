import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api.axios';
import { Bot, ConversationResponse, Message, DocumentType, MessageStream } from '@/types/types';

// ──────────────────────────────────────────────
// BOTS
// ──────────────────────────────────────────────

export const useBots = () =>
  useQuery<Bot[]>({
    queryKey: ['bots'],
    queryFn: () => api.get('/bots').then((r) => r.data),
  });

export const useBot = (botId: string) =>
  useQuery<Bot>({
    queryKey: ['bots', botId],
    queryFn: () => api.get(`/bots/${botId}`).then((r) => r.data),
    enabled: !!botId,
  });

export const useCreateBot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Bot>) => api.post('/bots', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bots'] }),
  });
};

export const useUpdateBot = (botId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Bot>) =>
      api.patch(`/bots/${botId}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bots'] });
      qc.invalidateQueries({ queryKey: ['bots', botId] });
    },
  });
};

export const useDeleteBot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (botId: string) => api.delete(`/bots/${botId}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bots'] }),
  });
};

// ──────────────────────────────────────────────
// DOCUMENTS
// ──────────────────────────────────────────────
export const useDocuments = (botId: string) =>
  useQuery<DocumentType[]>({
    queryKey: ['documents', botId],
    queryFn: () =>
      api.get(`/bots/${botId}/documents`).then((r) => r.data),
    enabled: !!botId,
  });

export const useUploadDocument = (botId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async(file: File) => {
      const form = new FormData();
      form.append('file', file);
      return api.post(`/bots/${botId}/documents/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents', botId] }),
  });
};

export const useDeleteDocument = (botId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) =>
      api.delete(`/bots/${botId}/documents/${docId}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents', botId] }),
  });
};

// ──────────────────────────────────────────────
// CHAT
// ──────────────────────────────────────────────
export const useConversations = (botId: string) =>
  useQuery<ConversationResponse>({
    queryKey: ['conversations', botId],
    queryFn: () =>
      api.get(`/chat/bots/${botId}/conversations`).then((r) => r.data),
    enabled: !!botId,
  });

export const useChatHistory = (conversationId: string) =>
  useQuery<MessageStream[]>({
    queryKey: ['history', conversationId],
    queryFn: () =>
      api.get(`/chat/conversations/${conversationId}/history`).then((r) => r.data),
    enabled: !!conversationId,
  });

export const useStartConversation = () =>
  useMutation({
    mutationFn: (botId: string) =>
      api.post('/chat/conversations', { botId }).then((r) => r.data),
  });
