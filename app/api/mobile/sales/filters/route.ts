import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Sale from '@/models/Sale';
import '@/models/Product';
import { verifyMobileAuth } from '@/lib/verifyMobileAuth';

// Type for aggregated product filter option
interface ProductFilterOption {
  _id: string;
  title: string;
  photo?: string;
  salesCount: number;
}

/**
 * GET /api/mobile/sales/filters
 * Get available filter options for sales (products the employee has sold)
 * Requires: Authorization: Bearer <token>
 */
export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
    const auth = verifyMobileAuth(request);
    if (!auth.success) {
      return auth.response;
    }

    const { user } = auth;
    await dbConnect();

    // Aggregate to get unique products sold by this employee
    const productAggregation = await Sale.aggregate([
      // Match sales by this employee
      { $match: { employee: new Types.ObjectId(user.id) } },
      // Unwind items array to work with individual products
      { $unwind: '$items' },
      // Group by product to get unique products and count
      {
        $group: {
          _id: '$items.product',
          productTitle: { $first: '$items.productTitle' },
          salesCount: { $sum: 1 },
        },
      },
      // Lookup to get product details (photo)
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      // Unwind the product details (will be single item or empty)
      {
        $unwind: {
          path: '$productDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Project the final shape
      {
        $project: {
          _id: { $toString: '$_id' },
          title: { $ifNull: ['$productDetails.title', '$productTitle'] },
          photo: '$productDetails.photo',
          salesCount: 1,
        },
      },
      // Sort by sales count descending
      { $sort: { salesCount: -1 } },
    ]);

    // Get payment method breakdown
    const paymentMethodAggregation = await Sale.aggregate([
      { $match: { employee: new Types.ObjectId(user.id) } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    const paymentMethods = paymentMethodAggregation.map((pm) => ({
      method: pm._id as 'Cash' | 'Online',
      count: pm.count,
      totalAmount: pm.totalAmount,
    }));

    // Format products
    const products: ProductFilterOption[] = productAggregation.map((p) => ({
      _id: p._id,
      title: p.title,
      photo: p.photo || undefined,
      salesCount: p.salesCount,
    }));

    return NextResponse.json({
      success: true,
      filters: {
        products,
        paymentMethods,
      },
    });
  } catch (error) {
    console.error('Sales filters fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
