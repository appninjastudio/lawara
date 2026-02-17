// UYAP Integration Types
// XML/UDF format compatible types for UYAP API

export interface UyapCredentials {
  username: string;
  password: string;
  certificateId?: string;
}

export interface UyapRequest {
  action: UyapActionType;
  caseNumber?: string;
  courtCode?: string;
  tcNo?: string;
  data?: Record<string, unknown>;
}

export type UyapActionType =
  | 'DOSYA_SORGULA'
  | 'BORCLU_SORGULA'
  | 'MAAS_HACZI'
  | 'TASINMAZ_HACZI'
  | 'ARAC_HACZI'
  | 'BANKA_HACZI'
  | 'SGK_SORGULA'
  | 'MERNIS_SORGULA'
  | 'TAKBIS_SORGULA'
  | 'EGMSIS_SORGULA'
  | 'TEBLIGAT_GONDER'
  | 'HACIZ_IHBARNAMESI'
  | 'ODEME_EMRI';

export interface UyapResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  requestId: string;
  timestamp: Date;
}

// UYAP Query Results
export interface UyapDosyaBilgisi {
  dosyaNo: string;
  dosyaTuru: string;
  icraDairesi: string;
  acilisTarihi: string;
  durum: string;
  alacakli: string;
  borclu: string;
  asilAlacak: number;
  faiz: number;
  toplamAlacak: number;
}

export interface UyapBorcluBilgisi {
  tcNo: string;
  adSoyad: string;
  dogumTarihi: string;
  anaAdi: string;
  babaAdi: string;
  adres?: UyapAdres;
  telefon?: string[];
}

export interface UyapAdres {
  il: string;
  ilce: string;
  mahalle: string;
  cadde?: string;
  sokak?: string;
  binaNo?: string;
  daireNo?: string;
  postaKodu?: string;
  tamAdres: string;
}

export interface UyapMaasHacziSonuc {
  isyeriAdi: string;
  sgkSicilNo: string;
  maas: number;
  hacizOrani: number;
  hacizTutari: number;
  baslangicTarihi: string;
}

export interface UyapTasinmazBilgisi {
  tasinmazId: string;
  il: string;
  ilce: string;
  mahalle: string;
  ada: string;
  parsel: string;
  nitelik: string;
  yuzolcumu: number;
  hissePay: string;
  takyidatlar: UyapTakyidat[];
}

export interface UyapTakyidat {
  tur: string;
  tarih: string;
  aciklama: string;
  lehtar?: string;
}

export interface UyapAracBilgisi {
  plaka: string;
  marka: string;
  model: string;
  modelYili: number;
  motorNo: string;
  sasiNo: string;
  renk: string;
  hacizDurumu: boolean;
  rehinDurumu: boolean;
}

export interface UyapBankaHesabi {
  bankaAdi: string;
  subeAdi: string;
  hesapNo: string;
  iban: string;
  bakiye?: number;
  hesapTuru: string;
}

// Buyapar Specific Types
export interface BuyaparQuickAction {
  id: string;
  type: BuyaparActionType;
  caseIds: string[];
  priority: 'low' | 'normal' | 'high';
  scheduledAt?: Date;
  status: 'queued' | 'processing' | 'completed' | 'failed';
}

export type BuyaparActionType =
  | 'TOPLU_MAAS_HACZI'
  | 'TOPLU_TASINMAZ_HACZI'
  | 'TOPLU_ARAC_HACZI'
  | 'TOPLU_BANKA_HACZI'
  | 'TOPLU_SGK_SORGU'
  | 'TOPLU_MERNIS_SORGU'
  | 'TOPLU_TEBLIGAT'
  | 'TOPLU_103_DAVETIYE'
  | 'TOPLU_89_1_IHBAR'
  | 'TOPLU_89_2_IHBAR'
  | 'TOPLU_89_3_IHBAR';

export interface BuyaparBatchResult {
  batchId: string;
  totalCount: number;
  successCount: number;
  failedCount: number;
  results: BuyaparItemResult[];
  startedAt: Date;
  completedAt?: Date;
}

export interface BuyaparItemResult {
  caseId: string;
  success: boolean;
  message?: string;
  data?: unknown;
}

// XML Builder helpers
export interface XmlElement {
  name: string;
  attributes?: Record<string, string>;
  value?: string;
  children?: XmlElement[];
}
