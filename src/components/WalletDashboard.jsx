import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, Clock, CheckCircle, RotateCcw, ArrowDownLeft, ArrowUpRight, Ticket, History } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\s/g, '');

const WalletDashboard = ({ user, onUpdateUser, t }) => {
    const [history, setHistory] = useState([]);
    const [amount, setAmount] = useState('');
    const [reference, setReference] = useState('');
    const [selectedBank, setSelectedBank] = useState('telebirr');
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('userToken');
            if (!token) return;
            const res = await axios.get(`${API_URL}/api/wallet/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setHistory(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error('Wallet fetch failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeposit = async (e) => {
        e.preventDefault();
        setSubmitStatus(null);
        setIsLoading(true);

        try {
            const token = localStorage.getItem('userToken');
            const res = await axios.post(`${API_URL}/api/wallet/deposit`, {
                amount: Number(amount),
                reference,
                bank: selectedBank
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.data.success) {
                setSubmitStatus('success');
                setStatusMessage(res.data.message || 'Deposit pending approval!');
                setAmount('');
                setReference('');
                fetchHistory(); // Refresh history
                // Switch to history tab after short delay? No, stay here for feedback.
            }
        } catch (err) {
            setSubmitStatus('error');
            setStatusMessage(err.response?.data?.error || 'Deposit failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const MERCHANT_INFO = {
        telebirr: { number: '0912345678', name: 'Beteseb Bingo' }, // Replace with real values
        cbe: { number: '1000123456789', name: 'Beteseb Bingo Ent.' }
    };

    return (
        <div className="wallet-container-v2">
            <header className="dashboard-header-v2">
                <h1 className="dashboard-title-v2">Wallet</h1>
                <button className="refresh-btn-v2" onClick={fetchHistory} disabled={isLoading}>
                    <RotateCcw size={20} className={isLoading ? 'spinning' : ''} />
                </button>
            </header>

            <div className="verified-user-banner-v2">
                <div className="user-info-v2">
                    <div className="user-icon-circle-v2">
                        <Wallet size={18} />
                    </div>
                    <span className="user-phone-number-v2">{user?.phoneNumber || '0900000000'}</span>
                </div>
                <div className="verified-pill-v2">
                    <CheckCircle size={14} />
                    <span>Verified</span>
                </div>
            </div>

            <div className="balance-summary-card">
                <div className="balance-item">
                    <small>Main Balance</small>
                    <span className="balance-amount">{user?.mainBalance || 0} <small>ETB</small></span>
                </div>
                <div className="balance-item highlight">
                    <small>Play Balance</small>
                    <span className="balance-amount">{user?.playBalance || 0} <small>ETB</small></span>
                </div>
            </div>

            <div className="action-tabs-v2">
                <button
                    className={`action-tab-v2 ${activeTab === 'deposit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('deposit')}
                >
                    Deposit
                </button>
                <button
                    className={`action-tab-v2 ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    History
                </button>
            </div>

            {activeTab === 'deposit' && (
                <div className="deposit-section upscale-reveal">
                    {submitStatus && (
                        <div className={`status-banner ${submitStatus}`}>
                            {submitStatus === 'success' ? <CheckCircle size={16} /> : <Clock size={16} />}
                            <span>{statusMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleDeposit} className="deposit-form">
                        <div className="form-group">
                            <label>Select Payment Method</label>
                            <div className="bank-options">
                                <button
                                    type="button"
                                    className={`bank-pill ${selectedBank === 'telebirr' ? 'active' : ''}`}
                                    onClick={() => setSelectedBank('telebirr')}
                                >
                                    Telebirr
                                </button>
                                <button
                                    type="button"
                                    className={`bank-pill ${selectedBank === 'cbe' ? 'active' : ''}`}
                                    onClick={() => setSelectedBank('cbe')}
                                >
                                    CBE Birr
                                </button>
                            </div>
                        </div>

                        <div className="merchant-info-card">
                            <p className="merchant-label">Transfer to this Number:</p>
                            <h3 className="merchant-number">{MERCHANT_INFO[selectedBank].number}</h3>
                            <p className="merchant-name">{MERCHANT_INFO[selectedBank].name}</p>
                            <small className="instruction-text">
                                Copy this number, go to your {selectedBank === 'telebirr' ? 'Telebirr App' : 'CBE App'}, and transfer the amount. Then enter the details below.
                            </small>
                        </div>

                        <div className="form-group">
                            <label>Amount Deposited (Birr)</label>
                            <input
                                type="number"
                                placeholder="e.g. 50"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                min="10"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Transaction Reference ID</label>
                            <input
                                type="text"
                                placeholder={selectedBank === 'telebirr' ? 'e.g. BK5S...' : 'Transaction Ref'}
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="submit-deposit-btn" disabled={isLoading}>
                            {isLoading ? <Clock className="spinning" size={18} /> : 'Verify & Deposit'}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'history' && (
                <>
                    <h2 className="section-subtitle-v2">Recent Transactions</h2>
                    <div className="transaction-list-v2">
                        {history.length > 0 ? (
                            history.map((tx, i) => {
                                const isPositive = ['WIN', 'REFUND', 'DEPOSIT', 'AIRDROP'].includes(tx.type);
                                const TxIcon = tx.type === 'BET' ? Ticket :
                                    tx.type === 'WIN' ? Ticket :
                                        isPositive ? ArrowDownLeft : ArrowUpRight;
                                const iconColor = isPositive ? '#22c55e' : '#ef4444';

                                return (
                                    <div key={tx.id} className="transaction-card-v2 upscale-reveal" style={{ animationDelay: `${i * 0.05}s` }}>
                                        <div className="tx-icon-v2">
                                            <div className="wallet-icon-box-v2" style={{ background: `${iconColor}20` }}>
                                                <TxIcon size={18} color={iconColor} />
                                            </div>
                                        </div>
                                        <div className="tx-details-v2">
                                            <span className="tx-type-v2">
                                                {tx.type === 'BET' ? 'Game Bet' :
                                                    tx.type === 'WIN' ? 'Bingo Win' :
                                                        tx.type === 'REFUND' ? 'Bet Refund' :
                                                            tx.type}
                                            </span>
                                            <span className="tx-date-v2">{new Date(tx.createdAt).toLocaleString()}</span>
                                            {tx.status === 'PENDING' && <span className="pending-badge">Pending</span>}
                                        </div>
                                        <div className="tx-outcome-v2">
                                            <span className="tx-amount-v2" style={{ color: iconColor }}>
                                                {isPositive ? '+' : '-'}{tx.amount} <small>Birr</small>
                                            </span>
                                            <span className={`tx-status-v2 ${tx.status.toLowerCase()}`}>{tx.status}</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="no-transactions-v2">
                                <Clock size={48} strokeWidth={1} />
                                <p>No transactions found</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default WalletDashboard;
