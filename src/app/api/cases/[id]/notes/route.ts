import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const caseId = parseInt(id);
    const body = await request.json();

    if (!body.content?.trim()) {
      return NextResponse.json({ error: 'Not içeriği zorunludur' }, { status: 400 });
    }

    const session = await getSession();
    const userId = session?.id || (await prisma.user.findFirst())?.id || 1;

    const note = await prisma.caseNote.create({
      data: {
        caseId,
        userId,
        content: body.content.trim(),
        type: body.type || 'note',
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, data: note });
  } catch (error) {
    console.error('Note POST Error:', error);
    return NextResponse.json({ error: 'Not eklenemedi' }, { status: 500 });
  }
}
