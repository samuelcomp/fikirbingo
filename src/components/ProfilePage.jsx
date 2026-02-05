import React from 'react';
import { User, Trophy, Share2, Settings, LogOut, Globe, Star, ChevronRight, Gamepad2 } from 'lucide-react';

const ProfilePage = ({ user, lang, onToggleLang, onLogout, t }) => {
    return (
        <div className="profile-wrapper animate-reveal">
            <div className="profile-hero">
                <div className="avatar-ring">
                    <div className="avatar-inner">
                        <User size={48} color="white" />
                    </div>
                </div>
                <h2 className="profile-name">{user?.username || 'DevPlayer'}</h2>
                <div className="profile-meta">
                    <span className="profile-id">ID: {user?.id?.substring(0, 10)}</span>
                    <span className="profile-phone">{user?.phoneNumber || 'No Phone'}</span>
                </div>
            </div>

            <div className="profile-stats-row">
                <div className="p-stat-card gold-glow">
                    <Trophy className="stat-icon-v2" />
                    <div className="stat-text-v2">
                        <span className="v2-val">{user?.totalWins || 0}</span>
                        <span className="v2-lab">WINS</span>
                    </div>
                </div>
                <div className="p-stat-card blue-glow">
                    <Gamepad2 className="stat-icon-v2" />
                    <div className="stat-text-v2">
                        <span className="v2-val">{user?.totalGames || 0}</span>
                        <span className="v2-lab">PLAYS</span>
                    </div>
                </div>

            </div>

            <div className="profile-menu-v2">
                <div className="menu-row-v2" onClick={onToggleLang}>
                    <div className="menu-icon-bg"><Globe size={20} /></div>
                    <div className="menu-info-v2">
                        <span className="menu-title-v2">Language / ቋንቋ</span>
                        <span className="menu-sub-v2">{lang === 'en' ? 'English' : 'አማርኛ'}</span>
                    </div>
                    <label className="switch mini">
                        <input type="checkbox" checked={lang === 'am'} readOnly />
                        <span className="slider round"></span>
                    </label>
                </div>

                <div className="menu-row-v2">
                    <div className="menu-icon-bg"><Settings size={20} /></div>
                    <div className="menu-info-v2">
                        <span className="menu-title-v2">Settings</span>
                    </div>
                    <ChevronRight size={20} opacity={0.3} />
                </div>

                <div className="menu-row-v2 logout-v2" onClick={onLogout}>
                    <div className="menu-icon-bg log-bg"><LogOut size={20} color="#ff4444" /></div>
                    <div className="menu-info-v2">
                        <span className="menu-title-v2" style={{ color: '#ff4444' }}>Logout</span>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ProfilePage;
