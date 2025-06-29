
export const getCurrentTime = (): string => {
  return new Date().toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

export const getCurrentDay = (): string => {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[new Date().getDay()];
};

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const isCurrentProgram = (startTime: string, endTime: string, day: string): boolean => {
  const now = new Date();
  const currentDay = getCurrentDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  if (currentDay !== day) return false;
  
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
};

export const formatDuration = (startTime: string, endTime: string): string => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const duration = end - start;
  
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  
  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${minutes}min`;
};

export const CATEGORIES_COLORS = {
  'Magazine': 'from-blue-500 to-blue-600',
  'Musique': 'from-purple-500 to-purple-600',
  'Sport': 'from-green-500 to-green-600',
  'Actualité': 'from-red-500 to-red-600',
  'Culture': 'from-amber-500 to-amber-600',
  'Religion': 'from-indigo-500 to-indigo-600',
  'Divertissement': 'from-pink-500 to-pink-600'
};
