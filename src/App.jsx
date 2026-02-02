import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import LandingPage from './components/LandingPage';
import CartelaSelection from './components/CartelaSelection';
import GameBoard from './components/GameBoard';
import WalletDashboard from './components/WalletDashboard';
import ProfilePage from './components/ProfilePage';
import Leaderboard from './components/Leaderboard';
import RegisterPage from './components/RegisterPage';
import GameHistory from './components/GameHistory';
import { Home, Trophy as TrophyIcon, Wallet, User as UserIcon, Gamepad2, History as HistoryIcon, Phone } from 'lucide-react';
import { translations } from './translations';
import './index.css';
import './components-styles.css';
import './landing-cartela-styles.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\s/g, '');
console.log('Fikir Bingo Debug - API_URL:', API_URL);
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

function App() {
    const [view, setView] = useState('landing');
    const [stake, setStake] = useState(10);
    const [user, setUser] = useState(null);
    const [branding, setBranding] = useState({ appName: 'Fikir Bingo', appLogo: null });
    const [selectedCartelas, setSelectedCartelas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mustRegister, setMustRegister] = useState(false);
    const [lang, setLang] = useState('en');

    const t = translations[lang];

    useEffect(() => {
        initApp();
    }, []);

    useEffect(() => {
        if (user?.id) fetchUserProfile();
    }, [view, stake]);

    const initApp = async () => {
        try {
            const brandRes = await axios.get(`${API_URL}/api/branding`);
            setBranding(brandRes.data);

            const initData = window.Telegram?.WebApp?.initData;
            const token = localStorage.getItem('userToken');

            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

            if (initData || (isLocalhost && !token)) {
                console.log(`[App] Auth with ${initData ? 'initData' : 'Dev Auth (localhost)'}`);
                const authRes = await axios.post(`${API_URL}/api/auth`, { initData });
                localStorage.setItem('userToken', authRes.data.token);
                setUser(authRes.data.user);
                setMustRegister(authRes.data.mustRegister);

                if (!authRes.data.mustRegister && view === 'register') {
                    setView('landing');
                }
            } else if (token) {
                console.log('[App] Auth with token');
                fetchUserProfile();
            } else {
                // No token, no initData, not localhost - might be a regular browser visit to ngrok
                console.log('[App] No auth source found');
            }
        } catch (e) {
            console.error('Initialization failed', e);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('userToken');
            if (token) {
                const res = await axios.get(`${API_URL}/api/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setUser(res.data);
                if (res.data.phoneNumber) {
                    setMustRegister(false);
                }
            }
        } catch (e) {
            console.error('Profile fetch failed');
        }
    };

    const handlePlay = (amount) => {
        if (mustRegister) {
            alert(t.mustRegisterError);
            return;
        }
        if (user?.canPlay === false) {
            alert('Your access to game play is currently restricted. Please contact support.');
            return;
        }
        setStake(amount);
        setView('lobby');
    };

    const handleGameStart = (cartelas) => {
        setSelectedCartelas(cartelas);
        setView('game');
    };

    const handleGameOver = () => {
        console.log(`[App] Game over, returning to ${stake} Birr lobby`);
        setSelectedCartelas([]); // Clear selection for new round
        setView('lobby'); // Return to the same stake lobby
        fetchUserProfile(); // Refresh balance/stats immediately
    };

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        setUser(null);
        setMustRegister(false);
        setView('landing');
    };

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="spinner-container">
                    <div className="heart-loader"></div>
                    <p className="loading-text">Loading Fikir Bingo (በመጫን ላይ)...</p>
                </div>
            </div>
        );
    }

    const isNotTelegram = !window.Telegram?.WebApp?.initData &&
        !window.location.hostname.includes('localhost') &&
        !window.location.hostname.includes('127.0.0.1');

    if (branding.isMaintenance) {
        return (
            <div className="access-denied-screen">
                <div className="denied-card upscale-reveal">
                    <h1>🚧 Under Maintenance</h1>
                    <p>Fikir Bingo is currently undergoing scheduled maintenance. Please check back later.</p>
                    <p>ጥገና ላይ ነን። እባክዎ ቆይተው ይሞክሩ።</p>
                </div>
            </div>
        );
    }

    if (user?.isBlocked) {
        return (
            <div className="access-denied-screen">
                <div className="denied-card upscale-reveal">
                    <h1>⛔ Account Blocked</h1>
                    <p>Your account has been suspended by administration. Please contact support for more details.</p>
                    <p>የእርስዎ መለያ ታግዷል። እባክዎ ድጋፍ ሰጪዎችን ያነጋግሩ።</p>
                </div>
            </div>
        );
    }

    if (isNotTelegram) {
        return (
            <div className="access-denied-screen">
                <div className="denied-card upscale-reveal">
                    <h1>🚷 Access Denied</h1>
                    <p>ይህ ጨዋታ ሊደረስበት የሚችለው በቴሌግራም ቦት ብቻ ነው (This game is only accessible via Telegram Bot).</p>
                    <div className="qr-placeholder">
                        <div className="bot-link">@FikirRealBingoBot</div>
                    </div>
                    <button className="prestige-btn" onClick={() => window.location.href = 'https://t.me/FikirRealBingoBot'}>
                        Go to Bot
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="app-main">
            <div className="content-area">
                <AnimatePresence mode="wait">
                    {view === 'register' && (
                        <motion.div
                            key="register"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <RegisterPage
                                API_URL={API_URL}
                                t={t}
                                onRegisterSuccess={() => {
                                    setMustRegister(false);
                                    setView('landing');
                                    initApp();
                                }}
                            />
                        </motion.div>
                    )}

                    {!mustRegister && view !== 'register' && (
                        <>
                            {view === 'landing' && (
                                <motion.div
                                    key="landing"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <LandingPage
                                        onPlay={handlePlay}
                                        appName={branding.appName}
                                        appLogo={branding.appLogo}
                                        userBalance={user?.mainBalance || 0}
                                        t={t}
                                        mustRegister={mustRegister}
                                    />
                                </motion.div>
                            )}
                            {view === 'leaderboard' && (
                                <motion.div
                                    key="leaderboard"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <Leaderboard t={t} user={user} />
                                </motion.div>
                            )}
                            {view === 'history' && (
                                <motion.div
                                    key="history"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <GameHistory t={t} user={user} />
                                </motion.div>
                            )}
                            {view === 'lobby' && (
                                <motion.div
                                    key="lobby"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                >
                                    <CartelaSelection
                                        user={user}
                                        stake={stake}
                                        onUpdateUser={setUser}
                                        onGameStart={handleGameStart}
                                        t={t}
                                    />
                                </motion.div>
                            )}
                            {view === 'game' && (
                                <motion.div
                                    key="game"
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                >
                                    <GameBoard
                                        user={user}
                                        roomId={`room-${stake}`}
                                        selectedCartelas={selectedCartelas}
                                        onGameOver={handleGameOver}
                                        t={t}
                                        branding={branding}
                                    />
                                </motion.div>
                            )}
                            {view === 'wallet' && (
                                <motion.div
                                    key="wallet"
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 30 }}
                                >
                                    <WalletDashboard
                                        user={user}
                                        onUpdateUser={fetchUserProfile}
                                        t={t}
                                    />
                                </motion.div>
                            )}
                            {view === 'profile' && (
                                <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 30 }}
                                >
                                    <ProfilePage
                                        user={user}
                                        lang={lang}
                                        onToggleLang={() => setLang(lang === 'en' ? 'am' : 'en')}
                                        onLogout={handleLogout}
                                        t={t}
                                    />
                                </motion.div>
                            )}
                        </>
                    )}
                </AnimatePresence>

                {mustRegister && view !== 'register' && (
                    <div className="registration-gate upscale-reveal">
                        <div className="gate-content">
                            <h2>🛡️ Registration Required</h2>
                            <p>You must complete your registration before accessing the game. This ensures a secure and fair experience for all players.</p>
                            <button className="prestige-btn" onClick={() => setView('register')}>
                                Go to Registration
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {view !== 'game' && (
                <nav className="bottom-nav-v2">
                    <button className={`nav-item-v2 ${view === 'landing' ? 'active' : ''}`} onClick={() => setView('landing')}>
                        <Gamepad2 size={24} />
                        <span>Game</span>
                    </button>

                    <button className={`nav-item-v2 ${view === 'leaderboard' ? 'active' : ''}`} onClick={() => setView('leaderboard')}>
                        <TrophyIcon size={24} />
                        <span>Scores</span>
                    </button>

                    <button className={`nav-item-v2 ${view === 'history' ? 'active' : ''}`} onClick={() => setView('history')}>
                        <HistoryIcon size={24} />
                        <span>History</span>
                    </button>

                    <button className={`nav-item-v2 ${view === 'wallet' ? 'active' : ''}`} onClick={() => setView('wallet')}>
                        <Wallet size={24} />
                        <span>Wallet</span>
                    </button>

                    <button className={`nav-item-v2 ${view === 'profile' ? 'active' : ''}`} onClick={() => setView('profile')}>
                        <UserIcon size={24} />
                        <span>Profile</span>
                    </button>
                </nav>
            )}
        </div>
    );
}

export default App;
