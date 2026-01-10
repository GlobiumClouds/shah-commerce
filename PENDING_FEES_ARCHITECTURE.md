# Pending Fees System - Architecture Diagram

## Complete Payment Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                           PARENT SIDE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Parent Portal                                                        │
│  ↓                                                                    │
│  View Fee Voucher → Pay Fee → Upload Receipt → Submit Payment        │
│                                    ↓                                  │
│                           POST /api/parent/[childId]/fee-vouchers/[id]/pay
│                                    ↓                                  │
│                           Response: "Payment submitted for approval"  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓ (Payment stored as PENDING)
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE (MongoDB)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  FeeVoucher Collection                                               │
│  {                                                                    │
│    _id: "...",                                                        │
│    voucherNumber: "VOW-001",                                          │
│    studentId: "...",                                                  │
│    paymentHistory: [                                                  │
│      {                                                                │
│        amount: 5000,                                                  │
│        status: "pending",      ← Payment waiting for approval         │
│        paymentMethod: "online",                                       │
│        screenshot: { url: "..." },                                    │
│        submittedBy: parentId,                                         │
│      }                                                                │
│    ],                                                                 │
│    paidAmount: 0,              ← Not counted until approved           │
│    status: "pending"           ← Voucher still pending                │
│  }                                                                    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ↓ (Data flows to UI)
┌─────────────────────────────────────────────────────────────────────┐
│                        BRANCH ADMIN SIDE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  GET /api/branch-admin/pending-fees                                   │
│  ↓                                                                    │
│  Pending Fees Dashboard                                              │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                       PENDING FEES TABLE                       │  │
│  ├────────────────────────────────────────────────────────────────┤  │
│  │ Voucher # │ Student │ Amount │ Method │   Date    │ Actions   │  │
│  ├────────────────────────────────────────────────────────────────┤  │
│  │ VOW-001   │ John    │ ₹5000  │ Online │ 10-Jan    │ ✓ ✗ 📄   │  │
│  │ VOW-002   │ Jane    │ ₹3000  │ Cheque │ 09-Jan    │ ✓ ✗ 📄   │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                         │                                             │
│            ┌────────────┼────────────┐                                │
│            ↓            ↓            ↓                                │
│        Approve      Reject      View Receipt                          │
│            │            │            │                                │
│    ┌───────┴─────┐      │      ┌─────┴──────┐                       │
│    ↓             ↓      ↓      ↓             ↓                       │
│  Modal1         Modal2  Modal3 Screenshot Display                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐                   │
│  │Confirm   │  │Rejection │  │Payment Receipt   │                   │
│  │Approve?  │  │Reason:   │  │[   IMAGE    ]    │                   │
│  │          │  │_______   │  │                  │                   │
│  │[✓] [✗]   │  │[✓] [✗]   │  │[Close]            │                   │
│  └──────────┘  └──────────┘  └──────────────────┘                   │
│    │              │                                                   │
│    └──────────────┼──────────────────────────────────────────┐       │
│                   │                                          │       │
└─────────────────────────────────────────────────────────────────────┘
                   ↓                                          ↓
        POST /api/branch-admin/pending-fees/approve    POST /api/branch-admin/pending-fees/reject
                   │                                          │
                   ↓                                          ↓
        ┌──────────────────┐                    ┌──────────────────────┐
        │ APPROVE LOGIC    │                    │ REJECT LOGIC         │
        ├──────────────────┤                    ├──────────────────────┤
        │ 1. Mark approved │                    │ 1. Mark rejected     │
        │ 2. Set approver  │                    │ 2. Set rejector      │
        │ 3. Recalculate   │                    │ 3. Store reason      │
        │    paid amount   │                    │ 4. Save to DB        │
        │ 4. Update status │                    │ 5. Return success    │
        │    to paid/      │                    │                      │
        │    partial       │                    │ Result: Payment can  │
        │ 5. Save to DB    │                    │ be resubmitted       │
        │                  │                    │                      │
        │ Result: Voucher  │                    │                      │
        │ marked paid!     │                    │                      │
        └──────────────────┘                    └──────────────────────┘
                   │                                          │
                   └──────────────────┬───────────────────────┘
                                      ↓
                        ┌─────────────────────────┐
                        │   DATABASE UPDATED      │
                        ├─────────────────────────┤
                        │ paymentHistory: [{      │
                        │   status: "approved"    │ (or "rejected")
                        │   approvedBy: adminId   │
                        │   approvedAt: now       │
                        │ }]                      │
                        │                         │
                        │ paidAmount: 5000        │ (updated if approved)
                        │ status: "paid"          │ (if fully paid)
                        └─────────────────────────┘
                                      │
                                      ↓
                        ┌─────────────────────────┐
                        │  SUCCESS RESPONSE       │
                        ├─────────────────────────┤
                        │ {                       │
                        │   success: true,        │
                        │   message: "Payment     │
                        │   approved/rejected",   │
                        │   data: {...}           │
                        │ }                       │
                        └─────────────────────────┘
                                      │
                                      ↓
                        ┌─────────────────────────┐
                        │  REMOVE FROM TABLE      │
                        │  Update UI              │
                        │  Show Success Message   │
                        └─────────────────────────┘
