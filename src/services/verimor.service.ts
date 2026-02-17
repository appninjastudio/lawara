// Verimor Integration Service
// Handles SMS and Voice Call operations for debt collection

import type {
  SmsRequest,
  SmsBulkRequest,
  SmsResponse,
  SmsStatusResponse,
  SmsCreditResponse,
  VoiceCallRequest,
  VoiceBulkCallRequest,
  VoiceCallResponse,
  VoiceCallStatusResponse,
  DebtReminderSms,
  DebtReminderCall,
} from '@/types/verimor';

interface VerimorConfig {
  apiId: string;
  apiKey: string;
  sourceAddr: string;
  callerId?: string;
  baseUrl: string;
}

class VerimorService {
  private config: VerimorConfig;

  constructor() {
    this.config = {
      apiId: process.env.VERIMOR_API_ID || '',
      apiKey: process.env.VERIMOR_API_KEY || '',
      sourceAddr: process.env.VERIMOR_SOURCE_ADDR || 'ICRAMATIK',
      callerId: process.env.VERIMOR_CALLER_ID,
      baseUrl: process.env.VERIMOR_BASE_URL || 'https://api.bulutsantralim.com',
    };
  }

  private getAuthHeader(): string {
    return 'Basic ' + Buffer.from(`${this.config.apiId}:${this.config.apiKey}`).toString('base64');
  }

  // ==========================================
  // SMS Operations (Verimor SMS API)
  // ==========================================

