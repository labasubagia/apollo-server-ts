import { ObjectID } from 'mongodb';
import { MOCK_MONGO_USER_ID } from '../const/mocks';
import { PostDbObject, UserDbObject } from '../generated/codegen';
import { TokenPayload } from '../interfaces/TokenPayload';
import { signJwtToken } from '../utils/auth';
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

// * Mock user for e2e Test
// ? Steps
// - Register with this user when initiate mock server with database (with loginMockUserForAuth())
// - Insert this user on beforeEach() test if database reset on afterEach()
//   (with insertMockAuthUser() from user action)
export const mockUserForAuth: UserDbObject & { password?: string } = {
  _id: new ObjectID(MOCK_MONGO_USER_ID),
  username: 'tom_jerry',
  email: 't.jerry@mail.com',
};

export const loginMockUserForAuth = () => {
  const payload: TokenPayload = {
    id: String(mockUserForAuth._id),
    email: mockUserForAuth.email as string,
    username: mockUserForAuth.username as string,
  };
  return signJwtToken(payload);
};
