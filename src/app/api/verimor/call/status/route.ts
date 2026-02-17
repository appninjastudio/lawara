// Verimor Call Status API Route

import { NextRequest, NextResponse } from 'next/server';
import { verimorService } from '@/services/verimor.service';

// GET - Check call status
export async function GET(request: NextRequest) {
  if (!verimorService.isConfigured()) {
    return NextResponse.json(
      { success: false, error: 'Verimor servisi yapılandırılmamış' },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const callId = searchParams.get('callId');

  if (!callId) {
    return NextResponse.json(
      { success: false, error: 'Call ID zorunludur' },
      { status: 400 }
    );
  }

  try {
    const result = await verimorService.getCallStatus(callId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Call Status API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Arama durumu sorgulama hatası' },
      { status: 500 }
    );
  }
}
