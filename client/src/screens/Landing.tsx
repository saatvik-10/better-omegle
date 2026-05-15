import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const [name, setName] = useState<string>('');
  const navigate = useNavigate();

  const handleRoomTransfer = () => {
    if (!name.trim()) return;
    navigate(`/room?name=${encodeURIComponent(name.trim())}`);
  };

  return (
    <div>
      <input
        type='text'
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleRoomTransfer}>JOIN</button>
    </div>
  );
};

export default Landing;
