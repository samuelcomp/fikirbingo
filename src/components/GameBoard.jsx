import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Trophy, LogOut, RotateCcw, Volume2, VolumeX, Info } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\s/g, '');
const socket = io(API_URL, {
    extraHeaders: {
        "ngrok-skip-browser-warning": "true"
    }
});

const GameBoard = ({ user, roomId = 'room-10', selectedCartelas = [], onGameOver, t }) => {
    const [gameState, setGameState] = useState({
        gameId: '...',
        playersCount: 0,
        prizePool: 0,
        calledNumbers: [],
        status: 'PLAYING'
    });
    const [winner, setWinner] = useState(null);
    const [isAutomatic, setIsAutomatic] = useState(true);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
    const [currentBall, setCurrentBall] = useState(null);

    const isWatcher = selectedCartelas.length === 0;

    useEffect(() => {
        if (!user?.id) return;
        const userId = user.id;
        socket.emit('join_room', { roomId, userId });

        socket.on('room_state', (data) => {
            if (data.roomId === roomId) {
                setGameState(prev => ({
                    ...prev,
                    gameId: data.gameId || prev.gameId,
                    playersCount: data.playersCount || 0,
                    prizePool: data.prizePool || 0,
                    calledNumbers: data.calledNumbers || [],
                    status: data.status
                }));
                if (data.calledNumbers?.length > 0) {
                    setCurrentBall(data.calledNumbers[data.calledNumbers.length - 1]);
                }
                if (data.winnerData) {
                    setWinner(data.winnerData);
                }
            }
        });

        socket.on('ball_drawn', (data) => {
            setCurrentBall(data.ball);
            setGameState(prev => ({
                ...prev,
                calledNumbers: [...prev.calledNumbers, data.ball]
            }));
        });

        socket.on('room_tick', (data) => {
            if (data.roomId === roomId) {
                setGameState(prev => ({
                    ...prev,
                    gameId: data.gameId,
                    status: data.status,
                    playersCount: data.playersCount,
                    prizePool: data.prizePool
                }));
                if (data.winnerData) {
                    setWinner(data.winnerData);
                }
            }
        });

        socket.on('player_won', (data) => {
            setWinner(data);
        });

        socket.on('game_reset', () => {
            onGameOver();
        });

        return () => {
            socket.off('room_state');
            socket.off('ball_drawn');
            socket.off('room_tick');
            socket.off('player_won');
            socket.off('game_reset');
        };
    }, [roomId, user?.id, onGameOver]);

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

    const renderCard = (card) => (
        <div key={card.id} className="game-card-v3">
            <div className="bingo-grid-5x5-v3">
                {['B', 'I', 'N', 'G', 'O'].map((col, idx) => (
                    <div key={col} className="bingo-col-v3">
                        <div className="col-header-v3" style={{ backgroundColor: getBallColor(idx * 15 + 1) }}>{col}</div>
                        {card.numbers[col].map((num, i) => {
                            const isMarked = gameState.calledNumbers.includes(num) || num === 'FREE';
                            return (
                                <div key={i} className={`mini-num-v3 ${isMarked ? 'marked' : ''}`}>
                                    {num === 'FREE' ? <span className="free-star">✨</span> : num}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
            <div className="card-footer-v3">Cartela No: {card.id}</div>
        </div>
    );

    return (
        <div className="game-view-v3 no-scroll-app">
            {/* 5-Pill Header */}
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
                {/* 1-75 Vertical Sidebar (BINGO Columns) */}
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

                {/* Right Area: Control & Feedback */}
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
                        {currentBall ? (
                            <div className="focus-ball-v3 shadow-pulse" style={{ borderColor: getBallColor(currentBall) }}>
                                <span className="focus-letter-v3" style={{ color: getBallColor(currentBall) }}>{getBallLetter(currentBall)}</span>
                                <span className="focus-val-v3">{currentBall}</span>
                            </div>
                        ) : (
                            <div className="focus-ball-v3 waiting">
                                <span className="wait-txt">WAITING</span>
                            </div>
                        )}
                    </div>

                    <div className="auto-toggle-row-v3">
                        <span className="toggle-label-v3">Automatic</span>
                        <label className="switch-v3">
                            <input type="checkbox" checked={isAutomatic} onChange={() => setIsAutomatic(!isAutomatic)} />
                            <span className="slider-v3 round"></span>
                        </label>
                    </div>

                    <div className="cards-stack-v3">
                        {isWatcher ? (
                            <div className="watcher-empty-v3">
                                <Info size={48} opacity={0.3} />
                                <p>Watching Round</p>
                                <small>የሚቀጥለውን ዙር ይጠብቁ</small>
                            </div>
                        ) : (
                            selectedCartelas.map(renderCard)
                        )}
                    </div>
                </main>
            </div>

            {/* Bottom Actions */}
            <footer className="game-footer-v3">
                <button className="action-btn-v3 leave" onClick={() => onGameOver()}>
                    Leave
                </button>
                <button className="action-btn-v3 refresh" onClick={() => window.location.reload()}>
                    Refresh
                </button>
                <button
                    className={`action-btn-v3 automatic ${isAutomatic ? 'active' : 'claim'}`}
                    disabled={isWatcher}
                >
                    {isAutomatic ? 'Automatic' : 'CLAIM BINGO!'}
                </button>
            </footer>

            {/* Winner Overlay */}
            {winner && (
                <div className="bingo-modal-overlay">
                    <div className="bingo-modal-content upscale-reveal gold-border">
                        <div className="crown-icon-wrapper">
                            <Trophy size={80} className="floating-crown" />
                        </div>
                        <h1 className="bingo-title glow-text">BINGO!</h1>
                        <div className="winner-announcement">
                            <span className="party-emoji">🎉</span>
                            <div className="winner-details">
                                <span className="winner-name">{winner.username} WON!</span>
                                {winner.phoneNumber && <span className="winner-phone">{winner.phoneNumber}</span>}
                            </div>
                            <span className="party-emoji">🎉</span>
                        </div>

                        <div className="prize-sum-v2">
                            <div className="prize-label">TOTAL PRIZE</div>
                            <div className="prize-val-v2">{winner.prize} <small>Birr</small></div>
                        </div>

                        <div className="winning-card-preview">
                            <div className="preview-label">🏆 Winning Cartela : {winner.cartelaId}</div>
                            <div className="bingo-grid-5x5 mini">
                                {['B', 'I', 'N', 'G', 'O'].map(col => (
                                    <div key={col} className="bingo-column">
                                        <div className="col-header" style={{ color: getBallColor(['B', 'I', 'N', 'G', 'O'].indexOf(col) * 15 + 1) }}>{col}</div>
                                        {winner.officialCard?.numbers[col].map((num, i) => {
                                            const isMarked = gameState.calledNumbers.includes(num) || num === 'FREE';
                                            return (
                                                <div key={i} className={`mini-num ${isMarked ? 'marked' : ''}`}>
                                                    {num === 'FREE' ? '✨' : num}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="next-game-ticker">
                            <div className="ticker-dot"></div>
                            Auto-starting next round shortly...
                        </div>

                        <button className="continue-btn prestige-action" onClick={() => onGameOver()}>
                            CONTINUE
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameBoard;
