import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Medal, Crown, Star } from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\s/g, '');

const Leaderboard = ({ t }) => {
    const [players, setPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/leaderboard`);
                setPlayers(res.data);
            } catch (e) {
                console.error('Failed to fetch leaderboard');
            } finally {
                setIsLoading(false);
            }
        }
        fetchLeaderboard();
    }, []);

    const getRankIcon = (index) => {
        switch (index) {
            case 0: return <Crown className="rank-icon gold" size={24} />;
            case 1: return <Medal className="rank-icon silver" size={20} />;
            case 2: return <Medal className="rank-icon bronze" size={18} />;
            default: return <span className="rank-number">{index + 1}</span>;
        }
    };

    if (isLoading) return <div className="loading-mini">Loading Rankings...</div>;

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <Trophy size={48} className="trophy-main" />
                <h2>Top Winners</h2>
                <p>Hall of Fame</p>
            </div>

            <div className="top-three">
                {players.slice(0, 3).map((player, i) => (
                    <div key={i} className={`top-card rank-${i + 1}`}>
                        <div className="avatar-ring">
                            {getRankIcon(i)}
                        </div>
                        <span className="name">{player.username?.split('_')[0] || 'Player'}</span>
                        <span className="wins">{player.totalWins} Wins</span>
                    </div>
                ))}
            </div>

            <div className="full-list premium-card">
                {players.map((player, i) => (
                    <div key={i} className="list-item">
                        <div className="rank-col">
                            {getRankIcon(i)}
                        </div>
                        <div className="info-col">
                            <span className="player-name">{player.username}</span>
                            <span className="player-stats">{player.totalEarnings} Birr Earned</span>
                        </div>
                        <div className="wins-col">
                            <Star size={14} className="star-icon" />
                            <span>{player.totalWins}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;
