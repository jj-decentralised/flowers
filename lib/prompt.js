const { VYSHNAVI } = require('./context');

const ART_STYLES = [
  {
    id: 'ukiyo-e',
    label: 'Ukiyo-e',
    region: 'Japan',
    flowers: 'cherry blossom branches, camellias, and chrysanthemums',
    style: 'Japanese ukiyo-e woodblock print aesthetic with bold flowing ink outlines, flat planes of color, dramatic asymmetry, and generous empty space. Hokusai and Hiroshige botanical influence, visible woodgrain texture, crisp edges meeting soft watercolor washes',
    palette: 'vermillion red, indigo blue, pale sakura pink, warm ochre, deep pine green'
  },
  {
    id: 'mughal',
    label: 'Mughal miniature',
    region: 'India',
    flowers: 'marigolds, jasmine garlands, and lotus buds',
    style: 'Mughal miniature painting with jewel-like saturation, fine squirrel-hair brush detail, flattened decorative depth, delicate gold leaf accents, ornate petal geometry, and luminous layered gouache on aged parchment',
    palette: 'saffron gold, ruby crimson, emerald green, lapis blue, ivory white'
  },
  {
    id: 'dutch-golden',
    label: 'Dutch Golden Age',
    region: 'Netherlands',
    flowers: 'tulips, roses, and striped carnations',
    style: 'Dutch Golden Age floral still life in the manner of Rachel Ruysch and Jan Davidsz de Heem — dark moody background, theatrical chiaroscuro, hyper-detailed petals catching a single shaft of light, dewdrops like glass, opulent and dramatic',
    palette: 'deep umber black background, candlelit gold highlights, crimson, ivory, bronze green'
  },
  {
    id: 'gongbi',
    label: 'Gongbi brushwork',
    region: 'China',
    flowers: 'peonies, plum blossoms, and orchids',
    style: 'Chinese gongbi painting on silk — meticulous fine-line brushwork, mineral pigments, elegant restraint with bursts of saturated color, petals rendered with precise gradation, subtle silk weave texture visible beneath paint',
    palette: 'carmine pink, mineral green, ink black, pale silk white, muted teal'
  },
  {
    id: 'mexican-folk',
    label: 'Mexican folk art',
    region: 'Mexico',
    flowers: 'cempasúchil marigolds, zinnias, and bougainvillea',
    style: 'Mexican folk art and alebrije color spirit — fearless saturated hues, playful symmetry, hand-painted charm, slightly stylized petals, festive energy, patterns echoing Oaxacan craft and papel picado joy',
    palette: 'electric magenta, cobalt blue, sunflower yellow, hot orange, vivid lime'
  },
  {
    id: 'art-nouveau',
    label: 'Art Nouveau',
    region: 'France',
    flowers: 'irises, lilies, and climbing wisteria',
    style: 'Art Nouveau poster aesthetic in the spirit of Alphonse Mucha — sinuous organic curves, ornamental stem whiplash lines, decorative halo-like composition, elegant flowing contours, romantic fin-de-siècle glamour',
    palette: 'lavender violet, antique gold, sage green, dusty rose, soft teal'
  },
  {
    id: 'persian',
    label: 'Persian illumination',
    region: 'Iran',
    flowers: 'pomegranate blossoms, roses, and night-blooming jasmine',
    style: 'Persian illuminated manuscript style with intricate floral arabesques, repeating geometric rhythm, turquoise tile-work color logic, refined courtly elegance, flattened ornamental space and exquisite micro-detail',
    palette: 'Persian turquoise, burnt orange, rose madder, lapis, cream parchment'
  },
  {
    id: 'minhwa',
    label: 'Minhwa folk',
    region: 'Korea',
    flowers: 'peonies, magnolia, and wild camellia',
    style: 'Korean minhwa folk painting — bold simple forms, cheerful symbolic energy, flat decorative perspective, thick confident brush marks, folk charm with auspicious abundance, paper with soft handmade warmth',
    palette: 'coral red, indigo, mustard yellow, pine green, clean paper white'
  },
  {
    id: 'impressionist',
    label: 'Impressionist',
    region: 'France',
    flowers: 'water lilies, roses, and loose wildflowers',
    style: 'French Impressionist oil-and-watercolor hybrid in the spirit of Monet and Berthe Morisot — broken dappled color, visible lively brushstrokes, light vibrating across petals, atmosphere over precision, sun-flecked and breathing',
    palette: 'violet shadow, sunlit yellow, cerulean blue, rose pink, fresh leaf green'
  },
  {
    id: 'tropicalia',
    label: 'Tropicália modern',
    region: 'Brazil',
    flowers: 'bird of paradise, hibiscus, and heliconia',
    style: 'Brazilian tropical modernism — audacious scale, hot sun-drenched color, graphic bold silhouettes, contemporary South American vitality, lush oversized blooms, celebratory and unapologetically vivid',
    palette: 'magenta fuchsia, tropical orange, palm green, electric yellow, deep coral'
  },
  {
    id: 'thai-mural',
    label: 'Thai temple mural',
    region: 'Thailand',
    flowers: 'lotus, frangipani, and golden orchids',
    style: 'Thai temple mural painting — luminous gold leaf glow, emerald and ruby flat color, graceful elongated petals, spiritual serenity with ornate decorative rhythm, aged plaster warmth beneath pigments',
    palette: 'temple gold, lotus pink, jade green, sunset orange, deep burgundy'
  },
  {
    id: 'batik',
    label: 'Batik textile',
    region: 'Indonesia',
    flowers: 'tropical orchids, frangipani, and hibiscus',
    style: 'Indonesian batik textile art influence — wax-resist crackle patterns in the background, flowing organic motifs, handcrafted dye irregularity, floral forms emerging from intricate indigo and sienna pattern fields',
    palette: 'indigo navy, terracotta, warm cream, forest green, wax-resist white'
  },
  {
    id: 'scottish-botanical',
    label: 'Scottish botanical',
    region: 'Scotland',
    flowers: 'wild roses, thistles, and bluebells',
    style: 'Scottish botanical illustration in the tradition of Patrick Syme and antique herbarium plates — precise scientific beauty, hand-tinted engraving feel, crisp specimen clarity, aged cream paper, elegant Latin-garden authority',
    palette: 'thistle purple, heather pink, slate blue, antique cream, sage'
  },
  {
    id: 'ethiopian-icon',
    label: 'Ethiopian icon',
    region: 'Ethiopia',
    flowers: 'stylized lilies and symbolic wheat sheaves with wild blooms',
    style: 'Ethiopian Orthodox icon painting influence — stylized flat forms, bold spiritual symbolism, hand-ground pigment richness, frontal sacred composition, decorative honesty, ancient hand-crafted intensity',
    palette: 'deep crimson, forest green, gold ochre, midnight blue, warm skin-tone cream'
  },
  {
    id: 'australian-ochre',
    label: 'Australian ochre',
    region: 'Australia',
    flowers: 'waratah, banksia, and native eucalyptus blossoms',
    style: 'Contemporary Australian botanical art with Aboriginal earth-pigment palette — ochre dusted textures, sun-baked land warmth, bold native flower architecture, ancient landscape colors meeting modern fine-art florals',
    palette: 'red ochre, burnt sienna, eucalyptus green, sun-bleached gold, charcoal'
  },
  {
    id: 'russian-lubok',
    label: 'Russian lubok',
    region: 'Russia',
    flowers: 'sunflowers, cornflowers, and garden roses',
    style: 'Russian lubok folk print aesthetic — fairytale boldness, simplified graphic petals, strong black outlines, folk narrative charm, hand-colored print texture, hearty and vivid peasant garden grandeur',
    palette: 'folk red, golden yellow, cornflower blue, black ink, warm cream'
  }
];

