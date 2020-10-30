import { Collection, Db, MongoClient } from 'mongodb';
import { mongoUri, mongoDBName } from '../../globalConfig.json';
import environment from '../environment';
import PostAction from './actions/posts';
import UserAction from './actions/users';

export class MongoDbProvider {
  private database?: Db;

  private databaseName: string;

  private mongoClient: MongoClient;

  constructor(url: string, databaseName: string) {
    this.mongoClient = new MongoClient(url, { useUnifiedTopology: true });
    this.databaseName = databaseName;
  }

  get postsCollection(): Collection {
    const collection = this.getCollection('posts');
    if (!collection) throw new Error('Posts collection is undefined');
    return collection;
  }

  get postsAction(): PostAction {
    return new PostAction(this as MongoDbProvider);
  }

  get usersCollection(): Collection {
    const collection = this.getCollection('users');
    if (!collection) throw new Error('Users collection is undefined');
    return collection;
  }

  get usersAction(): UserAction {
    return new UserAction(this as MongoDbProvider);
  }

  async connectAsync(): Promise<void> {
    await this.mongoClient.connect();
    this.database = this.mongoClient.db(this.databaseName);
  }

  async closeAsync(): Promise<void> {
    this.mongoClient.close();
  }

  async removeAllData(): Promise<void> {
    await this.postsCollection.deleteMany({});
    await this.usersCollection.deleteMany({});
  }

  private getCollection<T>(collectionName: string): Collection {
    if (!this.database) throw new Error('Database is undefined');
    return this.database.collection<T>(collectionName);
  }
}

export const mongoDbProvider = new MongoDbProvider(
  environment.mongodb.url,
  environment.mongodb.dbName
);

export const mongoDbMockProvider = new MongoDbProvider(mongoUri, mongoDBName);
