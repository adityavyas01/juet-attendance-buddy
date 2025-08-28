import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types';

export interface UserDocument extends Document {
  enrollmentNumber: string;
  name: string;
  course: string;
  branch: string;
  semester: number;
  passwordHash: string;
  dateOfBirth: string;
  // Encrypted WebKiosk credentials for auto-login
  webkioskCredentials?: {
    encryptedPassword: string;
    lastValidated?: Date;
    autoLoginEnabled: boolean;
  };
  isActive: boolean;
  lastLogin?: Date;
  lastSync?: Date;
  webkioskData?: {
    attendance?: any[];
    sgpa?: any[];
    lastSync?: Date;
  };
  preferences: {
    notifications: boolean;
    backgroundSync: boolean;
    theme: 'light' | 'dark' | 'auto';
    rememberCredentials: boolean;
  };
  toSafeObject(): Omit<UserDocument, 'passwordHash' | 'webkioskCredentials' | '__v'>;
}

const userSchema = new Schema<UserDocument>({
  enrollmentNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    match: /^[0-9]{2,3}[A-Z][0-9]{3}$/,
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
    validate: {
      validator: function(v: string) {
        return /^\d{2}-\d{2}-\d{4}$/.test(v);
      },
      message: 'Date of birth must be in DD-MM-YYYY format'
    },
  },
  // Encrypted WebKiosk credentials for seamless login
  webkioskCredentials: {
    encryptedPassword: {
      type: String,
      select: false, // Don't include in regular queries for security
    },
    lastValidated: {
      type: Date,
    },
    autoLoginEnabled: {
      type: Boolean,
      default: true,
    },
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
  webkioskData: {
    attendance: { type: Array, default: [] },
    sgpa: { type: Array, default: [] },
    lastSync: { type: Date },
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
    rememberCredentials: {
      type: Boolean,
      default: true,
    },
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.passwordHash;
      delete ret.webkioskCredentials; // Never include encrypted credentials in JSON
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
