export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  folderId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  isExpanded: boolean;
  createdAt: Date;
  updatedAt: Date;
}