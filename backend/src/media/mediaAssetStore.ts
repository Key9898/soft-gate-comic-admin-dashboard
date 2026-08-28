export type MediaKind = 'image' | 'pdf';

export interface MediaAssetRecord {
  id: string;
  key: string;
  url: string;
  name: string;
  contentType: string;
  kind: MediaKind;
  size: number;
  category: string;
  createdAt: Date;
}

export type MediaAssetCreateInput = Omit<MediaAssetRecord, 'createdAt'>;

export interface MediaAssetStore {
  create(input: MediaAssetCreateInput): Promise<MediaAssetRecord>;
  list(): Promise<MediaAssetRecord[]>;
  findById(id: string): Promise<MediaAssetRecord | null>;
  delete(id: string): Promise<boolean>;
}
