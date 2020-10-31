import { ObjectId, ObjectID } from 'mongodb';
import { PostDbObject, UserDbObject } from '../../generated/codegen';
import { PAGINATION_SORT_ASC } from '../../const/pagination';
import { PaginationParams } from '../../interfaces/PaginationParams';
import { MongoDbProvider } from '../provider';
import { getPaginationSkip } from '../../utils/pagination';

export default class PostAction {
  private provider: MongoDbProvider;

  constructor(provider: MongoDbProvider) {
    if (!provider) throw new Error('Provider is undefined');
    this.provider = provider;
  }

  async getAllPostPaginate(params: PaginationParams): Promise<PostDbObject[]> {
    const skip = getPaginationSkip({
      pageSize: params.first,
      pageNumber: params.page || 1,
    });
    const result = await this.provider.postsCollection
      .find()
      .sort({ _id: params.order || PAGINATION_SORT_ASC })
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

  async insertPost(payload: PostDbObject): Promise<PostDbObject | null> {
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
    userId: string;
    postId: string;
  }): Promise<PostDbObject | null> {
    const id = new ObjectID(postId);
    const likerId = new ObjectID(userId);

    const post = (await this.provider.postsCollection.findOne({
      _id: id,
    })) as PostDbObject;

    const likes: ObjectID[] = [...(post?.likedBy || []), likerId] as ObjectID[];

    const result = await this.provider.postsCollection.findOneAndUpdate(
      { _id: id },
      { $set: { likedBy: likes } },
      { returnOriginal: false }
    );
    return result.value as PostDbObject;
  }

  async unLikePost({
    userId,
    postId,
  }: {
    userId: string;
    postId: string;
  }): Promise<PostDbObject> {
    const id = new ObjectID(postId);
    const likerId = new ObjectID(userId);

    const post = (await this.provider.postsCollection.findOne({
      _id: id,
    })) as PostDbObject;

    const likes: ObjectID[] = [...((post?.likedBy || []) as ObjectId[])].filter(
      (item) => !item?.equals(likerId)
    );

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
