// Buyapar Integration Service
// Handles bulk UYAP operations through Buyapar API

import { buyaparClient } from '@/lib/api-client';
import { cache } from '@/lib/cache';
import type {
  BuyaparQuickAction,
  BuyaparActionType,
  BuyaparBatchResult,
  BuyaparItemResult,
} from '@/types/uyap';

interface QueuedAction {
  id: string;
  action: BuyaparQuickAction;
  createdAt: Date;
}

class BuyaparService {
  private apiKey: string;
  private actionQueue: Map<string, QueuedAction> = new Map();

  constructor() {
    this.apiKey = process.env.BUYAPAR_API_KEY || '';
    if (this.apiKey) {
      buyaparClient.setHeader('X-API-Key', this.apiKey);
    }
  }

  // Queue a bulk action
  async queueBulkAction(
    actionType: BuyaparActionType,
    caseIds: string[],
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<{ queueId: string; estimatedTime: number }> {
    const queueId = `buyapar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const action: BuyaparQuickAction = {
      id: queueId,
      type: actionType,
      caseIds,
      priority,
      status: 'queued',
    };

    this.actionQueue.set(queueId, {
      id: queueId,
      action,
      createdAt: new Date(),
    });

    // Send to Buyapar API
    const response = await buyaparClient.post<{ queueId: string; estimatedTime: number }>(
      '/bulk/queue',
      action
    );

    if (!response.success) {
      this.actionQueue.delete(queueId);
      throw new Error(response.error || 'Buyapar kuyruğa ekleme hatası');
    }

    return response.data!;
  }

  // Execute bulk Maaş Haczi
  async bulkMaasHaczi(caseIds: string[]): Promise<{ queueId: string }> {
    const result = await this.queueBulkAction('TOPLU_MAAS_HACZI', caseIds, 'high');
    return { queueId: result.queueId };
  }

  // Execute bulk Taşınmaz Haczi
  async bulkTasinmazHaczi(caseIds: string[]): Promise<{ queueId: string }> {
    const result = await this.queueBulkAction('TOPLU_TASINMAZ_HACZI', caseIds, 'high');
    return { queueId: result.queueId };
  }

  // Execute bulk Araç Haczi
  async bulkAracHaczi(caseIds: string[]): Promise<{ queueId: string }> {
    const result = await this.queueBulkAction('TOPLU_ARAC_HACZI', caseIds, 'high');
    return { queueId: result.queueId };
  }

  // Execute bulk Banka Haczi
  async bulkBankaHaczi(caseIds: string[]): Promise<{ queueId: string }> {
    const result = await this.queueBulkAction('TOPLU_BANKA_HACZI', caseIds, 'high');
    return { queueId: result.queueId };
  }

  // Execute bulk SGK Sorgu
  async bulkSgkSorgu(caseIds: string[]): Promise<{ queueId: string }> {
    const result = await this.queueBulkAction('TOPLU_SGK_SORGU', caseIds, 'normal');
    return { queueId: result.queueId };
  }

  // Execute bulk MERNİS Sorgu
  async bulkMernisSorgu(caseIds: string[]): Promise<{ queueId: string }> {
    const result = await this.queueBulkAction('TOPLU_MERNIS_SORGU', caseIds, 'normal');
    return { queueId: result.queueId };
  }

  // Execute bulk Tebligat
  async bulkTebligat(caseIds: string[]): Promise<{ queueId: string }> {
    const result = await this.queueBulkAction('TOPLU_TEBLIGAT', caseIds, 'high');
    return { queueId: result.queueId };
  }

  // Execute bulk 103 Davetiye
  async bulk103Davetiye(caseIds: string[]): Promise<{ queueId: string }> {
    const result = await this.queueBulkAction('TOPLU_103_DAVETIYE', caseIds, 'normal');
    return { queueId: result.queueId };
  }

  // Execute bulk 89/1 İhbarname
  async bulk89_1Ihbar(caseIds: string[]): Promise<{ queueId: string }> {
    const result = await this.queueBulkAction('TOPLU_89_1_IHBAR', caseIds, 'normal');
    return { queueId: result.queueId };
  }

  // Execute bulk 89/2 İhbarname
  async bulk89_2Ihbar(caseIds: string[]): Promise<{ queueId: string }> {
    const result = await this.queueBulkAction('TOPLU_89_2_IHBAR', caseIds, 'normal');
    return { queueId: result.queueId };
  }

  // Execute bulk 89/3 İhbarname
  async bulk89_3Ihbar(caseIds: string[]): Promise<{ queueId: string }> {
    const result = await this.queueBulkAction('TOPLU_89_3_IHBAR', caseIds, 'normal');
    return { queueId: result.queueId };
  }

  // Check batch status
  async getBatchStatus(queueId: string): Promise<BuyaparBatchResult | null> {
    const cacheKey = `buyapar:status:${queueId}`;
    const cached = cache.get<BuyaparBatchResult>(cacheKey);
    
    if (cached && cached.completedAt) {
      return cached;
    }

    const response = await buyaparClient.get<BuyaparBatchResult>(`/bulk/status/${queueId}`);
    
    if (!response.success) {
      return null;
    }

    // Cache completed results for 1 hour
    if (response.data?.completedAt) {
      cache.set(cacheKey, response.data, 3600);
    }

    return response.data!;
  }

  // Get batch results
  async getBatchResults(queueId: string): Promise<BuyaparItemResult[]> {
    const response = await buyaparClient.get<{ results: BuyaparItemResult[] }>(
      `/bulk/results/${queueId}`
    );
    
    if (!response.success) {
      return [];
    }

    return response.data?.results || [];
  }

  // Cancel a queued batch
  async cancelBatch(queueId: string): Promise<boolean> {
    const response = await buyaparClient.delete(`/bulk/cancel/${queueId}`);
    
    if (response.success) {
      this.actionQueue.delete(queueId);
      cache.delete(`buyapar:status:${queueId}`);
    }

    return response.success;
  }

  // Get all pending actions
  getPendingActions(): QueuedAction[] {
    return Array.from(this.actionQueue.values());
  }

  // Get action counts by type
  async getActionStats(): Promise<Record<BuyaparActionType, number>> {
    const response = await buyaparClient.get<{ stats: Record<BuyaparActionType, number> }>(
      '/stats/actions'
    );
    
    if (!response.success) {
      return {} as Record<BuyaparActionType, number>;
    }

    return response.data?.stats || ({} as Record<BuyaparActionType, number>);
  }
}

// Singleton export
export const buyaparService = new BuyaparService();
