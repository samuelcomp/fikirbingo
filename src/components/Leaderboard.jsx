import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Medal, Crown } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\s/g, '');

const Leaderboard = ({ user, t }) => {
    const [players, setPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('daily');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/leaderboard?timeframe=${timeframe}`);
                setPlayers(res.data);
            } catch (e) {
                console.error('Failed to fetch leaderboard');
            } finally {
                setIsLoading(false);
            }
        }
        fetchLeaderboard();
    }, [timeframe]);

    const getRankIcon = (index) => {
        switch (index) {
            case 0: return <Crown className="rank-badge-v2 gold" size={24} />;
            case 1: return <Medal className="rank-badge-v2 silver" size={24} />;
            case 2: return <Medal className="rank-badge-v2 bronze" size={24} />;
            default: return <span className="rank-text-v2">#{index + 1}</span>;
        }
    };

    if (isLoading) return <div className="loading-mini">Loading Rankings...</div>;

    return (
        <div className="leaderboard-container-v2">
            <h1 className="dashboard-title-v2">Leaderboard</h1>

            <div className="user-stats-banner-v2">
                <div className="user-avatar-v2">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="user-meta-v2">
                    <span className="user-name-v2">{user?.username} 😊</span>
                    <span className="user-played-v2">{user?.totalGames || 0} Played</span>
                </div>
                <div className="user-rank-status-v2">
                    <span className="rank-status-text-v2">Unranked</span>
                    <Trophy size={20} color="#fbbf24" />
                </div>
            </div>

            <h2 className="section-subtitle-v2">Top Players</h2>

            <div className="timeframe-tabs-v2">
                <button
                    className={`time-tab-v2 ${timeframe === 'weekly' ? 'active' : ''}`}
                    onClick={() => setTimeframe('weekly')}
                >
                    Weekly
                </button>
                <button
                    className={`time-tab-v2 ${timeframe === 'daily' ? 'active' : ''}`}
                    onClick={() => setTimeframe('daily')}
                >
                    Daily
                </button>
            </div>

            <div className="players-list-v2">
                {players.slice(0, 10).map((player, i) => (
                    <div key={i} className="player-row-v2 upscale-reveal" style={{ animationDelay: `${i * 0.05}s` }}>
                        <div className="rank-section-v2">
                            {getRankIcon(i)}
                        </div>
                        <div className="avatar-section-v2">
                            <div className="player-avatar-mini-v2">
                                {player.username[0]?.toUpperCase()}
                            </div>
                        </div>
                        <div className="name-section-v2">
                            <span className="player-name-text-v2">{player.username}</span>
                        </div>
                        <div className="stats-section-v2">
                            <span className="stats-value-v2">{player.totalGames || 0}</span>
                            <span className="stats-label-v2">Played</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;