```

---

## Component Structure

```
src/app/(dashboard)/branch-admin/
├── pending-fees/
│   └── page.js                          ← Main UI Component
│       ├── useApi() hook               ← API calls
│       ├── useAuth() hook               ← Authentication
│       ├── Pending Payments Table       ← Display
│       ├── Action Buttons               ← Approve/Reject
│       └── Modal Component              ← Confirmation dialogs
│
src/app/api/branch-admin/
├── pending-fees/
│   ├── route.js                         ← GET all pending
│   ├── approve/
│   │   └── route.js                     ← POST approve
│   └── reject/
│       └── route.js                     ← POST reject

src/backend/models/
├── FeeVoucher.js                        ← Payment storage
└── User.js                              ← User references
```

---

## Data Flow Sequences

### Sequence 1: Approval
```
UI Component
    │
    ├→ User clicks "Approve"
    │
    ├→ Open confirmation modal
    │
    ├→ User confirms
    │
    ├→ POST /api/branch-admin/pending-fees/approve
    │   {
    │     voucherId: "...",
    │     paymentIndex: 0
    │   }
    │
    ├→ API validates authorization
    ├→ Finds voucher & payment
    ├→ Sets status = "approved"
    ├→ Sets approvedBy = adminId
    ├→ Recalculates paidAmount
    ├→ Updates voucher status
    ├→ Saves to database
    │
    └→ Return success response
        │
        └→ Remove from table
          Display success message
          Update UI
```

### Sequence 2: Rejection
```
UI Component
    │
    ├→ User clicks "Reject"
    │
    ├→ Open rejection reason modal
    │
    ├→ User enters reason & confirms
    │
    ├→ POST /api/branch-admin/pending-fees/reject
    │   {
    │     voucherId: "...",
    │     paymentIndex: 0,
    │     rejectionReason: "..."
    │   }
    │
    ├→ API validates authorization
    ├→ Finds voucher & payment
    ├→ Sets status = "rejected"
    ├→ Sets approvedBy = adminId
    ├→ Stores rejectionReason
    ├→ Saves to database
    │
    └→ Return success response
        │
        └→ Remove from table
          Display success message
```

---

## State Management in Frontend

```javascript
// Component State
const [pendingPayments, setPendingPayments]          // All pending
const [selectedPayment, setSelectedPayment]          // Currently selected
const [showModal, setShowModal]                      // Modal visibility
const [actionType, setActionType]                    // 'approve' or 'reject'
const [rejectionReason, setRejectionReason]          // For rejection
const [actionLoading, setActionLoading]              // Processing
const [error, setError]                              // Error messages
const [successMessage, setSuccessMessage]            // Success messages

// Lifecycle
useEffect(() => {
  // Fetch pending payments on mount
})

// Handlers
handleApprove(payment)        // Open approve modal
handleReject(payment)         // Open reject modal
handleConfirmAction()         // Send API request
```

---

## Security Checks

```javascript
Authentication Layer
    ↓
Role Check: user.role === 'branch-admin'
    ↓
Branch Verification: voucher.branchId === admin.branchId
    ↓
Status Validation: payment.status === 'pending'
    ↓
Data Validation: All required fields present
    ↓
✓ Allow operation or ✗ Return 403/400 error
```

---

## Error Scenarios

```
┌─────────────────────────────────────┐
│         ERROR HANDLING              │
├─────────────────────────────────────┤
│                                      │
│ 403 Forbidden                        │
│ ├─ Not a branch admin               │
│ ├─ Different branch's payment       │
│ └─ Access denied                    │
│                                      │
│ 404 Not Found                        │
│ ├─ Voucher not found                │
│ └─ Payment not found                │
│                                      │
│ 400 Bad Request                      │
│ ├─ Payment not pending              │
│ ├─ Missing fields                   │
│ ├─ Invalid amount                   │
│ └─ No rejection reason              │
│                                      │
│ 500 Server Error                     │
│ └─ Database error                   │
│    (logged to console)              │
│                                      │
└─────────────────────────────────────┘
```

---

## Performance Optimizations

1. **Lean Queries**: Uses `.lean()` for read-only operations
2. **Proper Indexing**: FeeVoucher model has indexes on:
   - `status`, `branchId`, `paymentHistory.status`
3. **Pagination**: Can be added to fetch endpoint
4. **Caching**: Can be added for frequently accessed data

---

## Integration Checklist

- [x] Payment API stores pending status
- [x] Frontend page created
- [x] Fetch API endpoint created
- [x] Approve API endpoint created
- [x] Reject API endpoint created
- [x] Database model supports workflow
- [x] Error handling implemented
- [x] Authentication/Authorization checks
- [x] Documentation complete

✅ **System is ready for production use!**
