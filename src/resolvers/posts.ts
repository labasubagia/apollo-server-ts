import { ObjectID } from 'mongodb';
import { MOCK_MONGO_USER_ID } from '../const/mocks';
import { PAGINATION_SORT_ASC } from '../const/pagination';
import {
  MutationLikePostArgs,
  MutationPublishPostArgs,
  PostDbObject,
  QueryGetPostArgs,
  QueryGetPostsArgs,
} from '../generated/codegen';
import { MongoDbProvider } from '../mongo/provider';

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
      { input: { title, content } }: MutationPublishPostArgs
    ): Promise<PostDbObject | null> => {
      try {
        // TODO: add user authentication for author
        const payload: PostDbObject = {
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
        // TODO: add user authentication for author
        return provider.postsAction.likePost({
          userId: MOCK_MONGO_USER_ID,
          postId,
        });
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
