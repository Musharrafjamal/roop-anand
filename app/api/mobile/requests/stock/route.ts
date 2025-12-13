import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import dbConnect from '@/lib/mongodb';
import StockRequest from '@/models/StockRequest';
import Product from '@/models/Product';
import { verifyMobileAuth } from '@/lib/verifyMobileAuth';

// Type for populated product
interface PopulatedProduct {
  _id: Types.ObjectId;
  title: string;
  photo?: string;
  price: { base: number; lowestSellingPrice: number };
}

/**
 * GET /api/mobile/requests/stock
 * Get all stock requests for the authenticated employee
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

    // Get query params for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query: Record<string, unknown> = { employee: user.id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const requests = await StockRequest.find(query)
      .populate('product', 'title photo price')
      .sort({ createdAt: -1 });

    // Transform response
    const formattedRequests = requests.map((req) => {
      const product = req.product as unknown as PopulatedProduct | null;

      return {
        _id: req._id.toString(),
        product: product ? {
          _id: product._id.toString(),
          title: product.title,
          photo: product.photo,
          price: product.price,
        } : null,
        quantity: req.quantity,
        reason: req.reason,
        status: req.status,
        rejectionReason: req.rejectionReason,
        createdAt: req.createdAt,
        processedAt: req.processedAt,
      };
    });

    return NextResponse.json({
      success: true,
      requests: formattedRequests,
    });
  } catch (error) {
    console.error('Stock requests fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mobile/requests/stock
 * Create a new stock request for the authenticated employee
 * Requires: Authorization: Bearer <token>
 * Body: { productId: string, quantity: number, reason: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const auth = verifyMobileAuth(request);
    if (!auth.success) {
      return auth.response;
    }

    const { user } = auth;
    await dbConnect();

    const body = await request.json();
    const { productId, quantity, reason } = body;

    // Validation
    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'Product is required' },
        { status: 400 }
      );
    }

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, message: 'Quantity must be at least 1' },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Reason is required' },
        { status: 400 }
      );
    }

    if (reason.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: 'Reason must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Verify product exists and is active
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    if (product.status !== 'Active') {
      return NextResponse.json(
        { success: false, message: 'This product is currently inactive' },
        { status: 400 }
      );
    }

    // Create the stock request
    const stockRequest = await StockRequest.create({
      employee: user.id,
      product: productId,
      quantity,
      reason: reason.trim(),
      status: 'Pending',
    });

    // Populate and return
    const populatedRequest = await StockRequest.findById(stockRequest._id)
      .populate('product', 'title photo price');

    const productData = populatedRequest?.product as unknown as PopulatedProduct | null;

    return NextResponse.json({
      success: true,
      message: 'Stock request created successfully',
      request: {
        _id: populatedRequest?._id.toString(),
        product: productData ? {
          _id: productData._id.toString(),
          title: productData.title,
          photo: productData.photo,
          price: productData.price,
        } : null,
        quantity: populatedRequest?.quantity,
        reason: populatedRequest?.reason,
        status: populatedRequest?.status,
        createdAt: populatedRequest?.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Stock request creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
