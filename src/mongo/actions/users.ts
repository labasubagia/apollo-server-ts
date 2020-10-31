import { ObjectID } from 'mongodb';
import { PostDbObject, User, UserDbObject } from '../../generated/codegen';
import { verifyJwtToken } from '../../utils/auth';
import { mockUserForAuth } from '../dummy';
import { MongoDbProvider } from '../provider';

export default class UserAction {
  private provider: MongoDbProvider;

  constructor(provider: MongoDbProvider) {
    if (!provider) throw new Error('Provider is undefined');
    this.provider = provider;
  }

  async getSingleUserByJwtToken(token: string): Promise<UserDbObject | null> {
    try {
      if (!token) return null;
      const jwtObj: User | object | string = verifyJwtToken(token);
      const user = await this.getSingleUser({
        userId: (jwtObj as User).id as string,
      });
      return user;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getSingleUser({
    userId,
  }: {
    userId: string;
  }): Promise<UserDbObject | null> {
    const objId = new ObjectID(userId);
    const result = await this.provider.usersCollection.findOne(
      {
        _id: objId,
      },
      { projection: { password: false } }
    );
    return result;
  }

  async insertUser(
    user: UserDbObject & { password?: string }
  ): Promise<UserDbObject | null> {
    const result = await this.provider.usersCollection.insertOne(user);
    return result.ops[0] as UserDbObject;
  }

  async followUser({
    followerId,
    followingId,
  }: {
    followerId: string;
    followingId: string;
  }): Promise<UserDbObject | null> {
    const followerObjId = new ObjectID(followerId);
    const followingObjId = new ObjectID(followingId);

    const followerUser = (await this.provider.usersCollection.findOne({
      _id: followerObjId,
    })) as UserDbObject;

    const following: ObjectID[] = [
      ...(followerUser.following || []).filter(
        (id) =>
          !(id as ObjectID).equals(followerObjId) &&
          !(id as ObjectID).equals(followingObjId)
      ),
      followingObjId,
    ] as ObjectID[];

    const result = await this.provider.usersCollection.findOneAndUpdate(
      { _id: followerObjId },
      { $set: { following } },
      { returnOriginal: false }
    );
    return result.value as UserDbObject;
  }

  async unFollowUser({
    followerId,
    followingId,
  }: {
    followerId: string;
    followingId: string;
  }): Promise<UserDbObject | null> {
    const followerObjId = new ObjectID(followerId);
    const followingObjId = new ObjectID(followingId);

    const followerUser = (await this.provider.usersCollection.findOne({
      _id: followerObjId,
    })) as UserDbObject;

    const following: ObjectID[] = [...(followerUser.following || [])].filter(
      (id) =>
        !(id as ObjectID).equals(followerObjId) &&
        !(id as ObjectID).equals(new ObjectID(followingObjId))
    ) as ObjectID[];

    const result = await this.provider.usersCollection.findOneAndUpdate(
      { _id: followerObjId },
      { $set: { following } },
      { returnOriginal: false }
    );
    return result.value as UserDbObject;
  }

  async getUserPosts(user: UserDbObject): Promise<PostDbObject[]> {
    return this.provider.postsCollection
      .find({ author: user._id })
      .toArray() as Promise<PostDbObject[]>;
  }

  async getUserFollowing(user: UserDbObject): Promise<UserDbObject[]> {
    return this.provider.usersCollection
      .find({ _id: { $in: user.following || [] } })
      .toArray() as Promise<UserDbObject[]>;
  }

  async getUserFollowers(user: UserDbObject): Promise<UserDbObject[]> {
    return this.provider.usersCollection
      .find({ following: { $elemMatch: { $eq: user._id } } })
      .toArray() as Promise<UserDbObject[]>;
  }

  // Mockers

  async insertMockAuthUser(): Promise<UserDbObject | null> {
    return this.insertUser(mockUserForAuth);
  }

  async getMockAuthUser(): Promise<UserDbObject | null> {
    const user = (await this.provider.usersCollection.findOne({
      _id: mockUserForAuth?._id,
    })) as UserDbObject;
    return user;
  }

  async deleteMockAuthUser(): Promise<boolean> {
    const deleted = await this.provider.usersCollection.deleteOne({
      _id: mockUserForAuth?._id,
    });
    return deleted.result.ok === 1;
  }
}
