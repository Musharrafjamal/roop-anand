import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import Sale from '@/models/Sale';
import StockRequest from '@/models/StockRequest';
import MoneyRequest from '@/models/MoneyRequest';
import '@/models/Product';
import { verifyMobileAuth } from '@/lib/verifyMobileAuth';

// Type for populated product in employee's products
interface PopulatedProduct {
  _id: Types.ObjectId;
  title: string;
  photo?: string;
  price: {
    base: number;
    lowestSellingPrice: number;
  };
}

// Type for employee's product assignment
interface EmployeeProduct {
  product: PopulatedProduct | Types.ObjectId;
  quantity: number;
  assignedAt: Date;
}

// Type definitions for period
type TimePeriod = 'today' | 'week' | 'month' | 'lastMonth' | 'lifetime';

/**
 * Calculate date range for the given time period
 */
function getDateRange(period: TimePeriod): { startDate: Date; endDate: Date } {
  const now = new Date();
  let endDate = new Date(now);
  let startDate: Date;

  switch (period) {
    case 'today':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'lastMonth':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'lifetime':
    default:
      startDate = new Date(0); // Beginning of time
      endDate.setHours(23, 59, 59, 999);
      break;
  }

  return { startDate, endDate };
}

/**
 * GET /api/mobile/dashboard
 * Get comprehensive dashboard data for the authenticated employee
 * Requires: Authorization: Bearer <token>
 * Query params: period (today|week|month|lastMonth|lifetime) - default: today
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

    // Get query params
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || 'today') as TimePeriod;

    // Validate period
    const validPeriods: TimePeriod[] = ['today', 'week', 'month', 'lastMonth', 'lifetime'];
    if (!validPeriods.includes(period)) {
      return NextResponse.json(
        { success: false, message: 'Invalid period. Valid values: today, week, month, lastMonth, lifetime' },
        { status: 400 }
      );
    }

    const { startDate, endDate } = getDateRange(period);
    const dateFilter = { $gte: startDate, $lte: endDate };

    // Get employee with populated products
    const employee = await Employee.findById(user.id)
      .populate('products.product', 'title photo price')
      .lean();

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      );
    }

    // ============================================
    // 1. HOLDINGS SUMMARY
    // ============================================
    const holdings = {
      cash: employee.holdings?.cash || 0,
      online: employee.holdings?.online || 0,
      total: employee.holdings?.total || 0,
    };

    // ============================================
    // 2. STOCK SUMMARY (Products held by employee)
    // ============================================
    const products = employee.products as unknown as EmployeeProduct[];
    let totalStockQuantity = 0;
    let estimatedStockValue = 0;
    const productsList: Array<{
      productId: string;
      title: string;
      photo: string | null;
      quantity: number;
      basePrice: number;
      lowestPrice: number;
      estimatedValue: number;
    }> = [];

    for (const item of products || []) {
      const product = item.product as PopulatedProduct;
      if (product && product._id) {
        const quantity = item.quantity;
        const value = product.price.base * quantity;
        
        totalStockQuantity += quantity;
        estimatedStockValue += value;

        productsList.push({
          productId: product._id.toString(),
          title: product.title,
          photo: product.photo || null,
          quantity,
          basePrice: product.price.base,
          lowestPrice: product.price.lowestSellingPrice,
          estimatedValue: value,
        });
      }
    }

    const stockSummary = {
      totalProducts: productsList.length,
      totalQuantity: totalStockQuantity,
      estimatedValue: estimatedStockValue,
      products: productsList,
    };

    // ============================================
    // 3. SALES INSIGHTS
    // ============================================
    const salesQuery = {
      employee: new Types.ObjectId(user.id),
      createdAt: dateFilter,
    };

    const [salesData, topProducts] = await Promise.all([
      // Aggregate sales data
      Sale.aggregate([
        { $match: salesQuery },
        {
          $group: {
            _id: null,
            totalSales: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            cashSales: {
              $sum: { $cond: [{ $eq: ['$paymentMethod', 'Cash'] }, 1, 0] },
            },
            cashRevenue: {
              $sum: { $cond: [{ $eq: ['$paymentMethod', 'Cash'] }, '$totalAmount', 0] },
            },
            onlineSales: {
              $sum: { $cond: [{ $eq: ['$paymentMethod', 'Online'] }, 1, 0] },
            },
            onlineRevenue: {
              $sum: { $cond: [{ $eq: ['$paymentMethod', 'Online'] }, '$totalAmount', 0] },
            },
            avgSaleValue: { $avg: '$totalAmount' },
            totalItemsSold: { $sum: { $size: '$items' } },
          },
        },
      ]),

      // Get top selling products for this period
      Sale.aggregate([
        { $match: salesQuery },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            productTitle: { $first: '$items.productTitle' },
            quantitySold: { $sum: '$items.quantity' },
            revenue: { $sum: '$items.totalPrice' },
          },
        },
        { $sort: { quantitySold: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const salesStats = salesData[0] || {
      totalSales: 0,
      totalRevenue: 0,
      cashSales: 0,
      cashRevenue: 0,
      onlineSales: 0,
      onlineRevenue: 0,
      avgSaleValue: 0,
      totalItemsSold: 0,
    };

    const salesInsights = {
      totalSales: salesStats.totalSales,
      totalRevenue: salesStats.totalRevenue,
      avgSaleValue: Math.round(salesStats.avgSaleValue * 100) / 100,
      totalItemsSold: salesStats.totalItemsSold,
      byPaymentMethod: {
        cash: {
          count: salesStats.cashSales,
          revenue: salesStats.cashRevenue,
        },
        online: {
          count: salesStats.onlineSales,
          revenue: salesStats.onlineRevenue,
        },
      },
      topProducts: topProducts.map((p) => ({
        productId: p._id?.toString() || null,
        title: p.productTitle,
        quantitySold: p.quantitySold,
        revenue: p.revenue,
      })),
    };

    // ============================================
    // 4. MONEY DEPOSIT REQUEST INSIGHTS
    // ============================================
    const moneyRequestQuery = {
      employee: new Types.ObjectId(user.id),
      createdAt: dateFilter,
    };

    const moneyRequestsData = await MoneyRequest.aggregate([
      { $match: moneyRequestQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const moneyRequestStats = {
      pending: { count: 0, amount: 0 },
      approved: { count: 0, amount: 0 },
      rejected: { count: 0, amount: 0 },
    };

    let totalMoneyRequests = 0;
    let totalMoneyAmount = 0;

    for (const item of moneyRequestsData) {
      const status = (item._id as string).toLowerCase() as 'pending' | 'approved' | 'rejected';
      if (moneyRequestStats[status]) {
        moneyRequestStats[status] = { count: item.count, amount: item.totalAmount };
        totalMoneyRequests += item.count;
        totalMoneyAmount += item.totalAmount;
      }
    }

    const moneyDepositInsights = {
      total: {
        count: totalMoneyRequests,
        amount: totalMoneyAmount,
      },
      byStatus: moneyRequestStats,
    };

    // ============================================
    // 5. STOCK REQUEST INSIGHTS
    // ============================================
    const stockRequestQuery = {
      employee: new Types.ObjectId(user.id),
      createdAt: dateFilter,
    };

    const stockRequestsData = await StockRequest.aggregate([
      { $match: stockRequestQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
        },
      },
    ]);

    const stockRequestStats = {
      pending: { count: 0, quantity: 0 },
      approved: { count: 0, quantity: 0 },
      rejected: { count: 0, quantity: 0 },
    };

    let totalStockRequests = 0;
    let totalRequestedQuantity = 0;

    for (const item of stockRequestsData) {
      const status = (item._id as string).toLowerCase() as 'pending' | 'approved' | 'rejected';
      if (stockRequestStats[status]) {
        stockRequestStats[status] = { count: item.count, quantity: item.totalQuantity };
        totalStockRequests += item.count;
        totalRequestedQuantity += item.totalQuantity;
      }
    }

    const stockRequestInsights = {
      total: {
        count: totalStockRequests,
        quantity: totalRequestedQuantity,
      },
      byStatus: stockRequestStats,
    };

    // ============================================
    // 6. RECENT ACTIVITY
    // ============================================
    const [recentSales, recentMoneyRequests, recentStockRequests] = await Promise.all([
      Sale.find({ employee: user.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('totalAmount paymentMethod customer.name createdAt')
        .lean(),
      
      MoneyRequest.find({ employee: user.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('amount method status createdAt')
        .lean(),
      
      StockRequest.find({ employee: user.id })
        .populate('product', 'title')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('quantity status createdAt product')
        .lean(),
    ]);

    const recentActivity = {
      sales: recentSales.map((s) => ({
        _id: s._id.toString(),
        amount: s.totalAmount,
        paymentMethod: s.paymentMethod,
        customerName: s.customer?.name || 'Unknown',
        createdAt: s.createdAt,
      })),
      moneyRequests: recentMoneyRequests.map((r) => ({
        _id: r._id.toString(),
        amount: r.amount,
        method: r.method,
        status: r.status,
        createdAt: r.createdAt,
      })),
      stockRequests: recentStockRequests.map((r) => {
        const product = r.product as unknown as { _id: Types.ObjectId; title: string } | null;
        return {
          _id: r._id.toString(),
          productTitle: product?.title || 'Unknown Product',
          quantity: r.quantity,
          status: r.status,
          createdAt: r.createdAt,
        };
      }),
    };

    // ============================================
    // 7. EMPLOYEE INFO
    // ============================================
    const employeeInfo = {
      id: employee._id.toString(),
      fullName: employee.fullName,
      profilePhoto: employee.profilePhoto || null,
      status: employee.status,
      dateOfJoining: employee.dateOfJoining,
    };

    // ============================================
    // RESPONSE
    // ============================================
    return NextResponse.json({
      success: true,
      period,
      dateRange: {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
      },
      employee: employeeInfo,
      holdings,
      stockSummary,
      salesInsights,
      moneyDepositInsights,
      stockRequestInsights,
      recentActivity,
    });

  } catch (error) {
    console.error('Dashboard fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
