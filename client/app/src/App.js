import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Room from './components/Room';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Gifts from './components/Gifts';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/room" element={<Room />} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />
        <Route path="/reset-password/:token" element={<ResetPassword/>} />
        <Route path="/gifts" element={<Gifts />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

