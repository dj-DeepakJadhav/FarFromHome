window.FFH = window.FFH || {};

// German Grammar Engine
window.FFH.GrammarEngine = {
  // Articles: [Nominative, Accusative, Dative]
  articles: {
    'der': ['der', 'den', 'dem'],
    'die': ['die', 'die', 'der'],
    'das': ['das', 'das', 'dem'],
    'pl':  ['die', 'die', 'den']
  },
  
  indefiniteArticles: {
    'der': ['ein', 'einen', 'einem'],
    'die': ['eine', 'eine', 'einer'],
    'das': ['ein', 'ein', 'einem'],
    'pl':  ['keine', 'keine', 'keinen'] // no plural indefinite, using negative for fallback if needed
  },

  getArticle(gender, caseType, isDefinite = true) {
    const caseIndex = caseType === 'NOM' ? 0 : (caseType === 'AKK' ? 1 : 2);
    if (isDefinite) {
      return this.articles[gender][caseIndex];
    } else {
      return this.indefiniteArticles[gender][caseIndex];
    }
  },

  // Generates a request for an item. e.g. "Ich brauche den Apfel."
  generateRequest(item, amount = 1) {
    if (!item) return { de: "Hallo!", en: "Hello!", hintDe: "Hallo!" };

    const templates = [
      {
        // Ich brauche [AKK] [Noun].
        build: (i, amt) => {
          if (amt > 1 && i.pluralDe) {
            return {
              de: `Ich brauche ${amt} ${i.pluralDe}.`,
              en: `I need ${amt} ${i.nameEn}s.`,
              hintDe: `Ich brauche <span style="color:#aaa;">${amt} ${i.pluralDe}</span>.`
            };
          } else {
            const article = this.getArticle(i.gender, 'AKK', false);
            return {
              de: `Ich brauche ${article} ${i.nameDe}.`,
              en: `I need a ${i.nameEn}.`,
              hintDe: `Ich brauche <span style="color:${this.getColor(i.gender)}">${article} ${i.nameDe}</span>.`
            };
          }
        }
      },
      {
        // Haben Sie [AKK] [Noun]?
        build: (i, amt) => {
          if (amt > 1 && i.pluralDe) {
            return {
              de: `Haben Sie ${amt} ${i.pluralDe}?`,
              en: `Do you have ${amt} ${i.nameEn}s?`,
              hintDe: `Haben Sie <span style="color:#aaa;">${amt} ${i.pluralDe}</span>?`
            };
          } else {
            const article = this.getArticle(i.gender, 'AKK', false);
            return {
              de: `Haben Sie ${article} ${i.nameDe}?`,
              en: `Do you have a ${i.nameEn}?`,
              hintDe: `Haben Sie <span style="color:${this.getColor(i.gender)}">${article} ${i.nameDe}</span>?`
            };
          }
        }
      },
      {
        // Könnten Sie mir bitte [AKK] [Noun] bringen?
        build: (i, amt) => {
          if (amt > 1 && i.pluralDe) {
            return {
              de: `Könnten Sie mir bitte ${amt} ${i.pluralDe} bringen?`,
              en: `Could you please bring me ${amt} ${i.nameEn}s?`,
              hintDe: `Könnten Sie mir bitte <span style="color:#aaa;">${amt} ${i.pluralDe}</span> bringen?`
            };
          } else {
            const article = this.getArticle(i.gender, 'AKK', false);
            return {
              de: `Könnten Sie mir bitte ${article} ${i.nameDe} bringen?`,
              en: `Could you please bring me a ${i.nameEn}?`,
              hintDe: `Könnten Sie mir bitte <span style="color:${this.getColor(i.gender)}">${article} ${i.nameDe}</span> bringen?`
            };
          }
        }
      },
      {
        // Ich hätte gern [AKK] [Noun].
        build: (i, amt) => {
          if (amt > 1 && i.pluralDe) {
            return {
              de: `Ich hätte gern ${amt} ${i.pluralDe}.`,
              en: `I would like ${amt} ${i.nameEn}s.`,
              hintDe: `Ich hätte gern <span style="color:#aaa;">${amt} ${i.pluralDe}</span>.`
            };
          } else {
            const article = this.getArticle(i.gender, 'AKK', false);
            return {
              de: `Ich hätte gern ${article} ${i.nameDe}.`,
              en: `I would like a ${i.nameEn}.`,
              hintDe: `Ich hätte gern <span style="color:${this.getColor(i.gender)}">${article} ${i.nameDe}</span>.`
            };
          }
        }
      }
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    return template.build(item, amount);
  },

  getColor(gender) {
    if (gender === 'der') return '#3b82f6'; // blue
    if (gender === 'die') return '#ec4899'; // pink
    if (gender === 'das') return '#a855f7'; // purple
    return '#ffffff';
  },
  
  generateGreeting(npcId) {
    const time = new Date().getHours();
    if (time < 11) return "Guten Morgen!";
    if (time < 18) return "Guten Tag!";
    return "Guten Abend!";
  }
};
