import React from 'react';
import PropTypes from 'prop-types';



const ProfileSettingsIcon = ({ username }) => {
    const firstLetter = username.charAt(0).toUpperCase();

    return (
        <div className="avatarsettings flex items-center justify-center 
                bg-black text-white 
                rounded-full w-40 h-40 
                font-bold text-5xl"
>
    <div className="letter relative top-6 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
        {firstLetter}
    </div>
</div>




    );
};

ProfileSettingsIcon.propTypes = {
    username: PropTypes.string.isRequired,
};

export default ProfileSettingsIcon;
