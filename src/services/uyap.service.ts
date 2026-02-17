// UYAP Integration Service
// Handles all UYAP API communications with caching and error handling

import { uyapClient } from '@/lib/api-client';
import { cache, withCache } from '@/lib/cache';
import type {
  UyapRequest,
  UyapResponse,
  UyapActionType,
  UyapDosyaBilgisi,
  UyapBorcluBilgisi,
  UyapMaasHacziSonuc,
  UyapTasinmazBilgisi,
  UyapAracBilgisi,
  UyapBankaHesabi,
} from '@/types/uyap';

class UyapService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.UYAP_API_KEY || '';
    if (this.apiKey) {
      uyapClient.setHeader('X-API-Key', this.apiKey);
    }
  }

  // Generic UYAP request handler
  private async executeAction<T>(
    action: UyapActionType,
    params: Record<string, unknown>
  ): Promise<UyapResponse<T>> {
    const request: UyapRequest = {
      action,
      ...params,
    };

    const response = await uyapClient.post<UyapResponse<T>>('/execute', request);

    if (!response.success) {
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: response.error || 'UYAP API hatası',
        },
        requestId: '',
        timestamp: new Date(),
      };
    }

    return response.data!;
  }

  // Dosya Sorgulama - with 5 minute cache
  async queryCase(caseNumber: string, courtCode: string): Promise<UyapResponse<UyapDosyaBilgisi>> {
    const cacheKey = `uyap:case:${courtCode}:${caseNumber}`;
    
    return withCache(cacheKey, () => 
      this.executeAction<UyapDosyaBilgisi>('DOSYA_SORGULA', {
        caseNumber,
        courtCode,
      }),
      300 // 5 minutes cache
    );
  }

  // Borçlu Sorgulama - with 10 minute cache
  async queryDebtor(tcNo: string): Promise<UyapResponse<UyapBorcluBilgisi>> {
    const cacheKey = `uyap:debtor:${tcNo}`;
    
    return withCache(cacheKey, () =>
      this.executeAction<UyapBorcluBilgisi>('BORCLU_SORGULA', { tcNo }),
      600 // 10 minutes cache
    );
  }

  // MERNİS Sorgulama
  async queryMernis(tcNo: string): Promise<UyapResponse<UyapBorcluBilgisi>> {
    const cacheKey = `uyap:mernis:${tcNo}`;
    
    return withCache(cacheKey, () =>
      this.executeAction<UyapBorcluBilgisi>('MERNIS_SORGULA', { tcNo }),
      3600 // 1 hour cache - MERNİS data doesn't change often
    );
  }

  // SGK Sorgulama
  async querySgk(tcNo: string): Promise<UyapResponse<UyapMaasHacziSonuc[]>> {
    const cacheKey = `uyap:sgk:${tcNo}`;
    
    return withCache(cacheKey, () =>
      this.executeAction<UyapMaasHacziSonuc[]>('SGK_SORGULA', { tcNo }),
      1800 // 30 minutes cache
    );
  }

  // TAKBİS Sorgulama (Taşınmaz)
  async queryTakbis(tcNo: string): Promise<UyapResponse<UyapTasinmazBilgisi[]>> {
    const cacheKey = `uyap:takbis:${tcNo}`;
    
    return withCache(cacheKey, () =>
      this.executeAction<UyapTasinmazBilgisi[]>('TAKBIS_SORGULA', { tcNo }),
      1800 // 30 minutes cache
    );
  }

  // EGM-SİS Sorgulama (Araç)
  async queryEgmsis(tcNo: string): Promise<UyapResponse<UyapAracBilgisi[]>> {
    const cacheKey = `uyap:egmsis:${tcNo}`;
    
    return withCache(cacheKey, () =>
      this.executeAction<UyapAracBilgisi[]>('EGMSIS_SORGULA', { tcNo }),
      1800 // 30 minutes cache
    );
  }

  // Maaş Haczi İşlemi - No cache (mutation)
  async executeMaasHaczi(
    caseNumber: string,
    courtCode: string,
    tcNo: string,
    sgkSicilNo: string
  ): Promise<UyapResponse<UyapMaasHacziSonuc>> {
    // Invalidate related caches
    cache.delete(`uyap:sgk:${tcNo}`);
    
    return this.executeAction<UyapMaasHacziSonuc>('MAAS_HACZI', {
      caseNumber,
      courtCode,
      tcNo,
      sgkSicilNo,
    });
  }

  // Taşınmaz Haczi İşlemi
  async executeTasinmazHaczi(
    caseNumber: string,
    courtCode: string,
    tasinmazId: string
  ): Promise<UyapResponse<{ success: boolean; hacizNo: string }>> {
    return this.executeAction('TASINMAZ_HACZI', {
      caseNumber,
      courtCode,
      tasinmazId,
    });
  }

  // Araç Haczi İşlemi
  async executeAracHaczi(
    caseNumber: string,
    courtCode: string,
    plaka: string
  ): Promise<UyapResponse<{ success: boolean; hacizNo: string }>> {
    return this.executeAction('ARAC_HACZI', {
      caseNumber,
      courtCode,
      plaka,
    });
  }

  // Banka Haczi İşlemi
  async executeBankaHaczi(
    caseNumber: string,
    courtCode: string,
    iban: string
  ): Promise<UyapResponse<UyapBankaHesabi>> {
    return this.executeAction<UyapBankaHesabi>('BANKA_HACZI', {
      caseNumber,
      courtCode,
      iban,
    });
  }

  // Tebligat Gönderimi
  async sendTebligat(
    caseNumber: string,
    courtCode: string,
    recipientTcNo: string,
    documentType: string,
    address: string
  ): Promise<UyapResponse<{ barcodeNo: string; trackingNo: string }>> {
    return this.executeAction('TEBLIGAT_GONDER', {
      caseNumber,
      courtCode,
      recipientTcNo,
      documentType,
      address,
    });
  }

  // Haciz İhbarnamesi (89/1, 89/2, 89/3)
  async sendHacizIhbarnamesi(
    caseNumber: string,
    courtCode: string,
    ihbarnameType: '89_1' | '89_2' | '89_3',
    recipientInfo: { name: string; address: string; taxNo?: string }
  ): Promise<UyapResponse<{ documentNo: string }>> {
    return this.executeAction('HACIZ_IHBARNAMESI', {
      caseNumber,
      courtCode,
      ihbarnameType,
      recipientInfo,
    });
  }

  // Ödeme Emri Gönderimi
  async sendOdemeEmri(
    caseNumber: string,
    courtCode: string,
    debtorTcNo: string
  ): Promise<UyapResponse<{ documentNo: string; barcodeNo: string }>> {
    return this.executeAction('ODEME_EMRI', {
      caseNumber,
      courtCode,
      debtorTcNo,
    });
  }

  // Clear all UYAP caches
  clearCache(): void {
    // This would need a more sophisticated cache implementation
    // to clear only UYAP-related keys
    cache.clear();
  }
}

// Singleton export
export const uyapService = new UyapService();
