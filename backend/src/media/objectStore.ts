export type ObjectPutInput = { key: string; body: Buffer; contentType: string };

export interface ObjectStore {
  put(input: ObjectPutInput): Promise<{ url: string }>;
  delete(key: string): Promise<void>;
}
