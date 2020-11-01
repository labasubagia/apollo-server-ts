import jwt from 'jsonwebtoken';
import environment from '../environment';

export const signJwtToken = <T>(payload: T): string => {
  const obj = (payload as unknown) as object;
  return jwt.sign(obj, environment.jwt.secretKey, { expiresIn: '1h' });
};

export const verifyJwtToken = (token: string): string | object => {
  return jwt.verify(token, environment.jwt.secretKey);
};
