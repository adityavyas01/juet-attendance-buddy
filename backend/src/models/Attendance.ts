import mongoose, { Schema, Document } from 'mongoose';
import { IAttendanceRecord } from '../types';

export interface AttendanceDocument extends IAttendanceRecord, Document {}

const attendanceDataSchema = new Schema({
  lectures: {
    attended: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  tutorials: {
    attended: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  practicals: {
    attended: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
}, { _id: false });

const subjectSchema = new Schema({
  subjectId: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, trim: true, uppercase: true },
  faculty: { type: String, required: true, trim: true },
  attendance: { type: attendanceDataSchema, required: true },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  semester: { type: Number, required: true, min: 1, max: 8 },
  credits: { type: Number, required: true, min: 1, max: 6 },
}, { _id: false });

const attendanceSchema = new Schema<AttendanceDocument>({
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  subjects: [subjectSchema],
  overallAttendance: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
  },
  academicYear: {
    type: String,
    required: true,
    match: /^\d{4}-\d{4}$/,
  },
  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now,
  },
  syncedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
attendanceSchema.index({ userId: 1, semester: 1, academicYear: 1 }, { unique: true });
attendanceSchema.index({ syncedAt: 1 });
attendanceSchema.index({ overallAttendance: 1 });

// Instance methods
attendanceSchema.methods.calculateOverallAttendance = function() {
  let totalAttended = 0;
  let totalClasses = 0;

  this.subjects.forEach((subject: any) => {
    const { lectures, tutorials, practicals } = subject.attendance;
    totalAttended += lectures.attended + tutorials.attended + practicals.attended;
    totalClasses += lectures.total + tutorials.total + practicals.total;
  });

  this.overallAttendance = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;
  return this.overallAttendance;
};

export const Attendance = mongoose.model<AttendanceDocument>('Attendance', attendanceSchema);
