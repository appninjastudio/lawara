// Verimor Integration Types
// SMS and Voice Call (IVR) types for debt collection

// SMS Types
export interface SmsRequest {
  phone: string;
  message: string;
  header?: string; // Sender ID (başlık)
  sendAt?: string; // İleri tarihli gönderim (ISO 8601)
  datacoding?: 0 | 1 | 2; // 0: GSM7, 1: Turkish, 2: Unicode
  customId?: string; // Özel ID
}

export interface SmsBulkRequest {
  phones: string[];
  message: string;
  header?: string;
}

export interface SmsNtoNRequest {
  messages: Array<{
    phone: string;
    message: string;
    customId?: string;
  }>;
  header?: string;
}

export interface SmsResponse {
  success: boolean;
  messageId?: string;
  campaignId?: string;
  code?: number;
  message?: string;
  error?: string;
}

export interface SmsStatusResponse {
  success: boolean;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'expired' | 'unknown';
  deliveryDate?: string;
  error?: string;
  errorCode?: number;
}

export interface SmsCreditResponse {
  success: boolean;
  credit?: number;
  currency?: string;
  error?: string;
}

// Voice Call (IVR) Types
export interface VoiceCallRequest {
  phone: string;
  audioFile?: string; // Önceden yüklenmiş ses dosyası ID
  ttsMessage?: string; // Text-to-Speech mesajı
  callerId?: string; // Arayan numara
  maxRetry?: number; // Maksimum tekrar deneme
  retryInterval?: number; // Tekrar aralığı (dakika)
}

export interface VoiceBulkCallRequest {
  phones: string[];
  audioFile?: string;
  ttsMessage?: string;
  callerId?: string;
  maxRetry?: number;
}

export interface VoiceCallResponse {
  success: boolean;
  callId?: string;
  campaignId?: string;
  code?: number;
  message?: string;
  error?: string;
}

export interface VoiceCallStatusResponse {
  success: boolean;
  status: 'queued' | 'ringing' | 'answered' | 'completed' | 'failed' | 'busy' | 'no_answer';
  duration?: number; // Saniye cinsinden
  answeredAt?: string;
  endedAt?: string;
  keyPressed?: string; // IVR tuş basımı
  error?: string;
}

// IVR (Interactive Voice Response) Types
export interface IvrScenario {
  id: string;
  name: string;
  steps: IvrStep[];
}

export interface IvrStep {
  order: number;
  type: 'play' | 'tts' | 'input' | 'transfer' | 'hangup';
  content?: string; // Ses dosyası ID veya TTS metni
  inputDigits?: number; // Beklenen tuş sayısı
  timeout?: number; // Saniye
  nextStep?: Record<string, number>; // Tuş -> sonraki adım mapping
}

// Debt Collection Specific Types
export interface DebtReminderSms {
  caseId: string;
  debtorName: string;
  debtorPhone: string;
  totalDebt: number;
  dueDate?: string;
  caseNumber: string;
  courtName?: string;
}

export interface DebtReminderCall {
  caseId: string;
  debtorName: string;
  debtorPhone: string;
  totalDebt: number;
  caseNumber: string;
  useIvr?: boolean;
  ivrScenarioId?: string;
}

// Campaign Types
export interface SmsCampaign {
  id: string;
  name: string;
  caseIds: string[];
  messageTemplate: string;
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled';
  stats?: CampaignStats;
}

export interface CallCampaign {
  id: string;
  name: string;
  caseIds: string[];
  audioFileId?: string;
  ttsMessage?: string;
  ivrScenarioId?: string;
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled';
  stats?: CampaignStats;
}

export interface CampaignStats {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  answered?: number; // For calls
  avgDuration?: number; // For calls
}

// Report Types
export interface VerimorReport {
  startDate: Date;
  endDate: Date;
  smsSent: number;
  smsDelivered: number;
  smsFailed: number;
  callsMade: number;
  callsAnswered: number;
  callsFailed: number;
  totalCost: number;
}

// Verimor API Response Types
export interface VerimorApiResponse<T = unknown> {
  status: number;
  message?: string;
  data?: T;
}

// Verimor Error Codes
export const VERIMOR_ERROR_CODES: Record<number, string> = {
  400: 'Geçersiz istek',
  401: 'Yetkilendirme hatası',
  402: 'Yetersiz bakiye',
  404: 'Kaynak bulunamadı',
  422: 'İşlenemeyen veri',
  429: 'Çok fazla istek',
  500: 'Sunucu hatası',
};

// Verimor SMS Status Codes
export const VERIMOR_SMS_STATUS: Record<string, string> = {
  'pending': 'Beklemede',
  'sent': 'Gönderildi',
  'delivered': 'İletildi',
  'failed': 'Başarısız',
  'expired': 'Süresi doldu',
};

// Verimor Call Status Codes
export const VERIMOR_CALL_STATUS: Record<string, string> = {
  'queued': 'Kuyrukta',
  'ringing': 'Çalıyor',
  'answered': 'Cevaplandı',
  'completed': 'Tamamlandı',
  'failed': 'Başarısız',
  'busy': 'Meşgul',
  'no_answer': 'Cevap yok',
};
