// Verimor SMS API Routes

import { NextRequest, NextResponse } from 'next/server';
import { verimorService } from '@/services/verimor.service';
import type { DebtReminderSms } from '@/types/verimor';

// POST - Send SMS
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
        // Tek SMS gönderimi
        const { phone, message, header } = data;
        
        if (!phone || !message) {
          return NextResponse.json(
            { success: false, error: 'Telefon ve mesaj zorunludur' },
            { status: 400 }
          );
        }

        const result = await verimorService.sendSms({ phone, message, header });
        return NextResponse.json(result);
      }

      case 'bulk': {
        // Toplu SMS gönderimi (aynı mesaj)
        const { phones, message, header } = data;
        
        if (!phones?.length || !message) {
          return NextResponse.json(
            { success: false, error: 'Telefon listesi ve mesaj zorunludur' },
            { status: 400 }
          );
        }

        const result = await verimorService.sendBulkSms({ phones, message, header });
        return NextResponse.json(result);
      }

      case 'debt_reminder': {
        // Borç hatırlatma SMS'i
        const reminder: DebtReminderSms = data.reminder;
        
        if (!reminder?.debtorPhone || !reminder?.caseId) {
          return NextResponse.json(
            { success: false, error: 'Borçlu bilgileri eksik' },
            { status: 400 }
          );
        }

        const result = await verimorService.sendDebtReminderSms(reminder);
        return NextResponse.json(result);
      }

      case 'bulk_debt_reminder': {
        // Toplu borç hatırlatma SMS'i
        const reminders: DebtReminderSms[] = data.reminders;
        
        if (!reminders?.length) {
          return NextResponse.json(
            { success: false, error: 'Borçlu listesi boş' },
            { status: 400 }
          );
        }

        const results = await verimorService.sendBulkDebtReminderSms(reminders);
        
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
    console.error('SMS API Error:', error);
    return NextResponse.json(
      { success: false, error: 'SMS gönderim hatası' },
      { status: 500 }
    );
  }
}
