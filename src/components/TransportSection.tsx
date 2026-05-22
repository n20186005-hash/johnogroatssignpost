'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

export default function TransportSection() {
  const t = useTranslations('transport');

  const transportOptions = [
    {
      key: 'fromCenter',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 22h20L12 2z"/>
          <circle cx="12" cy="15" r="3"/>
        </svg>
      ),
    },
    {
      key: 'fromAirport',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21.5 4c0 0-2 .5-3.5 2L14.5 9.5l-8.2-1.8c-.8-.2-1.6.3-1.8 1.1-.2.8.3 1.6 1.1 1.8l6.3 1.4-3.4 3.4-2.8-.7c-.6-.2-1.2.1-1.4.7-.2.6.1 1.2.7 1.4l3.5.9 1.4 3.5c.2.6.8.9 1.4.7.6-.2.9-.8.7-1.4l-.7-2.8 3.4-3.4 1.4 6.3c.2.8 1 1.3 1.8 1.1.8-.2 1.3-1 1.1-1.8z"/>
        </svg>
      ),
    },
    {
      key: 'fromStation',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2"/>
          <path d="M8 21h8"/>
          <path d="M12 17v4"/>
        </svg>
      ),
    },
    {
      key: 'publicTransport',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="3" width="16" height="16" rx="2"/>
          <path d="M4 11h16"/>
          <circle cx="8" cy="15" r="1"/>
          <circle cx="16" cy="15" r="1"/>
        </svg>
      ),
    },
    {
      key: 'walking',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3 7h-6l3-7z"/>
          <path d="M12 9v13"/>
          <path d="M8 17l4 4 4-4"/>
          <path d="M5 22h14"/>
        </svg>
      ),
    },
    {
      key: 'driving',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 3v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3"/>
          <path d="M14 6h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-6"/>
          <path d="M4 20h16"/>
          <circle cx="7" cy="17" r="2"/>
          <circle cx="17" cy="17" r="2"/>
        </svg>
      ),
    },
  ];

  return (
    <section className="section-padding">
      <div className="max-w-5xl mx-auto">
        <h2
          className="font-display text-3xl sm:text-4xl font-semibold mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('title')}
        </h2>
        <div className="w-12 h-0.5 mb-10" style={{ background: 'var(--accent)' }} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {transportOptions.map((option) => (
            <TransportCard
              key={option.key}
              icon={option.icon}
              title={t(option.key as any)}
              description={t(`${option.key}Desc` as any)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TransportCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div
      className="rounded-xl p-5 flex gap-4"
      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
    >
      <div
        className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
        style={{ background: 'var(--accent)', color: 'white' }}
      >
        {icon}
      </div>
      <div>
        <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{description}</p>
      </div>
    </div>
  );
}
