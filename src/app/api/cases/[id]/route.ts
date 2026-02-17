// Single Case API Routes - GET, PUT, DELETE by ID
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const caseId = parseInt(id);

    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        debtor: true,
        creditor: true,
        court: true,
        createdBy: { select: { id: true, name: true, email: true } },
        transactions: { orderBy: { transactionDate: 'desc' } },
        commitments: {
          include: { installments: { orderBy: { installmentNumber: 'asc' } } },
        },
        notes: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        notifications: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!caseData) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ data: caseData });
  } catch (error) {
    console.error('Case GET Error:', error);
    return NextResponse.json({ error: 'Dosya getirilemedi' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const caseId = parseInt(id);
    const body = await request.json();

    const existing = await prisma.case.findUnique({ where: { id: caseId } });
    if (!existing) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 404 });
    }

    const principalAmount = body.principalAmount !== undefined
      ? parseFloat(body.principalAmount)
      : existing.principalAmount;
    const interestAmount = body.interestAmount !== undefined
      ? parseFloat(body.interestAmount)
      : existing.interestAmount;

    const updated = await prisma.case.update({
      where: { id: caseId },
      data: {
        ...(body.caseNumber && { caseNumber: body.caseNumber }),
        ...(body.foyNumber !== undefined && { foyNumber: body.foyNumber }),
        ...(body.debtorId && { debtorId: parseInt(body.debtorId) }),
        ...(body.creditorId && { creditorId: parseInt(body.creditorId) }),
        ...(body.courtId && { courtId: parseInt(body.courtId) }),
        ...(body.principalAmount !== undefined && { principalAmount }),
        ...(body.interestAmount !== undefined && { interestAmount }),
        totalAmount: principalAmount + interestAmount,
        ...(body.caseType && { caseType: body.caseType }),
        ...(body.status && { status: body.status }),
        ...(body.closeDate && { closeDate: new Date(body.closeDate) }),
      },
      include: {
        debtor: true,
        creditor: true,
        court: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Dosya başarıyla güncellendi',
    });
  } catch (error) {
    console.error('Case PUT Error:', error);
    return NextResponse.json({ error: 'Dosya güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const caseId = parseInt(id);

    const existing = await prisma.case.findUnique({ where: { id: caseId } });
    if (!existing) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 404 });
    }

    // Cascade delete related records
    await prisma.caseNotification.deleteMany({ where: { caseId } });
    await prisma.caseNote.deleteMany({ where: { caseId } });
    const commitments = await prisma.commitment.findMany({ where: { caseId }, select: { id: true } });
    if (commitments.length > 0) {
      await prisma.commitmentInstallment.deleteMany({ where: { commitmentId: { in: commitments.map(c => c.id) } } });
      await prisma.commitment.deleteMany({ where: { caseId } });
    }
    await prisma.transaction.deleteMany({ where: { caseId } });
    await prisma.case.delete({ where: { id: caseId } });

    return NextResponse.json({
      success: true,
      message: 'Dosya başarıyla silindi',
    });
  } catch (error) {
    console.error('Case DELETE Error:', error);
    return NextResponse.json({ error: 'Dosya silinemedi' }, { status: 500 });
  }
}
