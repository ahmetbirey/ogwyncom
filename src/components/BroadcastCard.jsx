import { useState } from 'react';
import useScrollAnimation from '../hooks/useScrollAnimation';

const BroadcastCard = ({ broadcast, delay = 0 }) => {
  const ref = useScrollAnimation();
  const [isClicked, setIsClicked] = useState(false);

  const handlePlayClick = () => {
    setIsClicked(true);
  };

  return (
    <div 
      ref={ref}
      className="broadcast-card scale-in" 
      style={{ transitionDelay: `${delay}s` }}
    >
      {isClicked ? (
        <iframe
          data-testid="embed-iframe"
          style={{ borderRadius: '12px' }}
          src={broadcast.spotifyUrl}
          width="100%"
          height="152"
          frameBorder="0"
          allowFullScreen=""
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title={broadcast.title}
        ></iframe>
      ) : (
        <div 
          className="spotify-placeholder"
          onClick={handlePlayClick}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '152px',
            backgroundColor: '#262626',
            borderRadius: '12px',
            cursor: 'pointer'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play-circle"><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16 10,8"/></svg>
        </div>
      )}
    </div>
  );
};

export default BroadcastCard;