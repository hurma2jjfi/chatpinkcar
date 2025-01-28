import React from 'react';
import PropTypes from 'prop-types';
import '../styles/ProfileIcon.css'; 

const ProfileIcon = ({ username }) => {
    const firstLetter = username.charAt(0).toUpperCase();

    return (
        <div className="avatar flex items-center justify-center 
                       bg-blue-500 text-white 
                       rounded-full w-12 h-12 
                       font-bold text-xl"
        >
            {firstLetter}
        </div>
    );
};

ProfileIcon.propTypes = {
    username: PropTypes.string.isRequired,
};

export default ProfileIcon;
