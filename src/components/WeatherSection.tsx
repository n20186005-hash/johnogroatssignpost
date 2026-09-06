import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Moon,
  ShieldAlert,
  Sun,
  Thermometer,
  Waves,
  Wind,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { beaufort, fetchWeather } from '@/lib/weather';
import type { DayWeather, WeatherData } from '@/lib/weather';

type Zone = 'dress' | 'play' | 'gear';

/* ---------- condition mapping ---------- */

function descKey(code: number): string {
  if (code === 0) return 'd_clear';
  if (code === 1) return 'd_mainlyClear';
  if (code === 2) return 'd_partlyCloudy';
  if (code === 3) return 'd_overcast';
  if (code === 45 || code === 48) return 'd_fog';
  if (code >= 51 && code <= 57) return 'd_drizzle';
  if (code >= 61 && code <= 67) return 'd_rain';
  if (code >= 71 && code <= 77) return 'd_snow';
  if (code >= 80 && code <= 82) return 'd_rainShowers';
  if (code >= 85 && code <= 86) return 'd_snowShowers';
  if (code >= 95) return 'd_thunderstorm';
  return 'd_overcast';
}

function codeIcon(code: number, isDay: boolean): LucideIcon {
  if (code === 0) return isDay ? Sun : Moon;
  if (code === 1) return CloudSun;
  if (code === 2 || code === 3) return Cloud;
  if (code >= 45 && code < 51) return CloudFog;
  if (code >= 51 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 77) return CloudSnow;
  if (code >= 80 && code <= 82) return CloudRain;
  if (code >= 85 && code <= 86) return CloudSnow;
  return CloudLightning;
}

function fmtShortDate(dateStr: string, locale: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  const localeTag = locale === 'zh' ? 'zh-CN' : 'en-GB';
  const weekday = new Intl.DateTimeFormat(localeTag, { weekday: 'short' }).format(d);
  const dayNum = new Intl.DateTimeFormat(localeTag, { day: 'numeric' }).format(d);
  const month = new Intl.DateTimeFormat(localeTag, { month: 'short' }).format(d);
  return `${weekday} ${month} ${dayNum}`;
}

const temp = (v: number | null): string => (v === null ? '—' : `${Math.round(v)}°C`);

const cleanNull = (v: number | null): number | null =>
  v === null || !Number.isFinite(v) ? null : v;

/* ---------- advice logic ---------- */

type AdviceSet = Record<Zone, string[]> & { risks: string[] };

function push(list: string[], key: string) {
  if (!list.includes(key)) list.push(key);
}

function buildAdvice(
  day: DayWeather,
  cur: WeatherData['current'],
  sea: WeatherData['sea'],
  bf: number
): AdviceSet {
  const advice: AdviceSet = { risks: [], dress: [], play: [], gear: [] };
  const code = day.code;
  const max = cleanNull(day.max);
  const min = cleanNull(day.min);
  const range = max !== null && min !== null ? max - min : null;
  const rainP = cleanNull(day.precip) ?? 0;
  const uv = cleanNull(day.uv) ?? 0;
  const sst = cleanNull(sea?.seaTemp ?? null);
  const wave = cleanNull(sea?.waveMax ?? sea?.waveHeight ?? null);
  const fallbackT = cur?.temperature ?? null;

  const drizzle = code >= 51 && code <= 57;
  const rain = (code >= 61 && code <= 67) || (code >= 80 && code <= 82);
  const snow = (code >= 71 && code <= 77) || (code >= 85 && code <= 86);
  const fog = code === 45 || code === 48;
  const thunder = code >= 95;
  const heavyRain = code === 63 || code === 64 || code === 65 || code === 82;
  const precipActive = drizzle || rain || snow || thunder;
  const warmest = max ?? fallbackT ?? 0;

  /* ---- risks (shown first, red) ---- */
  if (thunder) push(advice.risks, 'risk_thunder');
  else if (heavyRain) push(advice.risks, 'risk_heavyRain');
  if (fog) push(advice.risks, 'risk_fog');
  if (bf >= 7) push(advice.risks, 'risk_gale');
  else if (wave !== null && wave >= 1.8) push(advice.risks, 'risk_wave');
  if ((min ?? 9) <= 0) push(advice.risks, 'risk_ice');
  if (warmest >= 33) push(advice.risks, 'risk_heat');

  /* ---- dress ---- */
  if (!thunder && (precipActive || rainP >= 60) && warmest <= 25) {
    push(advice.dress, 'dress_rain');
  }
  if (snow && min !== null && min <= 0) push(advice.dress, 'dress_cold');
  else if (max !== null && max <= 8) push(advice.dress, 'dress_cold');
  else if (warmest >= 32) push(advice.dress, 'dress_hot');
  if (range !== null && range > 8 && !(max !== null && max <= 8)) {
    push(advice.dress, 'dress_range');
  }

  /* ---- play ---- */
  if (code <= 1) {
    if (warmest >= 32) push(advice.play, 'play_heat');
    else push(advice.play, 'play_fair');
  } else if (code === 2 || code === 3) {
    if (code === 3) push(advice.play, 'play_cloudy');
    else push(advice.play, 'play_fair');
  }

  if (fog) push(advice.play, 'play_fog');
  if (thunder) push(advice.play, 'play_storm');
  else if (drizzle) push(advice.play, 'play_drizzle');
  else if (rain) push(advice.play, 'play_rain');
  else if (!precipActive && rainP >= 60) push(advice.play, 'play_rainP');
  if (snow && !thunder) push(advice.play, 'play_snow');

  if (!thunder && bf >= 5 && bf <= 6) push(advice.play, 'play_wind');
  if (bf < 7 && wave !== null && wave >= 1.2 && wave < 1.8) {
    push(advice.play, 'play_seaWave');
  }
  if (sst !== null && sst <= 14) push(advice.play, 'play_seaCool');

  /* ---- gear ---- */
  if (uv >= 5) push(advice.gear, 'gear_sun');
  if (warmest >= 32) push(advice.gear, 'gear_hydrate');
  if (thunder || heavyRain) push(advice.gear, 'gear_raincoat');
  else if (rain && bf >= 5) push(advice.gear, 'gear_raincoat');
  else if (drizzle || rain || rainP >= 60) push(advice.gear, 'gear_umbrella');
  if (bf >= 5 && bf <= 6 && !thunder && !heavyRain) push(advice.gear, 'gear_hatWind');
  if (max !== null && max <= 8) push(advice.gear, 'gear_warm');
  else if (snow) push(advice.gear, 'gear_warm');
  if (fog) push(advice.gear, 'gear_bright');

  return advice;
}

