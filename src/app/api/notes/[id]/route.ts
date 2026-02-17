import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const noteId = parseInt(id);
    const body = await request.json();

    const note = await prisma.postItNote.update({
      where: { id: noteId },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.content !== undefined && { content: body.content.trim() }),
        ...(body.color !== undefined && { color: body.color }),
        ...(body.caseId !== undefined && { caseId: body.caseId || null }),
        ...(body.pinned !== undefined && { pinned: body.pinned }),
      },
    });

    return NextResponse.json({ success: true, data: note });
  } catch (error) {
    console.error('PostIt PUT Error:', error);
    return NextResponse.json({ error: 'Not güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const noteId = parseInt(id);

    await prisma.postItNote.delete({ where: { id: noteId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PostIt DELETE Error:', error);
    return NextResponse.json({ error: 'Not silinemedi' }, { status: 500 });
  }
}
