// Buyapar API Routes
import { NextRequest, NextResponse } from 'next/server';
import { buyaparService } from '@/services/buyapar.service';
import type { BuyaparActionType } from '@/types/uyap';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, caseIds, priority } = body;

    if (!caseIds || !Array.isArray(caseIds) || caseIds.length === 0) {
      return NextResponse.json(
        { error: 'Dosya ID listesi gerekli' },
        { status: 400 }
      );
    }

    let result;

    switch (action as BuyaparActionType) {
      case 'TOPLU_MAAS_HACZI':
        result = await buyaparService.bulkMaasHaczi(caseIds);
        break;
      case 'TOPLU_TASINMAZ_HACZI':
        result = await buyaparService.bulkTasinmazHaczi(caseIds);
        break;
      case 'TOPLU_ARAC_HACZI':
        result = await buyaparService.bulkAracHaczi(caseIds);
        break;
      case 'TOPLU_BANKA_HACZI':
        result = await buyaparService.bulkBankaHaczi(caseIds);
        break;
      case 'TOPLU_SGK_SORGU':
        result = await buyaparService.bulkSgkSorgu(caseIds);
        break;
      case 'TOPLU_MERNIS_SORGU':
        result = await buyaparService.bulkMernisSorgu(caseIds);
        break;
      case 'TOPLU_TEBLIGAT':
        result = await buyaparService.bulkTebligat(caseIds);
        break;
      case 'TOPLU_103_DAVETIYE':
        result = await buyaparService.bulk103Davetiye(caseIds);
        break;
      case 'TOPLU_89_1_IHBAR':
        result = await buyaparService.bulk89_1Ihbar(caseIds);
        break;
      case 'TOPLU_89_2_IHBAR':
        result = await buyaparService.bulk89_2Ihbar(caseIds);
        break;
      case 'TOPLU_89_3_IHBAR':
        result = await buyaparService.bulk89_3Ihbar(caseIds);
        break;
      default:
        return NextResponse.json(
          { error: 'Geçersiz Buyapar işlem türü' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      ...result,
      message: `${caseIds.length} dosya için işlem kuyruğa eklendi`,
    });
  } catch (error) {
    console.error('Buyapar API Error:', error);
    return NextResponse.json(
      { error: 'Buyapar işlemi başarısız', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queueId = searchParams.get('queueId');
    const type = searchParams.get('type');

    if (type === 'stats') {
      const stats = await buyaparService.getActionStats();
      return NextResponse.json({ success: true, stats });
    }

    if (type === 'pending') {
      const pending = buyaparService.getPendingActions();
      return NextResponse.json({ success: true, pending });
    }

    if (queueId) {
      const status = await buyaparService.getBatchStatus(queueId);
      if (!status) {
        return NextResponse.json(
          { error: 'Kuyruk bulunamadı' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, status });
    }

    return NextResponse.json(
      { error: 'queueId veya type parametresi gerekli' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Buyapar GET Error:', error);
    return NextResponse.json(
      { error: 'Durum sorgusu başarısız' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queueId = searchParams.get('queueId');

    if (!queueId) {
      return NextResponse.json(
        { error: 'queueId parametresi gerekli' },
        { status: 400 }
      );
    }

    const cancelled = await buyaparService.cancelBatch(queueId);
    
    if (!cancelled) {
      return NextResponse.json(
        { error: 'İşlem iptal edilemedi' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'İşlem iptal edildi',
    });
  } catch (error) {
    console.error('Buyapar DELETE Error:', error);
    return NextResponse.json(
      { error: 'İptal işlemi başarısız' },
      { status: 500 }
    );
  }
}
