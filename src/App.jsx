import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LandingPage from './components/LandingPage';
import CartelaSelection from './components/CartelaSelection';
import GameBoard from './components/GameBoard';
import WalletDashboard from './components/WalletDashboard';
import ProfilePage from './components/ProfilePage';
import Leaderboard from './components/Leaderboard';
import RegisterPage from './components/RegisterPage';
import { Home, Trophy as TrophyIcon, Wallet, User as UserIcon, Gamepad2 } from 'lucide-react';
import { translations } from './translations';
import './index.css';

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

            if (initData) {
                console.log('[App] Auth with initData');
                const authRes = await axios.post(`${API_URL}/api/auth`, { initData });
                localStorage.setItem('userToken', authRes.data.token);
                setUser(authRes.data.user);
                setMustRegister(authRes.data.mustRegister);

                // If they are NOT in mustRegister state, but we were showing the register page, switch to landing
                if (!authRes.data.mustRegister && view === 'register') {
                    setView('landing');
                }
            } else if (token) {
                console.log('[App] Auth with token');
                fetchUserProfile();
            } else {
                fetchUserProfile();
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
            } else if (!window.Telegram?.WebApp?.initData) {
                // Only use dev fallback if definitely NOT in Telegram
                let devId = sessionStorage.getItem('devOrderId');
                if (!devId) {
                    devId = 'dev-' + Math.random().toString(36).substring(7);
                    sessionStorage.setItem('devOrderId', devId);
                }
                setUser({
                    id: devId,
                    username: 'Player-' + devId.substring(4).toUpperCase(),
                    phoneNumber: '0900000000',
                    playBalance: 1250,
                    mainBalance: 50,
                    totalWins: 0,
                    coins: 0
                });
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
        setStake(amount);
        setView('lobby');
    };

    const handleGameStart = (cartelas) => {
        setSelectedCartelas(cartelas);
        setView('game');
    };

    const handleGameOver = () => {
        console.log('[App] Game over, returning to landing');
        setView('landing');
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

    return (
        <div className="app-main">
            <div className="content-area">
                {mustRegister ? (
                    <RegisterPage
                        API_URL={API_URL}
                        t={t}
                        onRegisterSuccess={() => {
                            setMustRegister(false);
                            initApp();
                        }}
                    />
                ) : (
                    <>
                        {view === 'landing' && (
                            <LandingPage
                                onPlay={handlePlay}
                                appName={branding.appName}
                                appLogo={branding.appLogo}
                                userBalance={user?.playBalance || 0}
                                t={t}
                            />
                        )}
                        {view === 'leaderboard' && (
                            <Leaderboard t={t} />
                        )}
                        {view === 'lobby' && (
                            <CartelaSelection
                                user={user}
                                stake={stake}
                                userBalance={user?.playBalance || 0}
                                onGameStart={handleGameStart}
                                t={t}
                            />
                        )}
                        {view === 'game' && (
                            <GameBoard
                                user={user}
                                roomId={`room-${stake}`}
                                selectedCartelas={selectedCartelas}
                                onGameOver={handleGameOver}
                                t={t}
                            />
                        )}
                        {view === 'wallet' && (
                            <WalletDashboard
                                user={user}
                                onUpdateUser={fetchUserProfile}
                                t={t}
                            />
                        )}
                        {view === 'profile' && (
                            <ProfilePage
                                user={user}
                                lang={lang}
                                onToggleLang={() => setLang(lang === 'en' ? 'am' : 'en')}
                                onLogout={handleLogout}
                                t={t}
                            />
                        )}
                    </>
                )}
            </div>

            {!mustRegister && view !== 'game' && (
                <nav className="bottom-nav">
                    <button className={`nav-item ${view === 'landing' ? 'active' : ''}`} onClick={() => setView('landing')}>
                        <Home size={22} />
                        <span>LOBBY</span>
                    </button>
                    <button className={`nav-item ${view === 'leaderboard' ? 'active' : ''}`} onClick={() => {
                        if (mustRegister) alert(t.mustRegisterError);
                        else setView('leaderboard');
                    }}>
                        <TrophyIcon size={22} />
                        <span>RANKING</span>
                    </button>
                    <button className={`nav-item ${view === 'lobby' ? 'active' : ''}`} onClick={() => setView('landing')}>
                        <Gamepad2 size={22} />
                        <span>GAMES</span>
                    </button>
                    <button className={`nav-item ${view === 'wallet' ? 'active' : ''}`} onClick={() => {
                        if (mustRegister) alert(t.mustRegisterError);
                        else setView('wallet');
                    }}>
                        <Wallet size={22} />
                        <span>{t.wallet || 'WALLET'}</span>
                    </button>
                    <button className={`nav-item ${view === 'profile' ? 'active' : ''}`} onClick={() => {
                        if (mustRegister) alert(t.mustRegisterError);
                        else setView('profile');
                    }}>
                        <UserIcon size={22} />
                        <span>{t.profile || 'ME'}</span>
                    </button>
                </nav>
            )}
        </div>
    );
}

export default App;
