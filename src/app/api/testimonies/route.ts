import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const testimonies = await db.testimony.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(testimonies);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch testimonies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, message, rating } = body;
    
    if (!name || !message) {
      return NextResponse.json({ error: 'Name and message are required' }, { status: 400 });
    }
    
    const testimony = await db.testimony.create({
      data: {
        name,
        message,
        rating: rating || 5,
        approved: false,
      },
    });
    return NextResponse.json(testimony, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create testimony' }, { status: 500 });
  }
}
