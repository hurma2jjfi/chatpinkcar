import React, { useState, useEffect } from 'react';
import '../styles/SimpleMenu.css'; 
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SettingsModal from '../profile/SettingsModal';

const SimpleMenu = () => {
    const navigate = useNavigate();
    const [menuVisible, setMenuVisible] = useState(false);
    const [fade, setFade] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal

    const toggleMenu = () => {
        setFade(prev => !prev);
        setMenuVisible(prev => !prev);
    };

    const handleClickOutside = (event) => {
        if (!event.target.closest('.three__wrapper')) {
            setFade(false);
            setTimeout(() => setMenuVisible(false), 300);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const dropdownStyle = {
        position: 'absolute',
        top: '139%',
        left: '-50px',
        backgroundColor: 'rgba(48, 48, 52, 0.7)', 
        backdropFilter: 'blur(50px)', 
        borderRadius: '16px', 
        border: '1px solid rgba(255, 255, 255, 0.1)', 
        boxShadow: `
            rgba(0, 0, 0, 0.1) 0px 32px 16px,
            rgba(0, 0, 0, 0.1) 0px 16px 8px,
            rgba(0, 0, 0, 0.1) 0px 8px 4px,
            rgba(0, 0, 0, 0.1) 0px 4px 2px,
            rgba(0, 0, 0, 0.1) 0px 2px 1px
        `,
        minWidth: '10rem', 
        paddingBlock: '0.5rem', 
        paddingInline: '0.5rem', 
        opacity: fade ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
    };

    const handleLogout = () => {
        toast.loading('Выход из системы');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
    };

    const handleSettings = () => {
        setIsModalOpen(true); // Open the modal
    };

    return (
        <div className="three__wrapper">
            <div className="three-dots" onClick={toggleMenu}>
                <MoreVertIcon />
            </div>
            {menuVisible && (
                <div style={dropdownStyle}>
                    <ul className='ul'>
                        <li onClick={handleSettings}>
                            <SettingsIcon style={{ marginRight: '8px' }} /> 
                            Настройки
                        </li>
                        <li onClick={handleLogout}>
                            <LogoutIcon style={{ marginRight: '8px' }} />
                            Выйти
                        </li>
                    </ul>
                </div>
            )}
            <SettingsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default SimpleMenu;
