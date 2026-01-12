import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\s/g, '');
const socket = io(API_URL, {
    extraHeaders: {
        "ngrok-skip-browser-warning": "true"
    }
});

const CartelaSelection = ({ user, stake = 10, onGameStart, userBalance, t }) => {
    const [selectedCartelas, setSelectedCartelas] = useState([]);
    const [countdown, setCountdown] = useState(60);
    const [roomStatus, setRoomStatus] = useState('WAITING');
    const roomId = `room-${stake}`;

    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        // Use real user ID for better state tracking
        const userId = user?.id || 'guest-' + Math.random().toString(36).substring(7);
        socket.emit('join_room', { roomId, userId });

        // Listen for immediate state after joining
        socket.on('room_state', (data) => {
            if (data.roomId === roomId) {
                setCountdown(data.countdown);
                setRoomStatus(data.status);
            }
        });

        socket.on('room_tick', (data) => {
            setCountdown(data.countdown);
            setRoomStatus(data.status);
        });

        socket.on('game_started', (data) => {
            if (selectedCartelas.length > 0) {
                onGameStart(selectedCartelas);
            } else {
                alert('Round started! You are in Watching Only mode.');
                onGameStart([]);
            }
        });

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('room_state');
            socket.off('room_tick');
            socket.off('game_started');
        };
    }, [roomId, selectedCartelas, onGameStart, user?.id]);

    const getRandomSet = (min, max, count) => {
        const set = new Set();
        while (set.size < count) {
            set.add(Math.floor(Math.random() * (max - min) + min));
        }
        return Array.from(set).sort((a, b) => a - b);
    };

    const generateCard = (id) => {
        const card = {
            id,
            numbers: {
                B: getRandomSet(1, 15, 5),
                I: getRandomSet(16, 30, 5),
                N: getRandomSet(31, 45, 5),
                G: getRandomSet(46, 60, 5),
                O: getRandomSet(61, 75, 5)
            }
        };
        card.numbers.N[2] = 'FREE';
        return card;
    };

    const toggleCartela = (id) => {
        const isSelected = selectedCartelas.find(c => c.id === id);
        if (isSelected) {
            setSelectedCartelas(selectedCartelas.filter(c => c.id !== id));
        } else if (selectedCartelas.length < 2) {
            setSelectedCartelas([...selectedCartelas, generateCard(id)]);
        }
    };

    return (
        <div className="cartela-lobby">
            <header className="lobby-header">
                <div className="countdown-timer">
                    <span className="label">Next Round</span>
                    <span className="time">{countdown}s</span>
                    <span className={`status-badge ${isConnected ? 'online' : 'offline'}`}>
                        {isConnected ? '✓ System Live' : '⚠ Syncing...'}
                    </span>
                </div>
                <div className="wallet-mini premium-card">
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block' }}>WALLET</span>
                    <span className="balance">{userBalance} <small style={{ fontSize: '10px' }}>Birr</small></span>
                </div>
            </header>

            <div className="selection-info">
                <h2>Choose Your Cards</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p>{t.chooseUpTo} ({selectedCartelas.length}/2)</p>
                    <div style={{ height: '4px', flex: 1, background: 'var(--glass-bg)', borderRadius: '2px' }}>
                        <div style={{ height: '100%', width: `${(selectedCartelas.length / 2) * 100}%`, background: 'var(--secondary)', borderRadius: '2px', transition: 'width 0.3s' }}></div>
                    </div>
                </div>
            </div>

            <div className="cartela-grid">
                {Array.from({ length: 40 }, (_, i) => i + 1).map(id => {
                    const isSelected = selectedCartelas.some(c => c.id === id);
                    return (
                        <div
                            key={id}
                            className={`cartela-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => toggleCartela(id)}
                        >
                            {id}
                        </div>
                    );
                })}
            </div>

            <footer className="lobby-footer">
                <button
                    className="play-btn"
                    disabled={selectedCartelas.length === 0 || roomStatus !== 'WAITING'}
                    style={{
                        opacity: (selectedCartelas.length === 0 || roomStatus !== 'WAITING') ? 0.6 : 1,
                        background: roomStatus === 'PLAYING' ? 'var(--glass-bg)' : 'linear-gradient(135deg, var(--secondary), hsl(174, 100%, 31%))'
                    }}
                >
                    {roomStatus === 'PLAYING' ? 'Game in Progress...' : `Stake ${selectedCartelas.length * stake} Birr`}
                </button>
            </footer>
        </div>
    );
};

export default CartelaSelection;
