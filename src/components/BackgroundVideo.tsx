import React from 'react';
import { BackgroundType } from '../types';
import { backgrounds } from '../constants';

interface BackgroundVideoProps {
  background: BackgroundType;
}

const BackgroundVideo: React.FC<BackgroundVideoProps> = ({ background }) => {
  return (
    <video
      className="absolute top-0 left-0 w-full h-full object-cover"
      autoPlay
      loop
      muted
      playsInline
      src={backgrounds[background].video}
    />
  );
};

export default BackgroundVideo;