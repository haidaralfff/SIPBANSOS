import React from 'react';

const Skeleton = ({
  className = '',
  variant = 'rectangular', // rectangular, circular, text
  width,
  height,
  ...props
}) => {
  const baseClasses = 'relative overflow-hidden bg-border/50';

  const variantClasses = {
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded',
  };

  const style = {};
  if (width) style.width = width;
  else if (variant === 'text') style.width = '100%';
  
  if (height) style.height = height;
  else if (variant === 'text') style.height = '1rem';

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
};

export default Skeleton;
