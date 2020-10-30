import { ObjectID } from 'mongodb';
import { PostDbObject, UserDbObject } from '../../generated/codegen';
import { MongoDbProvider } from '../provider';

export default class UserAction {
  private provider: MongoDbProvider;

  constructor(provider: MongoDbProvider) {
    if (!provider) throw new Error('Provider is undefined');
    this.provider = provider;
  }

  async getSingleUser({ userId }: { userId: string }): Promise<UserDbObject> {
    const objId = new ObjectID(userId);
    const result = await this.provider.usersCollection.findOne({
      _id: objId,
    });
    return result as UserDbObject;
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
}
