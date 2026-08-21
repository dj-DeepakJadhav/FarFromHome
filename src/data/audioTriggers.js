// Audio events linking event keys to spoken lines and SFX profiles.
//
// `ph` is a PHONETIC RESPELLING used only when the browser has no German
// voice installed. Without it, an English voice reads German spelling and
// mangles it ("der Apfel" came out unrecognisable). These respellings are
// tuned so an English-language voice lands close to the German pronunciation.
// When a real de-* voice IS present, `de` is spoken instead and `ph` is unused.
window.FFH.audioTriggers = {
  // Level 0: Arrival
  zimmer:           { de: 'das Zimmer', ph: 'dass tsimmer', en: 'the room', sfx: 'success' },
  neu_in_luebeck:   { de: 'Ich bin neu in Lübeck.', ph: 'ikh bin noy in Lyoo-beck', en: 'I am new in Lübeck.', sfx: 'success' },

  // Level 1: Dark Store
  milch:            { de: 'die Milch', ph: 'dee milsh', en: 'the milk', sfx: 'success' },
  apfel:            { de: 'der Apfel', ph: 'dare ahpfell', en: 'the apple', sfx: 'success' },
  brot:             { de: 'das Brot', ph: 'dass brote', en: 'the bread', sfx: 'success' },
  wasser:           { de: 'das Wasser', ph: 'dass vasser', en: 'the water', sfx: 'success' },
  banane:           { de: 'die Banane', ph: 'dee banahnuh', en: 'the banana', sfx: 'success' },
  kaese:            { de: 'der Käse', ph: 'dare kayzuh', en: 'the cheese', sfx: 'success' },
  ei:               { de: 'das Ei', ph: 'dass eye', en: 'the egg', sfx: 'success' },
  karotte:          { de: 'die Karotte', ph: 'dee karottuh', en: 'the carrot', sfx: 'success' },

  // Level 2: Pizzeria
  pizza:            { de: 'Zwei Pizza Margherita bitte.', ph: 'Tsvy peet-sa mar-gheh-ree-tah bit-tuh', en: 'Two pizzas please', sfx: 'success' },
  cola:             { de: 'zwei Cola', ph: 'tsvy koh-lah', en: 'two colas', sfx: 'success' },
  wein:             { de: 'zwei Glas Wein', ph: 'tsvy glahs vine', en: 'two glasses of wine', sfx: 'success' },
  guten_tag:        { de: 'Guten Tag!', ph: 'goo-ten tahg', en: 'Good day!', sfx: 'success' },
  danke_schoen:     { de: 'Vielen Dank!', ph: 'fee-len dahnk', en: 'Thank you very much!', sfx: 'success' },

  // Level 3: Doorstep Delivery
  doorbell_correct: { de: 'Tür ist auf! Bitte kommen Sie hoch.', ph: 'toor ist owf. bitteh kommen zee hoakh.', sfx: 'success' },
  doorbell_wrong:   { de: 'Falscher Knopf! Wer ist da?', ph: 'falsher knopf! vair ist dah?', sfx: 'error' },
  trinkgeld:        { de: 'Hier ist Ihr Trinkgeld, danke schön!', ph: 'here ist eer trink-geld, dahn-kuh shurn', sfx: 'success' },
  auf_wiedersehen:  { de: 'Auf Wiedersehen!', ph: 'owf vee-der-zay-en', en: 'Goodbye!', sfx: 'success' },

  // Level 4: Furniture Store
  moebel_sofa:      { de: 'Das Sofa ist sehr schön, aber zu teuer.', ph: 'dass zoh-fah ist zair shurn, ah-ber tsoo toy-er', en: 'The sofa is beautiful, but too expensive.', sfx: 'success' },
  moebel_tisch:     { de: 'Ein schöner Holztisch für mein Zimmer.', ph: 'ine shur-ner holts-tish fyoor mine tsimmer', en: 'A nice wooden table for my room.', sfx: 'success' },

  // Level 5: Pet & Toy Store
  pet_katze:        { de: 'Eine kleine süße Plüschkatze!', ph: 'eye-nuh kly-nuh zyoo-suh plyoosh-kat-suh', en: 'A cute little plush cat!', sfx: 'success' },
  pet_hund:         { de: 'Ein weicher Plüschhund für mein Bett.', ph: 'ine vy-kher plyoosh-hoond fyoor mine bet', en: 'A soft plush dog for my bed.', sfx: 'success' },

  // Level 6: Christmas Celebration
  weihnachten:      { de: 'Frohe Weihnachten meine Freunde!', ph: 'froh-uh vy-nakh-ten my-nuh froynd-uh', en: 'Merry Christmas my friends!', sfx: 'success' },
  wir_haben_es:     { de: 'Wir haben es geschafft!', ph: 'veer hah-ben ess geh-shahft', en: 'We made it!', sfx: 'success' }
};
