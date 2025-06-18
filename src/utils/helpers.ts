const profanityList = [
  'damn', 'hell', 'stupid', 'idiot', 'hate', 'dumb', 'loser', 'suck', 'crap', 'shut up'
];

const anonymousNames = [
  'Curious Cat', 'Silent Owl', 'Brave Fox', 'Wise Penguin', 'Quiet Wolf', 
  'Smart Dolphin', 'Clever Raven', 'Kind Bear', 'Swift Eagle', 'Gentle Deer',
  'Bold Tiger', 'Calm Panda', 'Bright Falcon', 'Noble Lion', 'Peaceful Dove'
];

export const generateAnonymousName = (): string => {
  const randomIndex = Math.floor(Math.random() * anonymousNames.length);
  const randomNumber = Math.floor(Math.random() * 1000);
  return `${anonymousNames[randomIndex]} ${randomNumber}`;
};

export const checkProfanity = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return profanityList.some(word => lowerText.includes(word));
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const getTimeRemaining = (date: Date): string => {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expired';
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
};