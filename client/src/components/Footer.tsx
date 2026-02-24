import { Linkedin, Github, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const SOCIAL_LINKS = [
  { href: 'https://www.linkedin.com/in/dynielle-ryan-1a4267250/', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://github.com/DynielleRyan/mic-mirror', icon: Github, label: 'GitHub' },
  { href: 'https://ryandev-78npq.sevalla.app/', icon: Globe, label: 'Portfolio' },
];

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn('border-t border-border bg-background py-6', className)}>
      <div className="mx-auto max-w-lg px-4 text-center">
        <p className="text-sm text-muted-foreground">
          © {currentYear} Dynielle Ryan. All rights reserved.
        </p>
        <div className="mt-3 flex justify-center gap-5">
          {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label={label}
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
