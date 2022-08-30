import type { Types } from 'mongoose';

export interface Comment {
  author: Types.ObjectId;
  comment: string;
  date: Date;
  project: string;
}

export interface Like {
  author: Types.ObjectId;
  date: Date;
  project: string;
}

export interface User {
  _id: Types.ObjectId;
  initials: string;
  name: string;
  profilePicture: string;
}
