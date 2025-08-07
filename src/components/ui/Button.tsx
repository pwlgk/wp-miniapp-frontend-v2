// components/ui/Button.tsx
import { forwardRef } from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', className = '', ...props }, ref) => {
    // Базовые стили
    const baseStyle = [
      'w-full py-3 px-4 rounded-xl font-bold text-center',
      'transition-all duration-300 transform',
      'shadow-md hover:shadow-lg active:scale-[0.98]',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
    ].join(' ');

    // Стили для вариантов
    const variantStyles = {
      primary: [
        'bg-light-accent',
        'text-light-text',
        'hover:bg-opacity-90',
        'focus:ring-light-accent',
      ].join(' '),

      secondary: [
        'bg-gray-200 text-light-text',
        'hover:bg-gray-300',
        'focus:ring-gray-400',
      ].join(' '),
    };

    return (
      <button
        ref={ref}
        className={`${baseStyle} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
