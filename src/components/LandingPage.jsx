import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Trophy, Users, History, Wallet, HelpCircle, CheckCircle2, Sparkles, Crown, Target } from 'lucide-react';
import { logoBase64 } from '../assets/logo';

const LandingPage = ({ onPlay, appName, appLogo, t, userBalance = 0, mustRegister = false }) => {
    const [showRules, setShowRules] = useState(false);
    const [selectedStake, setSelectedStake] = useState(10);

    const authenticLogo = logoBase64;

    const stakeOptions = [
        { value: 10, label: 'Starter', icon: Target, color: 'blue' },
        { value: 50, label: 'Pro', icon: Sparkles, color: 'purple' },
        { value: 100, label: 'VIP', icon: Crown, color: 'gold' }
    ];

    return (
        <div className="premium-bg-container">
            {/* Animated Particles Background */}
            <div className="particle-container">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${3 + Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            {/* Mesh Orbs - Visual Wow Factor */}
            <div className="premium-mesh-bg">
                <div className="mesh-orb orb-1"></div>
                <div className="mesh-orb orb-2"></div>
                <div className="mesh-orb orb-3"></div>
            </div>

            <div className="landing-container-v3">
                {/* Header with Rules Button */}
                <motion.header
                    className="landing-header-v3"
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <button className="rules-btn-v3" onClick={() => setShowRules(true)}>
                        <HelpCircle size={18} />
                        <span>{t.rules}</span>
                    </button>
                </motion.header>

                <main className="landing-main-v3">
                    {/* Hero Section with Logo */}
                    <motion.div
                        className="hero-section-v3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <motion.div
                            className="hero-logo-container"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", duration: 1, delay: 0.3 }}
                        >
                            <div className="logo-glow-ring"></div>
                            <img src={authenticLogo} alt="Logo" className="hero-logo" />
                        </motion.div>

                        <motion.h1
                            className="hero-title-v3"
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            {t.welcome}
                            <span className="gradient-text-v3">Fikir Bingo</span>
                        </motion.h1>

                        <motion.p
                            className="hero-subtitle-v3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                        >
                            Real-time multiplayer bingo. Big stakes, big wins. 🎰
                        </motion.p>
                    </motion.div>

                    {/* Balance Display */}
                    {!mustRegister && (
                        <motion.div
                            className="balance-display-v3"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 1 }}
                        >
                            <Wallet size={16} className="balance-icon" />
                            <span className="balance-amount">{userBalance}</span>
                            <span className="balance-currency">Birr</span>
                        </motion.div>
                    )}

                    {/* Stake Selection */}
                    <motion.div
                        className="stake-selection-v3"
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.1 }}
                    >
                        <h3 className="section-title-v3">Choose Your Stake</h3>

                        <div className="stake-cards-grid-v3">
                            {stakeOptions.map((stake, idx) => {
                                const Icon = stake.icon;
                                return (
                                    <motion.div
                                        key={stake.value}
                                        className={`stake-card-v3 ${selectedStake === stake.value ? 'active' : ''} ${stake.color}`}
                                        onClick={() => setSelectedStake(stake.value)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 1.2 + idx * 0.1 }}
                                        whileHover={{ scale: 1.05, y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <div className="stake-icon-v3">
                                            <Icon size={28} />
                                        </div>
                                        <div className="stake-amount-v3">{stake.value}</div>
                                        <div className="stake-currency-v3">BIRR</div>
                                        <div className="stake-label-v3">{stake.label}</div>
                                        {selectedStake === stake.value && (
                                            <motion.div
                                                className="selected-indicator-v3"
                                                layoutId="selected"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                            >
                                                <CheckCircle2 size={20} />
                                            </motion.div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Play Button */}
                    <motion.button
                        className="play-button-v3"
                        onClick={() => onPlay(selectedStake)}
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <div className="button-glow-v3"></div>
                        <div className="button-content-v3">
                            <Play size={24} fill="currentColor" />
                            <span>PLAY NOW - {selectedStake} BIRR</span>
                        </div>
                    </motion.button>
                </main>

                {/* Rules Modal */}
                {showRules && (
                    <div className="modal-overlay" onClick={() => setShowRules(false)}>
                        <motion.div
                            className="modal-content premium-card glass-modal"
                            onClick={e => e.stopPropagation()}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                        >
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
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LandingPage;
