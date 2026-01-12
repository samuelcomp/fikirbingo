import React from 'react';
import { User, Trophy, Share2, Settings, LogOut, Globe, Star } from 'lucide-react';

const ProfilePage = ({ user, lang, onToggleLang, onLogout, t }) => {
    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    <User size={40} />
                </div>
                <h2>{user?.username || 'Player'}</h2>
                <span className="user-id">ID: {user?.id?.slice(0, 8)}</span>
            </div>

            <div className="profile-stats-grid">
                <div className="p-stat-box premium-card">
                    <Trophy className="stat-icon-wrapper" style={{ color: 'var(--accent)' }} />
                    <span className="val">{user?.totalWins || 0}</span>
                    <span className="lab">{lang === 'am' ? 'አሸናፊ' : 'Wins'}</span>
                </div>
                <div className="p-stat-box premium-card">
                    <Star className="stat-icon-wrapper" style={{ color: 'var(--secondary)' }} />
                    <span className="val">{user?.coins || 0}</span>
                    <span className="lab">{lang === 'am' ? 'ኮይኖች' : 'Coins'}</span>
                </div>
            </div>

            <div className="profile-menu">
                <div className="menu-item" onClick={onToggleLang}>
                    <Globe size={20} className="stat-icon-wrapper" />
                    <div className="menu-text">
                        <span style={{ fontWeight: 700 }}>{t.langToggle}</span>
                        <small style={{ color: 'var(--text-dim)' }}>{lang === 'en' ? 'English' : 'አማርኛ'}</small>
                    </div>
                    <div className={`toggle ${lang === 'am' ? 'on' : ''}`}></div>
                </div>
                <div className="menu-item">
                    <Settings size={20} className="stat-icon-wrapper" />
                    <div className="menu-text">
                        <span style={{ fontWeight: 700 }}>Settings</span>
                    </div>
                </div>
                <div className="menu-item logout" onClick={onLogout} style={{ marginTop: '20px', borderColor: 'var(--primary-glow)' }}>
                    <LogOut size={20} color="var(--primary)" />
                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{lang === 'am' ? 'ውጣ' : 'Logout'}</span>
                </div>
            </div>

            <div className="referral-banner premium-card" style={{ marginTop: 'auto' }}>
                <h3 style={{ marginBottom: '8px' }}>{t.invite}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Earn 2% of their deposits forever!</p>
                <button className="play-btn">Copy Invite Link</button>
            </div>
        </div>
    );
};

export default ProfilePage;
