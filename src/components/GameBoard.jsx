import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Trophy, LogOut, RotateCcw, Volume2, VolumeX, Star, Info } from 'lucide-react';

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
        const userId = user?.id || 'guest-' + Math.random().toString(36).substring(7);
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
            setGameState(prev => ({
                ...prev,
                gameId: data.gameId,
                status: data.status,
                playersCount: data.playersCount,
                prizePool: data.prizePool
            }));
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
    }, [roomId]);

    // Automated Win Claiming
    useEffect(() => {
        if (isAutomatic && !isWatcher && gameState.status === 'PLAYING') {
            selectedCartelas.forEach(card => {
                if (checkWinLocal(card, gameState.calledNumbers)) {
                    socket.emit('claim_win', { roomId, userId: user?.id, cartelaId: card.id });
                }
            });
        }
    }, [gameState.calledNumbers, isAutomatic, isWatcher, selectedCartelas, gameState.status]);

    const checkWinLocal = (card, called) => {
        const calledSet = new Set(called);
        calledSet.add('FREE');

        const grid = [card.numbers.B, card.numbers.I, card.numbers.N, card.numbers.G, card.numbers.O];

        // Columns
        for (let c = 0; c < 5; c++) {
            if (grid[c].every(num => calledSet.has(num))) return true;
        }
        // Rows
        for (let r = 0; r < 5; r++) {
            let win = true;
            for (let c = 0; c < 5; c++) {
                if (!calledSet.has(grid[c][r])) { win = false; break; }
            }
            if (win) return true;
        }
        // Diagonals
        let d1 = true, d2 = true;
        for (let i = 0; i < 5; i++) {
            if (!calledSet.has(grid[i][i])) d1 = false;
            if (!calledSet.has(grid[i][4 - i])) d2 = false;
        }
        return d1 || d2;
    };

    const claimBingo = () => {
        if (!isWatcher) {
            selectedCartelas.forEach(c => {
                socket.emit('claim_win', { roomId, userId: user?.id, cartelaId: c.id });
            });
        }
    };

    const renderCard = (card) => (
        <div key={card.id} className="game-card-premium animate-reveal">
            <div className="bingo-grid-5x5">
                {['B', 'I', 'N', 'G', 'O'].map(col => (
                    <div key={col} className="bingo-column">
                        <div className="col-header">{col}</div>
                        {card.numbers[col].map((num, i) => {
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
            <div className="card-footer-no">Cartela No: {card.id}</div>
        </div>
    );

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

    return (
        <div className="premium-bg-container game-view">
            {/* 5-Pill Header */}
            <header className="game-status-header">
                <div className="status-pill-v3">
                    <span className="pill-label">Game ID</span>
                    <span className="pill-value mono">{gameState.gameId}</span>
                </div>
                <div className="status-pill-v3">
                    <span className="pill-label">Players</span>
                    <span className="pill-value">{gameState.playersCount}</span>
                </div>
                <div className="status-pill-v3">
                    <span className="pill-label">Bet</span>
                    <span className="pill-value">{roomId.split('-')[1]}</span>
                </div>
                <div className="status-pill-v3 highlight">
                    <span className="pill-label">Derash</span>
                    <span className="pill-value">{gameState.prizePool}</span>
                </div>
                <div className="status-pill-v3">
                    <span className="pill-label">Called</span>
                    <span className="pill-value">{gameState.calledNumbers.length}</span>
                </div>
            </header>

            <div className="game-main-layout">
                {/* 1-75 Sidebar */}
                <aside className="numbers-sidebar">
                    <div className="sidebar-grid">
                        {['B', 'I', 'N', 'G', 'O'].map((letter, colIndex) => (
                            <div key={letter} className="sidebar-col">
                                <div className="sidebar-letter">{letter}</div>
                                {Array.from({ length: 15 }, (_, i) => i + 1 + colIndex * 15).map(num => (
                                    <div
                                        key={num}
                                        className={`sidebar-num ${gameState.calledNumbers.includes(num) ? 'called' : ''} ${currentBall === num ? 'active' : ''}`}
                                        style={{ '--ball-color': getBallColor(num) }}
                                    >
                                        {num}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="game-board-main">
                    <div className="game-top-row">
                        <div className="recent-balls">
                            {gameState.calledNumbers.slice(-3).reverse().map((num, i) => (
                                <div key={i} className="recent-ball" style={{ backgroundColor: getBallColor(num) }}>
                                    {getBallLetter(num)}-{num}
                                </div>
                            ))}
                        </div>
                        <button className="sound-toggle" onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}>
                            {isVoiceEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                        </button>
                    </div>

                    <div className="current-ball-focus">
                        {currentBall ? (
                            <div className="big-ball shadow-pulse" style={{ borderColor: getBallColor(currentBall) }}>
                                <span className="big-letter" style={{ color: getBallColor(currentBall) }}>{getBallLetter(currentBall)}</span>
                                <span className="big-number">{currentBall}</span>
                            </div>
                        ) : (
                            <div className="big-ball waiting">
                                <span className="waiting-text">READY</span>
                            </div>
                        )}
                    </div>

                    <div className="mode-toggle-row">
                        <span className="toggle-label">Automatic</span>
                        <label className="switch">
                            <input type="checkbox" checked={isAutomatic} onChange={() => setIsAutomatic(!isAutomatic)} />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    <div className="cards-area">
                        {isWatcher ? (
                            <div className="watcher-mode animate-reveal">
                                <div className="watcher-icon"><Info size={48} /></div>
                                <h2>Watching Only</h2>
                                <p className="amharic-text">የዚህ ዙር ጨዋታ ተጀምሯል። አዲስ ዙር እስኪጀምር እባክዎ ይጠብቁ።</p>
                            </div>
                        ) : (
                            <div className="active-cards">
                                {selectedCartelas.map(renderCard)}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Bottom Actions */}
            <footer className="game-footer-actions">
                <button className="foot-btn leave" onClick={() => onGameOver()}>
                    <LogOut size={20} /> Leave
                </button>
                <button className="foot-btn refresh" onClick={() => window.location.reload()}>
                    <RotateCcw size={18} /> Refresh
                </button>
                <button
                    className={`foot-btn automatic-action ${isWatcher ? 'disabled' : ''}`}
                    onClick={claimBingo}
                >
                    {isAutomatic ? 'Automatic' : 'CLAIM BINGO!'}
                </button>
            </footer>

            {/* Winner Modal */}
            {winner && (
                <div className="bingo-modal-overlay">
                    <div className="bingo-modal-content upscale-reveal">
                        <div className="crown-icon-wrapper">
                            <Trophy size={80} className="floating-crown" />
                        </div>
                        <h1 className="bingo-title">BINGO!</h1>
                        <div className="winner-announcement">
                            <span className="party-emoji">🎉</span>
                            <span className="winner-name">{winner.username} WON!</span>
                            <span className="party-emoji">🎉</span>
                        </div>

                        <div className="winning-card-preview">
                            <div className="preview-label">🏆 Winning Cartela : {winner.cartelaId}</div>
                            <div className="bingo-grid-5x5 mini">
                                {['B', 'I', 'N', 'G', 'O'].map(col => (
                                    <div key={col} className="bingo-column">
                                        <div className="col-header">{col}</div>
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
                            Auto-starting next game in 10s
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameBoard;
