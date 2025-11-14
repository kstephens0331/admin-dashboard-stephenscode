import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { customerDb } from '../auth/firebase';
import { motion } from 'framer-motion';

export default function ModuleRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, under-review, approved, in-progress, completed, rejected
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [quoteAmount, setQuoteAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const q = query(collection(customerDb, 'moduleRequests'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const requestsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequests(requestsList);
    } catch (error) {
      console.error('Error fetching module requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId, newStatus, quote = null) => {
    try {
      const requestRef = doc(customerDb, 'moduleRequests', requestId);
      const updateData = {
        status: newStatus,
        updatedAt: new Date()
      };

      if (quote !== null) {
        updateData.quoteAmount = parseFloat(quote);
      }

      await updateDoc(requestRef, updateData);

      setRequests(requests.map(r =>
        r.id === requestId ? { ...r, ...updateData } : r
      ));

      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest({ ...selectedRequest, ...updateData });
      }
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const handleApproveWithQuote = async () => {
    if (!quoteAmount || parseFloat(quoteAmount) <= 0) {
      alert('Please enter a valid quote amount');
      return;
    }

    await handleStatusChange(selectedRequest.id, 'approved', quoteAmount);
    setQuoteAmount('');
  };

  const handleAddNotes = async () => {
    if (!adminNotes.trim()) return;

    setProcessing(true);
    try {
      const requestRef = doc(customerDb, 'moduleRequests', selectedRequest.id);
      const existingNotes = selectedRequest.adminNotes || [];
      const newNote = {
        note: adminNotes,
        timestamp: new Date(),
        adminId: 'admin'
      };

      await updateDoc(requestRef, {
        adminNotes: [...existingNotes, newNote],
        updatedAt: new Date()
      });

      const updatedNotes = [...existingNotes, newNote];
      setRequests(requests.map(r =>
        r.id === selectedRequest.id
          ? { ...r, adminNotes: updatedNotes }
          : r
      ));

      setAdminNotes('');
      setSelectedRequest({ ...selectedRequest, adminNotes: updatedNotes });
    } catch (error) {
      console.error('Error adding notes:', error);
    } finally {
      setProcessing(false);
    }
  };

  const viewRequestDetails = (request) => {
    setSelectedRequest(request);
    setAdminNotes('');
    setQuoteAmount('');
    setShowModal(true);
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus =
      filterStatus === 'all' ||
      (request.status || 'pending') === filterStatus;

    return matchesStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => (r.status || 'pending') === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    inProgress: requests.filter(r => r.status === 'in-progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  const getStatusColor = (status) => {
    switch (status || 'pending') {
      case 'pending':
        return 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400';
      case 'under-review':
        return 'bg-blue-500/20 border border-blue-500/30 text-blue-400';
      case 'approved':
        return 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400';
      case 'in-progress':
        return 'bg-purple-500/20 border border-purple-500/30 text-purple-400';
      case 'completed':
        return 'bg-green-500/20 border border-green-500/30 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 border border-red-500/30 text-red-400';
      default:
        return 'bg-slate-500/20 border border-slate-500/30 text-slate-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading module requests...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
            Module Requests
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Manage client feature and module requests
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/50 backdrop-blur-sm">
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-slate-300 font-semibold">Module System</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-600/10 p-4 border-2 border-blue-500/30 overflow-hidden"
        >
          <div className="relative">
            <p className="text-xs text-slate-400 mb-1">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-600/10 p-4 border-2 border-yellow-500/30 overflow-hidden"
        >
          <div className="relative">
            <p className="text-xs text-slate-400 mb-1">Pending</p>
            <p className="text-2xl font-bold text-white">{stats.pending}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-600/10 p-4 border-2 border-emerald-500/30 overflow-hidden"
        >
          <div className="relative">
            <p className="text-xs text-slate-400 mb-1">Approved</p>
            <p className="text-2xl font-bold text-white">{stats.approved}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-600/10 p-4 border-2 border-purple-500/30 overflow-hidden"
        >
          <div className="relative">
            <p className="text-xs text-slate-400 mb-1">In Progress</p>
            <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="relative rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-600/10 p-4 border-2 border-green-500/30 overflow-hidden"
        >
          <div className="relative">
            <p className="text-xs text-slate-400 mb-1">Completed</p>
            <p className="text-2xl font-bold text-white">{stats.completed}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="relative rounded-2xl bg-gradient-to-br from-red-500/10 to-pink-600/10 p-4 border-2 border-red-500/30 overflow-hidden"
        >
          <div className="relative">
            <p className="text-xs text-slate-400 mb-1">Rejected</p>
            <p className="text-2xl font-bold text-white">{stats.rejected}</p>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="relative rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-700/80 p-6 border border-slate-600/50 backdrop-blur-sm overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>
        <div className="relative">
          <label className="block text-sm font-semibold text-slate-300 mb-3">Filter by Status</label>
          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'under-review', 'approved', 'in-progress', 'completed', 'rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                }`}
              >
                {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Requests List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="relative rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-700/80 p-8 border border-slate-600/50 backdrop-blur-sm overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">
              Module Requests ({filteredRequests.length})
            </h2>
          </div>

          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-semibold">No requests found</p>
                <p className="text-sm mt-1">Try adjusting your filter</p>
              </div>
            ) : (
              filteredRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.9 + index * 0.05 }}
                  className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                        {request.customerName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="text-white font-semibold">{request.customerName || 'Unknown Customer'}</p>
                          {request.quoteAmount && (
                            <span className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                              ${request.quoteAmount.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">{request.customerEmail || 'No email'}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {request.createdAt?.toDate?.().toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg font-semibold text-sm ${getStatusColor(request.status)}`}>
                      {(request.status || 'pending').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </div>

                  <p className="text-slate-300 mb-4 line-clamp-2">{request.description || 'No description provided'}</p>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => viewRequestDetails(request)}
                      className="px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 hover:text-blue-300 text-sm font-semibold transition-all"
                    >
                      View Details
                    </button>
                    {(request.status || 'pending') === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(request.id, 'under-review')}
                          className="px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 hover:text-blue-300 text-sm font-semibold transition-all"
                        >
                          Review
                        </button>
                      </>
                    )}
                    {request.status === 'approved' && (
                      <button
                        onClick={() => handleStatusChange(request.id, 'in-progress')}
                        className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/50 text-purple-400 hover:text-purple-300 text-sm font-semibold transition-all"
                      >
                        Start Development
                      </button>
                    )}
                    {request.status === 'in-progress' && (
                      <button
                        onClick={() => handleStatusChange(request.id, 'completed')}
                        className="px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 hover:border-green-500/50 text-green-400 hover:text-green-300 text-sm font-semibold transition-all"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* Request Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 border border-slate-600/50 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 flex items-center justify-center text-slate-400 hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {selectedRequest.customerName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{selectedRequest.customerName || 'Unknown Customer'}</h2>
                <p className="text-slate-400">{selectedRequest.customerEmail || 'No email'}</p>
              </div>
              <span className={`inline-flex items-center px-4 py-2 rounded-xl font-semibold text-sm ${getStatusColor(selectedRequest.status)}`}>
                {(selectedRequest.status || 'pending').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-400 mb-3">Module Description</h3>
                <p className="text-white text-lg leading-relaxed">{selectedRequest.description || 'No description provided'}</p>
              </div>

              {selectedRequest.quoteAmount && (
                <div className="bg-emerald-500/10 rounded-xl p-6 border-2 border-emerald-500/30">
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">Quote Amount</h3>
                  <p className="text-4xl font-bold text-emerald-400">${selectedRequest.quoteAmount.toFixed(2)}</p>
                </div>
              )}

              {(selectedRequest.status === 'pending' || selectedRequest.status === 'under-review') && (
                <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4">Approve with Quote</h3>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={quoteAmount}
                      onChange={(e) => setQuoteAmount(e.target.value)}
                      placeholder="Enter quote amount"
                      className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <button
                      onClick={handleApproveWithQuote}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedRequest.id, 'rejected')}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Admin Notes</h3>
                {selectedRequest.adminNotes && selectedRequest.adminNotes.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {selectedRequest.adminNotes.map((note, index) => (
                      <div key={index} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                        <p className="text-white text-sm mb-1">{note.note}</p>
                        <p className="text-xs text-slate-500">
                          {note.timestamp?.toDate?.().toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) || 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm mb-4">No notes yet</p>
                )}

                <div className="space-y-3">
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add admin notes..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <button
                    onClick={handleAddNotes}
                    disabled={processing || !adminNotes.trim()}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? 'Adding...' : 'Add Note'}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-white font-semibold transition-all"
                >
                  Close
                </button>
                {selectedRequest.status === 'approved' && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedRequest.id, 'in-progress');
                      setSelectedRequest({ ...selectedRequest, status: 'in-progress' });
                    }}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Start Development
                  </button>
                )}
                {selectedRequest.status === 'in-progress' && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedRequest.id, 'completed');
                      setSelectedRequest({ ...selectedRequest, status: 'completed' });
                    }}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
