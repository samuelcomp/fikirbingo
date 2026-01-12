import React, { useState } from 'react';
import { Play, Trophy, Users, History, Wallet, User, HelpCircle } from 'lucide-react';

const LandingPage = ({ onPlay, appName, appLogo, t, userBalance = 0 }) => {
    const [showRules, setShowRules] = useState(false);
    const stats = [
        { label: t.activePlayers, value: '45K+', icon: <Users size={20} /> },
        { label: t.gamesPlayed, value: '60K+', icon: <History size={20} /> },
        { label: t.winnersDaily, value: '500+', icon: <Trophy size={20} /> },
    ];

    return (
        <div className="landing-container">
            <header className="landing-header">
                <div className="logo-section">
                    {appLogo ? (
                        <img src={appLogo} alt="Logo" className="app-logo-img" />
                    ) : (
                        <div className="logo-b">F</div>
                    )}
                    <h1>Fikir Bingo</h1>
                </div>
                <button className="rules-btn" onClick={() => setShowRules(true)}>
                    <HelpCircle size={18} />
                    <span>{t.rules}</span>
                </button>
            </header>

            <main className="landing-main">
                <div className="welcome-section">
                    <h2>{t.welcome} <span>Fikir Bingo</span></h2>
                    <p className="welcome-sub">Real-time multiplayer bingo. Big stakes, big wins.</p>
                </div>

                <div className="stake-card premium-card">
                    <div className="stake-header">
                        <span className="available-stakes-label">Available Stakes</span>
                        <div className="wallet-pill">
                            <Wallet size={12} className="wallet-icon-mini" />
                            {userBalance} Birr
                        </div>
                    </div>

                    <div className="stake-options">
                        {[10, 50, 100].map((val) => (
                            <button
                                key={val}
                                className="stake-btn-premium"
                                onClick={() => onPlay(val)}
                            >
                                <span className="stake-val">{val}</span>
                                <span className="stake-unit">Birr</span>
                            </button>
                        ))}
                    </div>

                    <button className="play-btn pulse" onClick={() => onPlay(10)}>
                        <Play size={22} fill="currentColor" />
                        {t.playNow}
                    </button>
                </div>

                <div className="stats-grid">
                    {stats.map((stat, i) => (
                        <div key={i} className="stat-card premium-card">
                            <div className="stat-icon-wrapper">{stat.icon}</div>
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </main>

            {showRules && (
                <div className="modal-overlay" onClick={() => setShowRules(false)}>
                    <div className="modal-content premium-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Game Rules 📖</h3>
                            <button className="close-modal" onClick={() => setShowRules(false)}>&times;</button>
                        </div>
                        <div className="rules-list">
                            {[
                                "Choose 1 or 2 cartelas (cards) with your preferred stake (10 - 100 Birr).",
                                "Wait for the live round to start. Numbers are called every 5 seconds.",
                                "System automatically marks called numbers on your cards in real-time.",
                                "First player to complete a full line wins the entire prize pool!",
                                "House takes a 15% commission. Payouts are instant."
                            ].map((rule, i) => (
                                <div key={i} className="rule-item">
                                    <span className="rule-step">{i + 1}</span>
                                    <p>{rule}</p>
                                </div>
                            ))}
                        </div>
                        <button className="play-btn" onClick={() => setShowRules(false)}>Got it!</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
