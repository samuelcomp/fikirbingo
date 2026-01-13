import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { ChevronLeft, RotateCcw, Hash, Users, Trophy } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\s/g, '');
const socket = io(API_URL, {
    extraHeaders: {
        "ngrok-skip-browser-warning": "true"
    }
});

const CartelaSelection = ({ user, stake = 10, onGameStart, t }) => {
    const [selectedIds, setSelectedIds] = useState([]);
    const [takenCartelas, setTakenCartelas] = useState({}); // { userId: [ids] }
    const [countdown, setCountdown] = useState(60);
    const [roomStatus, setRoomStatus] = useState('WAITING');
    const [playersCount, setPlayersCount] = useState(0);
    const [prizePool, setPrizePool] = useState(0);
    const roomId = `room-${stake}`;

    useEffect(() => {
        const userId = user?.id || 'guest-' + Math.random().toString(36).substring(7);
        socket.emit('join_room', { roomId, userId });

        socket.on('room_state', (data) => {
            if (data.roomId === roomId) {
                setCountdown(data.countdown);
                setRoomStatus(data.status);
                setTakenCartelas(data.takenCartelas || {});
                setPlayersCount(data.playersCount || 0);
                setPrizePool(data.prizePool || 0);

                // Sync our selection with server
                const myTaken = data.takenCartelas?.[userId] || [];
                setSelectedIds(myTaken);
            }
        });

        socket.on('room_tick', (data) => {
            if (data.roomId === roomId) {
                setCountdown(data.countdown);
                setRoomStatus(data.status);
                setPlayersCount(data.playersCount || 0);
                setPrizePool(data.prizePool || 0);
            }
        });

        socket.on('game_started', () => {
            // This event is handled when the component is active
        });

        return () => {
            socket.off('room_state');
            socket.off('room_tick');
            socket.off('game_started');
        };
    }, [roomId, stake, user?.id]);

    useEffect(() => {
        const handleStart = () => {
            const currentSelected = selectedIds.map(id => generateDeterministicCard(id));
            if (currentSelected.length > 0) {
                onGameStart(currentSelected);
            } else {
                onGameStart([]);
            }
        };
        socket.on('game_started', handleStart);
        return () => socket.off('game_started', handleStart);
    }, [selectedIds, onGameStart]);

    const generateDeterministicCard = (id) => {
        const getNumbers = (cardId, offset, min, max, count) => {
            const pool = [];
            for (let i = min; i <= max; i++) pool.push(i);
            const result = [];
            for (let i = 0; i < count; i++) {
                const index = (cardId * (i + offset + 7) + 13) % pool.length;
                result.push(pool.splice(index, 1)[0]);
            }
            return result.sort((a, b) => a - b);
        };

        const card = {
            id,
            numbers: {
                B: getNumbers(id, 1, 1, 15, 5),
                I: getNumbers(id, 2, 16, 30, 5),
                N: getNumbers(id, 3, 31, 45, 5),
                G: getNumbers(id, 4, 46, 60, 5),
                O: getNumbers(id, 5, 61, 75, 5)
            }
        };
        card.numbers.N[2] = 'FREE';
        return card;
    };

    const toggleCartela = (id) => {
        if (roomStatus !== 'WAITING') return;

        const allTaken = Object.entries(takenCartelas)
            .filter(([uid]) => uid !== user?.id)
            .flatMap(([_, ids]) => ids);

        if (allTaken.includes(id)) return; // Taken by others

        if (selectedIds.includes(id)) {
            socket.emit('deselect_cartela', { roomId, userId: user?.id, cartelaId: id });
        } else if (selectedIds.length < 2) {
            socket.emit('select_cartela', { roomId, userId: user?.id, cartelaId: id });
        }
    };

    const isTakenByOther = (id) => {
        return Object.entries(takenCartelas)
            .some(([uid, ids]) => uid !== user?.id && ids.includes(id));
    };

    const renderPreview = (id) => {
        const card = generateDeterministicCard(id);
        const columns = ['B', 'I', 'N', 'G', 'O'];
        const colors = { B: '#2563eb', I: '#7c3aed', N: '#db2777', G: '#059669', O: '#ea580c' };

        return (
            <div key={id} className="preview-card glass-panel animate-reveal">
                <div className="preview-header">Cartela No : {id}</div>
                <div className="bingo-mini-grid">
                    {columns.map(col => (
                        <div key={col} className="mini-col">
                            <div className="mini-letter" style={{ backgroundColor: colors[col] }}>{col}</div>
                            {card.numbers[col].map((num, i) => (
                                <div key={i} className={`mini-num ${num === 'FREE' ? 'free' : ''}`}>
                                    {num === 'FREE' ? '✨' : num}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="premium-bg-container no-scroll-app">
            <header className="lobby-header-v2">
                <div className="lobby-top-bar">
                    <button className="back-btn-v2" onClick={() => window.history.back()}>
                        <ChevronLeft size={24} />
                    </button>
                    <div className="lobby-branding">
                        <h1 className="lobby-title-v2">BINGO LOBBY</h1>
                        <span className="lobby-subtitle-v2">STAKE: {stake} BIRR</span>
                    </div>
                    <button className="refresh-btn-v2" onClick={() => window.location.reload()}>
                        <RotateCcw size={20} />
                    </button>
                </div>

                <div className="lobby-stats-v2">
                    <div className="l-stat-box prize-glow">
                        <Trophy size={18} className="l-stat-icon" />
                        <div className="l-stat-info">
                            <span className="l-stat-label">PRIZE POOL</span>
                            <span className="l-stat-value">{prizePool} <small>Birr</small></span>
                        </div>
                    </div>
                    <div className="l-stat-box players-glow">
                        <Users size={18} className="l-stat-icon" />
                        <div className="l-stat-info">
                            <span className="l-stat-label">PLAYERS</span>
                            <span className="l-stat-value">{playersCount}</span>
                        </div>
                    </div>
                    <div className="l-stat-box timer-glow">
                        <div className="l-timer-circle">
                            <span className="l-timer-val">{countdown}</span>
                            <span className="l-timer-unit">SEC</span>
                        </div>
                        <div className="l-stat-info">
                            <span className="l-stat-label">STARTS IN</span>
                            <span className="l-stat-status">{roomStatus}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="lobby-content-area">
                <div className="cartela-grid-professional scroll-v">
                    {Array.from({ length: 400 }, (_, i) => i + 1).map(id => {
                        const isMine = selectedIds.includes(id);
                        const isOther = isTakenByOther(id);
                        return (
                            <div
                                key={id}
                                className={`cartela-chip ${isMine ? 'is-mine' : ''} ${isOther ? 'is-taken' : ''}`}
                                onClick={() => toggleCartela(id)}
                            >
                                <span className="chip-id">{id}</span>
                                {isMine && <div className="chip-indicator"></div>}
                            </div>
                        );
                    })}
                </div>
            </div>

            <footer className="lobby-footer-v2">
                <div className="selection-tray">
                    {selectedIds.length === 0 ? (
                        <div className="tray-empty">Pick up to 2 cards to play</div>
                    ) : (
                        <div className="tray-cards">
                            {selectedIds.map(id => (
                                <div key={id} className="tray-card">Card #{id}</div>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    className={`lobby-play-btn ${selectedIds.length > 0 ? 'btn-active' : 'btn-dim'}`}
                    disabled={selectedIds.length === 0 || roomStatus !== 'WAITING'}
                >
                    {roomStatus === 'PLAYING' ? (
                        'JOINING NEXT ROUND...'
                    ) : (
                        <>PLAY WITH {selectedIds.length * stake} BIRR</>
                    )}
                </button>
            </footer>
        </div>
    );
};

export default CartelaSelection;
