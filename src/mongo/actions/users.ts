import { ObjectID } from 'mongodb';
import { PostDbObject, UserDbObject } from '../../codegen';
import { mongoDbProvider } from '../provider';

export const getSingleUser = async ({
  userId,
}: {
  userId: string;
}): Promise<UserDbObject> => {
  const objId = new ObjectID(userId);
  const result = await mongoDbProvider.usersCollection.findOne({
    _id: objId,
  });
  return result as UserDbObject;
};

export const followUser = async ({
  followerId,
  followingId,
}: {
  followerId: string;
  followingId: string;
}): Promise<UserDbObject | null> => {
  const followerObjId = new ObjectID(followerId);
  const followingObjId = new ObjectID(followingId);

  const followerUser = (await mongoDbProvider.usersCollection.findOne({
    _id: followerObjId,
  })) as UserDbObject;

  const following: ObjectID[] = [
    ...(followerUser.following || []).filter(
      (item) => !item.equals(followerObjId) && !item.equals(followingObjId)
    ),
    followingObjId,
  ];

  const result = await mongoDbProvider.usersCollection.findOneAndUpdate(
    { _id: followerObjId },
    { $set: { following } },
    { returnOriginal: false }
  );
  return result.value as UserDbObject;
};

export const unFollowUser = async ({
  followerId,
  followingId,
}: {
  followerId: string;
  followingId: string;
}): Promise<UserDbObject | null> => {
  const followerObjId = new ObjectID(followerId);
  const followingObjId = new ObjectID(followingId);

  const followerUser = (await mongoDbProvider.usersCollection.findOne({
    _id: followerObjId,
  })) as UserDbObject;

  const following: ObjectID[] = [...(followerUser.following || [])].filter(
    (item) =>
      !item.equals(followerObjId) && !item.equals(new ObjectID(followingObjId))
  );

  const result = await mongoDbProvider.usersCollection.findOneAndUpdate(
    { _id: followerObjId },
    { $set: { following } },
    { returnOriginal: false }
  );
  return result.value as UserDbObject;
};

export const getUserPosts = async (
  user: UserDbObject
): Promise<PostDbObject[]> => {
  return mongoDbProvider.postsCollection
    .find({ author: user._id })
    .toArray() as Promise<PostDbObject[]>;
};

export const getUserFollowing = async (
  user: UserDbObject
): Promise<UserDbObject[]> => {
  return mongoDbProvider.usersCollection
    .find({ _id: { $in: user.following || [] } })
    .toArray() as Promise<UserDbObject[]>;
};

export const getUserFollowers = async (
  user: UserDbObject
): Promise<UserDbObject[]> => {
  return mongoDbProvider.usersCollection
    .find({ following: { $elemMatch: { $eq: user._id } } })
    .toArray() as Promise<UserDbObject[]>;
};
