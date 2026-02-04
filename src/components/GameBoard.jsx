import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { io } from 'socket.io-client';
import { Trophy, LogOut, RotateCcw, Volume2, VolumeX, Info } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\s/g, '');

const GameBoard = ({ user, roomId = 'room-10', selectedCartelas = [], onGameOver, t, branding }) => {
    const [gameState, setGameState] = useState({
        gameId: '...',
        playersCount: 0,
        prizePool: 0,
        calledNumbers: [],
        status: 'PLAYING',
        resetIn: 0
    });
    const [winner, setWinner] = useState(null);
    const [isAutomatic, setIsAutomatic] = useState(true);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(branding?.isVoiceEnabled !== false);
    const [currentBall, setCurrentBall] = useState(null);

    const isWatcher = selectedCartelas.length === 0;
    const [socket, setSocket] = useState(null);
    const audioRef = React.useRef(new Audio('/assets/bingo_win.mp3'));
    const voiceRef = React.useRef(new Audio());

    const playBingoVoice = (num) => {
        if (!isVoiceEnabled || !branding?.voicePack) return;
        try {
            // Path: /assets/voices/[amharic/english]/[1-75].mp3
            voiceRef.current.src = `/assets/voices/${branding.voicePack}/${num}.mp3`;
            voiceRef.current.play().catch(e => console.log('Voice play failed (File might be missing):', e));
        } catch (e) { console.error('Voice system error:', e); }
    };

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token || !user?.id) return;

        const s = io(API_URL, {
            auth: { token },
            extraHeaders: { "ngrok-skip-browser-warning": "true" }
        });
        setSocket(s);

        s.on('connect', () => console.log('[Socket] Connected to server! Socket ID:', s.id));
        s.on('connect_error', (err) => console.error('[Socket] Connection failed:', err.message));
        s.on('disconnect', (reason) => console.warn('[Socket] Disconnected:', reason));

        s.emit('join_room', { roomId });

        s.on('room_state', (data) => {
            if (data.roomId === roomId) {
                setGameState(prev => ({
                    ...prev,
                    gameId: data.gameId || prev.gameId,
                    playersCount: data.playersCount || 0,
                    prizePool: data.prizePool || 0,
                    calledNumbers: data.calledNumbers || [],
                    status: data.status,
                    resetIn: data.resetIn || 0
                }));
                if (data.calledNumbers?.length > 0) {
                    setCurrentBall(data.calledNumbers[data.calledNumbers.length - 1]);
                }
                if (data.winnerData) {
                    setWinner(data.winnerData);
                }
            }
        });

        s.on('ball_drawn', (data) => {
            setCurrentBall(data.ball);
            playBingoVoice(data.ball);
            setGameState(prev => ({
                ...prev,
                calledNumbers: [...prev.calledNumbers, data.ball]
            }));
        });

        s.on('room_tick', (data) => {
            if (data.roomId === roomId) {
                setGameState(prev => ({
                    ...prev,
                    gameId: data.gameId,
                    status: data.status,
                    playersCount: data.playersCount,
                    prizePool: data.prizePool,
                    resetIn: data.resetIn || 0
                }));
                if (data.winnerData !== undefined) {
                    setWinner(data.winnerData);
                }
            }
        });

        s.on('player_won', (data) => {
            console.log('🏆 Winner data received via EVENT:', data);
            setWinner(data);
        });

        s.on('game_reset', () => {
            console.log('🔄 Game reset event received');
            onGameOver();
        });

        return () => {
            if (s) s.disconnect();
        };
    }, [roomId, user?.id, onGameOver]);

    // Audio Effect & Congratulations Confetti
    useEffect(() => {
        if (winner && isVoiceEnabled) {
            audioRef.current.play().catch(e => console.log('Audio play failed:', e));

            // Trigger Confetti for a WOW win!
            const count = 200;
            const defaults = { origin: { y: 0.7 }, zIndex: 10000 };

            function fire(particleRatio, opts) {
                confetti({
                    ...defaults,
                    ...opts,
                    particleCount: Math.floor(count * particleRatio)
                });
            }

            fire(0.25, { spread: 26, startVelocity: 55 });
            fire(0.2, { spread: 60 });
            fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
            fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
            fire(0.1, { spread: 120, startVelocity: 45 });
        }
    }, [winner, isVoiceEnabled]);

    const getBallColor = (num) => {
        if (num <= 15) return '#2563eb'; // B
        if (num <= 30) return '#7c3aed'; // I
        if (num <= 45) return '#db2777'; // N
        if (num <= 60) return '#059669'; // G
        return '#ea580c'; // O
    };

    const getBallLetter = (num) => {
        if (num <= 15) return 'B';
        if (num <= 30) return 'I';
        if (num <= 45) return 'N';
        if (num <= 60) return 'G';
        return 'O';
    };

    const renderCard = (card) => {
        if (!card || !card.numbers) return null;
        return (
            <div key={card.id} className="game-card-v3 upscale-reveal">
                <div className="bingo-grid-5x5-v3">
                    {['B', 'I', 'N', 'G', 'O'].map((col, idx) => (
                        <div key={col} className="bingo-col-v3">
                            <div className="col-header-v3" style={{ backgroundColor: getBallColor(idx * 15 + 1) }}>{col}</div>
                            {(card.numbers[col] || []).map((num, i) => {
                                const isMarked = gameState.calledNumbers.includes(num) || num === 'FREE';
                                return (
                                    <motion.div
                                        key={i}
                                        className={`mini-num-v3 ${isMarked ? 'marked' : ''}`}
                                        animate={isMarked ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        {num === 'FREE' ? <motion.span className="free-star" animate={{ rotate: 360 }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}>✨</motion.span> : num}
                                    </motion.div>
                                );
                            })}
                        </div>
                    ))}
                </div>
                <div className="card-footer-v3">Cartela No: {card.id}</div>
            </div>
        );
    };

    return (
        <div className="game-view-v3 no-scroll-app">
            <header className="game-status-row-v3">
                <div className="stat-pill-v3">
                    <span className="pill-title">Game ID</span>
                    <span className="pill-val mono">{gameState.gameId}</span>
                </div>
                <div className="stat-pill-v3">
                    <span className="pill-title">Players</span>
                    <span className="pill-val">{gameState.playersCount}</span>
                </div>
                <div className="stat-pill-v3">
                    <span className="pill-title">Bet</span>
                    <span className="pill-val">{roomId.split('-')[1]}</span>
                </div>
                <div className="stat-pill-v3 derash-glow">
                    <span className="pill-title">Derash</span>
                    <span className="pill-val">{gameState.prizePool}</span>
                </div>
                <div className="stat-pill-v3">
                    <span className="pill-title">Called</span>
                    <span className="pill-val">{gameState.calledNumbers.length}</span>
                </div>
            </header>

            <div className="game-body-v3">
                <aside className="bingo-sidebar-v3">
                    {['B', 'I', 'N', 'G', 'O'].map((letter, colIndex) => (
                        <div key={letter} className="sidebar-col-v3">
                            <div className="sidebar-letter-v3" style={{ backgroundColor: getBallColor(colIndex * 15 + 1) }}>{letter}</div>
                            {Array.from({ length: 15 }, (_, i) => i + 1 + colIndex * 15).map(num => (
                                <div
                                    key={num}
                                    className={`sidebar-num-v3 ${gameState.calledNumbers.includes(num) ? 'called' : ''} ${currentBall === num ? 'active' : ''}`}
                                    style={{ '--accent': getBallColor(num) }}
                                >
                                    {num}
                                </div>
                            ))}
                        </div>
                    ))}
                </aside>

                <main className="game-main-v3">
                    <div className="top-feedback-v3">
                        <div className="recent-draws-v3">
                            {gameState.calledNumbers.slice(-3).reverse().map((num, i) => (
                                <div key={i} className="recent-ball-v3" style={{ backgroundColor: getBallColor(num) }}>
                                    {getBallLetter(num)}-{num}
                                </div>
                            ))}
                        </div>
                        <button className="icon-btn-v3" onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}>
                            {isVoiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                        </button>
                    </div>

                    <div className="current-ball-v3">
                        <AnimatePresence mode="wait">
                            {currentBall ? (
                                <motion.div
                                    key={currentBall}
                                    initial={{ scale: 0.4, opacity: 0, rotate: -180 }}
                                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                    exit={{ scale: 1.5, opacity: 0, filter: 'blur(10px)' }}
                                    transition={{ type: 'spring', damping: 12 }}
                                    className="focus-ball-v3 shadow-pulse"
                                    style={{ borderColor: getBallColor(currentBall) }}
                                >
                                    <span className="focus-letter-v3" style={{ color: getBallColor(currentBall) }}>{getBallLetter(currentBall)}</span>
                                    <span className="focus-val-v3">{currentBall}</span>
                                    <motion.div
                                        className="ball-aura"
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        style={{ backgroundColor: getBallColor(currentBall) }}
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="waiting"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="focus-ball-v3 waiting"
                                >
                                    <span className="wait-txt">WAITING</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="cards-stack-v3">
                        {isWatcher ? (
                            <div className="watcher-card-v3 upscale-reveal">
                                <div className="watching-badge">Watching Only</div>
                                <div className="watcher-content">
                                    <div className="watcher-info-icon">
                                        <Info size={40} />
                                    </div>
                                    <p className="watcher-txt-am">የዚህ ዙር ጨዋታ ተጀምሯል። አዲስ ዙር እስኪጀምር እዚህ ይጠብቁ።</p>
                                    <p className="watcher-txt-en">This round has started. Please stay tuned for the next game.</p>
                                </div>
                            </div>
                        ) : (
                            selectedCartelas.map(renderCard)
                        )}
                    </div>
                </main>
            </div>

            <footer className="game-footer-v3">
                <button className="action-btn-v3 leave" onClick={() => onGameOver()}>Leave</button>
                <button className="action-btn-v3 refresh" onClick={() => window.location.reload()}>Refresh</button>
            </footer>

            {/* Winner Overlay - High Fidelity Restoration with Crash Protection */}
            {winner && (Array.isArray(winner) ? winner.length > 0 : true) && (
                <div className="bingo-modal-overlay">
                    <div className="bingo-modal-content upscale-reveal-v4 gold-border-prestige">
                        <div className="crown-circle-v4">
                            <Trophy size={40} className="crown-svg-v4" />
                        </div>

                        <h1 className="bingo-title-v4">BINGO!</h1>

                        <div className="winners-list-v4">
                            {(Array.isArray(winner) ? winner : [winner]).map((w, idx) => {
                                if (!w) return null;
                                return (
                                    <div key={idx} className="winner-presentation-v4">
                                        <div className="winner-label-v4">
                                            🎉 <span className="name-v4">{w.username || 'Player'} WON!</span> 🎉
                                        </div>

                                        <div className="card-box-v4">
                                            <div className="card-header-v4">
                                                <Trophy size={14} /> Winning Cartela : {w.cartelaId || '...'}
                                            </div>
                                            <div className="grid-5x5-v4">
                                                {['B', 'I', 'N', 'G', 'O'].map((col, cIdx) => (
                                                    <div key={col} className="col-v4">
                                                        <div className="header-v4" style={{ backgroundColor: getBallColor(cIdx * 15 + 1) }}>{col}</div>
                                                        {(w.officialCard?.[col] || []).map((num, i) => {
                                                            const isMarked = gameState.calledNumbers.includes(num) || num === 'FREE';
                                                            return (
                                                                <div key={i} className={`cell-v4 ${isMarked ? 'marked' : ''}`}>
                                                                    {num === 'FREE' ? '✨' : num}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="prize-pill-v4">
                                            <span className="p-lbl">PRIZE:</span> {w.prize || 0} <small>Birr</small>
                                        </div>

                                        {idx < (Array.isArray(winner) ? winner.length : 1) - 1 && <div className="winner-sep-v4" />}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="auto-start-pill-v4">
                            <div className="dot-v4 pulsing"></div>
                            Auto-starting next game in {gameState.resetIn || 0}s
                        </div>

                        <button className="prestige-continue-btn" onClick={() => onGameOver()}>
                            CONTINUE
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameBoard;
