import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { ChevronLeft, RotateCcw, MonitorPlay, Check, Loader2, AlertCircle } from 'lucide-react';

const CartelaChip = React.memo(({ id, isMine, isOther, onClick }) => {
    return (
        <div
            className={`cartela-chip-v3 ${isMine ? 'mine' : ''} ${isOther ? 'other' : ''}`}
            onClick={() => onClick(id)}
        >
            {id}
            {isMine && <Check size={10} className="chip-check" />}
            {isOther && <div className="chip-indicator" />}
        </div>
    );
});

const BalanceModal = ({ isOpen, onClose, t }) => {
    if (!isOpen) return null;
    return (
        <div className="balance-overlay upscale-reveal" onClick={onClose}>
            <div className="balance-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-icon-glow">
                    <AlertCircle size={32} color="#f87171" />
                </div>
                <h3>Insufficient Balance!</h3>
                <p className="amharic-text">ለጨዋታው በቂ ቀሪ ሂሳብ የለዎትም። እባክዎን ወደ ሂሳብዎ ገንዘብ ያስገቡ።</p>
                <p className="english-text">You don't have enough balance to play. Please deposit or convert your winnings.</p>

                <div className="modal-actions">
                    <button className="deposit-redirect-btn" onClick={() => window.location.href = '/wallet'}>
                        Deposit Now 💳
                    </button>
                    <button className="close-modal-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\s/g, '');

const CartelaSelection = ({ user, stake = 10, onGameStart, t }) => {
    const [socket, setSocket] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [takenCartelas, setTakenCartelas] = useState({});
    const [playersCount, setPlayersCount] = useState(0);
    const [prizePool, setPrizePool] = useState(0);
    const [roomStatus, setRoomStatus] = useState('WAITING');
    const [displayCountdown, setDisplayCountdown] = useState(60);
    const [selectionError, setSelectionError] = useState(null);
    const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
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
                setDisplayCountdown(data.countdown); // Sync local display
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
                // Only sync local display if it's more than 2 seconds off or if it's a reset
                setDisplayCountdown(prev => {
                    if (Math.abs(prev - data.countdown) > 2) return data.countdown;
                    return prev;
                });
                setRoomStatus(data.status);
                setPlayersCount(data.playersCount || 0);
                setPrizePool(data.prizePool || 0);

                if (data.status === 'PLAYING') {
                    setRoomStatus('PLAYING');
                }
            }
        });

        s.on('user_update', (updatedUser) => {
            console.log('[Socket] User balance updated');
            // This event is handled by the parent (App.jsx) in some designs, 
            // but here we can try to update local state or let it propagate.
            // Since `user` is a prop, we need a callback to update it in App.jsx.
            if (onUpdateUser) onUpdateUser(updatedUser);
        });

        s.on('error', (msg) => {
            setSelectionError(msg);
            setTimeout(() => setSelectionError(null), 3000);
        });

        return () => {
            s.disconnect();
        };
    }, [roomId, user?.telegramId]);

    // Local Timer Interpolation
    useEffect(() => {
        if (roomStatus !== 'WAITING') return;

        const timer = setInterval(() => {
            setDisplayCountdown(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [roomStatus]);

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

        // Security/Balance check
        const totalSelected = selectedIds.length;
        const isDeselect = selectedIds.includes(id);

        if (!isDeselect) {
            // Check combined balance (Play + Main)
            const playBal = Number(user?.playBalance || 0);
            const mainBal = Number(user?.mainBalance || 0);
            const totalAvailable = playBal + mainBal;

            if (totalAvailable < stake) {
                setIsBalanceModalOpen(true);
                return;
            }
        }

        const allTaken = Object.entries(takenCartelas)
            .filter(([tid]) => tid !== user?.telegramId)
            .flatMap(([_, ids]) => ids);

        if (allTaken.includes(id)) return;

        // Optimistic UI Update
        if (isDeselect) {
            setSelectedIds(prev => prev.filter(item => item !== id));
            socket.emit('deselect_cartela', { roomId, cartelaId: id });
        } else if (selectedIds.length < 2) {
            setSelectedIds(prev => [...prev, id]);
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
                    <span className="box-value">{displayCountdown} s</span>
                </div>
            </div>

            {selectionError && (
                <div className="selection-error-banner upscale-reveal">
                    <AlertCircle size={16} />
                    <span>{selectionError}</span>
                </div>
            )}

            {roomStatus === 'FINISHED' && (
                <div className="selection-error-banner info-mode upscale-reveal">
                    <Loader2 size={16} className="spinning" />
                    <span>Preparing Next Round... (የሚቀጥለው ዙር በመዘጋጀት ላይ)</span>
                </div>
            )}

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
                    {Array.from({ length: 400 }, (_, i) => i + 1).map(id => (
                        <CartelaChip
                            key={id}
                            id={id}
                            isMine={selectedIds.includes(id)}
                            isOther={isTakenByOther(id)}
                            onClick={toggleCartela}
                        />
                    ))}
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

            <BalanceModal
                isOpen={isBalanceModalOpen}
                onClose={() => setIsBalanceModalOpen(false)}
                t={t}
            />
        </div>
    );
};

export default CartelaSelection;
