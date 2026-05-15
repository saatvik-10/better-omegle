import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const Room = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const name = searchParams.get('name');

  useEffect(() => {
    //logic for user to the room
  }, [name]);

  return <div>Hello {name}</div>;
};

export default Room;
