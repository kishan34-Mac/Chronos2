export const LIFE_EXPECTANCY = 80;

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const DAYS_PER_YEAR = 365.25;

const WEEK_MESSAGES = [
  'You were discovering the world.',
  'You were learning what love feels like.',
  'You were figuring out who you are.',
  'You were chasing something beautiful.',
  'You were braver than you knew.',
  'You were changing quietly.',
  'You were building something.',
  'You were letting something go.',
  'You were exactly where you needed to be.',
  'You were becoming.',
  'You were finding your voice.',
  'You were learning to lose.',
  'You were holding on too tightly.',
  'You were saying yes when you meant no.',
  'You were learning to forgive.',
  'You were searching for meaning.',
  'You were finding it in unexpected places.',
  'You were creating without knowing it.',
  'You were loved more than you realized.',
  'You were writing a story only you could tell.',
];

export const CHAPTER_RANGES = [
  { name: 'Childhood', emoji: '🌱', range: '0–12', color: '#4ade80', description: 'The years of wonder, before the world had rules.' },
  { name: 'Teen Years', emoji: '⚡', range: '13–19', color: '#60a5fa', description: 'The years of becoming — the loudest and quietest simultaneously.' },
  { name: 'Young Adult', emoji: '🔥', range: '20–35', color: '#f97316', description: 'The years of building — mistakes that mattered.' },
  { name: 'Prime', emoji: '👑', range: '36–55', color: '#D4AF37', description: 'The years of clarity — when you finally know who you are.' },
  { name: 'Elder', emoji: '🌊', range: '56–75', color: '#a78bfa', description: 'The years of harvest — everything you planted, returning.' },
  { name: 'Legacy', emoji: '✨', range: '76–80+', color: '#f0d060', description: 'The years that outlive you.' },
];

export interface AgeExact {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function getAgeExact(dob: Date, now: Date = new Date()): AgeExact {
  const diff = now.getTime() - dob.getTime();
  if (diff < 0) return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  let days = now.getDate() - dob.getDate();
  let hours = now.getHours() - dob.getHours();
  let minutes = now.getMinutes() - dob.getMinutes();
  let seconds = now.getSeconds() - dob.getSeconds();

  if (seconds < 0) { seconds += 60; minutes -= 1; }
  if (minutes < 0) { minutes += 60; hours -= 1; }
  if (hours < 0) { hours += 24; days -= 1; }
  if (days < 0) {
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
    months -= 1;
  }
  if (months < 0) { months += 12; years -= 1; }
  if (years < 0) years = 0;

