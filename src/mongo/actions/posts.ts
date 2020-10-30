import { ObjectID } from 'mongodb';
import { PostDbObject, UserDbObject } from '../../codegen';
import { MOCK_MONGO_USER_ID } from '../../const/mocks';
import { PAGINATION_SORT_DESC } from '../../const/pagination';
import { PaginationParams } from '../../interfaces/PaginationParams';
import { MongoDbProvider } from '../provider';

export default class PostAction {
  private provider: MongoDbProvider;

  constructor(provider: MongoDbProvider) {
    if (!provider) throw new Error('Provider is undefined');
    this.provider = provider;
  }

  async getAllPostPaginate(params: PaginationParams): Promise<PostDbObject[]> {
    const skip = params.first * (params.page ? params.page - 1 : 0);
    const result = await this.provider.postsCollection
      .find()
      .sort({ _id: params.order || PAGINATION_SORT_DESC })
      .skip(skip)
      .limit(params.first)
      .toArray();
    return result as PostDbObject[];
  }

  async getSinglePost(id: string): Promise<PostDbObject | null> {
    const postId = new ObjectID(id);
    const result = await this.provider.postsCollection.findOne({
      _id: postId,
    });
    return result as PostDbObject;
  }

  async insertPost(
    payload: PostDbObject | { publishedAt: string }
  ): Promise<PostDbObject | null> {
    const author = await this.provider.usersCollection.find({
      _id: { ...payload }.author,
    });
    if (!author) throw new Error('Author not found');
    const result = await this.provider.postsCollection.insertOne(payload);
    return result.ops[0] as PostDbObject;
  }

  async likePost({
    userId,
    postId,
  }: {
    userId?: string;
    postId: string;
  }): Promise<PostDbObject | null> {
    const id = new ObjectID(postId);
    const likerId = new ObjectID(userId || MOCK_MONGO_USER_ID);
    const post = (await this.provider.postsCollection.findOne({
      _id: id,
    })) as PostDbObject;

    const isLiked = post.likedBy?.find((item) => item?.equals(likerId));
    let likes: ObjectID[] = [...(post?.likedBy || [])] as ObjectID[];
    likes = isLiked
      ? likes.filter((item) => !item.equals(likerId))
      : [...likes, likerId];

    const result = await this.provider.postsCollection.findOneAndUpdate(
      { _id: id },
      { $set: { likedBy: likes } },
      { returnOriginal: false }
    );
    return result.value as PostDbObject;
  }

  async findAuthor(post: PostDbObject): Promise<UserDbObject> {
    return this.provider.usersCollection.findOne({
      _id: post.author,
    }) as Promise<UserDbObject>;
  }

  async findLikeUsers(post: PostDbObject): Promise<UserDbObject[]> {
    return this.provider.usersCollection
      .find({ _id: { $in: post.likedBy || [] } })
      .toArray() as Promise<UserDbObject[]>;
  }
}
