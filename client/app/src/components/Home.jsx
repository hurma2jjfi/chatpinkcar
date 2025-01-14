import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VideoPlayer from './video/VideoPlayer';
import './styles/Home.css';



function Home() {
  // const videoSrc = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const textToType = 'Хотите общаться с пользователями нашей платформы, обсуждать крутые тачки? — Добро пожаловать в наш онлайн-чат, наслаждайтесь неповторимой атмосферой, и уникальностью в нашей новой платформе PinkCar...';
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    let i = 0;
    const intervalId = setInterval(() => {
      if (i < textToType.length) {
        setTypedText(textToType.substring(0, i + 1));
        i++;
      } else {
        clearInterval(intervalId);
      }
    }, 50); 

    return () => clearInterval(intervalId);
  }, [textToType]);

  return (
    <div className='wrapper__home'>
      <div className="wrapper__nav">
        <li>
          <Link className='login' to="/login">Log in</Link>
        </li>
        <li>
          <Link className='register' to="/register">Register</Link>
        </li>
      </div>

      <div className="parent">
      <div className="typing-text">
        <p className="typing">{typedText}<span className="caret"></span></p>
      </div></div>

      {/* <div className="wrap__media">
        <VideoPlayer src={videoSrc} />
        <VideoPlayer src={videoSrc} />
        <VideoPlayer src={videoSrc} />
        <VideoPlayer src={videoSrc} />
        <VideoPlayer src={videoSrc} />
        <VideoPlayer src={videoSrc} />
        <VideoPlayer src={videoSrc} />
        <VideoPlayer src={videoSrc} />
        <VideoPlayer src={videoSrc} />
      </div> */}
    </div>
  );
}

export default Home;
