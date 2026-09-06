import { useMessages, useTranslations } from 'next-intl';
import {
  Accessibility,
  BedDouble,
  Coffee,
  Fuel,
  ShoppingBag,
  SquareParking,
} from 'lucide-react';

type ServiceItem = {
  id: string;
  title: string;
  text: string;
};

const SERVICE_META: { id: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }> }[] = [
  { id: 'toilets', icon: Accessibility },
  { id: 'parking', icon: SquareParking },
  { id: 'food', icon: Coffee },
  { id: 'accommodation', icon: BedDouble },
  { id: 'shopping', icon: ShoppingBag },
  { id: 'fuel', icon: Fuel },
];

export default function ServicesSection() {
  const t = useTranslations('services');
  const messages = useMessages() as any;
  const items = (Array.isArray(messages?.services?.items) ? messages.services.items : []) as ServiceItem[];
  if (items.length === 0) return null;

  const ordered = SERVICE_META.map((meta) => ({
    ...meta,
    item: items.find((it) => it.id === meta.id),
  })).filter(
    (x): x is { id: string; icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; item: ServiceItem } =>
      Boolean(x.item)
  );

  return (
    <section className="section-padding" id="services">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-3xl mb-10">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-3">{t('title')}</h2>
          <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {t('subtitle')}
          </p>
          <p className="mt-3 text-sm italic" style={{ color: 'var(--text-tertiary, var(--text-secondary))' }}>
            {t('note')}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map(({ id, icon: Icon, item }) => (
            <article
              key={id}
              className="rounded-2xl p-5"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="flex items-center justify-center rounded-xl w-11 h-11 shrink-0"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <Icon size={22} strokeWidth={1.8} />
                </span>
                <h3 className="font-display text-lg font-semibold leading-snug">{item.title}</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
