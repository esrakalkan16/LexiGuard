import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('Yükleniyor...');

  useEffect(() => {
    const loadData = () => {
      fetch('http://localhost:3000/api/message')
        .then((res) => res.json())
        .then((data) => setMessage(data.message))
        .catch((err) => setMessage('API bağlantı hatası: ' + err.message));
    };

    loadData();
    const intervalId = setInterval(loadData, 2000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f0f2f5' }}>
      <h1 style={{ color: '#333', fontSize: '3rem' }}>{message}</h1>
    </div>
  );
}

export default App;
