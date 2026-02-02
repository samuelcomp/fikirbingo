import React, { useState, useEffect } from 'react';
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

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle size={16} className="status-icon approved" />;
            case 'REJECTED': return <XCircle size={16} className="status-icon rejected" />;
            case 'PENDING': return <Clock size={16} className="status-icon pending" />;
            default: return <AlertCircle size={16} className="status-icon" />;
        }
    };

    const getTypeIcon = (type) => {
        return type === 'DEPOSIT'
            ? <ArrowDownLeft size={18} className="type-icon deposit" />
            : <ArrowUpRight size={18} className="type-icon withdraw" />;
    };

    const filteredTransactions = transactions.filter(tx => {
        if (filter === 'all') return true;
        if (filter === 'deposit') return tx.type === 'DEPOSIT';
        if (filter === 'withdraw') return tx.type === 'WITHDRAW';
        return true;
    });

    return (
        <div className="wallet-simple-page">
            <header className="wallet-simple-header">
                <h1 className="page-title">Wallet</h1>
                <button
                    className="refresh-btn-v3"
                    onClick={handleRefresh}
                    disabled={isRefreshing || isLoadingTx}
                >
                    <RotateCcw size={20} className={(isRefreshing || isLoadingTx) ? 'spinning' : ''} />
                </button>
            </header>

            {/* Smart Tabs */}
            <div className="wallet-tabs-container">
                <button
                    className={`wallet-tab ${activeTab === 'balance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('balance')}
                >
                    <Wallet size={16} />
                    <span>Balance</span>
                </button>
                <button
                    className={`wallet-tab ${activeTab === 'transactions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transactions')}
                >
                    <Receipt size={16} />
                    <span>History</span>
                </button>
            </div>

            {activeTab === 'balance' ? (
                /* BALANCE VIEW */
                <div className="balance-view fade-in">
                    <div className="user-info-card">
                        <div className="user-icon-wrapper">
                            <Wallet size={20} />
                        </div>
                        <span className="user-phone">{user?.phoneNumber || '0900000000'}</span>
                        <div className="verified-badge">
                            <CheckCircle size={14} />
                            <span>Verified</span>
                        </div>
                    </div>

                    <div className="balance-cards-grid">
                        <div className="balance-card-simple main-wallet">
                            <div className="card-header">
                                <Wallet size={18} />
                                <span className="card-label">Main Wallet</span>
                            </div>
                            <div className="card-value">
                                <span className="amount">{user?.mainBalance || 0}</span>
                                <span className="currency">Birr</span>
                            </div>
                        </div>

                        <div className="balance-card-simple play-wallet">
                            <div className="card-header">
                                <ArrowRightLeft size={18} />
                                <span className="card-label">Play Wallet</span>
                            </div>
                            <div className="card-value">
                                <span className="amount">{user?.playBalance || 0}</span>
                                <span className="currency">Birr</span>
                            </div>
                        </div>

                        <div className="balance-card-simple loyalty-coins">
                            <div className="card-header">
                                <Coins size={18} />
                                <span className="card-label">Loyalty Coins</span>
                            </div>
                            <div className="card-value">
                                <span className="amount">{user?.loyaltyCoins || 0}</span>
                                <span className="currency">Coins</span>
                            </div>
                        </div>
                    </div>

                    <div className="wallet-info-text">
                        <p>Your wallet balances are updated in real-time.</p>
                        <p>Switch to the <b>History</b> tab to view past transactions.</p>
                    </div>
                </div>
            ) : (
                /* TRANSACTIONS VIEW */
                <div className="transactions-view fade-in">
                    <div className="transaction-filters">
                        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
                        <button className={`filter-btn ${filter === 'deposit' ? 'active' : ''}`} onClick={() => setFilter('deposit')}>Deposits</button>
                        <button className={`filter-btn ${filter === 'withdraw' ? 'active' : ''}`} onClick={() => setFilter('withdraw')}>Withdrawals</button>
                    </div>

                    <div className="transactions-list">
                        {isLoadingTx ? (
                            <div className="loading-state-simple">
                                <p>Loading history...</p>
                            </div>
                        ) : filteredTransactions.length === 0 ? (
                            <div className="empty-state-simple">
                                <AlertCircle size={32} />
                                <p>No {filter !== 'all' ? filter : ''} transactions found.</p>
                            </div>
                        ) : (
                            filteredTransactions.map((tx, idx) => (
                                <div key={idx} className="transaction-card-v3">
                                    <div className="tx-icon-wrapper">
                                        {getTypeIcon(tx.type)}
                                    </div>

                                    <div className="tx-details">
                                        <div className="tx-main">
                                            <span className="tx-type">{tx.type}</span>
                                            <span className="tx-amount">{tx.amount} Birr</span>
                                        </div>
                                        <div className="tx-meta">
                                            <span className="tx-ref">Ref: {tx.reference || 'N/A'}</span>
                                            <span className="tx-date">
                                                {new Date(tx.createdAt).toLocaleString('en-US', {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="tx-status-wrapper">
                                        {getStatusIcon(tx.status)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletDashboard;
