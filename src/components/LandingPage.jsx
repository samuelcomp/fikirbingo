import React, { useState } from 'react';
import { Play, Trophy, Users, History, Wallet, HelpCircle, CheckCircle2 } from 'lucide-react';
import { logoBase64 } from '../assets/logo';

const LandingPage = ({ onPlay, appName, appLogo, t, userBalance = 0 }) => {
    const [showRules, setShowRules] = useState(false);
    const [selectedStake, setSelectedStake] = useState(10);

    const stats = [
        { label: t.activePlayers, value: '45K+', icon: <Users size={20} /> },
        { label: t.gamesPlayed, value: '60K+', icon: <History size={20} /> },
        { label: t.winnersDaily, value: '500+', icon: <Trophy size={20} /> },
    ];

    const authenticLogo = logoBase64;

    return (
        <div className="premium-bg-container">
            <div className="landing-container">
                <header className="landing-header animate-reveal delay-1">
                    <div className="logo-section">
                        <div className="premium-logo-wrapper">
                            <img
                                src={authenticLogo}
                                alt="Fikir Bingo"
                                className="premium-logo-img"
                            />
                        </div>
                    </div>
                    <button className="rules-btn prestige-btn" onClick={() => setShowRules(true)}>
                        <HelpCircle size={18} />
                        <span>{t.rules}</span>
                    </button>
                </header>

                <main className="landing-main no-scroll-main">
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
                                    className={`stake-btn-premium chip-style ${selectedStake === val ? 'selected' : ''}`}
                                    onClick={() => setSelectedStake(val)}
                                >
                                    <div className="selection-dot">
                                        {selectedStake === val && <CheckCircle2 size={12} />}
                                    </div>
                                    <span className="stake-val">{val}</span>
                                    <span className="stake-unit">Birr</span>
                                </button>
                            ))}
                        </div>

                        <button
                            className="play-btn prestige-action pulse active-play"
                            onClick={() => onPlay(selectedStake)}
                        >
                            <Play size={22} fill="currentColor" />
                            {t.playNow} - {selectedStake} Birr
                        </button>
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
                                    { en: "Select your stake and click PLAY to enter the lobby.", am: "መጠንዎን ይምረጡ እና ወደ ሎቢው ለመግባት PLAY የሚለውን ይጫኑ።" },
                                    { en: "Choose 1 or 2 cartelas (cards) to play with.", am: "ለመጫወት 1 ወይም 2 ካርቴላዎችን ይምረጡ።" },
                                    { en: "Wait for the round. The system automatically detects and announces winners!", am: "ዙሩን ይጠብቁ። ሲስተሙ አሸናፊዎችን በራሱ ያሳውቃል!" },
                                    { en: "First player to complete a full line wins the prize pool!", am: "ቀድሞ መስመር የጨረሰ ተጫዋች ሽልማቱን ያሸንፋል!" },
                                    { en: "House adds a small commission. Payouts are instant.", am: "ሲስተሙ አነስተኛ ኮሚሽን ይወስዳል። ክፍያ ወዲያውኑ ይፈጸማል።" }
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
        </div>
    );
};

export default LandingPage;