  // Send single SMS
  async sendSms(request: SmsRequest): Promise<SmsResponse> {
    const payload = {
      msg: request.message,
      dest: this.formatPhone(request.phone),
      source_addr: request.header || this.config.sourceAddr,
      datacoding: request.datacoding ?? 1, // 1 = Turkish
      valid_for: '48:00', // 48 saat geçerlilik
      ...(request.sendAt && { send_at: request.sendAt }),
      ...(request.customId && { custom_id: request.customId }),
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/v2/sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          messageId: data.message_id,
          campaignId: data.campaign_id,
          message: 'SMS başarıyla gönderildi',
        };
      }

      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        code: response.status,
        error: error.message || this.getErrorMessage(response.status),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SMS gönderim hatası',
      };
    }
  }

  // Send bulk SMS (same message to multiple recipients)
  async sendBulkSms(request: SmsBulkRequest): Promise<SmsResponse> {
    const phones = request.phones.map(p => this.formatPhone(p));

    const payload = {
      msg: request.message,
      dest: phones.join(','),
      source_addr: request.header || this.config.sourceAddr,
      datacoding: 1,
      valid_for: '48:00',
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/v2/sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          campaignId: data.campaign_id,
          message: 'Toplu SMS başarıyla gönderildi',
        };
      }

      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        code: response.status,
        error: error.message || this.getErrorMessage(response.status),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Toplu SMS gönderim hatası',
      };
    }
  }

  // Send N:N SMS (different messages to different recipients)
  async sendNtoNSms(
    messages: Array<{ phone: string; message: string; customId?: string }>
  ): Promise<SmsResponse> {
    // Verimor N:N format
    const payload = {
      messages: messages.map(m => ({
        msg: m.message,
        dest: this.formatPhone(m.phone),
        ...(m.customId && { custom_id: m.customId }),
      })),
      source_addr: this.config.sourceAddr,
      datacoding: 1,
      valid_for: '48:00',
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/v2/sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          campaignId: data.campaign_id,
          message: 'N:N SMS başarıyla gönderildi',
        };
      }

      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        code: response.status,
        error: error.message || this.getErrorMessage(response.status),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'N:N SMS gönderim hatası',
      };
    }
  }

  // Check SMS delivery status
  async getSmsStatus(messageId: string): Promise<SmsStatusResponse> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/v2/sms/status?id=${messageId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': this.getAuthHeader(),
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          status: this.mapSmsStatus(data.status),
          deliveryDate: data.done_date,
        };
      }

      return {
        success: false,
        status: 'unknown',
        error: 'Durum sorgulama hatası',
      };
    } catch (error) {
      return {
        success: false,
        status: 'unknown',
        error: error instanceof Error ? error.message : 'Durum sorgulama hatası',
      };
    }
  }

  // Get remaining SMS credit
  async getSmsCredit(): Promise<SmsCreditResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v2/balance`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          credit: data.balance,
          currency: data.currency || 'TRY',
        };
      }

      return { success: false, error: 'Kredi bilgisi alınamadı' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Kredi sorgulama hatası',
      };
    }
  }

  // ==========================================
  // Voice Call Operations (Verimor Bulut Santral)
  // ==========================================

  // Make single voice call with TTS
  async makeCall(request: VoiceCallRequest): Promise<VoiceCallResponse> {
    const payload: Record<string, unknown> = {
      destination: this.formatPhone(request.phone),
      caller_id: request.callerId || this.config.callerId,
    };

    if (request.ttsMessage) {
      payload.tts_message = request.ttsMessage;
      payload.tts_lang = 'tr-TR';
    } else if (request.audioFile) {
      payload.audio_file = request.audioFile;
    }

    if (request.maxRetry) {
      payload.max_retry = request.maxRetry;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/v2/calls/outbound`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          callId: data.call_id,
          message: 'Arama başarıyla başlatıldı',
        };
      }

      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        code: response.status,
        error: error.message || this.getErrorMessage(response.status),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Arama başlatma hatası',
      };
    }
  }

  // Make bulk voice calls
  async makeBulkCalls(request: VoiceBulkCallRequest): Promise<VoiceCallResponse> {
    const payload: Record<string, unknown> = {
      destinations: request.phones.map(p => this.formatPhone(p)),
      caller_id: request.callerId || this.config.callerId,
    };

    if (request.ttsMessage) {
      payload.tts_message = request.ttsMessage;
      payload.tts_lang = 'tr-TR';
    } else if (request.audioFile) {
      payload.audio_file = request.audioFile;
    }

    if (request.maxRetry) {
      payload.max_retry = request.maxRetry;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/v2/calls/outbound/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          campaignId: data.campaign_id,
          message: 'Toplu arama başarıyla başlatıldı',
        };
      }

      const error = await response.json().catch(() => ({}));
      return {
        success: false,
        code: response.status,
        error: error.message || this.getErrorMessage(response.status),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Toplu arama hatası',
      };
    }
  }

  // Get call status
  async getCallStatus(callId: string): Promise<VoiceCallStatusResponse> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/v2/calls/${callId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': this.getAuthHeader(),
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          status: this.mapCallStatus(data.status),
          duration: data.duration,
          answeredAt: data.answered_at,
          endedAt: data.ended_at,
          keyPressed: data.dtmf_digits,
        };
      }

      return {
        success: false,
        status: 'failed',
        error: 'Arama durumu sorgulama hatası',
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Arama durumu sorgulama hatası',
      };
    }
  }

  // ==========================================
  // Debt Collection Specific Methods
  // ==========================================

  // Send debt reminder SMS
  async sendDebtReminderSms(reminder: DebtReminderSms): Promise<SmsResponse> {
    const message = this.buildDebtReminderMessage(reminder);

    return this.sendSms({
      phone: reminder.debtorPhone,
      message,
      customId: `debt_${reminder.caseId}`,
    });
  }

  // Send bulk debt reminder SMS
  async sendBulkDebtReminderSms(reminders: DebtReminderSms[]): Promise<SmsResponse[]> {
    const results: SmsResponse[] = [];

    // N:N gönderim için hazırla
    const messages = reminders.map(r => ({
      phone: r.debtorPhone,
      message: this.buildDebtReminderMessage(r),
      customId: `debt_${r.caseId}`,
    }));

    // 1000'lik gruplar halinde gönder (Verimor limiti)
    const chunks = this.chunkArray(messages, 1000);

    for (const chunk of chunks) {
      const result = await this.sendNtoNSms(chunk);
      results.push(result);
    }

    return results;
  }

  // Make debt reminder call
  async makeDebtReminderCall(reminder: DebtReminderCall): Promise<VoiceCallResponse> {
    const ttsMessage = this.buildDebtReminderTts(reminder);

    return this.makeCall({
      phone: reminder.debtorPhone,
      ttsMessage,
      maxRetry: 2,
    });
  }

  // Make bulk debt reminder calls
  async makeBulkDebtReminderCalls(reminders: DebtReminderCall[]): Promise<VoiceCallResponse[]> {
    const results: VoiceCallResponse[] = [];

    for (const reminder of reminders) {
      const result = await this.makeDebtReminderCall(reminder);
      results.push(result);

      // Rate limiting - 100ms bekle
      await this.sleep(100);
    }

    return results;
  }

  // ==========================================
  // Helper Methods
  // ==========================================

  private formatPhone(phone: string): string {
    // Türkiye formatına çevir (905xxxxxxxxx)
    let cleaned = phone.replace(/\D/g, '');

    if (cleaned.startsWith('0')) {
      cleaned = '9' + cleaned;
    } else if (!cleaned.startsWith('90')) {
      cleaned = '90' + cleaned;
    }

    return cleaned;
  }

  private buildDebtReminderMessage(reminder: DebtReminderSms): string {
    const formattedDebt = new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(reminder.totalDebt);

    return `Sayin ${reminder.debtorName}, ${reminder.caseNumber} sayili icra dosyanizda ${formattedDebt} borcunuz bulunmaktadir. Odeme yapmaniz onemle rica olunur. Bilgi icin: 0850 XXX XX XX`;
  }

  private buildDebtReminderTts(reminder: DebtReminderCall): string {
    const formattedDebt = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
    }).format(reminder.totalDebt);

    return `Sayın ${reminder.debtorName}. ${reminder.caseNumber} sayılı icra dosyanızda ${formattedDebt} Türk Lirası borcunuz bulunmaktadır. Ödeme yapmanız önemle rica olunur. Detaylı bilgi için 1'e, tekrar dinlemek için 2'ye basınız.`;
  }

  private mapSmsStatus(status: string): SmsStatusResponse['status'] {
    const statusMap: Record<string, SmsStatusResponse['status']> = {
      'PENDING': 'pending',
      'SENT': 'sent',
      'DELIVERED': 'delivered',
      'FAILED': 'failed',
      'EXPIRED': 'expired',
    };
    return statusMap[status?.toUpperCase()] || 'unknown';
  }

  private mapCallStatus(status: string): VoiceCallStatusResponse['status'] {
    const statusMap: Record<string, VoiceCallStatusResponse['status']> = {
      'QUEUED': 'queued',
      'RINGING': 'ringing',
      'ANSWERED': 'answered',
      'COMPLETED': 'completed',
      'FAILED': 'failed',
      'BUSY': 'busy',
      'NO_ANSWER': 'no_answer',
    };
    return statusMap[status?.toUpperCase()] || 'failed';
  }

  private getErrorMessage(statusCode: number): string {
    const errorMessages: Record<number, string> = {
      400: 'Geçersiz istek',
      401: 'Yetkilendirme hatası - API bilgilerini kontrol edin',
      402: 'Yetersiz bakiye',
      404: 'Kaynak bulunamadı',
      422: 'İşlenemeyen veri',
      429: 'Çok fazla istek - lütfen bekleyin',
      500: 'Sunucu hatası',
    };

    return errorMessages[statusCode] || `Bilinmeyen hata (Kod: ${statusCode})`;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Check if service is configured
  isConfigured(): boolean {
    return !!(this.config.apiId && this.config.apiKey);
  }
}

// Singleton export
export const verimorService = new VerimorService();
