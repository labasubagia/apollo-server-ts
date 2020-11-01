import { AuthenticationError } from 'apollo-server';
import { ObjectID } from 'mongodb';
import { PAGINATION_SORT_ASC } from '../const/pagination';
import {
  MutationLikePostArgs,
  MutationPublishPostArgs,
  PostDbObject,
  QueryGetPostArgs,
  QueryGetPostsArgs,
} from '../generated/codegen';
import MongoDbProvider from '../mongo/provider';

const postsResolver = (provider: MongoDbProvider) => ({
  Query: {
    getPosts: async (
      _: unknown,
      { first, page, order }: QueryGetPostsArgs
    ): Promise<PostDbObject[]> => {
      return provider.postsAction.getAllPostPaginate({
        first,
        page,
        order: order || PAGINATION_SORT_ASC,
      });
    },

    getPost: async (
      _: unknown,
      { id }: QueryGetPostArgs
    ): Promise<PostDbObject | null> => provider.postsAction.getSinglePost(id),
  },

  Mutation: {
    publishPost: async (
      _: unknown,
      { input: { title, content } }: MutationPublishPostArgs,
      context: any
    ): Promise<PostDbObject | null> => {
      const user = await provider.usersAction.getSingleUserByJwtToken(
        context?.token
      );
      if (!user) throw new AuthenticationError('Please login');
      const payload: PostDbObject = {
        title,
        content,
        author: user?._id,
        publishedAt: new Date().toISOString(),
      };
      return provider.postsAction.insertPost(payload);
    },

    likePost: async (
      _: unknown,
      { postId }: MutationLikePostArgs,
      context: any
    ): Promise<PostDbObject | null> => {
      const user = await provider.usersAction.getSingleUserByJwtToken(
        context?.token
      );
      if (!user) throw new AuthenticationError('Please login');
      return provider.postsAction.likePost({
        userId: String(user?._id),
        postId,
      });
    },
  },

  Post: {
    id: (obj: PostDbObject): ObjectID => obj?._id as ObjectID,
    author: async (obj: PostDbObject) => provider.postsAction.findAuthor(obj),
    likedBy: async (obj: PostDbObject) =>
      provider.postsAction.findLikeUsers(obj),
    likeCount: (obj: PostDbObject): number => obj.likedBy?.length || 0,
  },
});

export default postsResolver;
