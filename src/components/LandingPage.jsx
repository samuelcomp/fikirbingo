import React, { useState } from 'react';
import { Play, Trophy, Users, History, Wallet, HelpCircle } from 'lucide-react';

const LandingPage = ({ onPlay, appName, appLogo, t, userBalance = 0 }) => {
    const [showRules, setShowRules] = useState(false);

    // Premium Stats with Bilingual Labels - kept simple to avoid overlap
    const stats = [
        { label: t.activePlayers, value: '45K+', icon: <Users size={20} /> },
        { label: t.gamesPlayed, value: '60K+', icon: <History size={20} /> },
        { label: t.winnersDaily, value: '500+', icon: <Trophy size={20} /> },
    ];

    // Placeholder for logo if missing
    const defaultLogo = "https://cdn-icons-png.flaticon.com/512/3408/3408545.png";

    return (
        <div className="landing-container">
            <header className="landing-header animate-reveal delay-1">
                <div className="logo-section">
                    <div className="premium-logo-wrapper">
                        <img
                            src={appLogo || defaultLogo}
                            alt="Fikir Bingo"
                            className="premium-logo-img"
                            onError={(e) => { e.target.src = defaultLogo; }}
                        />
                    </div>
                </div>
                <button className="rules-btn prestige-btn" onClick={() => setShowRules(true)}>
                    <HelpCircle size={18} />
                    <span>{t.rules}</span>
                </button>
            </header>

            <main className="landing-main">
                <div className="welcome-section animate-reveal delay-2">
                    <h2 className="brilliant-text">
                        <span>{t.welcome}</span>
                        Fikir Bingo
                    </h2>
                    <p className="welcome-sub">Real-time multiplayer bingo. Big stakes, big wins.</p>
                </div>

                <div className="stake-card premium-card animate-reveal delay-3">
                    <div className="stake-header">
                        <span className="available-stakes-label">Available Stakes (መጠኖች)</span>
                        <div className="wallet-pill gold-glow">
                            <Wallet size={12} className="wallet-icon-mini" />
                            {userBalance} Birr
                        </div>
                    </div>

                    <div className="stake-options">
                        {[10, 50, 100].map((val, idx) => (
                            <button
                                key={val}
                                className={`stake-btn-premium chip-style delay-${idx + 1}`}
                                onClick={() => onPlay(val)}
                            >
                                <span className="stake-val">{val}</span>
                                <span className="stake-unit">Birr (ብር)</span>
                            </button>
                        ))}
                    </div>

                    <button className="play-btn prestige-action pulse" onClick={() => onPlay(10)}>
                        <Play size={22} fill="currentColor" />
                        {t.playNow}
                    </button>
                </div>

                <div className="stats-grid animate-reveal delay-3">
                    {stats.map((stat, i) => (
                        <div key={i} className="stat-card premium-card glass-panel">
                            <div className="stat-icon-wrapper pulse-soft">{stat.icon}</div>
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </main>

            {showRules && (
                <div className="modal-overlay" onClick={() => setShowRules(false)}>
                    <div className="modal-content premium-card glass-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{t.rules} 📖</h3>
                            <button className="close-modal" onClick={() => setShowRules(false)}>&times;</button>
                        </div>
                        <div className="rules-list">
                            {[
                                { en: "Choose 1 or 2 cartelas (cards) with your preferred stake (10 - 100 Birr).", am: "በመረጡት መጠን (ከ10 - 100 ብር) 1 ወይም 2 ካርቴላዎችን ይምረጡ።" },
                                { en: "Wait for the live round to start. Numbers are called every 5 seconds.", am: "ጨዋታው እስኪጀምር ይጠብቁ። ቁጥሮች በየ 5 ሰከንዱ ይጠራሉ።" },
                                { en: "System automatically marks called numbers on your cards in real-time.", am: "ሲስተሙ የተጠሩትን ቁጥሮች በራሱ ምልክት ያደርጋል።" },
                                { en: "First player to complete a full line wins the entire prize pool!", am: "አንድ መስመር ቀድሞ የጨረሰ ተጫዋች አጠቃላይ ሽልማቱን ያሸንፋል!" },
                                { en: "House takes a 15% commission. Payouts are instant.", am: "ሲስተሙ 15% ኮሚሽን ይወስዳል። ክፍያ ወዲያውኑ ይፈጸማል።" }
                            ].map((rule, i) => (
                                <div key={i} className="rule-item-premium">
                                    <div className="rule-step-badge">{i + 1}</div>
                                    <div className="rule-text-container">
                                        <p className="rule-am">{rule.am}</p>
                                        <p className="rule-en">{rule.en}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="play-btn prestige-action" onClick={() => setShowRules(false)}>ጎበዝ! (Got it!)</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
