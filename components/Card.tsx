
import React from 'react';
import { Icon } from './Icon';

type CardProps = {
  title: string;
  iconName?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export const Card: React.FC<CardProps> = ({ title, iconName, children, actions, className }) => {
  return (
    <div className={`bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-800 rounded-xl p-4 md:p-6 flex flex-col ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          {iconName && <Icon name={iconName} className="w-5 h-5 text-gray-400 dark:text-gray-500" />}
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{title}</h3>
        </div>
        {actions && <div>{actions}</div>}
      </div>
      <div className="flex-grow flex flex-col">
        {children}
      </div>
    </div>
  );
};