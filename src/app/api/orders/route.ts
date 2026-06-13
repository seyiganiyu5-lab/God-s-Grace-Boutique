import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const orders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, customerPhone, items, total, paymentMethod } = body;
    
    if (!customerName || !items || !total) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const order = await db.order.create({
      data: {
        customerName,
        customerPhone: customerPhone || '',
        items: typeof items === 'string' ? items : JSON.stringify(items),
        total: parseFloat(total),
        paymentMethod: paymentMethod || 'wave',
      },
    });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
