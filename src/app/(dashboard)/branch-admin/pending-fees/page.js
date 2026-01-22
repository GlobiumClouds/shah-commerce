'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import Image from 'next/image';

export default function BranchAdminPendingFeesPage() {
  const { user, loading: authLoading } = useAuth();
  const { execute: request } = useApi();
  const [pendingPayments, setPendingPayments] = useState([]);
  const [approvedPayments, setApprovedPayments] = useState([]);
  const [rejectedPayments, setRejectedPayments] = useState([]);
  const [statistics, setStatistics] = useState({
    pending: { count: 0, totalAmount: 0 },
    approved: { count: 0, totalAmount: 0 },
    rejected: { count: 0, totalAmount: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve', 'reject', or 'view'
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved', 'rejected'

  // Fetch pending payments
  useEffect(() => {
    if (authLoading || !user) return;

    const fetchPendingPayments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Token nikaalein
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

        // Fetch call with Authorization header
        const res = await fetch('/api/branch-admin/pending-fees', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const response = await res.json();

        if (response.success) {
          setPendingPayments(response.data || []);
          setApprovedPayments(response.approvedPayments || []);
          setRejectedPayments(response.rejectedPayments || []);
          setStatistics(response.statistics || {
            pending: { count: 0, totalAmount: 0 },
            approved: { count: 0, totalAmount: 0 },
            rejected: { count: 0, totalAmount: 0 },
          });
        } else {
          setError(response.message || "Failed to fetch pending payments");
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Failed to connect to server.");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingPayments();
  }, [authLoading, user, request]);

  const handleApprove = (payment) => {
    setSelectedPayment(payment);
    setActionType('approve');
    setRejectionReason('');
    setShowModal(true);
  };

  const handleReject = (payment) => {
    setSelectedPayment(payment);
    setActionType('reject');
    setRejectionReason('');
    setShowModal(true);
  };

  const handleView = (payment) => {
    setSelectedPayment(payment);
    setActionType('view');
    setShowModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedPayment) return;

    if (actionType === 'reject' && !rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const endpoint = actionType === 'approve'
        ? '/api/branch-admin/pending-fees/approve'
        : '/api/branch-admin/pending-fees/reject';

      const payload = {
        voucherId: selectedPayment.voucherId,
        paymentIndex: selectedPayment.paymentIndex,
        ...(actionType === 'reject' && { rejectionReason })
      };

      const response = await request(endpoint, payload);

      if (response.success) {
        setSuccessMessage(
          `Payment ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`
        );
        // Remove the payment from the list
        setPendingPayments(pendingPayments.filter(p => p.paymentId !== selectedPayment.paymentId));
        setShowModal(false);
        setSelectedPayment(null);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.message || `Failed to ${actionType} payment`);
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', fontSize: '18px', color: '#666' }}>Loading pending payments...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#333' }}>Pending Fee Payments (Branch Admin)</h1>
        <p style={{ margin: '0', color: '#666' }}>Review and approve/reject student fee payments for your branch</p>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#ffc107', fontSize: '18px' }}>Pending Payments</h3>
          <p style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>{statistics.pending.count}</p>
          <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>PKR {statistics.pending.totalAmount?.toLocaleString()}</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#28a745', fontSize: '18px' }}>Approved Payments</h3>
          <p style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{statistics.approved.count}</p>
          <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>PKR {statistics.approved.totalAmount?.toLocaleString()}</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#dc3545', fontSize: '18px' }}>Rejected Payments</h3>
          <p style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>{statistics.rejected.count}</p>
          <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>PKR {statistics.rejected.totalAmount?.toLocaleString()}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #ddd' }}>
          <button
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: activeTab === 'pending' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'pending' ? 'white' : '#666',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '4px 4px 0 0'
            }}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({statistics.pending.count})
          </button>
          <button
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: activeTab === 'approved' ? '#28a745' : '#f8f9fa',
              color: activeTab === 'approved' ? 'white' : '#666',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '4px 4px 0 0'
            }}
            onClick={() => setActiveTab('approved')}
          >
            Approved ({statistics.approved.count})
          </button>
          <button
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: activeTab === 'rejected' ? '#dc3545' : '#f8f9fa',
              color: activeTab === 'rejected' ? 'white' : '#666',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '4px 4px 0 0'
            }}
            onClick={() => setActiveTab('rejected')}
          >
            Rejected ({statistics.rejected.count})
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px', marginBottom: '20px', border: '1px solid', borderRadius: '4px', backgroundColor: '#fee', color: '#c33', borderColor: '#fcc' }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div style={{ padding: '10px', marginBottom: '20px', border: '1px solid', borderRadius: '4px', backgroundColor: '#efe', color: '#3c3', borderColor: '#cfc' }}>
          {successMessage}
        </div>
      )}

      {(() => {
        const currentPayments = activeTab === 'pending' ? pendingPayments : activeTab === 'approved' ? approvedPayments : rejectedPayments;
        const noDataMessage = activeTab === 'pending' ? 'No pending fee payments for your branch' : activeTab === 'approved' ? 'No approved fee payments for your branch' : 'No rejected fee payments for your branch';

        return currentPayments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>{noDataMessage}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Voucher #</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Student Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Class</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Payment Method</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                    {activeTab === 'approved' ? 'Approved Date' : 'Submitted Date'}
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Transaction ID</th>
                  {activeTab === 'pending' && (
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Actions</th>
                  )}
                  {activeTab === 'rejected' && (
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Rejection Reason</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentPayments.map((payment) => (
                  <tr key={payment.paymentId}>
                    <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                      <strong>{payment.voucherNumber}</strong>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{payment.studentName}</td>
                    <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>{payment.className}</td>
                    <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold', color: '#28a745' }}>
                      <strong>{payment.currency || 'PKR'} {payment.amount?.toFixed(2)}</strong>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                      <span style={{ display: 'inline-block', padding: '4px 8px', backgroundColor: '#007bff', color: 'white', borderRadius: '4px', fontSize: '12px' }}>
                        {payment.paymentMethod?.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                      {activeTab === 'approved' ? new Date(payment.approvedAt).toLocaleDateString() : new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                      <code>{payment.transactionId}</code>
                    </td>
                    {activeTab === 'pending' && (
                      <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', transition: 'background-color 0.3s', backgroundColor: '#007bff', color: 'white' }}
                            onClick={() => handleView(payment)}
                          >
                            View
                          </button>
                          <button
                            style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', transition: 'background-color 0.3s', backgroundColor: '#28a745', color: 'white' }}
                            onClick={() => handleApprove(payment)}
                          >
                            Approve
                          </button>
                          <button
                            style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', transition: 'background-color 0.3s', backgroundColor: '#dc3545', color: 'white' }}
                            onClick={() => handleReject(payment)}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                    {activeTab === 'rejected' && (
                      <td style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', color: '#dc3545' }}>
                        {payment.rejectedReason || 'No reason provided'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}

      {/* Action Modal */}
      {showModal && selectedPayment && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => !actionLoading && setShowModal(false)}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', maxWidth: '500px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#333' }}>
              {actionType === 'view' ? 'View Payment Details' : actionType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <p>
                <strong>Voucher:</strong> {selectedPayment.voucherNumber}
              </p>
              <p>
                <strong>Student:</strong> {selectedPayment.studentName}
              </p>
              <p>
                <strong>Class:</strong> {selectedPayment.className}
              </p>
              <p>
                <strong>Amount:</strong> {selectedPayment.currency || 'PKR'}{' '}
                {selectedPayment.amount?.toFixed(2)}
              </p>
              <p>
                <strong>Payment Method:</strong>{' '}
                {selectedPayment.paymentMethod?.replace('-', ' ').toUpperCase()}
              </p>
              <p>
                <strong>Transaction ID:</strong> {selectedPayment.transactionId}
              </p>
              <p>
                <strong>Submitted Date:</strong> {new Date(selectedPayment.paymentDate).toLocaleDateString()}
              </p>

              {/* Display screenshot */}
              {selectedPayment.screenshotUrl && (
                <div style={{ marginTop: '16px' }}>
                  <p>
                    <strong>Payment Receipt:</strong>
                  </p>
                  <div
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '8px',
                      maxHeight: '300px',
                      overflow: 'auto',
                    }}
                  >
                    <img
                      src={selectedPayment.screenshotUrl}
                      alt="Payment receipt"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  </div>
                </div>
              )}

              {actionType === 'reject' && (
                <div style={{ marginTop: '16px' }}>
                  <label>
                    <strong>Reason for Rejection:</strong>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '8px',
                      marginTop: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', transition: 'background-color 0.3s', backgroundColor: '#6c757d', color: 'white' }}
                onClick={() => setShowModal(false)}
                disabled={actionLoading}
              >
                {actionType === 'view' ? 'Close' : 'Cancel'}
              </button>
              {actionType !== 'view' && (
                <button
                  style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', transition: 'background-color 0.3s', backgroundColor: actionType === 'approve' ? '#28a745' : '#dc3545', color: 'white' }}
                  onClick={handleConfirmAction}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? actionType === 'approve'
                      ? 'Approving...'
                      : 'Rejecting...'
                    : actionType === 'approve'
                      ? 'Approve'
                      : 'Reject'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
