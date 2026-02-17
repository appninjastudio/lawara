// Verimor Voice Call API Routes

import { NextRequest, NextResponse } from 'next/server';
import { verimorService } from '@/services/verimor.service';
import type { DebtReminderCall } from '@/types/verimor';

// POST - Make voice call
export async function POST(request: NextRequest) {
  if (!verimorService.isConfigured()) {
    return NextResponse.json(
      { success: false, error: 'Verimor servisi yapılandırılmamış' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case 'single': {
        // Tek arama
        const { phone, ttsMessage, audioFile, callerId, maxRetry } = data;
        
        if (!phone) {
          return NextResponse.json(
            { success: false, error: 'Telefon numarası zorunludur' },
            { status: 400 }
          );
        }

        if (!ttsMessage && !audioFile) {
          return NextResponse.json(
            { success: false, error: 'TTS mesajı veya ses dosyası zorunludur' },
            { status: 400 }
          );
        }

        const result = await verimorService.makeCall({
          phone,
          ttsMessage,
          audioFile,
          callerId,
          maxRetry,
        });
        return NextResponse.json(result);
      }

      case 'bulk': {
        // Toplu arama
        const { phones, ttsMessage, audioFile, callerId, maxRetry } = data;
        
        if (!phones?.length) {
          return NextResponse.json(
            { success: false, error: 'Telefon listesi zorunludur' },
            { status: 400 }
          );
        }

        if (!ttsMessage && !audioFile) {
          return NextResponse.json(
            { success: false, error: 'TTS mesajı veya ses dosyası zorunludur' },
            { status: 400 }
          );
        }

        const result = await verimorService.makeBulkCalls({
          phones,
          ttsMessage,
          audioFile,
          callerId,
          maxRetry,
        });
        return NextResponse.json(result);
      }

      case 'debt_reminder': {
        // Borç hatırlatma araması
        const reminder: DebtReminderCall = data.reminder;
        
        if (!reminder?.debtorPhone || !reminder?.caseId) {
          return NextResponse.json(
            { success: false, error: 'Borçlu bilgileri eksik' },
            { status: 400 }
          );
        }

        const result = await verimorService.makeDebtReminderCall(reminder);
        return NextResponse.json(result);
      }

      case 'bulk_debt_reminder': {
        // Toplu borç hatırlatma araması
        const reminders: DebtReminderCall[] = data.reminders;
        
        if (!reminders?.length) {
          return NextResponse.json(
            { success: false, error: 'Borçlu listesi boş' },
            { status: 400 }
          );
        }

        const results = await verimorService.makeBulkDebtReminderCalls(reminders);
        
        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;

        return NextResponse.json({
          success: failCount === 0,
          total: results.length,
          successCount,
          failCount,
          results,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Geçersiz işlem tipi' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Call API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Arama başlatma hatası' },
      { status: 500 }
    );
  }
}
