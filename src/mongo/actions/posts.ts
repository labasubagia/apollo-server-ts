import { ObjectID } from 'mongodb';
import { PostDbObject, UserDbObject } from '../../codegen';
import { MOCK_MONGO_USER_ID } from '../../const/mocks';
import { PAGINATION_SORT_DESC } from '../../const/pagination';
import { PaginationParams } from '../../interfaces/pagination';
import { mongoDbProvider } from '../provider';

export const getAllPostPaginate = async (
  params: PaginationParams
): Promise<PostDbObject[]> => {
  const skip = params.first * (params.page ? params.page - 1 : 0);
  const result = await mongoDbProvider.postsCollection
    .find()
    .sort({ _id: params.order || PAGINATION_SORT_DESC })
    .skip(skip)
    .limit(params.first)
    .toArray();
  return result as PostDbObject[];
};

export const getSinglePost = async (
  id: string
): Promise<PostDbObject | null> => {
  const postId = new ObjectID(id);
  const result = await mongoDbProvider.postsCollection.findOne({ _id: postId });
  return result as PostDbObject;
};

export const insertPost = async (
  userId: string,
  { title, content }: { title: string; content: string }
): Promise<PostDbObject | null> => {
  const authorId = new ObjectID(userId);
  const result = await mongoDbProvider.postsCollection.insertOne({
    title,
    content,
    author: authorId,
    publishedAt: new Date().toISOString(),
  });
  return result.ops[0] as PostDbObject;
};

export const likePost = async ({
  userId,
  postId,
}: {
  userId?: string;
  postId: string;
}): Promise<PostDbObject | null> => {
  const id = new ObjectID(postId);
  const likerId = new ObjectID(userId || MOCK_MONGO_USER_ID);
  const post = (await mongoDbProvider.postsCollection.findOne({
    _id: id,
  })) as PostDbObject;

  const isLiked = post.likedBy?.find((item) => item.equals(likerId));
  let likes: ObjectID[] = [...(post.likedBy || [])];
  likes = isLiked
    ? likes.filter((item) => !item.equals(likerId))
    : [...likes, likerId];

  const result = await mongoDbProvider.postsCollection.findOneAndUpdate(
    { _id: id },
    { $set: { likedBy: likes } },
    { returnOriginal: false }
  );
  return result.value as PostDbObject;
};

export const findAuthor = async (post: PostDbObject): Promise<UserDbObject> => {
  return mongoDbProvider.usersCollection.findOne({
    _id: post.author,
  }) as Promise<UserDbObject>;
};

export const findLikeUsers = async (
  post: PostDbObject
): Promise<UserDbObject[]> => {
  return mongoDbProvider.usersCollection
    .find({ _id: { $in: post.likedBy || [] } })
    .toArray() as Promise<UserDbObject[]>;
};