/* ---------- component ---------- */

export default async function WeatherSection() {
  const [locale, weather] = await Promise.all([getLocale(), fetchWeather()]);
  const t = await getTranslations('weather');

  const tKey = (k: string) => t(k);

  const today = weather?.daily[0] ?? null;
  const cur = weather?.current ?? null;
  const sea = weather?.sea ?? null;

  let advice: AdviceSet | null = null;
  if (today) {
    const windKm = cleanNull(today.wind ?? null) ?? cur?.windSpeed ?? null;
    advice = buildAdvice(today, cur, sea, beaufort(windKm));
  }

  const CurrentIcon = cur ? codeIcon(cur.weatherCode, cur.isDay) : Cloud;

  return (
    <section className="section-padding" id="weather">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-3xl mb-10">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-3">{t('title')}</h2>
          <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {t('subtitle')}
          </p>
        </div>

        {!weather || weather.daily.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('unavailable')}
          </p>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,370px)_1fr]">
              {/* current conditions */}
              {cur && (
                <article
                  className="rounded-2xl p-6 self-start"
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                >
                  <p
                    className="mb-5 text-xs uppercase tracking-widest font-semibold"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {t('currentHeading')}
                  </p>

                  <div className="flex items-center gap-4">
                    <CurrentIcon size={44} strokeWidth={1.5} aria-hidden="true" />
                    <p className="font-display font-bold" style={{ fontSize: '2.6rem', lineHeight: 1 }}>
                      {temp(cur.temperature)}
                    </p>
                  </div>
                  <p className="mt-3 text-base font-medium">{tKey(descKey(cur.weatherCode))}</p>

                  <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <dt className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                        <Thermometer size={14} strokeWidth={2} aria-hidden="true" />
                        {t('feelsLike')}
                      </dt>
                      <dd className="mt-0.5 font-semibold">{temp(cur.apparent)}</dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                        <Droplets size={14} strokeWidth={2} aria-hidden="true" />
                        {t('humidity')}
                      </dt>
                      <dd className="mt-0.5 font-semibold">
                        {cur.humidity === null ? '—' : `${Math.round(cur.humidity)}%`}
                      </dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                        <Wind size={14} strokeWidth={2} aria-hidden="true" />
                        {t('windSpeedLabel')}
                      </dt>
                      <dd className="mt-0.5 font-semibold">
                        {cur.windSpeed === null
                          ? '—'
                          : `${Math.round(cur.windSpeed)} km/h`}
                        {cur.windGusts !== null && (
                          <span
                            className="block font-normal"
                            style={{ color: 'var(--text-tertiary, var(--text-secondary))' }}
                          >
                            {t('gustsLabel')}: {Math.round(cur.windGusts)} km/h
                          </span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                        <Droplets size={14} strokeWidth={2} aria-hidden="true" />
                        {t('rainChanceToday')}
                      </dt>
                      <dd className="mt-0.5 font-semibold">
                        {today && today.precip !== null ? `${today.precip}%` : '—'}
                      </dd>
                    </div>
                    {sea?.seaTemp !== null && sea?.seaTemp !== undefined && (
                      <div>
                        <dt className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                          <Thermometer size={14} strokeWidth={2} aria-hidden="true" />
                          {t('seaTempLabel')}
                        </dt>
                        <dd className="mt-0.5 font-semibold">{temp(sea.seaTemp)}</dd>
                      </div>
                    )}
                    {sea?.waveHeight !== null && sea?.waveHeight !== undefined && (
                      <div>
                        <dt className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                          <Waves size={14} strokeWidth={2} aria-hidden="true" />
                          {t('waveLabel')}
                        </dt>
                        <dd className="mt-0.5 font-semibold">
                          {sea.waveHeight === null ? '—' : `${sea.waveHeight.toFixed(1)} m`}
                        </dd>
                      </div>
                    )}
                  </dl>

                  {sea && (
                    <p
                      className="mt-4 text-xs italic"
                      style={{ color: 'var(--text-tertiary, var(--text-secondary))' }}
                    >
                      {t('seaNote')}
                    </p>
                  )}
                </article>
              )}

              {/* 7-day outlook */}
              <div
                className="rounded-2xl p-5 sm:p-6"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
              >
                <p
                  className="mb-2 text-xs uppercase tracking-widest font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {t('outlookHeading')}
                </p>
                <ul>
                  {weather.daily.map((day, i) => {
                    const Icon = codeIcon(day.code, true);
                    return (
                      <li
                        key={day.date}
                        className="py-3"
                        style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-color)' }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-20 sm:w-28 shrink-0 text-sm font-semibold whitespace-nowrap">
                            {fmtShortDate(day.date, locale)}
                          </span>
                          <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                          <p
                            className="min-w-0 flex-1 text-sm truncate"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {tKey(descKey(day.code))}
                          </p>
                          <span className="text-sm sm:text-base font-semibold whitespace-nowrap">
                            {temp(day.max)}
                          </span>
                          <span
                            className="hidden sm:inline text-sm whitespace-nowrap"
                            style={{ color: 'var(--text-tertiary, var(--text-secondary))' }}
                          >
                            {temp(day.min)}
                          </span>
                        </div>
                        <div
                          className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 pl-9 sm:pl-[7.6rem] text-xs"
                          style={{ color: 'var(--text-tertiary, var(--text-secondary))' }}
                        >
                          {day.precip !== null && (
                            <span className="inline-flex items-center gap-1">
                              <Droplets size={12} strokeWidth={2} aria-hidden="true" />
                              {day.precip}%
                            </span>
                          )}
                          {day.wind !== null && (
                            <span className="inline-flex items-center gap-1">
                              <Wind size={12} strokeWidth={2} aria-hidden="true" />
                              {Math.round(day.wind)} km/h
                            </span>
                          )}
                          {day.uv !== null && (
                            <span className="inline-flex items-center gap-1">
                              <Sun size={12} strokeWidth={2} aria-hidden="true" />
                              UV {Math.round(day.uv)}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* smart advice card */}
            {advice && (
              <div
                className="mt-6 rounded-2xl p-5 sm:p-6"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
              >
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h3 className="font-display text-lg sm:text-xl font-semibold">
                    {t('adviceTitle')}
                  </h3>
                  {today && (
                    <p
                      className="text-sm whitespace-nowrap"
                      style={{ color: 'var(--text-tertiary, var(--text-secondary))' }}
                    >
                      {fmtShortDate(today.date, locale)}
                    </p>
                  )}
                </div>

                {advice.risks.length > 0 ? (
                  <div
                    className="rounded-xl p-4 mb-6"
                    style={{
                      background: 'rgba(229,72,77,0.08)',
                      border: '1px solid rgba(229,72,77,0.35)',
                      color: '#d14a52',
                    }}
                  >
                    <p className="flex items-center gap-2 text-sm font-semibold mb-1.5">
                      <ShieldAlert size={16} strokeWidth={2} aria-hidden="true" />
                      {t('riskTitle')}
                    </p>
                    <ul className="space-y-1 text-sm">
                      {advice.risks.map((k) => (
                        <li key={k}>{tKey(k)}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p
                    className="flex items-center gap-2 rounded-xl px-4 py-3 mb-6 text-sm"
                    style={{ background: 'var(--bg-secondary)' }}
                  >
                    <ShieldAlert size={15} strokeWidth={2} aria-hidden="true" />
                    {t('noRisk')}
                  </p>
                )}

                <div
                  className="grid gap-6"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
                >
                  {(
                    [
                      ['dress', t('zoneDress')],
                      ['play', t('zonePlay')],
                      ['gear', t('zoneGear')],
                    ] as [Zone, string][]
                  ).map(([zone, label]) =>
                    advice[zone].length === 0 ? null : (
                      <div key={zone}>
                        <p
                          className="mb-2 text-xs uppercase tracking-widest font-semibold"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {label}
                        </p>
                        <ul className="space-y-1.5 text-sm leading-relaxed">
                          {advice[zone].map((k) => (
                            <li key={k} className="flex gap-2">
                              <span className="shrink-0 mt-[0.55em] w-1.5 h-1.5 rounded-full self-start" style={{ background: 'var(--accent)' }} />
                              <span>{tKey(k)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
