export const randomIntWithLimit = (limit: number): number => {
  if (limit < 0) throw new Error('Limit minimal 0');
  return Math.floor(Math.random() * limit);
};

export const randomBoolean = (): boolean => {
  // 0 <= Math.prototype.random() <= 1
  return Math.random() >= 0.5;
};
