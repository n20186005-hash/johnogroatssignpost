import { useTranslations, useLocale } from 'next-intl';
import {
  ATTRACTION_SHORT_NAME,
  ATTRACTION_FULL_NAME,
  COUNTRY_NAME,
  MAPS_EMBED_SRC,
  MAPS_SHARE_URL,
  GOVT_TOURISM_URL,
} from '@/lib/site';

export default function MapEmbed() {
  const t = useTranslations('mapSection');
  const locale = useLocale();

  return (
    <section id="map" className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-5xl mx-auto">
        <h2
          className="font-display text-3xl sm:text-4xl font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('title')}
        </h2>
        <p className="mb-8 text-sm" style={{ color: 'var(--text-muted)' }}>{t('subtitle')}</p>
        <div className="w-12 h-0.5 mb-10" style={{ background: 'var(--accent)' }} />

        {/* Map */}
        <div
          className="map-container relative rounded-xl overflow-hidden"
          style={{ border: '1px solid var(--map-border)' }}
        >
          <iframe
            src={MAPS_EMBED_SRC}
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            title={`Google Maps - ${ATTRACTION_FULL_NAME}`}
          />
        </div>

        {/* Open in Google Maps */}
        <div className="mt-6 flex justify-center">
          <a
            href={MAPS_SHARE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-colors"
            style={{ background: 'var(--accent)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {t('openMaps')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>

        {/* Authoritative outbound link */}
        <p
          className="mt-8 text-sm leading-relaxed text-center max-w-3xl mx-auto"
          style={{ color: 'var(--text-muted)' }}
        >
          {locale === 'zh' ? (
            <>
              {ATTRACTION_FULL_NAME}（{ATTRACTION_SHORT_NAME}）位于{COUNTRY_NAME}。如需获取官方最新信息与区域旅游资讯，请访问{' '}
              <a
                href={GOVT_TOURISM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline font-medium"
                style={{ color: 'var(--accent)' }}
              >
                英国苏格兰官方旅游门户（VisitScotland）
              </a>
              。
            </>
          ) : (
            <>
              For official updates and regional tourism information about {ATTRACTION_SHORT_NAME} and {ATTRACTION_FULL_NAME} in {COUNTRY_NAME}, visit{' '}
              <a
                href={GOVT_TOURISM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline font-medium"
                style={{ color: 'var(--accent)' }}
              >
                Scotland&apos;s Official Tourism Portal (VisitScotland)
              </a>
              .
            </>
          )}
        </p>
      </div>
    </section>
  );
}
