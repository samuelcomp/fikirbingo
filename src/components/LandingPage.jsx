import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Trophy, Users, History, Wallet, HelpCircle, CheckCircle2 } from 'lucide-react';
import { logoBase64 } from '../assets/logo';

const LandingPage = ({ onPlay, appName, appLogo, t, userBalance = 0, mustRegister = false }) => {
    const [showRules, setShowRules] = useState(false);
    const [selectedStake, setSelectedStake] = useState(10);

    const authenticLogo = logoBase64;

    return (
        <div className="premium-bg-container">
            {/* Mesh Orbs - Visual Wow Factor */}
            <div className="premium-mesh-bg">
                <div className="mesh-orb orb-1"></div>
                <div className="mesh-orb orb-2"></div>
                <div className="mesh-orb orb-3"></div>
            </div>

            <div className="landing-container">
                <motion.header
                    className="landing-header"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', damping: 20 }}
                >
                    <div className="logo-section">
                        <div className="premium-logo-wrapper">
                            <img src={authenticLogo} alt="Logo" className="premium-logo-img" />
                        </div>
                    </div>
                    <button className="rules-btn prestige-btn" onClick={() => setShowRules(true)}>
                        <HelpCircle size={18} />
                        <span>{t.rules}</span>
                    </button>
                </motion.header>

                <main className="landing-main no-scroll-main">
                    <motion.div
                        className="welcome-section"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="brilliant-text">
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                {t.welcome}
                            </motion.span>
                            Fikir Bingo
                        </h2>
                        <p className="welcome-sub">Real-time multiplayer bingo. Big stakes, big wins.</p>
                    </motion.div>

                    <motion.div
                        className="stake-card premium-card"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="stake-header">
                            <span className="available-stakes-label">Available Stakes (መጠኖች)</span>
                            {!mustRegister && (
                                <div className="wallet-pill gold-glow">
                                    <Wallet size={12} className="wallet-icon-mini" />
                                    {userBalance} Birr
                                </div>
                            )}
                        </div>

                        <div className="stake-options">
                            {[10, 50, 100].map((val, idx) => (
                                <motion.button
                                    key={val}
                                    whileHover={{ y: -5, scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`stake-btn-premium chip-style ${selectedStake === val ? 'selected' : ''}`}
                                    onClick={() => setSelectedStake(val)}
                                >
                                    <div className="selection-dot">
                                        {selectedStake === val && <CheckCircle2 size={12} />}
                                    </div>
                                    <span className="stake-val">{val}</span>
                                    <span className="stake-unit">Birr</span>
                                </motion.button>
                            ))}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="play-btn prestige-action pulse active-play"
                            onClick={() => onPlay(selectedStake)}
                        >
                            <Play size={22} fill="currentColor" />
                            {t.playNow} - {selectedStake} Birr
                        </motion.button>
                    </motion.div>
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
