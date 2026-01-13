import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { ChevronLeft, RotateCcw, Hash } from 'lucide-react';

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
    const roomId = `room-${stake}`;

    useEffect(() => {
        const userId = user?.id || 'guest-' + Math.random().toString(36).substring(7);
        socket.emit('join_room', { roomId, userId });

        socket.on('room_state', (data) => {
            if (data.roomId === roomId) {
                setCountdown(data.countdown);
                setRoomStatus(data.status);
                setTakenCartelas(data.takenCartelas || {});

                // Sync our selection with server
                const myTaken = data.takenCartelas?.[userId] || [];
                setSelectedIds(myTaken);
            }
        });

        socket.on('room_tick', (data) => {
            setCountdown(data.countdown);
            setRoomStatus(data.status);
        });

        socket.on('game_started', () => {
            const currentSelected = selectedIds.map(id => generateDeterministicCard(id));
            if (currentSelected.length > 0) {
                onGameStart(currentSelected);
            } else {
                onGameStart([]);
            }
        });

        return () => {
            socket.off('room_state');
            socket.off('room_tick');
            socket.off('game_started');
        };
    }, [roomId, selectedIds, onGameStart, user?.id]);

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
        <div className="premium-bg-container">
            <header className="lobby-top-nav">
                <button className="nav-btn" onClick={() => window.history.back()}>
                    <ChevronLeft size={20} /> Back
                </button>
                <div className="lobby-title">Bingo Lobby</div>
                <button className="nav-btn" onClick={() => window.location.reload()}>
                    <RotateCcw size={18} /> Refresh
                </button>
            </header>

            <div className="status-pills-row">
                <div className="status-pill">
                    <span className="pill-label">Main Wallet</span>
                    <span className="pill-value">{user?.mainBalance || 0}</span>
                </div>
                <div className="status-pill highlight">
                    <span className="pill-label">Play Wallet</span>
                    <span className="pill-value">{user?.playBalance || 0}</span>
                </div>
                <div className="status-pill">
                    <span className="pill-label">Stake</span>
                    <span className="pill-value">{stake}</span>
                </div>
                <div className="status-pill timer">
                    <span className="pill-value">{countdown}<small>s</small></span>
                </div>
            </div>

            <div className="cartela-scroll-area">
                <div className="cartela-grid-v2">
                    {Array.from({ length: 400 }, (_, i) => i + 1).map(id => {
                        const isMine = selectedIds.includes(id);
                        const isOther = isTakenByOther(id);
                        return (
                            <div
                                key={id}
                                className={`grid-item ${isMine ? 'mine' : ''} ${isOther ? 'other' : ''}`}
                                onClick={() => toggleCartela(id)}
                            >
                                {id}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="selection-preview-container">
                {selectedIds.length === 0 ? (
                    <div className="empty-preview">
                        <Hash size={32} />
                        <p>Select up to 2 cards to preview</p>
                    </div>
                ) : (
                    <div className="previews-row">
                        {selectedIds.map(id => renderPreview(id))}
                    </div>
                )}
            </div>

            <footer className="lobby-v2-footer">
                <button
                    className={`confirm-play-btn ${selectedIds.length > 0 ? 'active' : ''}`}
                    disabled={selectedIds.length === 0 || roomStatus !== 'WAITING'}
                >
                    {roomStatus === 'PLAYING' ? 'GAME IN PROGRESS' : `PLAY WITH ${selectedIds.length * stake} BIRR`}
                </button>
            </footer>
        </div>
    );
};

export default CartelaSelection;
