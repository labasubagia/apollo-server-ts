import dotenv from 'dotenv';

dotenv.config();

interface Environment {
  apollo: {
    introspection: boolean;
    playground: boolean;
  };
  mongodb: {
    url: string;
    dbName: string;
  };
  jwt: {
    secretKey: string;
  };
  port: string | number;
}

const environment: Environment = {
  apollo: {
    introspection: process.env.APOLLO_INTROSPECTION === 'true',
    playground: process.env.APOLLO_PLAYGROUND === 'true',
  },
  mongodb: {
    url: process.env.MONGODB_URL as string,
    dbName: process.env.MONGODB_DB_NAME as string,
  },
  jwt: {
    secretKey: process.env.JWT_SECRET_KEY as string,
  },
  port: process.env.PORT || 4000,
};

export default environment;
