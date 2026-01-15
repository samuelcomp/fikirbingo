import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, Clock, CheckCircle, RotateCcw, ArrowDownLeft, ArrowUpRight, Ticket, Coins, History } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\s/g, '');

const WalletDashboard = ({ user, onUpdateUser, t }) => {
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('balance');
    const [isLoading, setIsLoading] = useState(false);

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

            <div className="action-tabs-v2">
                <button
                    className={`action-tab-v2 ${activeTab === 'balance' ? 'active' : ''}`}
                    onClick={() => setActiveTab('balance')}
                >
                    Balance
                </button>
                <button
                    className={`action-tab-v2 ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    History
                </button>
            </div>

            <h2 className="section-subtitle-v2">Recent Transactions</h2>

            <div className="transaction-list-v2">
                {history.length > 0 ? (
                    history.map((tx, i) => {
                        const isPositive = ['WIN', 'REFUND', 'DEPOSIT', 'AIRDROP'].includes(tx.type);
                        const TxIcon = tx.type === 'BET' ? Ticket :
                            tx.type === 'WIN' ? Coins :
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
                                </div>
                                <div className="tx-outcome-v2">
                                    <span className="tx-amount-v2" style={{ color: iconColor }}>
                                        {isPositive ? '+' : '-'}{tx.amount} <small>Birr</small>
                                    </span>
                                    <span className={`tx-status-v2 approved`}>Completed</span>
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
        </div>
    );
};

export default WalletDashboard;
