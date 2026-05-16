import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Room from './Room';

const Landing = () => {
  const [name, setName] = useState<string>('');
  const navigate = useNavigate();

  const [joined, setJoined] = useState<boolean>(false);

  const [localVideoTrack, setlocalVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<MediaStreamTrack | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleRoomTransfer = () => {
    if (!name.trim()) return;
    navigate(`/room?name=${encodeURIComponent(name.trim())}`);
  };

  const getStream = async () => {
    const stream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];

    setlocalVideoTrack(audioTrack);
    setLocalAudioTrack(videoTrack);

    if (!videoRef.current) return;

    videoRef.current.srcObject = new MediaStream([videoTrack]);
  };

  useEffect(() => {
    if (videoRef && videoRef.current) {
      getStream();
    }
  }, []);
  return (
    <div>
      {!joined ? (
        <>
          <video autoPlay ref={videoRef} className='rotate-x-180 rotate-180' />

          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={handleRoomTransfer}>JOIN</button>
        </>
      ) : (
        <>
          <Room
            name={name}
            localAudioTrack={localAudioTrack}
            localVideoTrack={localVideoTrack}
          />
        </>
      )}
    </div>
  );
};

export default Landing;
