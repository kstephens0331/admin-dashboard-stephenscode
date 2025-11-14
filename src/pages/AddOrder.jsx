import React, { useState, useEffect } from 'react';
import { collection, addDoc, Timestamp, getDocs } from 'firebase/firestore';
import { ordersDb, customerDb } from '../auth/firebase';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function AddOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    company: 'StephensCode',
    email: '',
    customerId: '',
    customerName: '',
    items: [{ title: '', price: 0, quantity: 1 }]
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const snapshot = await getDocs(collection(customerDb, 'customers'));
      const customerList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCustomers(customerList);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const companies = [
    'StephensCode',
    'CalenFlow',
    'SACVPN',
    'SentinelForge',
    'FC Photo',
    'Niche Solutions'
  ];

  const productTemplates = {
    StephensCode: [
      { title: 'Plug & Play Website', price: 250 },
      { title: 'Website Rebuild', price: 500 },
      { title: 'Standard Website', price: 1000 },
      { title: 'E-Commerce Website', price: 2000 },
      { title: 'Premium Build', price: 5000 },
      { title: 'Custom Business Platform', price: 7500 },
      { title: 'Module/Feature Addition', price: 500 },
      { title: 'Website Update', price: 100 },
      { title: 'Maintenance (Monthly)', price: 50 },
      { title: 'Hosting (Monthly)', price: 25 }
    ],
    CalenFlow: [
      { title: 'CalenFlow Basic', price: 29 },
      { title: 'CalenFlow Pro', price: 49 },
      { title: 'CalenFlow Enterprise', price: 99 }
    ],
    SACVPN: [
      { title: 'SACVPN Monthly', price: 9.99 },
      { title: 'SACVPN Annual', price: 99 },
      { title: 'SACVPN Family Plan', price: 19.99 }
    ],
    SentinelForge: [
      { title: 'Penetration Test - Basic', price: 1500 },
      { title: 'Penetration Test - Comprehensive', price: 3500 },
      { title: 'Security Audit', price: 2000 },
      { title: 'Vulnerability Assessment', price: 1000 }
    ],
    'FC Photo': [
      { title: 'Event Photography Package', price: 500 },
      { title: 'Portrait Session', price: 200 },
      { title: 'Commercial Photography', price: 1000 },
      { title: 'Photo Editing Service', price: 50 }
    ],
    'Niche Solutions': [
      { title: 'Custom Software Solution', price: 5000 },
      { title: 'API Development', price: 2000 },
      { title: 'Database Design', price: 1500 },
      { title: 'Consulting (Hourly)', price: 150 }
    ]
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Show customer suggestions when typing email
    if (name === 'email') {
      setShowCustomerSuggestions(value.length > 0);
      if (selectedCustomer && value !== selectedCustomer.email) {
        setSelectedCustomer(null);
        setFormData(prev => ({ ...prev, customerId: '', customerName: '' }));
      }
    }
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setFormData(prev => ({
      ...prev,
      email: customer.email || '',
      customerId: customer.id,
      customerName: customer.fullName || customer.email || 'Unknown'
    }));
    setShowCustomerSuggestions(false);
  };

  const clearCustomer = () => {
    setSelectedCustomer(null);
    setFormData(prev => ({
      ...prev,
      customerId: '',
      customerName: ''
    }));
  };

  const filteredCustomers = customers.filter(customer =>
    formData.email &&
    (customer.email?.toLowerCase().includes(formData.email.toLowerCase()) ||
     customer.fullName?.toLowerCase().includes(formData.email.toLowerCase()))
  ).slice(0, 5);

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'price' || field === 'quantity'
      ? parseFloat(value) || 0
      : value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { title: '', price: 0, quantity: 1 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const useTemplate = (index, template) => {
    handleItemChange(index, 'title', template.title);
    handleItemChange(index, 'price', template.price);
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || formData.items.some(item => !item.title || item.price <= 0)) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        company: formData.company,
        email: formData.email,
        customerId: formData.customerId || null,
        customerName: formData.customerName || formData.email,
        items: formData.items.map(item => ({
          title: item.title,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity)
        })),
        total: calculateTotal(),
        createdAt: Timestamp.now(),
        status: 'completed',
        source: 'admin-manual',
        linkedAccount: !!formData.customerId
      };

      await addDoc(collection(ordersDb, 'orders'), orderData);

      alert('Order added successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Error adding order:', error);
      alert('Failed to add order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
            Add New Order
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Create a manual order for StephensCode or subsidiaries
          </p>
        </div>
        <button
          onClick={() => navigate('/orders')}
          className="px-6 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-white font-semibold transition-all"
        >
          Cancel
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company & Email */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-700/80 p-8 border border-slate-600/50 backdrop-blur-sm overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }} />
          </div>

          <div className="relative">
            <h2 className="text-2xl font-bold text-white mb-6">Order Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Company <span className="text-orange-400">*</span>
                </label>
                <select
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                  required
                >
                  {companies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Customer Email <span className="text-orange-400">*</span>
                  {selectedCustomer && (
                    <span className="ml-2 text-xs text-emerald-400">
                      ✓ Linked to {selectedCustomer.fullName || 'customer account'}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => setShowCustomerSuggestions(formData.email.length > 0)}
                    onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 200)}
                    placeholder="customer@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                    required
                  />
                  {selectedCustomer && (
                    <button
                      type="button"
                      onClick={clearCustomer}
                      className="absolute right-3 top-3.5 text-slate-400 hover:text-white"
                      title="Clear customer link"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Customer Suggestions Dropdown */}
                {showCustomerSuggestions && filteredCustomers.length > 0 && !selectedCustomer && (
                  <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                    <div className="p-2 text-xs text-slate-400 border-b border-slate-700">
                      Found {filteredCustomers.length} matching customer{filteredCustomers.length !== 1 ? 's' : ''}
                    </div>
                    {filteredCustomers.map(customer => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => selectCustomer(customer)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-700/50 transition-colors border-b border-slate-700/50 last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white">
                              {customer.fullName || 'No Name'}
                            </div>
                            <div className="text-sm text-slate-400">{customer.email}</div>
                            {customer.phone && (
                              <div className="text-xs text-slate-500">{customer.phone}</div>
                            )}
                          </div>
                          <div className="text-xs text-emerald-400">
                            {(customer.status || 'active') === 'active' ? '● Active' : '○ Inactive'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <p className="mt-2 text-xs text-slate-500">
                  {selectedCustomer
                    ? '✓ Order will be linked to this customer account'
                    : 'Start typing to search and link to an existing customer account'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-700/80 p-8 border border-slate-600/50 backdrop-blur-sm overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }} />
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Order Items</h2>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Item {index + 1}</h3>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 hover:text-red-300 text-sm font-semibold transition-all"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Product Templates */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Quick Select Template
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {productTemplates[formData.company].map((template, tIndex) => (
                        <button
                          key={tIndex}
                          type="button"
                          onClick={() => useTemplate(index, template)}
                          className="px-3 py-1 rounded-lg bg-slate-700/50 hover:bg-orange-500/20 border border-slate-600/50 hover:border-orange-500/50 text-slate-300 hover:text-orange-400 text-sm font-medium transition-all"
                        >
                          {template.title} (${template.price})
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Product/Service <span className="text-orange-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                        placeholder="E.g., Standard Website"
                        className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Price <span className="text-orange-400">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-3.5 text-slate-400">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-300 mb-2">
                        Quantity <span className="text-orange-400">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="text-lg font-bold text-emerald-400">
                      Subtotal: ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Total & Submit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-600/10 p-8 border-2 border-emerald-500/30 backdrop-blur-sm overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }} />
          </div>

          <div className="relative flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-2">
                Order Total
              </div>
              <div className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                ${calculateTotal().toFixed(2)}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Order...' : 'Create Order'}
            </button>
          </div>
        </motion.div>
      </form>
    </motion.div>
  );
}
