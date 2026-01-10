import { NextResponse } from 'next/server';
import { withAuth } from '@/backend/middleware/auth';
import connectDB from '@/lib/database';
import FeeVoucher from '@/backend/models/FeeVoucher';
import User from '@/backend/models/User';

const handler = withAuth(async (request, user, userDoc, context) => {
  try {
    // Check if user is branch admin
    if (user.role !== 'branch-admin') {
      return NextResponse.json(
        { success: false, message: 'Only branch admins can approve payments' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { voucherId, paymentIndex } = body;

    if (!voucherId || paymentIndex === undefined) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user's branch
    const branchAdmin = await User.findById(userDoc._id).populate('branchProfile.branchId');
    if (!branchAdmin?.branchProfile?.branchId) {
      return NextResponse.json(
        { success: false, message: 'Branch not found' },
        { status: 400 }
      );
    }

    const branchId = branchAdmin.branchProfile.branchId._id;

    // Find the voucher
    const voucher = await FeeVoucher.findById(voucherId);
    if (!voucher) {
      return NextResponse.json(
        { success: false, message: 'Fee voucher not found' },
        { status: 404 }
      );
    }

    // Verify branch ownership
    if (voucher.branchId.toString() !== branchId.toString()) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if payment exists and is pending
    const payment = voucher.paymentHistory[paymentIndex];
    if (!payment) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      );
    }

    if (payment.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: `Payment is already ${payment.status}` },
        { status: 400 }
      );
    }

    // Approve the payment
    payment.status = 'approved';
    payment.approvedBy = userDoc._id;
    payment.approvedAt = new Date();

    // Update paid amount and remaining amount
    const totalApprovedAmount = voucher.paymentHistory
      .filter((p) => p.status === 'approved')
      .reduce((sum, p) => sum + p.amount, 0);

    voucher.paidAmount = totalApprovedAmount;
    voucher.remainingAmount = Math.max(0, voucher.totalAmount - totalApprovedAmount);

    // Update voucher status
    if (voucher.remainingAmount <= 0) {
      voucher.status = 'paid';
    } else if (totalApprovedAmount > 0) {
      voucher.status = 'partial';
    }

    await voucher.save();

    return NextResponse.json({
      success: true,
      message: 'Payment approved successfully',
      data: {
        voucherId: voucher._id,
        voucherNumber: voucher.voucherNumber,
        paidAmount: voucher.paidAmount,
        remainingAmount: voucher.remainingAmount,
        status: voucher.status,
      },
    });
  } catch (error) {
    console.error('Error approving payment:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to approve payment' },
      { status: 500 }
    );
  }
});

export async function POST(request, context) {
  return handler(request, context);
}
