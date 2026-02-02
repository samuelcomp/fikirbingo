import React, { useState } from 'react';
import axios from 'axios';
import { Wallet, CheckCircle, RotateCcw, Coins, ArrowRightLeft } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\s/g, '');

const WalletDashboard = ({ user, onUpdateUser, t }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            if (onUpdateUser) {
                await onUpdateUser();
            }
        } catch (e) {
            console.error('Refresh failed');
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    return (
        <div className="wallet-simple-page">
            <header className="wallet-simple-header">
                <h1 className="page-title">Wallet</h1>
                <button
                    className="refresh-btn-v3"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                >
                    <RotateCcw size={20} className={isRefreshing ? 'spinning' : ''} />
                </button>
            </header>

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
                <p>View your transaction history in the Transactions tab.</p>
            </div>
        </div>
    );
};

export default WalletDashboard;
