# Integration with Existing Payment System

## Current Payment Submission Flow

The parent payment API (`src/app/api/parent/[childId]/fee-vouchers/[id]/pay/route.js`) already includes pending payment handling:

### Key Lines from Payment API:
```javascript
// Line 82-88: Add payment to history with pending approval status
const payment = {
  amount,
  paymentDate: new Date(),
  paymentMethod,
  transactionId: transactionId || `TXN-${Date.now()}`,
  screenshot: { url: uploadResult.url, publicId: uploadResult.publicId },
  remarks,
  status: 'pending', // ← Pending admin approval
  submittedBy: userDoc._id,
};

voucher.paymentHistory.push(payment);
```

✅ **Payments are already stored as pending!**

---

## How Payment Moves Through the System

### Stage 1: Parent Submits (Already Working)
```javascript
// Endpoint: POST /api/parent/[childId]/fee-vouchers/[id]/pay
// Payment stored with status: "pending"
// Parent sees: "Payment submitted for approval"
```

Response:
```json
{
  "success": true,
  "message": "Payment submitted for approval",
  "payment": {
    "amount": 5000,
    "paymentDate": "2024-01-10T10:30:00Z",
    "paymentMethod": "online",
    "transactionId": "TXN-1234567890",
    "status": "pending"
  }
}
```

### Stage 2: Admin Reviews (NEW - Pending Fees Page)
```javascript
// Endpoint: GET /api/branch-admin/pending-fees
// Shows all payments with status: "pending"
// Branch admin reviews and decides
```

### Stage 3a: Admin Approves (NEW - Approve API)
```javascript
// Endpoint: POST /api/branch-admin/pending-fees/approve
// Payment status: "pending" → "approved"
// Voucher updates:
//   - paidAmount increases
//   - remainingAmount decreases
//   - status updates to "paid" or "partial"
```

### Stage 3b: Admin Rejects (NEW - Reject API)
```javascript
// Endpoint: POST /api/branch-admin/pending-fees/reject
// Payment status: "pending" → "rejected"
// Voucher unchanged, parent can resubmit
```

---

## Database State Progression

### After Parent Submits:
```javascript
voucher.paymentHistory = [{
  amount: 5000,
  status: 'pending',          // ← Waiting for approval
  submittedBy: parentId,
  paymentDate: new Date(),
  screenshot: { url: "..." }
}]

voucher.paidAmount = 0        // Not counted yet
voucher.status = 'pending'    // No approved payments
```

### After Admin Approves:
```javascript
voucher.paymentHistory = [{
  amount: 5000,
  status: 'approved',         // ← Approved!
  submittedBy: parentId,
  approvedBy: adminId,        // ← Now has approver
  approvedAt: new Date(),
  paymentDate: new Date()
}]

voucher.paidAmount = 5000     // Updated!
voucher.remainingAmount = 0
voucher.status = 'paid'       // If fully paid
```

### After Admin Rejects:
```javascript
voucher.paymentHistory = [{
  amount: 5000,
  status: 'rejected',         // ← Rejected
  submittedBy: parentId,
  approvedBy: adminId,        // ← Rejector's ID
  approvedAt: new Date(),
  rejectionReason: "Invalid transaction ID"
}]

voucher.paidAmount = 0        // Unchanged
voucher.status = 'pending'    // Still pending
// Parent can submit new payment
```

---

## No Changes Needed to Payment API!

The new Pending Fees system works with the **existing** payment API. No modifications required.

The payment submission already:
- ✅ Stores payments as pending
- ✅ Uploads screenshot to Cloudinary
- ✅ Validates amount and payment method
- ✅ Creates proper FeeVoucher entry

---

## Complete User Journey

### For Parent:
1. Open Fee Payment form
2. Select payment method
3. Upload receipt screenshot
4. Submit payment
5. See: "Payment submitted for approval"
6. Later: Admin approves → Voucher marked paid

### For Branch Admin:
1. Open Pending Fees page
2. See all pending payments from parents
3. Review each payment:
   - Check student details
   - View receipt screenshot
   - Verify transaction ID
4. Approve → Marks paid
5. Or Reject → Stores reason

---

## Query to Find All Pending Payments

```javascript
// In Node.js or API
const pendingVouchers = await FeeVoucher.find({
  'paymentHistory.status': 'pending'
});

// Get just pending payments:
const pendingPayments = [];
for (const voucher of pendingVouchers) {
  const pending = voucher.paymentHistory.filter(p => p.status === 'pending');
  pendingPayments.push(...pending);
}
```

This is exactly what the new `/api/branch-admin/pending-fees` endpoint does!

---

## Testing the Complete Flow

### 1. Setup Test Data
```bash
# Make sure you have:
# - A branch admin user
# - A parent user
# - A student enrolled in the branch
# - A fee voucher assigned to the student
```

### 2. Submit Payment (as Parent)
```bash
curl -X POST http://localhost:3000/api/parent/[childId]/fee-vouchers/[id]/pay \
  -F "amount=5000" \
  -F "paymentMethod=online" \
  -F "transactionId=TXN-123" \
  -F "screenshot=@receipt.jpg"

# Response should show status: "pending"
```

### 3. Check Pending Fees (as Admin)
```bash
curl http://localhost:3000/api/branch-admin/pending-fees \
  -H "Authorization: Bearer [admin-token]"

# Should show the payment just submitted
```

### 4. Approve Payment (as Admin)
```bash
curl -X POST http://localhost:3000/api/branch-admin/pending-fees/approve \
  -H "Content-Type: application/json" \
  -d '{"voucherId": "[id]", "paymentIndex": 0}'

# Voucher status should update to "paid"
```

---

## Summary

The **Pending Fees System** is a complete payment approval workflow that:

✅ Uses **existing** payment submission mechanism  
✅ Adds **admin review** layer for payments  
✅ Supports **approval and rejection** workflows  
✅ **Automatically updates** voucher totals and status  
✅ **Stores audit trail** (who approved, when, reason if rejected)  
✅ **Branch-scoped** - admins only see their branch's payments  

Everything is ready to use!
