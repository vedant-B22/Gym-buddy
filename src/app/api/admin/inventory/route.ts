import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, hasPermission } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'inventory:read')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [equipmentList, products] = await Promise.all([
      prisma.equipment.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          maintenanceLogs: {
            orderBy: { createdAt: 'desc' },
            take: 3,
            include: { loggedBy: { select: { name: true } } },
          },
        },
      }),
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { stockQuantity: 'asc' },
      }),
    ]);

    return NextResponse.json({ equipment: equipmentList, products });
  } catch (error: unknown) {
    console.error('Fetch inventory error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'inventory:write')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { type } = body;

    if (type === 'MAINTENANCE_LOG') {
      const { equipmentId, issueDescription, cost, status, notes } = body;
      if (!equipmentId || !issueDescription) {
        return NextResponse.json({ error: 'Equipment ID and issue description required' }, { status: 400 });
      }

      const log = await prisma.maintenanceLog.create({
        data: {
          equipmentId,
          loggedByUserId: session.userId,
          issueDescription,
          cost: parseFloat(cost) || 0,
          status: status || 'REPORTED',
          notes,
          resolvedAt: status === 'RESOLVED' ? new Date() : null,
        },
      });

      // Update equipment condition if resolved
      if (status === 'RESOLVED') {
        const todayStr = new Date().toISOString().split('T')[0];
        await prisma.equipment.update({
          where: { id: equipmentId },
          data: {
            condition: 'GOOD',
            lastServicedDate: todayStr,
          },
        });
      }

      return NextResponse.json({ success: true, log });
    }

    if (type === 'PRODUCT') {
      const { name, category, price, costPrice, stockQuantity, reorderLevel, sku } = body;
      if (!name || price === undefined) {
        return NextResponse.json({ error: 'Product name and price are required' }, { status: 400 });
      }

      const product = await prisma.product.create({
        data: {
          name,
          category: category || 'SUPPLEMENT',
          price: parseFloat(price),
          costPrice: parseFloat(costPrice) || 0,
          stockQuantity: parseInt(stockQuantity) || 0,
          reorderLevel: parseInt(reorderLevel) || 5,
          sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
        },
      });

      return NextResponse.json({ success: true, product });
    }

    // Default: Add Equipment
    const {
      name,
      category,
      purchaseDate,
      condition = 'EXCELLENT',
      warrantyExpiry,
      maintenanceFrequencyDays = 90,
      notes,
    } = body;

    if (!name || !category) {
      return NextResponse.json({ error: 'Equipment name and category are required' }, { status: 400 });
    }

    const equipment = await prisma.equipment.create({
      data: {
        name,
        category,
        purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
        condition,
        warrantyExpiry: warrantyExpiry || null,
        maintenanceFrequencyDays: parseInt(maintenanceFrequencyDays) || 90,
        notes,
      },
    });

    return NextResponse.json({ success: true, equipment });
  } catch (error: unknown) {
    console.error('Create inventory error:', error);
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || !hasPermission(session.role, 'inventory:write')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { id, type, condition, nextServiceDate, stockAdjustment } = body;

    if (type === 'PRODUCT_STOCK' && id) {
      const updated = await prisma.product.update({
        where: { id },
        data: {
          stockQuantity: {
            increment: parseInt(stockAdjustment) || 0,
          },
        },
      });
      return NextResponse.json({ success: true, product: updated });
    }

    if (id) {
      const updated = await prisma.equipment.update({
        where: { id },
        data: {
          ...(condition && { condition }),
          ...(nextServiceDate && { nextServiceDate }),
        },
      });
      return NextResponse.json({ success: true, equipment: updated });
    }

    return NextResponse.json({ error: 'Invalid update request' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Update inventory error:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}
