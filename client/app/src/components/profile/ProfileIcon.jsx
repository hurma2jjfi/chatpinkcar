import React from 'react';
import PropTypes from 'prop-types';
import '../styles/ProfileIcon.css'; 

const ProfileIcon = ({ username }) => {
    
    const firstLetter = username.charAt(0).toUpperCase();

    return (
            <div className="avatar">
                {firstLetter}
            </div>
    );
};

ProfileIcon.propTypes = {
    username: PropTypes.string.isRequired,
};

export default ProfileIcon;
