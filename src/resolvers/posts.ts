import { ObjectID } from 'mongodb';
import { MOCK_MONGO_USER_ID } from '../const/mocks';
import {
  MutationLikePostArgs,
  MutationPublishPostArgs,
  PostDbObject,
  QueryGetPostArgs,
  QueryGetPostsArgs,
} from '../codegen';
import {
  findAuthor,
  findLikeUsers,
  getAllPostPaginate,
  getSinglePost,
  insertPost,
  likePost,
} from '../mongo/actions/posts';

export default {
  Query: {
    getPosts: async (
      _: unknown,
      { first, page }: QueryGetPostsArgs
    ): Promise<PostDbObject[]> => getAllPostPaginate({ first, page }),

    getPost: async (
      _: unknown,
      { id }: QueryGetPostArgs
    ): Promise<PostDbObject | null> => getSinglePost(id),
  },

  Mutation: {
    publishPost: async (
      _: unknown,
      { input: { title, content } }: MutationPublishPostArgs
    ): Promise<PostDbObject | null> => {
      try {
        return insertPost(MOCK_MONGO_USER_ID, { title, content });
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
        return likePost({ postId });
      } catch (error) {
        console.error({ error });
        return null;
      }
    },
  },

  Post: {
    id: (obj: PostDbObject): ObjectID => obj._id,
    author: async (obj: PostDbObject) => findAuthor(obj),
    likedBy: async (obj: PostDbObject) => findLikeUsers(obj),
    likeCount: (obj: PostDbObject): number => obj.likedBy?.length || 0,
  },
};
