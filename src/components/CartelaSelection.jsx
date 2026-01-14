import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { ChevronLeft, RotateCcw, MonitorPlay, Check, Loader2 } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\s/g, '');

const CartelaSelection = ({ user, stake = 10, onGameStart, t }) => {
    const [socket, setSocket] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [takenCartelas, setTakenCartelas] = useState({});
    const [playersCount, setPlayersCount] = useState(0);
    const [prizePool, setPrizePool] = useState(0);
    const [countdown, setCountdown] = useState(60);
    const [roomStatus, setRoomStatus] = useState('WAITING');
    const roomId = `room-${stake}`;

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token || !user?.telegramId) return;

        const s = io(API_URL, {
            auth: { token },
            extraHeaders: { "ngrok-skip-browser-warning": "true" }
        });
        setSocket(s);

        const telegramId = user.telegramId;
        s.emit('join_room', { roomId });

        s.on('room_state', (data) => {
            if (data.roomId === roomId) {
                setCountdown(data.countdown);
                setRoomStatus(data.status);
                setTakenCartelas(data.takenCartelas || {});
                setPlayersCount(data.playersCount || 0);
                setPrizePool(data.prizePool || 0);

                // Sync our selection with server using telegramId
                const myTaken = data.takenCartelas?.[telegramId] || [];
                setSelectedIds(myTaken);
            }
        });

        s.on('room_tick', (data) => {
            if (data.roomId === roomId) {
                setCountdown(data.countdown);
                setRoomStatus(data.status);
                setPlayersCount(data.playersCount || 0);
                setPrizePool(data.prizePool || 0);

                if (data.status === 'PLAYING') {
                    setRoomStatus('PLAYING');
                }
            }
        });

        return () => {
            s.disconnect();
        };
    }, [roomId, user?.telegramId]);

    // Auto-transition to Game/Spectator when status is PLAYING
    useEffect(() => {
        if (roomStatus === 'PLAYING') {
            console.log('[Lobby] Game started! Auto-transitioning...');
            const cards = selectedIds.map(id => generateDeterministicCard(id));
            onGameStart(cards);
        }
    }, [roomStatus, selectedIds, onGameStart]);

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
        if (roomStatus !== 'WAITING' || !socket) return;

        const allTaken = Object.entries(takenCartelas)
            .filter(([tid]) => tid !== user?.telegramId)
            .flatMap(([_, ids]) => ids);

        if (allTaken.includes(id)) return;

        if (selectedIds.includes(id)) {
            socket.emit('deselect_cartela', { roomId, cartelaId: id });
        } else if (selectedIds.length < 2) {
            socket.emit('select_cartela', { roomId, cartelaId: id });
        }
    };

    const isTakenByOther = (id) => {
        return Object.entries(takenCartelas)
            .some(([tid, ids]) => tid !== user?.telegramId && ids.includes(id));
    };

    const getBallColor = (num) => {
        if (num <= 15) return '#2563eb'; // B
        if (num <= 30) return '#7c3aed'; // I
        if (num <= 45) return '#db2777'; // N
        if (num <= 60) return '#059669'; // G
        return '#ea580c'; // O
    };

    const renderPreview = (id) => {
        const card = generateDeterministicCard(id);
        const columns = ['B', 'I', 'N', 'G', 'O'];

        return (
            <div key={id} className="preview-card-v3 upscale-reveal">
                <div className="preview-header-v3">
                    <span>Cartela No : {id}</span>
                </div>
                <div className="bingo-grid-mini-v3">
                    {columns.map((col, idx) => (
                        <div key={col} className="bingo-col-mini-v3">
                            <div className="col-header-mini-v3" style={{ backgroundColor: getBallColor(idx * 15 + 1) }}>{col}</div>
                            {card.numbers[col].map((num, i) => (
                                <div key={i} className={`mini-cell-v3 ${num === 'FREE' ? 'free' : ''}`}>
                                    {num === 'FREE' ? <span className="free-star">✨</span> : num}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const selectionProgress = (selectedIds.length / 2) * 100;

    return (
        <div className="lobby-container-v3">
            <header className="lobby-header-v3">
                <button className="header-action-btn back" onClick={() => window.history.back()}>
                    <ChevronLeft size={22} />
                    <span>Back</span>
                </button>
                <button className="header-action-btn refresh" onClick={() => window.location.reload()}>
                    <RotateCcw size={18} />
                    <span>Refresh</span>
                </button>
            </header>

            <div className="lobby-status-grid">
                <div className="status-box">
                    <span className="box-label">Main Wallet</span>
                    <span className="box-value">{user?.mainBalance || 0}</span>
                </div>
                <div className="status-box">
                    <span className="box-label">Play Wallet</span>
                    <span className="box-value">{user?.playBalance || 0}</span>
                </div>
                <div className="status-box">
                    <span className="box-label">Stake</span>
                    <span className="box-value">{stake}</span>
                </div>
                <div className="status-box highlight">
                    <span className="box-value">{countdown} s</span>
                </div>
            </div>

            <div className="selection-progress-bar">
                <div className="progress-info">
                    <span>Select 2 Cartelas to Play</span>
                    <span className={selectedIds.length === 2 ? 'ready' : ''}>
                        {selectedIds.length}/2 {selectedIds.length === 2 && 'Ready! ✅'}
                    </span>
                </div>
                <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${selectionProgress}%` }}></div>
                </div>
            </div>

            <main className="lobby-main-grid-area">
                <div className="cartela-chips-scroll">
                    {Array.from({ length: 400 }, (_, i) => i + 1).map(id => {
                        const isMine = selectedIds.includes(id);
                        const isOther = isTakenByOther(id);
                        return (
                            <div
                                key={id}
                                className={`cartela-chip-v3 ${isMine ? 'mine' : ''} ${isOther ? 'other' : ''}`}
                                onClick={() => toggleCartela(id)}
                            >
                                {id}
                                {isMine && <Check size={10} className="chip-check" />}
                                {isOther && <div className="chip-indicator" />}
                            </div>
                        );
                    })}
                </div>
            </main>

            <footer className="lobby-footer-v3">
                <div className="previews-row">
                    {selectedIds.length > 0 ? (
                        selectedIds.map(renderPreview)
                    ) : (
                        <div className="previews-placeholder-v3">
                            <MonitorPlay size={40} strokeWidth={1} />
                            <p>Select your cartelas to see preview</p>
                        </div>
                    )}
                </div>

                {roomStatus === 'PLAYING' ? (
                    <button className="watch-live-btn-v3" onClick={() => onGameStart([])}>
                        <Loader2 className="spinning" size={18} />
                        WATCH LIVE GAME 🎥
                    </button>
                ) : (
                    <div className="lobby-action-info">
                        {selectedIds.length < 2 ? (
                            <p className="hint-text">Select {2 - selectedIds.length} more to play</p>
                        ) : (
                            <p className="success-text">Waiting for game to start... ⏳</p>
                        )}
                    </div>
                )}
            </footer>
        </div>
    );
};

export default CartelaSelection;
