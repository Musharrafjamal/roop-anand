import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MoneyRequest from '@/models/MoneyRequest';
import Employee from '@/models/Employee';
import { verifyMobileAuth } from '@/lib/verifyMobileAuth';

/**
 * GET /api/mobile/requests/money
 * Get all money requests for the authenticated employee
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

    // Get query params for filtering and pagination
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = { employee: user.id };
    if (status && status !== 'all') {
      query.status = status;
    }

    // Get total count for pagination
    const totalCount = await MoneyRequest.countDocuments(query);

    const requests = await MoneyRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Transform response
    const formattedRequests = requests.map((req) => ({
      _id: req._id.toString(),
      amount: req.amount,
      method: req.method,
      referenceNumber: req.referenceNumber,
      status: req.status,
      rejectionReason: req.rejectionReason,
      createdAt: req.createdAt,
      processedAt: req.processedAt,
    }));

    return NextResponse.json({
      success: true,
      requests: formattedRequests,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + requests.length < totalCount,
      },
    });
  } catch (error) {
    console.error('Money requests fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mobile/requests/money
 * Create a new money request for the authenticated employee
 * Requires: Authorization: Bearer <token>
 * Body: { amount: number, method: 'Cash' | 'Online', referenceNumber?: string }
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
    const { amount, method, referenceNumber } = body;

    // Validation
    if (!amount || amount < 1) {
      return NextResponse.json(
        { success: false, message: 'Amount must be at least ₹1' },
        { status: 400 }
      );
    }

    if (!method || !['Cash', 'Online'].includes(method)) {
      return NextResponse.json(
        { success: false, message: 'Method must be either "Cash" or "Online"' },
        { status: 400 }
      );
    }

    if (method === 'Online' && (!referenceNumber || referenceNumber.trim().length === 0)) {
      return NextResponse.json(
        { success: false, message: 'Reference number is required for online payments' },
        { status: 400 }
      );
    }

    // Get employee to check holdings
    const employee = await Employee.findById(user.id);
    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check if employee has enough holdings
    const holdingsField = method === 'Cash' ? 'cash' : 'online';
    const availableAmount = employee.holdings?.[holdingsField] || 0;

    if (availableAmount < amount) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Insufficient ${method.toLowerCase()} holdings`,
          available: availableAmount,
          requested: amount,
        },
        { status: 400 }
      );
    }

    // Create the money request
    const moneyRequest = await MoneyRequest.create({
      employee: user.id,
      amount,
      method,
      referenceNumber: method === 'Online' ? referenceNumber.trim() : undefined,
      status: 'Pending',
    });

    return NextResponse.json({
      success: true,
      message: 'Money request created successfully',
      request: {
        _id: moneyRequest._id.toString(),
        amount: moneyRequest.amount,
        method: moneyRequest.method,
        referenceNumber: moneyRequest.referenceNumber,
        status: moneyRequest.status,
        createdAt: moneyRequest.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Money request creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
