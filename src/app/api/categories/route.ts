import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      include: { products: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, nameFr, slug, image } = body;
    
    if (!name || !nameFr || !slug) {
      return NextResponse.json({ error: 'Name, nameFr, and slug are required' }, { status: 400 });
    }
    
    const category = await db.category.create({
      data: { name, nameFr, slug, image },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
