import { MongoClient, Db } from 'mongodb';

class MongoConnectionManager {
  private client: MongoClient | null = null;
  private uri: string = '';

  async connect(uri: string): Promise<void> {
    if (this.client) {
      await this.disconnect();
    }
    this.uri = uri;
    this.client = new MongoClient(uri);
    await this.client.connect();
    // Verify connection
    await this.client.db('admin').command({ ping: 1 });
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.uri = '';
    }
  }

  getClient(): MongoClient {
    if (!this.client) {
      throw new Error('Not connected to MongoDB');
    }
    return this.client;
  }

  getDb(name: string): Db {
    return this.getClient().db(name);
  }

  isConnected(): boolean {
    return this.client !== null;
  }

  getUri(): string {
    return this.uri;
  }
}

export const mongoManager = new MongoConnectionManager();
