// Custom hooks for UYAP and Buyapar operations
'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import type { UyapResponse, UyapDosyaBilgisi, UyapBorcluBilgisi } from '@/types/uyap';

interface UseUyapOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

export function useUyapQuery<T>(options: UseUyapOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (action: string, params: Record<string, unknown>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<UyapResponse<T>>('/api/uyap', { action, params });
      
      if (response.success && response.data?.success) {
        setData(response.data.data as T);
        options.onSuccess?.(response.data.data);
      } else {
        const errorMsg = response.data?.error?.message || response.error || 'İşlem başarısız';
        setError(errorMsg);
        options.onError?.(errorMsg);
      }
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      options.onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
}

// Specific hooks for common operations
export function useCaseQuery(options: UseUyapOptions = {}) {
  return useUyapQuery<UyapDosyaBilgisi>(options);
}

export function useDebtorQuery(options: UseUyapOptions = {}) {
  return useUyapQuery<UyapBorcluBilgisi>(options);
}

export function useBulkAction(options: UseUyapOptions = {}) {
  const [queueId, setQueueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'queued' | 'processing' | 'completed' | 'failed'>('idle');

  const execute = useCallback(async (action: string, caseIds: string[]) => {
    setLoading(true);
    setError(null);
    setStatus('idle');

    try {
      const response = await apiClient.post<{ queueId: string }>('/api/buyapar', { action, caseIds });
      
      if (response.success && response.data?.queueId) {
        setQueueId(response.data.queueId);
        setStatus('queued');
        options.onSuccess?.(response.data);
      } else {
        const errorMsg = response.error || 'İşlem başarısız';
        setError(errorMsg);
        setStatus('failed');
        options.onError?.(errorMsg);
      }
    } catch (err) {
      const errorMsg = (err as Error).message;
      setError(errorMsg);
      setStatus('failed');
      options.onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [options]);

  const checkStatus = useCallback(async () => {
    if (!queueId) return;

    try {
      const response = await apiClient.get<{ status: { status: string } }>(`/api/buyapar?queueId=${queueId}`);
      
      if (response.success && response.data?.status) {
        setStatus(response.data.status.status as typeof status);
      }
    } catch (err) {
      console.error('Status check failed:', err);
    }
  }, [queueId]);

  const cancel = useCallback(async () => {
    if (!queueId) return;

    try {
      await apiClient.delete(`/api/buyapar?queueId=${queueId}`);
      setStatus('idle');
      setQueueId(null);
    } catch (err) {
      console.error('Cancel failed:', err);
    }
  }, [queueId]);

  return { queueId, loading, error, status, execute, checkStatus, cancel };
}

// Hook for polling batch status
interface BatchStatusResponse {
  status?: {
    completedAt?: string;
    status: string;
  };
}

export function useBatchStatusPolling(queueId: string | null, interval = 5000) {
  const [status, setStatus] = useState<BatchStatusResponse | null>(null);
  const [polling, setPolling] = useState(false);

  const startPolling = useCallback(() => {
    if (!queueId || polling) return;

    setPolling(true);
    
    const poll = async () => {
      try {
        const response = await apiClient.get<BatchStatusResponse>(`/api/buyapar?queueId=${queueId}`);
        if (response.success && response.data) {
          setStatus(response.data);
          
          // Stop polling if completed or failed
          if (response.data.status?.completedAt) {
            setPolling(false);
            return;
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }

      if (polling) {
        setTimeout(poll, interval);
      }
    };

    poll();
  }, [queueId, interval, polling]);

  const stopPolling = useCallback(() => {
    setPolling(false);
  }, []);

  return { status, polling, startPolling, stopPolling };
}
