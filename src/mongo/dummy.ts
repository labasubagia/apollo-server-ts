import { ObjectID } from 'mongodb';
import { PostDbObject, UserDbObject } from '../generated/codegen';
import { randomIntWithLimit } from '../utils/random';

export const usersDummy: UserDbObject[] = [
  {
    _id: new ObjectID(),
    username: 'John Terry',
    email: 'john@mail.com',
  },
  {
    _id: new ObjectID(),
    username: 'Martin Luke',
    email: 'luke@mail.com',
  },
  {
    _id: new ObjectID(),
    username: 'Christina Perry',
    email: 'christina.perry@mail.com',
  },
  {
    _id: new ObjectID(),
    username: 'Manuel George',
    email: 'm.george@mail.com',
  },
];

export const postsDummy: PostDbObject[] = [
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
