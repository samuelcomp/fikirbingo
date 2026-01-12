import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const WalletDashboard = ({ user, onUpdateUser, t }) => {
    const [history, setHistory] = useState([]);
    const [amount, setAmount] = useState('');
    const [reference, setReference] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('deposit');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                // In dev mode, we might not have a token
                setHistory([]);
                return;
            }
            const res = await axios.get(`${API_URL}/api/wallet/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setHistory(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error('Wallet fetch failed:', e.response?.status);
            setHistory([]);
        }
    };

    const handleDeposit = async () => {
        if (!amount || !reference) return alert('Please fill all fields');
        setIsLoading(true);
        try {
            const token = localStorage.getItem('userToken');
            await axios.post(`${API_URL}/api/wallet/deposit`,
                { amount, reference, bank: 'Telebirr' },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert('Deposit request submitted! Waiting for admin approval.');
            setAmount('');
            setReference('');
            fetchHistory();
        } catch (e) {
            alert('Submission failed. Check your reference code.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleWithdraw = async () => {
        if (!amount || amount < 50) return alert('Minimum withdrawal is 50 Birr');
        setIsLoading(true);
        try {
            const token = localStorage.getItem('userToken');
            await axios.post(`${API_URL}/api/wallet/withdraw`,
                { amount, bank: 'Telebirr' },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert('Withdrawal request submitted!');
            setAmount('');
            fetchHistory();
            onUpdateUser();
        } catch (e) {
            alert(e.response?.data?.error || 'Withdrawal failed');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle size={16} className="status-completed" />;
            case 'REJECTED': return <XCircle size={16} className="status-rejected" />;
            default: return <Clock size={16} className="status-pending" />;
        }
    };

    return (
        <div className="wallet-container">
            <div className="balance-hero premium-card">
                <div className="balance-item">
                    <span className="label">{t.playBalance}</span>
                    <span className="value" style={{ color: 'var(--accent)' }}>{user?.playBalance || 0} <small>B</small></span>
                </div>
                <div className="balance-divider"></div>
                <div className="balance-item" style={{ textAlign: 'right' }}>
                    <span className="label">{t.cashBalance}</span>
                    <span className="value" style={{ color: 'var(--secondary)' }}>{user?.mainBalance || 0} <small>B</small></span>
                </div>
            </div>

            <div className="wallet-actions premium-card">
                <div className="wallet-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'deposit' ? 'active' : ''}`}
                        onClick={() => setActiveTab('deposit')}
                    >
                        {t.deposit}
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'withdraw' ? 'active' : ''}`}
                        onClick={() => setActiveTab('withdraw')}
                    >
                        {t.withdraw}
                    </button>
                </div>

                {activeTab === 'deposit' ? (
                    <div className="action-form">
                        <div className="info-alert">
                            <p>Send money to <strong style={{ color: 'var(--accent)' }}>0912xxxxxx</strong> (Telebirr) and enter the reference number below.</p>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Amount (Birr)</label>
                            <input type="number" className="pro-input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                        </div>
                        <div className="input-group">
                            <label className="input-label">SMS Reference Code</label>
                            <input type="text" className="pro-input" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="ABC123XYZ" />
                        </div>
                        <button className="play-btn" onClick={handleDeposit} disabled={isLoading}>
                            {isLoading ? 'Processing...' : `Request ${t.deposit}`}
                        </button>
                    </div>
                ) : (
                    <div className="action-form">
                        <div className="info-alert" style={{ borderLeftColor: 'var(--secondary)' }}>
                            <p>Min: 50 Birr. 5 Birr processing fee applies.</p>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Withdrawal Amount</label>
                            <input type="number" className="pro-input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                        </div>
                        <button className="play-btn" onClick={handleWithdraw} disabled={isLoading} style={{ background: 'linear-gradient(135deg, var(--secondary), hsl(174, 100%, 31%))' }}>
                            {isLoading ? 'Processing...' : t.withdraw}
                        </button>
                    </div>
                )}
            </div>

            <div className="history-section">
                <h3 className="section-title" style={{ fontSize: '20px', fontWeight: 900, marginBottom: '20px' }}>{t.history}</h3>
                <div className="history-list">
                    {Array.isArray(history) && history.map(tx => (
                        <div key={tx.id} className="history-item premium-card">
                            <div className="tx-icon-box">
                                {tx.type === 'DEPOSIT' || tx.type === 'WIN' ? <ArrowDownCircle color="var(--success)" /> : <ArrowUpCircle color="var(--primary)" />}
                            </div>
                            <div className="tx-main-info">
                                <span className="tx-title">{tx.type}</span>
                                <span className="tx-sub">{new Date(tx.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="tx-amount-box">
                                <span className="tx-val" style={{ color: (tx.type === 'DEPOSIT' || tx.type === 'WIN') ? 'var(--success)' : 'var(--primary)' }}>
                                    {tx.type === 'DEPOSIT' || tx.type === 'WIN' ? '+' : '-'}{tx.amount}
                                </span>
                                <span className="tx-status-text">{tx.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WalletDashboard;
