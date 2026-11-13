export interface CitaTatuaje {
  id: string;
  cliente: string;
  fecha: string;
  estilo: string; // Ej: Realismo, Tradicional, Blackwork
  tatuador: string;
  zonaCuerpo: string;
  estado: string;
  precio: number;
  observaciones: string;
  sizeCm?: number | null;
  tattooReferenceUrl?: string | null;
  catalogDesignId?: string | null;
  catalogImageUrl?: string | null;
  paymentReceiptUrl?: string | null;
  aiAnalysis?: {
    style: string;
    colors: string[];
    lineDetail: string;
    shading: string;
    complexity: string;
    elements: string[];
    explanation: string;
  } | null;
  originalPrice?: number | null;
  paymentVerifiedAt?: string | null;
  userId?: string;
}