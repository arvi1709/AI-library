// 🛑 Comprehensive Bad Word Filter List (Global + Indian Social Media Slang)
// Use case: Chat/comment moderation, toxicity detection, or input sanitization.

const BAD_WORDS = [
  // 🔹 1. English / Global Profanity
  'anal', 'anus', 'arse', 'ass', 'asshole', 'ass-hat', 'ass-jabber', 'ass-pirate',
  'bastard', 'beastiality', 'bestiality', 'bitch', 'bitching', 'bloody', 'blowjob',
  'bollocks', 'boner', 'boob', 'bugger', 'bum', 'butt', 'buttplug',
  'clitoris', 'cock', 'cocksucker', 'coon', 'crap', 'cunt', 'cum', 'cumshot',
  'damn', 'dildo', 'dyke', 'erection',
  'fag', 'faggot', 'fanny', 'felching', 'fellate', 'fellatio', 'flange',
  'fuck', 'fucked', 'fucker', 'fucking', 'goddamn', 'godsdamn',
  'hell', 'homo', 'hooker', 'horny',
  'jerk', 'jizz', 'knob', 'knobend', 'labia', 'lmao', 'lmfao',
  'muff', 'motherfucker',
  'nigger', 'nigga', 'nips',
  'piss', 'pissed', 'penis', 'pussy', 'prick',
  'queer', 'scrotum', 'sex', 'shit', 'shitting', 'shitter', 'slut',
  'spunk', 'smegma', 'testicle', 'tit', 'turd', 'twat', 'vagina',
  'wank', 'whore', 'fuckall', 'fuckoff', 'bullshit', 'dumbass', 'retard',

  // 🇮🇳 🔹 2. Indian / Hinglish Profanity (Social Media Common)
  'bc', 'bkl', 'mc', 'madarchod', 'behenchod', 'bhosdike', 'bhosdika', 'bhosda',
  'chutiya', 'chutiye', 'chu', 'chus', 'chusle', 'chuswa', 'chuswaunga', 'gandu', 'gaand',
  'gaandfat', 'gaandmara', 'gaandmarike', 'randi', 'rand', 'randwa',
  'launda', 'laundi', 'loda', 'lauda', 'lund', 'lund', 'lund lele mera', 'teri maa chodunga','choot', 'chut', 'chutmarike',
  'chutiyapa', 'chudai', 'chudne', 'chudti', 'chudwa', 'chuda', 'chudega', 'chudegi',
  'harami', 'saala', 'sala', 'kutta', 'kutti', 'kamina', 'kamini', 'ullu', 'ullu ka pattha',
  'bewakoof', 'ullu ke bacche', 'nalayak', 'nikamma', 'tharki', 'lafanga',
  'faltu', 'jhatu', 'jhaat', 'jhaantu', 'fattu', 'bakchod', 'bakchodi', 'bawaal',
  'chirkut', 'ghanta', 'item', 'tatti', 'potty', 'suar', 'suar ke bacche', 'kuttiya',
  'kutte', 'kuttey', 'tatte', 'jhant', 'jhantoo', 'randiya', 'randy', 'sexi', 'sexy',

  // 🔹 3. Regional / Desi Slang
  'launde', 'laundi', 'tapori', 'aukat', 'aukat me reh', 'kat le', 'scene ban gaya',
  'bakchod', 'bakchodi', 'jhantu', 'chirkut', 'fattu', 'ghanta', 'patakha', 'item',
  'tatti', 'fattu', 'potty', 'lukka', 'tapka', 'faltu banda', 'sasta banda',

  // 🔹 4. Modern English + Indian mix insults / slang
  'fuckhead', 'jerkoff', 'dumbfuck', 'idiot', 'stupid', 'moron', 'loser', 'simp',
  'horny', 'cringe', 'weirdo', 'shithead', 'prickhead', 'bitchass', 'pisshead',
  'dumbshit', 'fucktard', 'tharki', 'tattiwala', 'chutiapa', 'jhantuwa', 'chinal',
  'tharak', 'tharakii', 'randibaaz', 'panauti',

  // 🔹 5. Abbreviations / Chat Shortcuts (used offensively)
  'lmaoo', 'lmfaoo', 'wtf', 'stfu', 'gtfo', 'ffs', 'omfg', 'mf', 'af', 'tf',
  'idgaf', 'fml', 'omg', 'smh', 'fkn', 'fkng', 'fknc', 'lmaoo', 'xd'
];

// 🔍 Regex pattern for profanity detection (without g flag, we'll handle matching differently)
const profanityPattern = `\\b(${BAD_WORDS.join('|')})\\b`;

/**
 * Check if text contains profanity
 * @param text - The text to check
 * @returns true if profanity is found, false otherwise
 */
export const containsProfanity = (text: string): boolean => {
  if (!text) return false;
  // Create a new regex each time to avoid issues with the global flag
  const regex = new RegExp(profanityPattern, 'i');
  return regex.test(text);
};

/**
 * Censor profanity in text by replacing with asterisks
 * @param text - The text to censor
 * @returns The censored text
 */
export const censorProfanity = (text: string): string => {
  if (!text) return text;
  // Create a new regex each time with the global flag for replacement
  const regex = new RegExp(profanityPattern, 'gi');
  return text.replace(regex, (match) => '*'.repeat(match.length));
};

/**
 * Get a user-friendly error message for profanity detection
 * @returns Error message
 */
export function getProfanityErrorMessage(): string {
  return "Your comment contains inappropriate language. Please remove any profanities and try again.";
}
