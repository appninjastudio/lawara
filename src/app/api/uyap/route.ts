// UYAP API Routes
import { NextRequest, NextResponse } from 'next/server';
import { uyapService } from '@/services/uyap.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, params } = body;

    let result;

    switch (action) {
      case 'queryCase':
        result = await uyapService.queryCase(params.caseNumber, params.courtCode);
        break;
      case 'queryDebtor':
        result = await uyapService.queryDebtor(params.tcNo);
        break;
      case 'queryMernis':
        result = await uyapService.queryMernis(params.tcNo);
        break;
      case 'querySgk':
        result = await uyapService.querySgk(params.tcNo);
        break;
      case 'queryTakbis':
        result = await uyapService.queryTakbis(params.tcNo);
        break;
      case 'queryEgmsis':
        result = await uyapService.queryEgmsis(params.tcNo);
        break;
      case 'maasHaczi':
        result = await uyapService.executeMaasHaczi(
          params.caseNumber,
          params.courtCode,
          params.tcNo,
          params.sgkSicilNo
        );
        break;
      case 'tasinmazHaczi':
        result = await uyapService.executeTasinmazHaczi(
          params.caseNumber,
          params.courtCode,
          params.tasinmazId
        );
        break;
      case 'aracHaczi':
        result = await uyapService.executeAracHaczi(
          params.caseNumber,
          params.courtCode,
          params.plaka
        );
        break;
      case 'bankaHaczi':
        result = await uyapService.executeBankaHaczi(
          params.caseNumber,
          params.courtCode,
          params.iban
        );
        break;
      case 'tebligat':
        result = await uyapService.sendTebligat(
          params.caseNumber,
          params.courtCode,
          params.recipientTcNo,
          params.documentType,
          params.address
        );
        break;
      case 'hacizIhbarnamesi':
        result = await uyapService.sendHacizIhbarnamesi(
          params.caseNumber,
          params.courtCode,
          params.ihbarnameType,
          params.recipientInfo
        );
        break;
      case 'odemeEmri':
        result = await uyapService.sendOdemeEmri(
          params.caseNumber,
          params.courtCode,
          params.debtorTcNo
        );
        break;
      default:
        return NextResponse.json(
          { error: 'Geçersiz işlem türü' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('UYAP API Error:', error);
    return NextResponse.json(
      { error: 'UYAP işlemi başarısız', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    uyapService.clearCache();
    return NextResponse.json({ success: true, message: 'Cache temizlendi' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Cache temizleme başarısız' },
      { status: 500 }
    );
  }
}
