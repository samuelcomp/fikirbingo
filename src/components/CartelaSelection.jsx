import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { ChevronLeft, RotateCcw } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\s/g, '');
// Socket is now initialized inside the component to include the auth token

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
        if (!token || !user?.id) return;

        const s = io(API_URL, {
            auth: { token },
            extraHeaders: { "ngrok-skip-browser-warning": "true" }
        });
        setSocket(s);

        const userId = user.id;
        s.emit('join_room', { roomId });

        s.on('room_state', (data) => {
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

        s.on('room_tick', (data) => {
            if (data.roomId === roomId) {
                setCountdown(data.countdown);
                setRoomStatus(data.status);
                setPlayersCount(data.playersCount || 0);
                setPrizePool(data.prizePool || 0);
            }
        });

        s.on('game_started', () => {
            // Can't easily use selectedIds here due to closure, 
            // but the footer button click usually handles transition
        });

        return () => {
            s.disconnect();
        };
    }, [roomId, user?.id]);

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
            .filter(([uid]) => uid !== user?.id)
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
            .some(([uid, ids]) => uid !== user?.id && ids.includes(id));
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
            <div key={id} className="preview-card-v2">
                <div className="preview-label-v2">Cartela No : {id}</div>
                <div className="bingo-grid-mini">
                    {columns.map((col, idx) => (
                        <div key={col} className="bingo-col-mini">
                            <div className="col-header-mini" style={{ backgroundColor: getBallColor(idx * 15 + 1) }}>{col}</div>
                            {card.numbers[col].map((num, i) => (
                                <div key={i} className="mini-cell">
                                    {num === 'FREE' ? <span className="free-star">✨</span> : num}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="lobby-container-v2">
            <header className="lobby-header-nav">
                <button className="nav-btn-v2" onClick={() => window.history.back()}>
                    <ChevronLeft size={20} />
                    <span>Back</span>
                </button>
                <button className="nav-btn-v2" onClick={() => window.location.reload()}>
                    <RotateCcw size={18} />
                    <span>Refresh</span>
                </button>
            </header>

            <div className="status-row-v2">
                <div className="stat-pill-v2">
                    <span className="pill-title">Main Wallet</span>
                    <span className="pill-val">{user?.mainBalance || 0}</span>
                </div>
                <div className="stat-pill-v2">
                    <span className="pill-title">Play Wallet</span>
                    <span className="pill-val">{user?.playBalance || 0}</span>
                </div>
                <div className="stat-pill-v2">
                    <span className="pill-title">Stake</span>
                    <span className="pill-val">{stake}</span>
                </div>
                <div className="stat-pill-v2 timer-pill">
                    <span className="pill-val">{countdown} <small>s</small></span>
                </div>
                <div className={`stat-pill-v2 selection-pill ${selectedIds.length === 2 ? 'full' : ''}`}>
                    <span className="pill-title">Cards</span>
                    <span className="pill-val">{selectedIds.length}/2</span>
                </div>
            </div>

            <main className="cartela-selection-main">
                <div className="cartela-grid-v2-scroll">
                    {Array.from({ length: 400 }, (_, i) => i + 1).map(id => {
                        const isMine = selectedIds.includes(id);
                        const isOther = isTakenByOther(id);
                        return (
                            <div
                                key={id}
                                className={`grid-chip-v2 ${isMine ? 'mine' : ''} ${isOther ? 'other' : ''}`}
                                onClick={() => toggleCartela(id)}
                            >
                                {id}
                            </div>
                        );
                    })}
                </div>
            </main>

            <footer className="lobby-footer-previews">
                <div className="previews-container-v2">
                    {selectedIds.length > 0 ? (
                        selectedIds.map(renderPreview)
                    ) : (
                        <div className="preview-placeholder">Select up to 2 cards to preview</div>
                    )}
                </div>
                <button
                    className={`lobby-play-btn-v2 ${selectedIds.length > 0 || roomStatus === 'PLAYING' ? 'active' : ''}`}
                    disabled={selectedIds.length === 0 && roomStatus === 'WAITING'}
                    onClick={() => {
                        const cards = selectedIds.map(id => generateDeterministicCard(id));
                        onGameStart(cards);
                    }}
                >
                    {roomStatus === 'PLAYING' ? 'WATCH LIVE GAME 🎥' : 'CONFIRM SELECTION'}
                </button>
            </footer>
        </div>
    );
};

export default CartelaSelection;