function pickVariation() {
  return ART_STYLES[Math.floor(Math.random() * ART_STYLES.length)];
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
      palette: 'stormy violet, rain-silver, deep teal, petal blush',
      light: 'misty monsoon atmosphere, rain-softened highlights, humid luminous air'
    };
  }

  if (cloudy) {
    return {
      palette: 'dusty rose, soft lavender, pearl grey, muted sage',
      light: 'diffused overcast glow, even moody light, gentle atmospheric depth'
    };
  }

  if (clear && temp >= 30) {
    return {
      palette: 'sun-flare coral, amber gold, hot cream, tropical green',
      light: 'bright Singapore sun, sharp warm highlights, radiant petal edges'
    };
  }

  if (ctx.sky.isNight) {
    return {
      palette: 'midnight indigo, moonlit silver, deep plum, star-white petals',
      light: 'nocturnal rim light, moon-glow on petals, intimate night-bloom luminosity'
    };
  }

  return {
    palette: 'warm apricot, honey gold, fresh green, soft cream',
    light: 'natural daylight, gentle side light, open airy warmth'
  };
}

function skyDetail(ctx) {
  const parts = [];
  const sky = ctx.sky;
  const birth = ctx.birthSky;

  if (sky.dominantStar) {
    const direction = sky.dominantStar.azimuth < 90 || sky.dominantStar.azimuth > 270
      ? 'east' : 'west';
    parts.push('stems subtly leaning toward the ' + direction + ', echoing ' + sky.dominantStar.name + ' above Singapore');
  }

  if (birth.dominantStar) {
    parts.push('a trace of ' + birth.dominantStar.name + ' warmth in accent petals, from the sky on ' + birth.dateLabel);
  }

  if (ctx.isBirthday) {
    parts.push('a golden celebratory bloom at the crown for her birthday, ' + ctx.age + ' years');
  }

  return parts.join('. ');
}

function buildRecraftPrompt(ctx, options = {}) {
  const mood = weatherMood(ctx);
  const sky = skyDetail(ctx);
  const art = options.variation || null;

  if (art) {
    return [
      'A breathtaking hand-painted flower bouquet for ' + VYSHNAVI.name + ',',
      'rendered in the ' + art.style + '.',
      'Featuring ' + art.flowers + '.',
      'Art tradition: ' + art.label + ' (' + art.region + ').',
      'Primary palette: ' + art.palette + '.',
      'Weather-infused tones: ' + mood.palette + '.',
      mood.light + '.',
      sky ? sky + '.' : '',
      'Rich saturated color, expressive artistic personality, visually striking — never dull, never grey, never generic stock illustration.',
      'Centered vertical bouquet, confident composition, museum-quality fine art floral,',
      'no text, no people, no hands, no vase, no watermark.'
    ].filter(Boolean).join(' ');
  }

  return [
    'Photorealistic hand-drawn botanical bouquet for ' + VYSHNAVI.name + ',',
    'visible ink outlines and vivid watercolor on cream paper.',
    'Palette: ' + mood.palette + '.',
    mood.light + '.',
    sky ? sky + '.' : '',
    'no text, no people, no vase, no watermark.'
  ].filter(Boolean).join(' ');
}

module.exports = { buildRecraftPrompt, pickVariation, FLOWER_VARIATIONS: ART_STYLES };
