import React, { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, Phone } from 'lucide-react';

const RegisterPage = ({ onRegisterSuccess, t, API_URL }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleShareContact = () => {
        const webapp = window.Telegram?.WebApp;
        if (!webapp) {
            setError("Telegram WebApp not detected. Please open this app inside Telegram.");
            return;
        }

        setIsLoading(true);

        // Use the Telegram WebApp method to request contact
        // In some versions, it's requestContact, in others you use a callback
        try {
            if (webapp.requestContact) {
                webapp.requestContact((res) => {
                    if (res.status === 'sent') {
                        saveContact(res.response_data.contact.phone_number);
                    } else {
                        setIsLoading(false);
                        setError("Contact sharing was cancelled.");
                    }
                });
            } else {
                // Fallback for older versions or if requestContact is not directly available
                // Some developers use a button in the bot instead, but let's try to handle it here
                setError("Your Telegram version doesn't support direct contact sharing. Please register in the bot first.");
                setIsLoading(false);
            }
        } catch (e) {
            console.error("Contact request failed", e);
            setError("Failed to request contact.");
            setIsLoading(false);
        }
    };

    const saveContact = async (phoneNumber) => {
        try {
            const token = localStorage.getItem('userToken');
            await axios.post(`${API_URL}/api/save-contact`, { phoneNumber }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            onRegisterSuccess();
        } catch (e) {
            console.error("Contact save error:", e);
            // Extract the specific backend error message (e.g. Whitelist Block)
            const msg = e.response?.data?.error || "Failed to save contact. Please try again.";
            alert(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="registration-container">
            <div className="registration-card premium-card">
                <div className="shield-icon">
                    <ShieldCheck size={60} color="#ffaa00" />
                </div>
                <h1>{t.registrationTitle}</h1>
                <p>{t.registrationDesc}</p>

                {error && <p className="error-text">{error}</p>}

                <button
                    className={`play-btn ${isLoading ? 'loading' : ''}`}
                    onClick={handleShareContact}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="spinner"></div>
                    ) : (
                        <>
                            <Phone size={20} />
                            {t.shareContact}
                        </>
                    )}
                </button>

                <div className="registration-footer">
                    <button className="text-btn" onClick={() => onRegisterSuccess()}>
                        🔄 Already shared in Bot? Refresh
                    </button>
                    <p className="security-note">🔒 Your data is verified by Telegram security.</p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
