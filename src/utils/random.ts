// eslint-disable-next-line import/prefer-default-export
export const randomIntWithLimit = (limit: number) => {
  if (limit < 0) throw new Error('Limit minimal 0');
  return Math.floor(Math.random() * limit);
};
