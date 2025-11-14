import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { customerDb } from '../auth/firebase';
import { motion } from 'framer-motion';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      // Try with orderBy first, fall back to unordered query if it fails
      let snapshot;
      try {
        const q = query(collection(customerDb, 'customers'), orderBy('createdAt', 'desc'));
        snapshot = await getDocs(q);
      } catch (orderError) {
        console.warn('Could not order by createdAt, fetching unordered:', orderError);
        // Fall back to unordered query if createdAt index doesn't exist
        snapshot = await getDocs(collection(customerDb, 'customers'));
      }

      const customerList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by createdAt in JavaScript if available, otherwise by ID
      customerList.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return b.createdAt.toMillis() - a.createdAt.toMillis();
        }
        return 0;
      });

      setCustomers(customerList);
      console.log(`Loaded ${customerList.length} customers from Firebase`);
    } catch (error) {
      console.error('Error fetching customers:', error);
      alert('Error loading customers. Check browser console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (customerId, currentStatus) => {
    try {
      const customerRef = doc(customerDb, 'customers', customerId);
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateDoc(customerRef, { status: newStatus });

      // Update local state
      setCustomers(customers.map(c =>
        c.id === customerId ? { ...c, status: newStatus } : c
      ));
    } catch (error) {
      console.error('Error toggling customer status:', error);
    }
  };

  const relinkCustomerOrders = async (customer) => {
    try {
      // Import ordersDb and necessary functions
      const { ordersDb } = await import('../auth/firebase');
      const { collection, query, where, getDocs, updateDoc: updateOrderDoc, doc: orderDoc } = await import('firebase/firestore');

      // Find all orders with matching email
      const q = query(
        collection(ordersDb, 'orders'),
        where('email', '==', customer.email.toLowerCase())
      );

      const snapshot = await getDocs(q);
      let linkedCount = 0;

      // Update each matching order
      const updatePromises = snapshot.docs.map(async (order) => {
        await updateOrderDoc(orderDoc(ordersDb, 'orders', order.id), {
          customerId: customer.id,
          customerName: customer.fullName,
          linkedAccount: true,
          linkedAt: new Date()
        });
        linkedCount++;
      });

      await Promise.all(updatePromises);
      alert(`Successfully linked ${linkedCount} order${linkedCount !== 1 ? 's' : ''} to ${customer.fullName}'s account!`);
    } catch (error) {
      console.error('Error relinking orders:', error);
      alert('Error relinking orders. Check console for details.');
    }
  };

  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm);

    const matchesFilter =
      filterStatus === 'all' ||
      (customer.status || 'active') === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: customers.length,
    active: customers.filter(c => (c.status || 'active') === 'active').length,
    inactive: customers.filter(c => c.status === 'inactive').length,
    withCredits: customers.filter(c => (c.referralCredits || 0) > 0).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading customers...</p>
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Customer Management
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            View and manage all registered customers
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/50 backdrop-blur-sm">
          <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          <span className="text-sm text-slate-300 font-semibold">Customer Database</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative rounded-3xl bg-gradient-to-br from-blue-500/10 to-cyan-600/10 p-6 border-2 border-blue-500/30 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }} />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-400">Total Customers</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-600/10 p-6 border-2 border-emerald-500/30 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }} />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-400">Active</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.active}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative rounded-3xl bg-gradient-to-br from-red-500/10 to-pink-600/10 p-6 border-2 border-red-500/30 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }} />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-400">Inactive</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.inactive}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative rounded-3xl bg-gradient-to-br from-yellow-500/10 to-orange-600/10 p-6 border-2 border-yellow-500/30 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }} />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-400">With Credits</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.withCredits}</p>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="relative rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-700/80 p-6 border border-slate-600/50 backdrop-blur-sm overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>
        <div className="relative flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                filterStatus === 'all'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                filterStatus === 'active'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                filterStatus === 'inactive'
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg'
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </motion.div>

      {/* Customers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">
              Customer List ({filteredCustomers.length})
            </h2>
          </div>

          <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-700/50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300 uppercase tracking-wider">Customer</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300 uppercase tracking-wider">Contact</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300 uppercase tracking-wider">Credits</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center">
                        <div className="text-slate-400">
                          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="text-lg font-semibold">No customers found</p>
                          <p className="text-sm mt-1">Try adjusting your search or filter</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer, index) => (
                      <motion.tr
                        key={customer.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                        className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold shadow-lg">
                              {customer.fullName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{customer.fullName || 'N/A'}</p>
                              <p className="text-xs text-slate-400">{customer.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            <p className="text-white">{customer.email || 'N/A'}</p>
                            <p className="text-slate-400">{customer.phone || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg font-semibold text-sm ${
                            (customer.referralCredits || 0) > 0
                              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                              : 'bg-slate-700/50 border border-slate-600/50 text-slate-400'
                          }`}>
                            ${(customer.referralCredits || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg font-semibold text-sm ${
                            (customer.status || 'active') === 'active'
                              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                              : 'bg-red-500/20 border border-red-500/30 text-red-400'
                          }`}>
                            {(customer.status || 'active').charAt(0).toUpperCase() + (customer.status || 'active').slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => viewCustomerDetails(customer)}
                              className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 hover:text-blue-300 text-sm font-medium transition-all"
                            >
                              View
                            </button>
                            <button
                              onClick={() => relinkCustomerOrders(customer)}
                              className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/50 text-purple-400 hover:text-purple-300 text-sm font-medium transition-all"
                              title="Link all orders with this email to this customer"
                            >
                              Re-link
                            </button>
                            <button
                              onClick={() => handleToggleStatus(customer.id, customer.status || 'active')}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                (customer.status || 'active') === 'active'
                                  ? 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300'
                                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 hover:text-emerald-300'
                              }`}
                            >
                              {(customer.status || 'active') === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Customer Details Modal */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 border border-slate-600/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {selectedCustomer.fullName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedCustomer.fullName || 'Unknown'}</h2>
                <p className="text-slate-400">{selectedCustomer.email || 'No email'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Phone</p>
                  <p className="text-white font-semibold">{selectedCustomer.phone || 'N/A'}</p>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg font-semibold text-sm ${
                    (selectedCustomer.status || 'active') === 'active'
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/20 border border-red-500/30 text-red-400'
                  }`}>
                    {(selectedCustomer.status || 'active').charAt(0).toUpperCase() + (selectedCustomer.status || 'active').slice(1)}
                  </span>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Referral Credits</p>
                  <p className="text-2xl font-bold text-emerald-400">${(selectedCustomer.referralCredits || 0).toFixed(2)}</p>
                </div>
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-1">Google Analytics</p>
                  <p className="text-white font-semibold">{selectedCustomer.googleAnalyticsId || 'Not set'}</p>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-1">Customer ID</p>
                <p className="text-white font-mono text-sm">{selectedCustomer.id}</p>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-xs text-slate-400 mb-1">Registration Date</p>
                <p className="text-white font-semibold">
                  {selectedCustomer.createdAt?.toDate?.().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) || 'N/A'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-white font-semibold transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  relinkCustomerOrders(selectedCustomer);
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Re-link Orders
              </button>
              <button
                onClick={() => {
                  // Navigate to referral credits page with this customer pre-selected
                  setShowModal(false);
                  window.location.href = `/referral-credits?customer=${selectedCustomer.id}`;
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Manage Credits
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
