import type { Types } from 'mongoose';

export interface Comment {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  comment: string;
  date: Date;
  project: string;
}

export interface Like {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  date: Date;
  project: string;
}

export interface User {
  _id: Types.ObjectId;
  email?: string;
  initials: string;
  name: string;
  profilePicture: string;
}

export enum EventTypes {
  ADD_COMMENT = 'addComment',
  ADD_LIKE = 'addLike',
  DELETE_COMMENT = 'deleteComment',
  DELETE_LIKE = 'deleteLike',
}
