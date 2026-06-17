// v4-data.js — travel daemon + weather, demo content (generic, no private data).
(function (root) {

  // weather drives the hanging pet (WeatherOpen). state = sky/wind key.
  const WEATHER = {
    state: 'rain',           // sun | cloud | rain | storm | snow | fog | frost | breeze | gale | typhoon
    moonState: 'moon_full',  // night-mode fallback glyph
    place: 'demo city', temp: '22°C', cond: 'rain · night',
    detail: 'humidity 86% · wind 2 m/s', moonrise: 'moonrise 22:40',
  };

  const TRAVEL = {
    status: 'home',                       // away | home
    daemon: 'sdk daemon · every 6h · destination chosen by the agent',
    next: 'next departure 09:00',
    current: {
      place: '庞贝', placeEn: 'POMPEII',
      era: 'AD 79 · late August',
      sub: 'the last dusk before Vesuvius',
      depart: '03:00', back: '03:42',
      scene: 'pompeii',
      note: '街角面包房的炉子还热着,圆面包压进模子里,要等天亮才卖。广场上有人为明天的选举刷标语,蘸的红颜料很新。没有人抬头看山——山只是山,绿的,长葡萄的。',
      brought: {
        icon: 'amphora',
        name: 'a shard of fish-sauce glaze',
        where: 'placed on the desk',
        line: 'salt and ferment still clinging to the rim — a demo souvenir.',
      },
    },
    shelf: [
      { icon: 'shell',   place: 'Crete',      era: 'c. 1600 BC', name: 'a spiral conch' },
      { icon: 'feather', place: 'Heian-kyo',  era: 'c. 1004',    name: 'a faded goose quill' },
      { icon: 'key',     place: 'Alexandria', era: 'c. AD 200',  name: 'a library brass key' },
      { icon: 'leaf',    place: 'Wangchuan',  era: 'c. 740',     name: 'an unfinished verse' },
    ],
  };

  root.V4 = { WEATHER, TRAVEL };
})(window);
