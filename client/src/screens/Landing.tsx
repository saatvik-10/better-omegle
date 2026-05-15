import { useState } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const [name, setName] = useState<string>();

  const handleRoomTransfer = () => {
    <Link to={`/room?name={name}`} />;
  };

  return (
    <div>
      <input type='text' onChange={(e) => e.target.value} />

      <button onClick={handleRoomTransfer}>JOIN</button>
    </div>
  );
};

export default Landing;
