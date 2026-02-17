// Verimor API Routes
// SMS and Voice Call endpoints

import { NextResponse } from 'next/server';
import { verimorService } from '@/services/verimor.service';

// GET - Check credit balance and service status
export async function GET() {
  if (!verimorService.isConfigured()) {
    return NextResponse.json(
      { success: false, error: 'Verimor servisi yapılandırılmamış' },
      { status: 503 }
    );
  }

  try {
    const credit = await verimorService.getSmsCredit();
    
    return NextResponse.json({
      success: true,
      configured: true,
      credit: credit.credit,
      currency: credit.currency,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Servis durumu alınamadı' },
      { status: 500 }
    );
  }
}
