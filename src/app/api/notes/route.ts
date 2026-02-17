import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const notes = await prisma.postItNote.findMany({
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json({ data: notes });
  } catch (error) {
    console.error('PostIt GET Error:', error);
    return NextResponse.json({ error: 'Notlar getirilemedi' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Başlık zorunludur' }, { status: 400 });
    }

    const session = await getSession();
    const userId = session?.id || (await prisma.user.findFirst())?.id || 1;

    const note = await prisma.postItNote.create({
      data: {
        userId,
        title: body.title.trim(),
        content: body.content?.trim() || '',
        color: body.color || 'yellow',
        caseId: body.caseId?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, data: note });
  } catch (error) {
    console.error('PostIt POST Error:', error);
    return NextResponse.json({ error: 'Not oluşturulamadı' }, { status: 500 });
  }
}
