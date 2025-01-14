import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MaskGroup from '../assets/MaskGroup.svg';
import backSvg from '../assets/back.svg';
import { Link } from 'react-router-dom'; 


function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(''); // State for avatar preview

  // Validation states
  const [emailValid, setEmailValid] = useState(true);
  const [usernameValid, setUsernameValid] = useState(true);
  const [passwordValid, setPasswordValid] = useState(true);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(true);
  const [bioValid, setBioValid] = useState(true);

  const handleRegister = async (e) => {
    e.preventDefault();

    // Reset validation states
    let isValid = true;

    // Validate fields
    if (!email) {
      setEmailValid(false);
      isValid = false;
    } else {
      setEmailValid(true); // Reset if valid
    }
    
    if (!username) {
      setUsernameValid(false);
      isValid = false;
    } else {
      setUsernameValid(true); // Reset if valid
    }

    if (password.length < 8) {
      toast.error('Пароль должен содержать минимум 8 символов');
      isValid = false;
      setPasswordValid(false);
    } else {
      setPasswordValid(true); // Reset if valid
    }

    // Check confirm password after password validation
    if (!confirmPassword) {
      toast.error('Подтвердите пароль');
      isValid = false;
      setConfirmPasswordValid(false);
    } else if (password !== confirmPassword) {
      toast.error('Пароли не совпадают');
      isValid = false;
      setConfirmPasswordValid(false);
    } else {
      setConfirmPasswordValid(true); // Reset if valid
    }

    if (!bio) {
      setBioValid(false);
      isValid = false;
    } else {
      setBioValid(true); // Reset if valid
    }

    if (!isValid) return; // Stop execution if any field is invalid
    
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('username', username);
      formData.append('bio', bio);
      if (avatar) formData.append('avatar', avatar);

      await registerUser(formData);
      toast.success('Регистрация успешна!');
      resetForm();
    } catch (error) {
      console.error(error.response);
      toast.error(error.response?.data || error.message);
    }
  };

  const registerUser = async (formData) => {
    return axios.post('http://127.0.0.1:3000/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file)); // Create a preview URL for the selected image
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    setBio('');
    setAvatar(null);
    setAvatarPreview(''); // Reset avatar preview
  };

  return (
    <div className="container__onner">
      <div className='container'>
        <div className="back" title='Назад'>
          <Link to="/"> 
            <img src={backSvg} alt="Back" />
          </Link>
        </div>
        <div className="wrapper__form">
          <form onSubmit={handleRegister}>
            <div className="input__container__reg">
            <img className='logo' src={MaskGroup} alt="Logo" />
            <h1 className='pinkTitle'>Register in the <span>Pinkcar</span></h1>
              <input 
                type="email" 
                className='field__email' 
                placeholder='Email*' 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                style={{ borderColor: emailValid ? '' : 'red' }} // Conditional styling
              />
              <input 
                type="text" 
                className='field__user' 
                placeholder='Username*' 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                style={{ borderColor: usernameValid ? '' : 'red' }} // Conditional styling
              />
              <input 
                type="password" 
                className='field__password' 
                placeholder='Password*' 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={{ borderColor: passwordValid ? '' : 'red' }} // Conditional styling
              />
              <input 
                type="password" 
                className='field__four' 
                placeholder='Confirm password*' 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                style={{ borderColor: confirmPasswordValid ? '' : 'red' }} // Conditional styling
              />
              <textarea 
                placeholder='Biography*' 
                className='textarea__bio' 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                style={{ borderColor: bioValid ? '' : 'red' }} // Conditional styling for biography
              />

              <input 
                type="file" 
                className='field__five' 
                accept="image/*" 
                onChange={handleAvatarChange} 
                id="file-upload"
              />
              <label htmlFor="file-upload" className="upload-label">Avatar*</label>

              {/* Display Avatar Preview */}
              {avatarPreview && (
                <div className="avatar-preview">
                  <img src={avatarPreview} alt="Avatar Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }} />
                </div>
              )}

              <button className='brn__register' type="submit">Register</button>
              
<div className="forgotPass__wrap flex items-center justify-center mt-3">
            <div className="wrap flex items-center space-x-4"> {/* Используем flex и space-x для равного расстояния */}
                <Link to="/login" className="text-center link">
                    <h1>Already have an account?</h1>
                </Link>
            </div>
        </div>



            </div>
          </form>
        </div>


        
        <ToastContainer />
      </div>
    </div>
  );
}

export default Register;
