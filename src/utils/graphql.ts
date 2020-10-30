// eslint-disable-next-line import/prefer-default-export
export const normalize = <T>(data: T): T => {
  return JSON.parse(JSON.stringify({ ...data }));
};
