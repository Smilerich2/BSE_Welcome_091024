import React from 'react';
import { Button } from '../types';
import * as Icons from 'lucide-react';

interface DashboardButtonProps extends Button {
  onClick: () => void;
}

const DashboardButton: React.FC<DashboardButtonProps> = ({ name, icon, onClick }) => {
  const IconComponent = Icons[icon as keyof typeof Icons];

  return (
    <button
      className="bg-white bg-opacity-20 rounded-xl p-6 flex flex-col items-center justify-center transition-all duration-300 flex-1 hover:bg-opacity-30 hover:scale-105"
      onClick={onClick}
    >
      <IconComponent className="w-10 h-10 text-white mb-3" />
      <span className="text-lg font-medium text-white">{name}</span>
    </button>
  );
};

export default DashboardButton;