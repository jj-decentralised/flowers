const { VYSHNAVI } = require('./context');

const FLOWER_VARIATIONS = [
  {
    id: 'roses',
    label: 'Garden roses',
    flowers: 'lush garden roses in varying stages of bloom, tight buds and open cups, velvety layered petals',
    accent: 'sprigs of baby\'s breath and soft eucalyptus'
  },
  {
    id: 'peonies',
    label: 'Soft peonies',
    flowers: 'generous blousy peonies with ruffled petals, soft crepe-paper texture, full romantic heads',
    accent: 'delicate lisianthus and fern fronds'
  },
  {
    id: 'wildflower',
    label: 'Wild meadow',
    flowers: 'loose wild meadow bouquet with cornflowers, poppies, Queen Anne\'s lace, and field grasses',
    accent: 'airy unstructured stems, gathered as if from a summer walk'
  },
  {
    id: 'tropical',
    label: 'Tropical blooms',
    flowers: 'tropical hibiscus, frangipani, and orchid sprays with glossy petals',
    accent: 'broad monstera leaves and humid Singapore greenery'
  },
  {
    id: 'tulips',
    label: 'Tulip still life',
    flowers: 'elegant cupped tulips and ranunculus in a Dutch botanical still-life manner',
    accent: 'slender stems with gentle arc, classic editorial composition'
  },
  {
    id: 'jasmine',
    label: 'Jasmine & jasmine vine',
    flowers: 'fragile white jasmine clusters, star-shaped blooms, and soft vine tendrils',
    accent: 'moonlit ivory petals with tiny golden centers'
  },
  {
    id: 'anemones',
    label: 'Anemones',
    flowers: 'moody anemones with dark centers and fine papery petals, artful negative space',
    accent: 'dusty miller and wispy dried grasses'
  },
  {
    id: 'cherry',
    label: 'Cherry blossom',
    flowers: 'delicate cherry blossom branches with scattered pink petals and budding flowers',
    accent: 'ethereal spring branches, petals drifting as if caught mid-fall'
  },
  {
    id: 'sunflower',
    label: 'Sunflower study',
    flowers: 'sunflowers with warm golden faces, slightly imperfect hand-painted petals',
    accent: 'wild oats and soft blue delphinium contrast'
  },
  {
    id: 'orchid',
    label: 'Orchid spray',
    flowers: 'graceful phalaenopsis orchid sprays with translucent petals and sculptural form',
    accent: 'minimal stems, refined Singapore tropical elegance'
  }
];

function pickVariation() {
  return FLOWER_VARIATIONS[Math.floor(Math.random() * FLOWER_VARIATIONS.length)];
}

function weatherMood(ctx) {
  const w = ctx.weather;
  const code = w.weather_code;
  const temp = w.temperature_2m;
  const rain = w.precipitation > 0 || (code >= 51 && code <= 67) || (code >= 80 && code <= 82);
  const cloudy = w.cloud_cover > 60 || code === 3;
  const clear = code === 0 || (w.cloud_cover < 25 && !rain);

  if (rain) {
    return {
      flowers: 'soft roses and peonies with gently drooping rain-kissed petals, dewdrops on leaves',
      palette: 'cool mauve, silver-grey, muted blush pink, sage green stems',
      light: 'misty overcast daylight, soft diffused shadows, humid tropical atmosphere'
    };
  }

  if (cloudy) {
    return {
      flowers: 'layered peonies, garden roses, and wildflowers in a loose romantic bouquet',
      palette: 'muted dusty rose, lavender, cream, and soft sage',
      light: 'gentle diffused window light, even soft shadows, calm overcast glow'
    };
  }

  if (clear && temp >= 30) {
    return {
      flowers: 'sun-warmed roses, hibiscus accents, and open peonies in full bloom',
      palette: 'warm coral, peach, golden amber, and honey cream petals',
      light: 'bright warm Singapore daylight, luminous highlights on petal edges'
    };
  }

  if (ctx.sky.isNight) {
    return {
      flowers: 'moonlit roses and jasmine with luminous petal centers like tiny stars',
      palette: 'deep plum, midnight blue stems, soft ivory petals with silver highlights',
      light: 'quiet moonlit ambience, subtle rim light, intimate nocturnal still life'
    };
  }

  return {
    flowers: 'hand-gathered bouquet of roses, peonies, and delicate filler blooms',
    palette: 'warm blush, soft apricot, cream, and muted green foliage',
    light: 'natural soft daylight, gentle side lighting, airy botanical warmth'
  };
}

function skyDetail(ctx) {
  const parts = [];
  const sky = ctx.sky;
  const birth = ctx.birthSky;

  if (sky.dominantStar) {
    const direction = sky.dominantStar.azimuth < 90 || sky.dominantStar.azimuth > 270
      ? 'east' : 'west';
    parts.push('stems subtly leaning toward the ' + direction + ', inspired by ' + sky.dominantStar.name + ' overhead in Singapore tonight');
  }

  if (birth.dominantStar) {
    parts.push('a whisper of ' + birth.dominantStar.name + ' warmth in the coral-red accent petals, echoing the sky on ' + birth.dateLabel + ' when ' + VYSHNAVI.name + ' was born');
  }

  if (ctx.isBirthday) {
    parts.push('one golden celebratory rose at the crown of the bouquet for her birthday, ' + ctx.age + ' years, with delicate star-like sparkles in the center');
  }

  if (sky.starCount >= 5) {
    parts.push(sky.starCount + ' blooms echoing the stars visible above Singapore');
  }

  return parts.join('. ');
}

function seasonalNote(ctx) {
  const month = ctx.month;
  const notes = [
    'early winter softness with hellebore accents',
    'late winter tenderness, pale blush blooms',
    'spring awakening, fresh green stems and young petals',
    'spring abundance, airy garden flowers',
    'late spring fullness, generous layered petals',
    'early summer warmth, open romantic roses',
    'tropical summer lushness, humid botanical richness',
    'high summer brightness, sun-touched coral tones',
    'late summer golden warmth',
    'early autumn muted elegance',
    'autumn softness, warm fading petals',
    'deep winter intimacy, velvety rose tones for December'
  ];
  return notes[month];
}

function buildRecraftPrompt(ctx, options = {}) {
  const mood = weatherMood(ctx);
  const sky = skyDetail(ctx);
  const season = seasonalNote(ctx);
  const variation = options.variation || null;
  const flowers = variation
    ? variation.flowers + ', with ' + variation.accent
    : mood.flowers;

  return [
    'Photorealistic hand-drawn botanical illustration of a romantic flower bouquet composed for ' + VYSHNAVI.name + ',',
    'fine art still life combining realistic flower anatomy with visible hand-sketched ink outlines, delicate watercolor washes, and soft colored pencil shading on textured cream watercolor paper.',
    flowers + '.',
    'Color palette: ' + mood.palette + '.',
    mood.light + '.',
    season + '.',
    sky ? sky + '.' : '',
    'Centered vertical bouquet composition, natural gathered stems, organic imperfect petals with layered translucency, subtle paper grain and faint pencil construction lines,',
    'intimate sentimental editorial botanical journal aesthetic, shallow depth of field, warm romantic mood,',
    'cream off-white background, no text, no people, no hands, no vase, no watermark.'
  ].filter(Boolean).join(' ');
}

module.exports = { buildRecraftPrompt, pickVariation, FLOWER_VARIATIONS };
