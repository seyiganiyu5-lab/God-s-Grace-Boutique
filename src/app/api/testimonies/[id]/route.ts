import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.testimony.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete testimony' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const testimony = await db.testimony.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(testimony);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update testimony' }, { status: 500 });
  }
}
