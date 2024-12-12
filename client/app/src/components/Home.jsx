import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Добро пожаловать в чат PinkCar! Вы находитесь на главной!</h1>
      <nav>
        <ul>
          <li>
            <Link to="/login">Log in</Link>
          </li>
          <li>
            <Link to="/register">Register</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Home;