  return { years, months, days, hours, minutes, seconds };
}

export function getTotalDaysLived(dob: Date, now: Date = new Date()): number {
  const diff = now.getTime() - dob.getTime();
  return diff > 0 ? diff / MS_PER_DAY : 0;
}

export function getTotalWeeksLived(dob: Date, now: Date = new Date()): number {
  return Math.floor(getTotalDaysLived(dob, now) / 7);
}

export function getTotalWeeksTotal(): number {
  return LIFE_EXPECTANCY * 52;
}

export function getPercentageLived(dob: Date, now: Date = new Date()): number {
  const totalDays = LIFE_EXPECTANCY * DAYS_PER_YEAR;
  return (getTotalDaysLived(dob, now) / totalDays) * 100;
}

export interface LifeStats {
  secondsLived: number;
  minutesLived: number;
  hoursLived: number;
  daysLived: number;
  weeksLived: number;
  monthsLived: number;
  yearsLived: number;
  secondsRemaining: number;
  minutesRemaining: number;
  hoursRemaining: number;
  daysRemaining: number;
  weeksRemaining: number;
  percentageLived: number;
  percentageRemaining: number;
  heartbeats: number;
  breaths: number;
  sleepHours: number;
  stepsWalked: number;
  mealsEaten: number;
  wordsSpoken: number;
  dreamsHad: number;
  sunrisesSeen: number;
  mondaysLived: number;
}

export function getLifeStats(dob: Date, now: Date = new Date()): LifeStats {
  const daysLived = getTotalDaysLived(dob, now);
  const weeksLived = Math.floor(daysLived / 7);
  const totalDays = LIFE_EXPECTANCY * DAYS_PER_YEAR;
  const daysRemaining = Math.max(0, totalDays - daysLived);
  const percentageLived = (daysLived / totalDays) * 100;
  const percentageRemaining = 100 - percentageLived;
  const ageExact = getAgeExact(dob, now);

  return {
    secondsLived: Math.floor(daysLived * 24 * 60 * 60),
    minutesLived: Math.floor(daysLived * 24 * 60),
    hoursLived: Math.floor(daysLived * 24),
    daysLived: Math.floor(daysLived),
    weeksLived,
    monthsLived: Math.floor(daysLived / 30.4375),
    yearsLived: ageExact.years,
    secondsRemaining: Math.floor(daysRemaining * 24 * 60 * 60),
    minutesRemaining: Math.floor(daysRemaining * 24 * 60),
    hoursRemaining: Math.floor(daysRemaining * 24),
    daysRemaining: Math.floor(daysRemaining),
    weeksRemaining: Math.floor(daysRemaining / 7),
    percentageLived,
    percentageRemaining,
    heartbeats: Math.floor(daysLived * 24 * 60 * 70),
    breaths: Math.floor(daysLived * 24 * 60 * 16),
    sleepHours: Math.floor(daysLived * 8),
    stepsWalked: Math.floor(daysLived * 7500),
    mealsEaten: Math.floor(daysLived * 3),
    wordsSpoken: Math.floor(daysLived * 16000),
    dreamsHad: Math.floor(daysLived * 4),
    sunrisesSeen: Math.floor(daysLived),
    mondaysLived: weeksLived,
  };
}

export type ChapterName = 'childhood' | 'teen' | 'youngAdult' | 'prime' | 'elder' | 'legacy';

export function getChapter(dob: Date, now: Date = new Date()): ChapterName {
  const age = getAgeExact(dob, now).years;
  if (age <= 12) return 'childhood';
  if (age <= 19) return 'teen';
  if (age <= 35) return 'youngAdult';
  if (age <= 55) return 'prime';
  if (age <= 75) return 'elder';
  return 'legacy';
}

export function getChapterIndex(dob: Date, now: Date = new Date()): number {
  const chapter = getChapter(dob, now);
  const map: Record<ChapterName, number> = {
    childhood: 0, teen: 1, youngAdult: 2, prime: 3, elder: 4, legacy: 5,
  };
  return map[chapter];
}

export function getChapterProgress(dob: Date, now: Date = new Date()): number {
  const age = getAgeExact(dob, now).years;
  const monthsPast = age * 12 + getAgeExact(dob, now).months;
  const chapterBoundaries = [
    { start: 0, end: 13 },
    { start: 13, end: 20 },
    { start: 20, end: 36 },
    { start: 36, end: 56 },
    { start: 56, end: 76 },
    { start: 76, end: 80 },
  ];
  const idx = getChapterIndex(dob, now);
  const { start, end } = chapterBoundaries[idx];
  const startMonths = start * 12;
  const endMonths = end * 12;
  const progress = ((monthsPast - startMonths) / (endMonths - startMonths)) * 100;
  return Math.max(0, Math.min(100, progress));
}

export function getChapterRanges() {
  return CHAPTER_RANGES;
}

export interface WeekData {
  isPast: boolean;
  approximateAge: number;
  approximateSeason: string;
  seasonEmoji: string;
  message: string;
}

export function getWeekData(weekIndex: number, dob: Date, now: Date = new Date()): WeekData {
  const weeksLived = getTotalWeeksLived(dob, now);
  const approximateAge = Math.floor(weekIndex / 52);
  const seasonIndex = weekIndex % 52;
  let approximateSeason = 'winter';
  let seasonEmoji = '❄️';
  if (seasonIndex <= 12) { approximateSeason = 'winter'; seasonEmoji = '❄️'; }
  else if (seasonIndex <= 25) { approximateSeason = 'spring'; seasonEmoji = '🌸'; }
  else if (seasonIndex <= 38) { approximateSeason = 'summer'; seasonEmoji = '☀️'; }
  else { approximateSeason = 'autumn'; seasonEmoji = '🍂'; }

  const message = WEEK_MESSAGES[weekIndex % WEEK_MESSAGES.length];

  return {
    isPast: weekIndex < weeksLived,
    approximateAge,
    approximateSeason,
    seasonEmoji,
    message,
  };
}

export interface GoalTime {
  days: number;
  months: number;
  years: number;
}

export function getGoalTime(hoursPerDay: number, totalHoursNeeded: number): GoalTime {
  const days = totalHoursNeeded / hoursPerDay;
  const months = days / 30;
  const years = days / 365;
  return { days, months, years };
}

export function generateFinalSentence(dob: Date, now: Date = new Date()): string {
  const stats = getLifeStats(dob, now);
  const pct = stats.percentageLived.toFixed(1);
  const age = stats.yearsLived;

  if (stats.percentageLived < 20) {
    return `You are ${age} years old and ${pct}% through your life. The entire story is still ahead of you.`;
  }
  if (stats.percentageLived < 40) {
    return `You have lived ${pct}% of your life. The chapters worth writing are just beginning.`;
  }
  if (stats.percentageLived < 60) {
    return `You are exactly halfway. Everything you've built is the foundation. Everything ahead is the reward.`;
  }
  if (stats.percentageLived < 80) {
    return `You have lived ${pct}% of a remarkable life. The final chapters are often the most beautiful.`;
  }
  return `You have lived ${pct}% of your life. What a journey it has been. What a legacy remains.`;
}

export function getChapterColorForWeek(weekIndex: number): string {
  if (weekIndex <= 624) return 'rgba(74,222,128,0.7)';
  if (weekIndex <= 988) return 'rgba(96,165,250,0.7)';
  if (weekIndex <= 1820) return 'rgba(249,115,22,0.7)';
  if (weekIndex <= 2860) return 'rgba(212,175,55,0.9)';
  if (weekIndex <= 3900) return 'rgba(167,139,250,0.7)';
  return 'rgba(240,208,96,0.7)';
}

export function getChapterIndexForWeek(weekIndex: number): number {
  if (weekIndex <= 624) return 0;
  if (weekIndex <= 988) return 1;
  if (weekIndex <= 1820) return 2;
  if (weekIndex <= 2860) return 3;
  if (weekIndex <= 3900) return 4;
  return 5;
}
