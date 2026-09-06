export type CurrentWeather = {
  time: string;
  temperature: number | null;
  apparent: number | null;
  humidity: number | null;
  isDay: boolean;
  weatherCode: number;
  windSpeed: number | null;
  windGusts: number | null;
  windDirection: number | null;
};

export type DayWeather = {
  date: string;
  code: number;
  max: number | null;
  min: number | null;
  precip: number | null;
  wind: number | null;
  uv: number | null;
};

export type SeaWeather = {
  time: string;
  seaTemp: number | null;
  waveHeight: number | null;
  waveMax: number | null;
  wavePeriod: number | null;
};

export type WeatherData = {
  current: CurrentWeather | null;
  daily: DayWeather[];
  sea: SeaWeather | null;
};

const API_URL = 'https://api.open-meteo.com/v1/forecast';
const PARAMS = new URLSearchParams({
  latitude: '58.6440',
  longitude: '-3.0700',
  current:
    'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m',
  daily:
    'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max',
  timezone: 'auto',
  forecast_days: '7',
});

const MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine';
const MARINE_PARAMS = new URLSearchParams({
  latitude: '58.6440',
  longitude: '-3.0700',
  hourly: 'sea_surface_temperature,wave_height,wave_period',
  timezone: 'auto',
  forecast_days: '1',
});

const num = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null;

/** Convert wind speed (km/h) to the Beaufort scale, integer 0-12. */
export function beaufort(kmh: number | null): number {
  if (kmh === null) return 0;
  const bounds = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118];
  let bf = 0;
  for (const b of bounds) {
    if (kmh >= b) bf += 1;
    else break;
  }
  return Math.min(bf, 12);
}

async function fetchMain(): Promise<{
  current: CurrentWeather | null;
  daily: DayWeather[];
}> {
  const res = await fetch(`${API_URL}?${PARAMS.toString()}`, {
    next: { revalidate: 1800 },
  });
  if (!res.ok) return { current: null, daily: [] };
  const j = (await res.json()) as Record<string, any>;
  const c = j?.current as Record<string, unknown> | undefined;
  const d = j?.daily as Record<string, unknown> | undefined;
  if (!c || !d || !Array.isArray(d.time)) return { current: null, daily: [] };

  const daily = (d.time as string[])
    .slice(0, 7)
    .map((date, i) => ({
      date: String(date),
      code: num(Array.isArray(d.weather_code) ? d.weather_code[i] : undefined) ?? 0,
      max: num(Array.isArray(d.temperature_2m_max) ? d.temperature_2m_max[i] : undefined),
      min: num(Array.isArray(d.temperature_2m_min) ? d.temperature_2m_min[i] : undefined),
      precip: num(
        Array.isArray(d.precipitation_probability_max)
          ? d.precipitation_probability_max[i]
          : undefined
      ),
      wind: num(
        Array.isArray(d.wind_speed_10m_max) ? d.wind_speed_10m_max[i] : undefined
      ),
      uv: num(Array.isArray(d.uv_index_max) ? d.uv_index_max[i] : undefined),
    }))
    .filter((x) => x.max !== null && x.min !== null);

  return {
    current: {
      time: typeof c.time === 'string' ? c.time : '',
      temperature: num(c.temperature_2m),
      apparent: num(c.apparent_temperature),
      humidity: num(c.relative_humidity_2m),
      isDay: c.is_day !== 0,
      weatherCode: num(c.weather_code) ?? 0,
      windSpeed: num(c.wind_speed_10m),
      windGusts: num(c.wind_gusts_10m),
      windDirection: num(c.wind_direction_10m),
    },
    daily,
  };
}

async function fetchSea(currentTime: string): Promise<SeaWeather | null> {
  try {
    const res = await fetch(`${MARINE_URL}?${MARINE_PARAMS.toString()}`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    const j = (await res.json()) as Record<string, any>;
    const h = j?.hourly as Record<string, unknown> | undefined;
    if (!h || !Array.isArray(h.time) || !Array.isArray(h.sea_surface_temperature)) {
      return null;
    }
    const times = h.time as string[];
    const temps = (h.sea_surface_temperature as unknown[]).map(num);
    const waves = Array.isArray(h.wave_height) ? (h.wave_height as unknown[]).map(num) : [];
    const periods = Array.isArray(h.wave_period) ? (h.wave_period as unknown[]).map(num) : [];

    // Match the hourly row closest to the current land-weather time.
    let best = 0;
    let bestDiff = Infinity;
    const curMs = Date.parse(currentTime) || 0;
    times.forEach((tt, i) => {
      const diff = Math.abs(Date.parse(tt) - curMs);
      if (Number.isFinite(diff) && diff < bestDiff) {
        bestDiff = diff;
        best = i;
      }
    });

    const finiteMax = Math.max(...waves.filter((v): v is number => v !== null));
    return {
      time: times[best] ?? '',
      seaTemp: temps[best] ?? null,
      waveHeight: waves[best] ?? null,
      waveMax: Number.isFinite(finiteMax) ? finiteMax : null,
      wavePeriod: periods[best] ?? null,
    };
  } catch {
    return null;
  }
}

export async function fetchWeather(): Promise<WeatherData | null> {
  try {
    const main = await fetchMain();
    const sea =
      main.current && main.current.time ? await fetchSea(main.current.time) : null;
    return { ...main, sea };
  } catch {
    return null;
  }
}
