import { type Db, MongoClient } from "mongodb";

declare global {
  var mongoClientPromise: Promise<MongoClient> | undefined;
}

export async function getDatabase(): Promise<Db> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Missing MONGODB_URI. Add it to your .env.local file.");
  }

  if (!global.mongoClientPromise) {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
    // Reuse the pool in production too, and let later requests retry failures.
    global.mongoClientPromise = client.connect().catch(async (error) => {
      global.mongoClientPromise = undefined;
      await client.close().catch(() => undefined);
      throw error;
    });
  }

  const client = await global.mongoClientPromise;
  return client.db(process.env.MONGODB_DB || "fitmess-ai");
}
