import { Collection, Db, MongoClient, ObjectID } from 'mongodb';
import { UserDbObject } from '../codegen';
import { MOCK_MONGO_USER_ID } from '../const/mocks';
import environment from '../environment';

export class MongoDbProvider {
  private database?: Db;

  private mongoClient: MongoClient;

  constructor(url: string) {
    this.mongoClient = new MongoClient(url, { useUnifiedTopology: true });
  }

  get postsCollection(): Collection {
    const collection = this.getCollection('posts');
    if (!collection) throw new Error('Posts collection is undefined');
    return collection;
  }

  get usersCollection(): Collection {
    const collection = this.getCollection('users');
    if (!collection) throw new Error('Users collection is undefined');
    return collection;
  }

  async connectAsync(databaseName: string): Promise<void> {
    await this.mongoClient.connect();
    this.database = this.mongoClient.db(databaseName);
  }

  async closeAsync(): Promise<void> {
    this.mongoClient.close();
  }

  private getCollection(collectionName: string): Collection {
    if (!this.database) throw new Error('Database is undefined');
    return this.database.collection(collectionName);
  }
}

export const mongoDbProvider = new MongoDbProvider(environment.mongodb.url);

export const addMockUserAsync = async (): Promise<void> => {
  const count = await mongoDbProvider.usersCollection.countDocuments();
  if (count === 0) {
    const users: UserDbObject[] = [
      {
        _id: new ObjectID(MOCK_MONGO_USER_ID),
        firstName: 'Wayne',
        lastName: 'Rooney',
        email: 'wayne@mail.com',
      },
      {
        _id: new ObjectID('fedcba987654321098765432'),
        firstName: 'Christian',
        lastName: 'Fate',
        email: 'chris.fate@mail.com',
        following: [new ObjectID(MOCK_MONGO_USER_ID)],
      },
    ];
    await mongoDbProvider.usersCollection.insertMany(users);
  }
};
