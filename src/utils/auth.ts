import jwt from 'jsonwebtoken';
import environment from '../environment';

export const signJwtToken = (obj: object): string => {
  return jwt.sign(obj, environment.jwt.secretKey, { expiresIn: '1h' });
};

export const verifyJwtToken = (token: string): string | object => {
  return jwt.verify(token, environment.jwt.secretKey);
};
