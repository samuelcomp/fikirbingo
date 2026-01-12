import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Trophy, Users, Star } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\s/g, '');
const socket = io(API_URL, {
    extraHeaders: {
        "ngrok-skip-browser-warning": "true"
    }
});

const GameBoard = ({ user, roomId = 'room-10', selectedCartelas, onGameOver, t }) => {
    const [calledNumbers, setCalledNumbers] = useState([]);
    const [currentBall, setCurrentBall] = useState(null);
    const [winner, setWinner] = useState(null);
    const [voiceSettings, setVoiceSettings] = useState({ isVoiceEnabled: true, voicePack: 'am-ET' });

    useEffect(() => {
        fetchSettings();
        const userId = user?.id || 'guest-' + Math.random().toString(36).substring(7);
        socket.emit('join_room', { roomId, userId });

        socket.on('room_state', (data) => {
            if (data.roomId === roomId) {
                setCalledNumbers(data.calledNumbers || []);
                if (data.calledNumbers.length > 0) {
                    setCurrentBall(data.calledNumbers[data.calledNumbers.length - 1]);
                }
            }
        });

        socket.on('ball_drawn', (data) => {
            setCurrentBall(data.ball);
            setCalledNumbers(numbers => [...numbers, data.ball]);

            // Re-fetch briefly to ensure we have latest admin voice settings
            if (calledNumbers.length % 10 === 0) fetchSettings();
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
            socket.off('player_won');
            socket.off('game_reset');
        };
    }, [roomId, user?.id]);

    // Separate effect for actual voice announcement to avoid race conditions
    useEffect(() => {
        if (currentBall && voiceSettings.isVoiceEnabled) {
            announceNumber(currentBall);
        }
    }, [currentBall, voiceSettings]);

    const fetchSettings = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/branding`);
            setVoiceSettings({
                isVoiceEnabled: res.data.isVoiceEnabled,
                voicePack: res.data.voicePack || 'am-ET'
            });
        } catch (e) { console.error('Failed to load voice settings'); }
    };

    const announceNumber = (num) => {
        if ('speechSynthesis' in window) {
            // Cancel any previous speech to avoid backlog
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(num.toString());
            utterance.lang = voiceSettings.voicePack;
            utterance.rate = 0.9; // Slightly slower for clarity
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    const checkWin = (cartelaId) => {
        const cartela = selectedCartelas.find(c => c.id === cartelaId);
        socket.emit('claim_win', {
            roomId,
            userId: user?.id || 'dev-player',
            cartelaId,
            cartelaNumbers: cartela?.numbers || {}
        });
    };

    const roomStake = roomId.split('-')[1] || 10;
    const cartelas = selectedCartelas || [];

    const claimBingo = () => {
        if (cartelas.length > 0) {
            cartelas.forEach(c => checkWin(c.id));
        }
    };


    return (
        <div className="game-board-container">
            <header className="game-header">
                <div className="current-ball-display">
                    <div className={`ball-circle ${calledNumbers.length > 0 ? 'pulse' : ''}`}>
                        {calledNumbers[calledNumbers.length - 1] || '?'}
                    </div>
                    <span className="ball-label">LATEST BALL</span>
                </div>

                <div className="game-stats premium-card" style={{ padding: '12px 24px', display: 'flex', gap: '20px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block' }}>BALLS</span>
                        <span style={{ fontSize: '18px', fontWeight: 900 }}>{calledNumbers.length}</span>
                    </div>
                    <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block' }}>ROOM</span>
                        <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--accent)' }}>{roomStake}B</span>
                    </div>
                </div>
            </header>

            <div className="main-grid-75 premium-card">
                {Array.from({ length: 75 }, (_, i) => i + 1).map(num => (
                    <div
                        key={num}
                        className={`grid-number ${calledNumbers.includes(num) ? 'called' : ''} ${calledNumbers[calledNumbers.length - 1] === num ? 'active' : ''}`}
                    >
                        {num}
                    </div>
                ))}
            </div>

            <div className="player-cards-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '120px' }}>
                {cartelas.map((cartela, idx) => (
                    <div key={idx} className="premium-card" style={{ padding: '16px', background: 'linear-gradient(180deg, var(--bg-card), var(--bg-dark))' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                            <span style={{ fontWeight: 900, color: 'white', fontSize: '14px', letterSpacing: '1px' }}>CARD #{cartela.id}</span>
                            <div className="status-badge online" style={{ fontSize: '8px' }}>LIVE SYNC</div>
                        </div>
                        <div className="bingo-grid-5x5">
                            {['B', 'I', 'N', 'G', 'O'].map(col => (
                                <div key={col} className="bingo-column">
                                    <div className="col-header">{col}</div>
                                    {cartela.numbers[col].map((num, i) => (
                                        <div
                                            key={i}
                                            className={`mini-num ${calledNumbers.includes(num) || num === 'FREE' ? 'marked' : ''}`}
                                        >
                                            {num === 'FREE' ? <Star size={16} fill="currentColor" /> : num}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <footer className="lobby-footer" style={{ display: 'flex', gap: '12px' }}>
                <button
                    className="play-btn"
                    onClick={claimBingo}
                    style={{ flex: 2, background: 'linear-gradient(135deg, var(--primary), hsl(355, 78%, 46%))', boxShadow: '0 8px 25px var(--primary-glow)' }}
                >
                    CLAIM BINGO!
                </button>
                <button
                    className="rules-btn"
                    onClick={() => onGameOver()}
                    style={{ flex: 1, justifyContent: 'center' }}
                >
                    LEAVE
                </button>
            </footer>

            {winner && (
                <div className="win-overlay" onClick={() => onGameOver()}>
                    <div className="win-content" onClick={e => e.stopPropagation()} style={{ background: 'linear-gradient(135deg, var(--bg-card), #1a1b26)', border: '3px solid var(--accent)' }}>
                        <div className="congrats-badge" style={{ background: 'var(--accent)', color: 'black', padding: '4px 20px', borderRadius: '20px', fontWeight: 900, fontSize: '12px', marginBottom: '10px', display: 'inline-block' }}>CONGRATULATIONS!</div>
                        <div style={{ margin: '20px 0' }}>
                            <Trophy size={100} color="var(--accent)" style={{ filter: 'drop-shadow(0 0 30px var(--accent-glow))' }} />
                        </div>
                        <h2 style={{ fontSize: '48px', margin: '10px 0' }}>{winner.username === (user?.username || 'You') ? 'YOU WON!' : 'BINGO!'}</h2>
                        <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '20px' }}>
                            Winner: <span style={{ color: 'white', fontWeight: 900 }}>{winner.username}</span>
                        </p>
                        <div className="prize" style={{ fontSize: '56px', marginBottom: '40px' }}>
                            {winner.prize} <small style={{ fontSize: '20px' }}>Birr</small>
                        </div>
                        <button className="play-btn" onClick={() => onGameOver()} style={{ maxWidth: '280px', margin: '0 auto' }}>
                            CONTINUE
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameBoard;
