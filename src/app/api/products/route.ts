import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const featured = searchParams.get('featured');
    
    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = categoryId;
    if (featured === 'true') where.featured = true;
    
    const products = await db.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, nameFr, description, descriptionFr, price, image, categoryId, inStock, featured } = body;
    
    if (!name || !nameFr || !description || !descriptionFr || !price || !image || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const product = await db.product.create({
      data: {
        name,
        nameFr,
        description,
        descriptionFr,
        price: parseFloat(price),
        image,
        categoryId,
        inStock: inStock !== undefined ? inStock : true,
        featured: featured !== undefined ? featured : false,
      },
      include: { category: true },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
