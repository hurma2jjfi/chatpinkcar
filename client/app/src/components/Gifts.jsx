import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
};

function Gifts() {
    const [gifts, setGifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login', { replace: true });
            return;
        }

        const fetchGifts = async () => {
            try {
                const response = await axios.get('http://localhost:3000/gifts');
                setGifts(response.data.data);
                setLoading(false);
            } catch (err) {
                setError(err);
                setLoading(false);
                console.error("Ошибка при получении подарков:", err);
            }
        };

        fetchGifts();
    }, []);

    if (loading) {
        return <p>Загрузка...</p>;
    }

    if (error) {
        return <p>Ошибка при загрузке подарков!</p>;
    }

    
    return (
        <div>
            <h2>Подарки</h2>
            {gifts.length > 0 ? (
                <div>
                    {gifts.map(gift => (
                        <div key={gift.id}>
                            <h3>{gift.name}</h3>
                            <p>{gift.description}</p>
                            <p>Цена: {gift.price} руб.</p>
                            {gift.svgPath && (
                                <img
                                    src={`/${gift.svgPath}`} 
                                    alt={gift.name}
                                    style={{ maxWidth: '100px' }}
                                />
                            )}
                            
                            <iframe src="https://yoomoney.ru/quickpay/fundraise/button?billNumber=18DUA308BGT.250215&successURL=http%3A%2F%2Flocalhost%3A3001%2Fgifts" width="330" height="50" frameborder="0" allowtransparency="true" scrolling="no"></iframe>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Нет доступных подарков.</p>
            )}
        </div>
);

}

export default Gifts;
