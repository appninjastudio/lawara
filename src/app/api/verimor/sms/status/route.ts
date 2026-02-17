// Verimor SMS Status API Route

import { NextRequest, NextResponse } from 'next/server';
import { verimorService } from '@/services/verimor.service';

// GET - Check SMS delivery status
export async function GET(request: NextRequest) {
  if (!verimorService.isConfigured()) {
    return NextResponse.json(
      { success: false, error: 'Verimor servisi yapılandırılmamış' },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const messageId = searchParams.get('messageId');

  if (!messageId) {
    return NextResponse.json(
      { success: false, error: 'Message ID zorunludur' },
      { status: 400 }
    );
  }

  try {
    const result = await verimorService.getSmsStatus(messageId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('SMS Status API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Durum sorgulama hatası' },
      { status: 500 }
    );
  }
}
