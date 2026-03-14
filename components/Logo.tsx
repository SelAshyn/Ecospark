import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  variant?: 'default' | 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
  href?: string;
  className?: string;
}

export default function Logo({
  variant = 'default',
  size = 'md',
  showIcon = true,
  showText = false,
  href = '/',
  className = '',
}: LogoProps) {
  const sizeClasses = {
    sm: {
      width: 120,
      height: 40,
    },
    md: {
      width: 150,
      height: 50,
    },
    lg: {
      width: 180,
      height: 60,
    },
  };

  const variantClasses = {
    default: {
      filter: 'invert(23%) sepia(18%) saturate(2764%) hue-rotate(95deg) brightness(40%) contrast(96%)',
    },
    light: {
      filter: 'invert(100%) brightness(100%)',
    },
    dark: {
      filter: 'invert(23%) sepia(18%) saturate(2764%) hue-rotate(95deg) brightness(95%) contrast(96%)',
    },
  };

  const sizes = sizeClasses[size];
  const variants = variantClasses[variant];

  const LogoContent = () => (
    <div className={`flex items-center group ${className}`}>
      {showIcon && (
        <div className="group-hover:scale-105 transition">
          <Image
            src="/ecospark-logo.svg"
            alt="Ecospark Logo"
            width={sizes.width}
            height={sizes.height}
            style={{ filter: variants.filter }}
            priority
          />
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
}
