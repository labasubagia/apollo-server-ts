import { ObjectID } from 'mongodb';
import { PostDbObject, UserDbObject } from '../codegen';
import { randomIntWithLimit } from '../utils/random';

export const usersDummy: UserDbObject[] = [
  {
    _id: new ObjectID(),
    firstName: 'John',
    lastName: 'Terry',
    email: 'john@mail.com',
  },
  {
    _id: new ObjectID(),
    firstName: 'Martin',
    lastName: 'Luke',
    email: 'luke@mail.com',
  },
  {
    _id: new ObjectID(),
    firstName: 'Christina',
    lastName: 'Perry',
    email: 'christina.perry@mail.com',
  },
  {
    _id: new ObjectID(),
    firstName: 'Manuel',
    lastName: 'George',
    email: 'm.george@mail.com',
  },
];

export const postsDummy: (PostDbObject | { publishedAt: string })[] = [
  {
    _id: new ObjectID(),
    title: 'New Way with TailwindCSS',
    content: 'Make your life much easier',
    author: usersDummy[randomIntWithLimit(usersDummy.length)]._id,
    publishedAt: new Date().toISOString(),
  },
  {
    _id: new ObjectID(),
    title: 'Typescript',
    content: 'Prevent bug faster',
    author: usersDummy[randomIntWithLimit(usersDummy.length)]._id,
    publishedAt: new Date().toISOString(),
  },
  {
    _id: new ObjectID(),
    title: 'Hello World',
    content: 'Today I learn about unit testing',
    author: usersDummy[randomIntWithLimit(usersDummy.length)]._id,
    publishedAt: new Date().toISOString(),
  },
];
