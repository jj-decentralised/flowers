const Astronomy = require('astronomy-engine');

const SINGAPORE = { lat: 1.3521, lng: 103.8198, name: 'Singapore' };

const VYSHNAVI = {
  name: 'Vyshnavi',
  birthYear: 1995,
  birthMonth: 11,
  birthDay: 29,
  birthHour: 12
};

const BRIGHT_STARS = [
  { name: 'Sirius', ra: 6.752, dec: -16.716 },
  { name: 'Canopus', ra: 6.399, dec: -52.696 },
  { name: 'Rigel', ra: 5.242, dec: -8.202 },
  { name: 'Betelgeuse', ra: 5.919, dec: 7.407 },
  { name: 'Vega', ra: 18.616, dec: 38.784 },
  { name: 'Altair', ra: 19.846, dec: 8.868 },
  { name: 'Spica', ra: 13.420, dec: -11.161 },
  { name: 'Antares', ra: 16.490, dec: -26.432 },
  { name: 'Pollux', ra: 7.755, dec: 28.026 },
  { name: 'Fomalhaut', ra: 22.962, dec: -29.622 },
  { name: 'Deneb', ra: 20.690, dec: 45.280 },
  { name: 'Regulus', ra: 10.139, dec: 11.967 }
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEATHER_LABELS = {
  0: 'clear skies', 1: 'a gentle haze', 2: 'soft clouds', 3: 'overcast light',
  45: 'morning mist', 48: 'silver fog', 51: 'light drizzle', 53: 'steady rain',
  55: 'heavy rain', 61: 'rain', 63: 'rain', 65: 'rain', 80: 'showers', 95: 'thunder'
};

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function getVisibleStars(time, observer) {
  const visibleStars = [];
  for (const star of BRIGHT_STARS) {
    const h = Astronomy.Horizon(time, observer, star.ra, star.dec, 'normal');
    if (h.altitude > 5) {
      visibleStars.push({
        name: star.name,
        altitude: h.altitude,
        azimuth: h.azimuth
      });
    }
  }
  visibleStars.sort((a, b) => b.altitude - a.altitude);
  return visibleStars;
}

function getBirthSkyContext() {
  const birth = new Date(
    VYSHNAVI.birthYear + '-' +
    String(VYSHNAVI.birthMonth + 1).padStart(2, '0') + '-' +
    String(VYSHNAVI.birthDay).padStart(2, '0') + 'T' +
    String(VYSHNAVI.birthHour).padStart(2, '0') + ':00:00+08:00'
  );
  const time = new Astronomy.AstroTime(birth);
  const observer = new Astronomy.Observer(SINGAPORE.lat, SINGAPORE.lng, 15);
  const visibleStars = getVisibleStars(time, observer);
  const moonPhase = Astronomy.Illumination(Astronomy.Body.Moon, time);

  return {
    dominantStar: visibleStars[0] || null,
    starCount: visibleStars.length,
    moonPhase: moonPhase.phase_fraction,
    dateLabel: '29 December 1995'
  };
}

function isVyshnaviBirthday(now) {
  return now.getMonth() === VYSHNAVI.birthMonth && now.getDate() === VYSHNAVI.birthDay;
}

function getSkyContext(now) {
  const time = new Astronomy.AstroTime(now);
  const observer = new Astronomy.Observer(SINGAPORE.lat, SINGAPORE.lng, 15);
  const visibleStars = getVisibleStars(time, observer);
  const moonPhase = Astronomy.Illumination(Astronomy.Body.Moon, time);
  const moonEquator = Astronomy.Equator(Astronomy.Body.Moon, time, observer, true, true);
  const moonHorizon = Astronomy.Horizon(
    time, observer, moonEquator.ra, moonEquator.dec, 'normal'
  );

  const bodies = ['Sun', 'Moon', 'Venus', 'Jupiter', 'Mars', 'Saturn'].map((name) => {
    const body = Astronomy.Body[name];
    const equ = Astronomy.Equator(body, time, observer, true, true);
    const hor = Astronomy.Horizon(time, observer, equ.ra, equ.dec, 'normal');
    return {
      name,
      altitude: hor.altitude,
      azimuth: hor.azimuth,
      visible: hor.altitude > 0
    };
  });

  return {
    visibleStars,
    starCount: visibleStars.length,
    dominantStar: visibleStars[0] || null,
    moonPhase: moonPhase.phase_fraction,
    moonIllumination: moonPhase.phase_fraction,
    moonVisible: moonHorizon.altitude > 0,
    moonAltitude: moonHorizon.altitude,
    bodies,
    isNight: !bodies[0].visible
  };
}

async function fetchWeather() {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + SINGAPORE.lat +
    '&longitude=' + SINGAPORE.lng +
    '&current=temperature_2m,relative_humidity_2m,weather_code,cloud_cover,precipitation,is_day,wind_speed_10m' +
    '&daily=sunrise,sunset&timezone=Asia%2FSingapore&forecast_days=1';

  try {
    const res = await fetch(url);
    return await res.json();
  } catch {
    return {
      current: {
        temperature_2m: 28,
        relative_humidity_2m: 80,
        weather_code: 2,
        cloud_cover: 45,
        precipitation: 0,
        is_day: 1,
        wind_speed_10m: 8
      }
    };
  }
}

function buildContext(weather, now, birthSky) {
  const sky = getSkyContext(now);
  const day = now.getDay();
  const dateKey = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');
  const birthday = isVyshnaviBirthday(now);

  const seedString = [
    VYSHNAVI.name,
    VYSHNAVI.birthDay,
    VYSHNAVI.birthMonth + 1,
    VYSHNAVI.birthYear,
    birthSky.dominantStar ? birthSky.dominantStar.name : 'none',
    Math.round(birthSky.moonPhase * 100),
    dateKey,
    day,
    weather.current.temperature_2m,
    weather.current.weather_code,
    weather.current.cloud_cover,
    weather.current.precipitation,
    sky.starCount,
    sky.dominantStar ? sky.dominantStar.name : 'none',
    Math.round(sky.moonPhase * 100),
    sky.dominantStar ? Math.round(sky.dominantStar.azimuth) : 0,
    birthday ? 'birthday' : 'ordinary'
  ].join('|');

  return {
    now,
    dateKey,
    dayName: DAYS[day],
    dayOfMonth: now.getDate(),
    month: now.getMonth(),
    monthName: MONTHS[now.getMonth()],
    seed: hashString(seedString),
    weather: weather.current,
    sky,
    birthSky,
    isBirthday: birthday,
    age: birthday ? now.getFullYear() - VYSHNAVI.birthYear : null
  };
}

function weatherPhrase(code) {
  if (WEATHER_LABELS[code]) return WEATHER_LABELS[code];
  if (code >= 61 && code <= 67) return 'rain';
  if (code >= 80 && code <= 82) return 'showers';
  if (code >= 1 && code <= 3) return 'soft clouds';
  return 'the air above Singapore';
}

function moonPhrase(fraction) {
  if (fraction < 0.08) return 'a new moon';
  if (fraction < 0.28) return 'a waxing crescent';
  if (fraction < 0.45) return 'a gentle half-moon';
  if (fraction < 0.58) return 'a waxing moon';
  if (fraction < 0.72) return 'a full moon';
  if (fraction < 0.85) return 'a waning moon';
  return 'a quiet crescent';
}

function buildCaption(ctx) {
  const w = ctx.weather;
  const sky = ctx.sky;
  const birth = ctx.birthSky;
  const lines = [];

  if (ctx.isBirthday) {
    lines.push(
      'Happy birthday, ' + VYSHNAVI.name + ' — this golden bloom is yours alone today'
    );
    lines.push(
      'woven from the sky above Singapore on the day you arrived, ' + birth.dateLabel +
      ', when ' + (birth.dominantStar ? birth.dominantStar.name : 'the stars') +
      ' stood overhead'
    );
  } else {
    lines.push(
      'Drawn for ' + VYSHNAVI.name + ' on ' + ctx.dayName + ' — ' +
      weatherPhrase(w.weather_code) + ' at ' + Math.round(w.temperature_2m) + '°C'
    );
  }

  if (sky.dominantStar) {
    lines.push(
      'with ' + sky.dominantStar.name + ' overhead, petals leaning toward ' +
      (sky.dominantStar.azimuth < 90 || sky.dominantStar.azimuth > 270 ? 'the east' : 'the west')
    );
  } else if (sky.isNight) {
    lines.push('under a soft Singapore night, with ' + moonPhrase(sky.moonPhase));
  } else if (!ctx.isBirthday) {
    lines.push('while ' + moonPhrase(sky.moonPhase) + ' waits beyond the daylight');
  }

  if (!ctx.isBirthday && birth.dominantStar) {
    lines.push(
      'and a quiet trace of ' + birth.dominantStar.name + ', the star that watched over your first day'
    );
  }

  const influence = [
    ctx.isBirthday ? ('BIRTHDAY · ' + ctx.age) : ctx.dayName.slice(0, 3).toUpperCase(),
    '29 · 12 · 1995',
    birth.dominantStar ? birth.dominantStar.name : 'birth star',
    Math.round(w.relative_humidity_2m) + '% humidity',
    sky.starCount + ' stars tonight'
  ].join(' · ');

  return {
    main: lines.join(', ') + '.',
    influence,
    isBirthday: ctx.isBirthday
  };
}

async function gatherFlowerContext(now = new Date()) {
  const weather = await fetchWeather();
  const birthSky = getBirthSkyContext();
  const ctx = buildContext(weather, now, birthSky);
  const caption = buildCaption(ctx);
  return { ctx, caption };
}

module.exports = {
  SINGAPORE,
  VYSHNAVI,
  MONTHS,
  gatherFlowerContext,
  buildCaption
};
