import mongoose, { Schema } from 'mongoose';

import type { Comment, Like, User } from 'types/types';

const UserSchema = new Schema<User>({
  _id: {
    required: true,
    type: Schema.Types.ObjectId,
  },
  email: {
    required: false,
    type: String,
  },
  initials: {
    required: true,
    type: String,
  },
  name: {
    required: true,
    type: String,
  },
  profilePicture: String,
});

const CommentSchema = new Schema<Comment>({
  author: {
    ref: 'User',
    required: true,
    type: Schema.Types.ObjectId,
  },
  comment: {
    required: true,
    type: String,
  },
  date: {
    default: Date.now,
    type: Date,
  },
  project: {
    required: true,
    type: String,
  },
});

const LikeSchema = new Schema<Like>({
  author: {
    ref: 'User',
    required: true,
    type: Schema.Types.ObjectId,
  },
  date: {
    default: Date.now,
    type: Date,
  },
  project: {
    required: true,
    type: String,
  },
});

export const CommentDocument = mongoose.model('Comment', CommentSchema);
export const LikeDocument = mongoose.model('Like', LikeSchema);
export const UserDocument = mongoose.model('User', UserSchema);
