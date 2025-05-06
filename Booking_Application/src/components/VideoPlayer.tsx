import React from 'react';

interface VideoPlayerProps {
  src: string;
  type: string;
  width?: string;
  height?: string;
  autoplay?: boolean;
  muted?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, type, autoplay = false, muted = false }) => {
  return (
    <video autoPlay={autoplay} muted={autoplay || muted}>
      <source src={src} type={type} />
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoPlayer;
