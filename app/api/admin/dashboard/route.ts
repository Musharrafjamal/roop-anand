import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Sale from "@/models/Sale";
import Employee from "@/models/Employee";
import Product from "@/models/Product";
import MoneyRequest from "@/models/MoneyRequest";
import StockRequest from "@/models/StockRequest";
import { authOptions } from "@/lib/authOptions";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get filter parameters
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Get current date info
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    // Date filter for queries (optional)
    const filterStartDate = startDateParam ? new Date(startDateParam) : null;
    const filterEndDate = endDateParam ? new Date(endDateParam) : null;
    const hasDateFilter = filterStartDate && filterEndDate;

    // Build date match query for filtered data
    const dateMatchQuery = hasDateFilter
      ? { createdAt: { $gte: filterStartDate, $lt: filterEndDate } }
      : {};

    // Chart date range
    const chartStartDate = filterStartDate || new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);
    const chartEndDate = filterEndDate || todayEnd;

    // ============= FILTERED SALES DATA =============
    // Sales in the filtered date range (for stats cards)
    const filteredSalesResult = await Sale.aggregate([
      { $match: dateMatchQuery },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
    ]);
    const filteredSales = filteredSalesResult[0] || { total: 0, count: 0 };

    // Compare with previous period (same duration before the filter start)
    let previousPeriodSales = { total: 0, count: 0 };
    if (hasDateFilter) {
      const duration = filterEndDate.getTime() - filterStartDate.getTime();
      const prevStart = new Date(filterStartDate.getTime() - duration);
      const prevEnd = filterStartDate;
      const prevResult = await Sale.aggregate([
        { $match: { createdAt: { $gte: prevStart, $lt: prevEnd } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
      ]);
      previousPeriodSales = prevResult[0] || { total: 0, count: 0 };
    }

    // ============= TODAY'S SALES (always show) =============
    const todaySalesResult = await Sale.aggregate([
      { $match: { createdAt: { $gte: todayStart, $lt: todayEnd } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
    ]);
    const todaySales = todaySalesResult[0] || { total: 0, count: 0 };

    // Yesterday's sales for comparison
    const yesterdaySalesResult = await Sale.aggregate([
      { $match: { createdAt: { $gte: yesterdayStart, $lt: todayStart } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const yesterdaySales = yesterdaySalesResult[0]?.total || 0;

    // This month's sales
    const monthSalesResult = await Sale.aggregate([
      { $match: { createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
    ]);
    const monthSales = monthSalesResult[0] || { total: 0, count: 0 };

    // Last month's sales for comparison
    const lastMonthSalesResult = await Sale.aggregate([
      { $match: { createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const lastMonthSales = lastMonthSalesResult[0]?.total || 0;

    // ============= EMPLOYEE HOLDINGS (not date filtered - current state) =============
    const employeeHoldingsResult = await Employee.aggregate([
      {
        $group: {
          _id: null,
          totalCash: { $sum: "$holdings.cash" },
          totalOnline: { $sum: "$holdings.online" },
          totalHoldings: { $sum: "$holdings.total" }
        }
      }
    ]);
    const totalHoldings = employeeHoldingsResult[0] || { totalCash: 0, totalOnline: 0, totalHoldings: 0 };

    // ============= REQUESTS (filtered by date) =============
    const pendingStockRequests = await StockRequest.countDocuments({ status: "Pending", ...dateMatchQuery });
    const pendingMoneyRequests = await MoneyRequest.countDocuments({ status: "Pending", ...dateMatchQuery });
    const approvedStockRequests = await StockRequest.countDocuments({ status: "Approved", ...dateMatchQuery });
    const approvedMoneyRequests = await MoneyRequest.countDocuments({ status: "Approved", ...dateMatchQuery });
    const rejectedStockRequests = await StockRequest.countDocuments({ status: "Rejected", ...dateMatchQuery });
    const rejectedMoneyRequests = await MoneyRequest.countDocuments({ status: "Rejected", ...dateMatchQuery });

    // ============= EMPLOYEE COUNTS (not date filtered) =============
    const totalEmployees = await Employee.countDocuments();
    const onlineEmployees = await Employee.countDocuments({ status: "Online" });

    // ============= PRODUCT COUNTS (not date filtered) =============
    const totalProducts = await Product.countDocuments({ status: "Active" });
    const lowStockProducts = await Product.countDocuments({ 
      status: "Active",
      stockQuantity: { $lte: 10 }
    });

    // ============= TOP EMPLOYEES (filtered by date) =============
    const topEmployees = await Sale.aggregate([
      { $match: dateMatchQuery },
      {
        $group: {
          _id: "$employee",
          totalSales: { $sum: "$totalAmount" },
          salesCount: { $sum: 1 }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "_id",
          as: "employee"
        }
      },
      { $unwind: "$employee" },
      {
        $project: {
          _id: 1,
          name: "$employee.fullName",
          totalSales: 1,
          salesCount: 1,
          profilePhoto: "$employee.profilePhoto"
        }
      }
    ]);

    // ============= DAILY SALES FOR CHART (filtered) =============
    const dailySales = await Sale.aggregate([
      { $match: { createdAt: { $gte: chartStartDate, $lt: chartEndDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    // Transform daily sales to include proper date
    const formattedDailySales = dailySales.map(day => ({
      date: `${day._id.year}-${String(day._id.month).padStart(2, '0')}-${String(day._id.day).padStart(2, '0')}`,
      total: day.total,
      count: day.count
    }));

    // Fill in missing days with zero values
    const filledDailySales = [];
    const currentDate = new Date(chartStartDate);
    while (currentDate < chartEndDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existingDay = formattedDailySales.find(d => d.date === dateStr);
      filledDailySales.push({
        date: dateStr,
        total: existingDay?.total || 0,
        count: existingDay?.count || 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // ============= EMPLOYEE HOLDINGS LIST (not date filtered) =============
    const employeeHoldings = await Employee.find({ "holdings.total": { $gt: 0 } })
      .select("fullName holdings profilePhoto")
      .sort({ "holdings.total": -1 })
      .limit(10)
      .lean();

    const formattedEmployeeHoldings = employeeHoldings.map(emp => ({
      name: emp.fullName,
      cash: emp.holdings.cash,
      online: emp.holdings.online,
      total: emp.holdings.total,
      profilePhoto: emp.profilePhoto
    }));

    // ============= TOP PRODUCTS (filtered by date) =============
    const topProducts = await Sale.aggregate([
      { $match: dateMatchQuery },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          productTitle: { $first: "$items.productTitle" },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.totalPrice" }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $project: {
          _id: 1,
          name: { $ifNull: [{ $arrayElemAt: ["$product.title", 0] }, "$productTitle"] },
          photo: { $arrayElemAt: ["$product.photo", 0] },
          totalQuantity: 1,
          totalRevenue: 1
        }
      }
    ]);

    // ============= RECENT ACTIVITY (filtered by date, or last 5 if no filter) =============
    const activityDateQuery = hasDateFilter ? dateMatchQuery : {};
    
    const recentSales = await Sale.find(activityDateQuery)
      .populate("employee", "fullName profilePhoto")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentStockRequests = await StockRequest.find(activityDateQuery)
      .populate("employee", "fullName profilePhoto")
      .populate("product", "title")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentMoneyRequests = await MoneyRequest.find(activityDateQuery)
      .populate("employee", "fullName profilePhoto")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // ============= RESPONSE =============
    return NextResponse.json({
      statistics: {
        // Filtered sales summary (main stat card)
        filteredSales: {
          total: filteredSales.total,
          count: filteredSales.count,
          previousTotal: previousPeriodSales.total,
          percentChange: previousPeriodSales.total > 0 
            ? Math.round(((filteredSales.total - previousPeriodSales.total) / previousPeriodSales.total) * 100) 
            : 0
        },
        // Today's sales (always available)
        todaySales: {
          total: todaySales.total,
          count: todaySales.count,
          yesterdayTotal: yesterdaySales,
          percentChange: yesterdaySales > 0 
            ? Math.round(((todaySales.total - yesterdaySales) / yesterdaySales) * 100) 
            : 0
        },
        monthSales: {
          total: monthSales.total,
          count: monthSales.count,
          lastMonthTotal: lastMonthSales,
          percentChange: lastMonthSales > 0 
            ? Math.round(((monthSales.total - lastMonthSales) / lastMonthSales) * 100) 
            : 0
        },
        holdings: {
          total: totalHoldings.totalHoldings,
          cash: totalHoldings.totalCash,
          online: totalHoldings.totalOnline
        },
        pendingRequests: {
          stock: pendingStockRequests,
          money: pendingMoneyRequests,
          total: pendingStockRequests + pendingMoneyRequests
        },
        employees: {
          total: totalEmployees,
          online: onlineEmployees
        },
        products: {
          total: totalProducts,
          lowStock: lowStockProducts
        }
      },
      charts: {
        topEmployees,
        dailySales: filledDailySales,
        employeeHoldings: formattedEmployeeHoldings,
        topProducts,
        requestsOverview: {
          pendingStock: pendingStockRequests,
          pendingMoney: pendingMoneyRequests,
          approvedStock: approvedStockRequests,
          approvedMoney: approvedMoneyRequests,
          rejectedStock: rejectedStockRequests,
          rejectedMoney: rejectedMoneyRequests
        }
      },
      recentActivity: {
        sales: recentSales,
        stockRequests: recentStockRequests,
        moneyRequests: recentMoneyRequests
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
