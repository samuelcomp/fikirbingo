import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Wallet, CheckCircle, RotateCcw, Coins, ArrowRightLeft, ArrowDownLeft, ArrowUpRight, Clock, XCircle, AlertCircle, Receipt } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\s/g, '');

const WalletDashboard = ({ user, onUpdateUser, t }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('balance'); // 'balance' | 'transactions'

    // Transactions State
    const [transactions, setTransactions] = useState([]);
    const [isLoadingTx, setIsLoadingTx] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all' | 'deposit' | 'withdraw'

    useEffect(() => {
        if (activeTab === 'transactions') {
            fetchTransactions();
        }
    }, [activeTab]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            if (activeTab === 'transactions') {
                await fetchTransactions();
            }
            if (onUpdateUser) {
                await onUpdateUser();
            }
        } catch (e) {
            console.error('Refresh failed');
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    const fetchTransactions = async () => {
        setIsLoadingTx(true);
        try {
            const token = localStorage.getItem('userToken');
            if (!token) return;
            const res = await axios.get(`${API_URL}/api/wallet/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTransactions(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error('Transaction fetch failed');
        } finally {
            setIsLoadingTx(false);
        }
    };

    const filteredTransactions = transactions.filter(tx => {
        if (filter === 'all') return true;
        if (filter === 'deposit') return tx.type === 'DEPOSIT';
        if (filter === 'withdraw') return tx.type === 'WITHDRAW';
        return true;
    });

    return (
        <div className="wallet-page-v4">
            <header className="wallet-header-v4">
                <h1 className="wallet-title-v4">My Wallet</h1>
                <button
                    className="refresh-btn-v3"
                    onClick={handleRefresh}
                    disabled={isRefreshing || isLoadingTx}
                >
                    <RotateCcw size={20} className={(isRefreshing || isLoadingTx) ? 'spinning' : ''} />
                </button>
            </header>

            <div className="wallet-tabs-v4">
                <button
                    className={`tab-btn-v4 ${activeTab === 'balance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('balance')}
                >
                    <Wallet size={18} /> Balance
                </button>
                <button
                    className={`tab-btn-v4 ${activeTab === 'transactions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transactions')}
                >
                    <Receipt size={18} /> History
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'balance' ? (
                    <motion.div
                        key="balance"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="balance-section"
                    >
                        <div className="balance-cards-grid-v4">
                            <motion.div
                                className="balance-card-v4 main full-width"
                                whileHover={{ scale: 1.01 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="card-icon-circle">
                                    <Wallet />
                                </div>
                                <div className="card-label-v4">Wallet Balance</div>
                                <div className="card-amount-v4">
                                    {user?.mainBalance || 0} <span>Birr</span>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="history-section"
                    >
                        <div className="transaction-filters" style={{ marginBottom: '16px' }}>
                            <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                            <button className={`filter-btn ${filter === 'deposit' ? 'active' : ''}`} onClick={() => setFilter('deposit')}>In</button>
                            <button className={`filter-btn ${filter === 'withdraw' ? 'active' : ''}`} onClick={() => setFilter('withdraw')}>Out</button>
                        </div>

                        <div className="tx-list-v4">
                            {isLoadingTx ? (
                                <div className="loading-state-simple">Loading...</div>
                            ) : filteredTransactions.length === 0 ? (
                                <div className="empty-state-simple" style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
                                    <Receipt size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                    <p>No transactions found</p>
                                </div>
                            ) : (
                                filteredTransactions.map((tx, idx) => (
                                    <motion.div
                                        key={idx}
                                        className="tx-item-v4"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <div className={`tx-icon-v4 ${tx.type === 'DEPOSIT' || tx.type === 'WIN' || tx.type === 'REFUND' ? 'deposit' : 'withdraw'
                                            }`}>
                                            {tx.type === 'DEPOSIT' || tx.type === 'WIN' || tx.type === 'REFUND' ?
                                                <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                        </div>
                                        <div className="tx-info-v4">
                                            <span className="tx-type-v4">{tx.type}</span>
                                            <span className="tx-date-v4">
                                                {new Date(tx.createdAt).toLocaleString('en-US', {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <div className="tx-right-v4">
                                            <div className={`tx-amount-v4 ${tx.type === 'DEPOSIT' || tx.type === 'WIN' || tx.type === 'REFUND' ? 'deposit' : 'withdraw'
                                                }`}>
                                                {tx.type === 'DEPOSIT' || tx.type === 'WIN' || tx.type === 'REFUND' ? '+' : '-'}{tx.amount}
                                            </div>
                                            <span className={`status-badge-v4 ${tx.status.toLowerCase()}`}>
                                                {tx.status}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WalletDashboard;
