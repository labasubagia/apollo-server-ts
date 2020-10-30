import { ObjectID } from 'mongodb';
import { MOCK_MONGO_USER_ID } from '../const/mocks';
import {
  MutationLikePostArgs,
  MutationPublishPostArgs,
  PostDbObject,
  QueryGetPostArgs,
  QueryGetPostsArgs,
} from '../codegen';
import { MongoDbProvider } from '../mongo/provider';

const postsResolver = (provider: MongoDbProvider) => ({
  Query: {
    getPosts: async (
      _: unknown,
      { first, page }: QueryGetPostsArgs
    ): Promise<PostDbObject[]> =>
      provider.postsAction.getAllPostPaginate({ first, page }),

    getPost: async (
      _: unknown,
      { id }: QueryGetPostArgs
    ): Promise<PostDbObject | null> => provider.postsAction.getSinglePost(id),
  },

  Mutation: {
    publishPost: async (
      _: unknown,
      { input: { title, content } }: MutationPublishPostArgs
    ): Promise<PostDbObject | null> => {
      try {
        const payload: PostDbObject | { publishedAt: string } = {
          title,
          content,
          author: new ObjectID(MOCK_MONGO_USER_ID),
          publishedAt: new Date().toISOString(),
        };
        return provider.postsAction.insertPost(payload);
      } catch (error) {
        console.error({ error });
        return null;
      }
    },

    likePost: async (
      _: unknown,
      { postId }: MutationLikePostArgs
    ): Promise<PostDbObject | null> => {
      try {
        return provider.postsAction.likePost({ postId });
      } catch (error) {
        console.error({ error });
        return null;
      }
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
