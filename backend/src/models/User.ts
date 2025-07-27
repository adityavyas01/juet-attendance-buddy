import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types';

export interface UserDocument extends IUser, Document {}

const userSchema = new Schema<UserDocument>({
  enrollmentNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    match: /^[0-9]{2}[A-Z][0-9]{3}$/,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  course: {
    type: String,
    required: true,
    trim: true,
  },
  branch: {
    type: String,
    required: true,
    trim: true,
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  lastSync: {
    type: Date,
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true,
    },
    backgroundSync: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
    },
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.passwordHash;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes
userSchema.index({ enrollmentNumber: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ lastSync: 1 });

// Instance methods
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.passwordHash;
  return userObject;
};

export const User = mongoose.model<UserDocument>('User', userSchema);
