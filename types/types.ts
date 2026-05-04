
export interface Bot {
    id: string;
    name: string;
    description: string;
    systemPrompt: string;
    model: string;
    temperature: number;
    maxTokens: number;
    primaryColor: string;
    welcomeMessage: string;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
    orgId: string;
    _count: BotCount;
}

interface BotCount {
    documents: number;
    conversations: number;
}


export interface ConversationResponse {
    data: Conversation[];
    meta: Meta;
}


export interface Meta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}



export interface Conversation {
    id: string;
    sessionId: string;
    botId: string,
    visitorId: null;
    createdAt: Date;
    _count: Count;
    messages: Message[];
}


export interface Message {
    id: string;
    role: string;
    content: string;
    createdAt: Date;
}


export interface MessageStream {
    id: string;
    role: string;
    content: string;
    createdAt: Date;
    sources?: SourceElement[];
    tokensUsed: number;
}

export interface Count {
    messages: number;
}

export interface SourceElement {
    id:           string;
    content:      string;
    documentId:   string;
    documentName: string;
    chunkIndex:   number;
    similarity:   number;
}


export interface DocumentType {
    id:         string;
    name:       string;
    mimeType:   string;
    status:     'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';
    chunkCount: number;
    fileSize:   number;
    createdAt:  Date;
    updatedAt:  Date;
}

export interface APIKey {
    id:         string;
    label:      string;
    lastUsedAt: Date;
    createdAt:  Date;
}

