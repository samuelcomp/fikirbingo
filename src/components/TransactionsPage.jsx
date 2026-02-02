import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowDownLeft, ArrowUpRight, RotateCcw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\s/g, '');

const TransactionsPage = ({ user, t }) => {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // 'all' | 'deposit' | 'withdraw'

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setIsLoading(true);
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
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED':
                return <CheckCircle size={18} className="status-icon approved" />;
            case 'REJECTED':
                return <XCircle size={18} className="status-icon rejected" />;
            case 'PENDING':
                return <Clock size={18} className="status-icon pending" />;
            default:
                return <AlertCircle size={18} className="status-icon" />;
        }
    };

    const getTypeIcon = (type) => {
        return type === 'DEPOSIT'
            ? <ArrowDownLeft size={20} className="type-icon deposit" />
            : <ArrowUpRight size={20} className="type-icon withdraw" />;
    };

    const filteredTransactions = transactions.filter(tx => {
        if (filter === 'all') return true;
        if (filter === 'deposit') return tx.type === 'DEPOSIT';
        if (filter === 'withdraw') return tx.type === 'WITHDRAW';
        return true;
    });

    return (
        <div className="transactions-page">
            <header className="transactions-header">
                <h1 className="page-title">Transactions</h1>
                <button
                    className="refresh-btn-v3"
                    onClick={fetchTransactions}
                    disabled={isLoading}
                >
                    <RotateCcw size={20} className={isLoading ? 'spinning' : ''} />
                </button>
            </header>

            <div className="transaction-filters">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                <button
                    className={`filter-btn ${filter === 'deposit' ? 'active' : ''}`}
                    onClick={() => setFilter('deposit')}
                >
                    Deposits
                </button>
                <button
                    className={`filter-btn ${filter === 'withdraw' ? 'active' : ''}`}
                    onClick={() => setFilter('withdraw')}
                >
                    Withdrawals
                </button>
            </div>

            <div className="transactions-list">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner-container">
                            <RotateCcw size={32} className="spinning" />
                            <p>Loading transactions...</p>
                        </div>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="empty-state">
                        <AlertCircle size={48} />
                        <p className="empty-title">No Transactions</p>
                        <p className="empty-subtitle">
                            {filter === 'all'
                                ? 'You have no transaction history yet.'
                                : `No ${filter} transactions found.`}
                        </p>
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
                                    <span className="tx-bank">{tx.bank || 'N/A'}</span>
                                </div>
                                <div className="tx-date">
                                    {new Date(tx.createdAt).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>

                            <div className="tx-status-wrapper">
                                {getStatusIcon(tx.status)}
                                <span className={`tx-status-label ${tx.status.toLowerCase()}`}>
                                    {tx.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TransactionsPage;
