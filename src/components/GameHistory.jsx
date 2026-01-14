import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, Clock, Trophy, AlertCircle } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\s/g, '');

const GameHistory = ({ user, t }) => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem('userToken');
                const res = await axios.get(`${API_URL}/api/game-history`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setHistory(res.data);
            } catch (e) {
                console.error('Failed to fetch game history');
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (isLoading) return <div className="loading-mini">Loading History...</div>;

    return (
        <div className="game-history-container-v2">
            <h1 className="dashboard-title-v2">Game History</h1>

            <div className="total-games-banner-v2">
                <div className="banner-content-v2">
                    <span className="banner-label-v2">Total Games</span>
                    <span className="banner-value-v2">{user?.totalGames || history.length}</span>
                </div>
            </div>

            <h2 className="section-subtitle-v2">Recent Games</h2>

            <div className="history-list-v2">
                {history.length > 0 ? (
                    history.map((game, i) => (
                        <div key={game.id} className="game-history-card-v2 upscale-reveal" style={{ animationDelay: `${i * 0.05}s` }}>
                            <div className="game-card-top-v2">
                                <div className="game-info-v2">
                                    <div className="game-icon-circle-v2"></div>
                                    <div className="game-meta-v2">
                                        <span className="game-id-v2">Game {game.id.substring(0, 8).toUpperCase()}</span>
                                        <div className="game-date-v2">
                                            <Clock size={12} />
                                            <span>{new Date(game.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`game-status-badge-v2 ${game.won ? 'won' : 'lost'}`}>
                                    {game.won ? 'Won' : 'Lost'}
                                </div>
                            </div>

                            <div className="game-details-row-v2">
                                <div className="detail-item-v2">
                                    <span className="detail-label-v2">Stake:</span>
                                    <span className="detail-value-v2">{game.stake}</span>
                                </div>
                                <div className="detail-item-v2">
                                    <span className="detail-label-v2">Prize:</span>
                                    <span className="detail-value-v2">{game.prize}</span>
                                </div>
                                <div className="detail-item-v2">
                                    <span className="detail-label-v2">Winners:</span>
                                    <span className="detail-value-v2">{game.winnersCount}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-history-v2">
                        <History size={48} strokeWidth={1} />
                        <p>No games played yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameHistory;
