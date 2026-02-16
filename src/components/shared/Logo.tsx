import type { FC } from 'react';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const Logo: FC<LogoProps> = ({ variant = 'light', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24',
    '2xl': 'h-32',
  };

  const logoSrc = variant === 'dark'
    ? '/images/logo-dark.png'
    : '/images/logo-light.png';

  return (
    <img
      src={logoSrc}
      alt="Castwell Investment Limited"
      className={`${sizeClasses[size]} w-auto object-contain ${className}`}
    />
  );
};

export default Logo;
