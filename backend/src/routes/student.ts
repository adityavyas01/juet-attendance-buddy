import express from 'express';
import { protect, AuthRequest } from '../middleware/auth';
import { asyncHandler, createCustomError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';
import { logger } from '../utils/logger';

const router = express.Router();

// Helper function to get fresh data from WebKiosk
const getWebKioskData = async (enrollmentNumber: string) => {
  // This would typically fetch from database first, then WebKiosk if needed
  // For now, we'll simulate cached data structure
  const { WebKioskScraper } = await import('../services/webkioskScraper');
  const scraper = new WebKioskScraper();
  
  try {
    // Note: In production, you'd fetch stored credentials or refresh data periodically
    // For now, returning cached-like data structure
    return {
      studentInfo: {
        name: "Aditya Vyas",
        enrollmentNumber: enrollmentNumber,
        course: "B.T.(CSE)",
        branch: "CSE",
        semester: 7
      },
      // This would come from your database cache
      attendance: [],
      sgpa: []
    };
  } finally {
    await scraper.cleanup();
  }
};

// @desc    Get student profile information
// @route   GET /api/student/profile
// @access  Private
router.get('/profile', protect, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const enrollmentNumber = req.user!.enrollmentNumber;
  
  try {
    const data = await getWebKioskData(enrollmentNumber);
    
    const response: ApiResponse = {
      success: true,
      message: 'Profile data retrieved successfully',
      data: {
        enrollmentNumber: enrollmentNumber,
        name: data.studentInfo.name,
        course: data.studentInfo.course,
        branch: data.studentInfo.branch,
        semester: data.studentInfo.semester,
        lastSync: new Date(),
        profilePicture: null // Can be added later
      },
      timestamp: new Date(),
    };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching profile:', error);
    throw createCustomError('Failed to fetch profile data', 500);
  }
}));

// @desc    Get all attendance data for attendance page
// @route   GET /api/student/attendance
// @access  Private
router.get('/attendance', protect, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const enrollmentNumber = req.user!.enrollmentNumber;
  
  try {
    // In production, this would fetch from database with fresh WebKiosk data
    const mockAttendanceData = [
      {
        subjectId: "18B14CI744",
        name: "AD-HOC AND WIRELESS NETWORKS",
        code: "18B14CI744",
        faculty: "Dr. Faculty Name",
        attendance: {
          lectures: { attended: 42, total: 80 },
          tutorials: { attended: 0, total: 0 },
          practicals: { attended: 0, total: 0 }
        },
        percentage: 53,
        status: "warning", // good, warning, critical
        requiredClasses: 18, // to reach 75%
        semester: 7,
        credits: 3,
        lastUpdated: new Date()
      },
      {
        subjectId: "18B14CI844",
        name: "ALGORITHMS ANALYSIS AND DESIGN",
        code: "18B14CI844",
        faculty: "Dr. Faculty Name",
        attendance: {
          lectures: { attended: 26, total: 80 },
          tutorials: { attended: 0, total: 0 },
          practicals: { attended: 0, total: 0 }
        },
        percentage: 33,
        status: "critical",
        requiredClasses: 34, // to reach 75%
        semester: 7,
        credits: 3,
        lastUpdated: new Date()
      },
      {
        subjectId: "18B14CI645",
        name: "GRAPH ALGORITHMS AND APPLICATIONS",
        code: "18B14CI645",
        faculty: "Dr. Faculty Name",
        attendance: {
          lectures: { attended: 45, total: 80 },
          tutorials: { attended: 0, total: 0 },
          practicals: { attended: 0, total: 0 }
        },
        percentage: 56,
        status: "warning",
        requiredClasses: 15, // to reach 75%
        semester: 7,
        credits: 3,
        lastUpdated: new Date()
      },
      {
        subjectId: "24B19HS792",
        name: "INTRODUCTION TO FINANCIAL MARKETS",
        code: "24B19HS792",
        faculty: "Dr. Faculty Name",
        attendance: {
          lectures: { attended: 33, total: 80 },
          tutorials: { attended: 0, total: 0 },
          practicals: { attended: 0, total: 0 }
        },
        percentage: 41,
        status: "critical",
        requiredClasses: 27, // to reach 75%
        semester: 7,
        credits: 3,
        lastUpdated: new Date()
      },
      {
        subjectId: "18B19CI791",
        name: "MAJOR PROJECT PART-1",
        code: "18B19CI791",
        faculty: "Dr. Faculty Name",
        attendance: {
          lectures: { attended: 0, total: 0 },
          tutorials: { attended: 0, total: 0 },
          practicals: { attended: 0, total: 0 }
        },
        percentage: 0,
        status: "info", // Project subject
        requiredClasses: 0,
        semester: 7,
        credits: 3,
        lastUpdated: new Date()
      },
      {
        subjectId: "18B14MA845",
        name: "OPERATIONS RESEARCH",
        code: "18B14MA845",
        faculty: "Dr. Faculty Name",
        attendance: {
          lectures: { attended: 57, total: 80 },
          tutorials: { attended: 0, total: 0 },
          practicals: { attended: 0, total: 0 }
        },
        percentage: 71,
        status: "warning",
        requiredClasses: 3, // to reach 75%
        semester: 7,
        credits: 3,
        lastUpdated: new Date()
      }
    ];

    // Calculate summary statistics
    const totalSubjects = mockAttendanceData.length;
    const averageAttendance = mockAttendanceData.reduce((sum, subject) => sum + subject.percentage, 0) / totalSubjects;
    const criticalSubjects = mockAttendanceData.filter(subject => subject.percentage < 60).length;
    const warningSubjects = mockAttendanceData.filter(subject => subject.percentage >= 60 && subject.percentage < 75).length;
    const goodSubjects = mockAttendanceData.filter(subject => subject.percentage >= 75).length;

    const response: ApiResponse = {
      success: true,
      message: 'Attendance data retrieved successfully',
      data: {
        subjects: mockAttendanceData,
        summary: {
          totalSubjects,
          averageAttendance: Math.round(averageAttendance * 100) / 100,
          criticalSubjects,
          warningSubjects,
          goodSubjects,
          lastSync: new Date()
        }
      },
      timestamp: new Date(),
    };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching attendance:', error);
    throw createCustomError('Failed to fetch attendance data', 500);
  }
}));

// @desc    Get specific subject attendance details
// @route   GET /api/student/attendance/:subjectId
// @access  Private
router.get('/attendance/:subjectId', protect, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { subjectId } = req.params;
  const enrollmentNumber = req.user!.enrollmentNumber;
  
  try {
    // Mock detailed subject data - in production, fetch from database
    const mockSubjectDetail = {
      subjectId: subjectId,
      name: "AD-HOC AND WIRELESS NETWORKS",
      code: subjectId,
      faculty: "Dr. Faculty Name",
      semester: 7,
      credits: 3,
      attendance: {
        lectures: { attended: 42, total: 80 },
        tutorials: { attended: 0, total: 0 },
        practicals: { attended: 0, total: 0 }
      },
      percentage: 53,
      status: "warning",
      requiredClasses: 18,
      weeklyProgress: [
        { week: 1, percentage: 80 },
        { week: 2, percentage: 75 },
        { week: 3, percentage: 70 },
        { week: 4, percentage: 65 },
        { week: 5, percentage: 60 },
        { week: 6, percentage: 55 },
        { week: 7, percentage: 53 }
      ],
      recentClasses: [
        { date: "2025-08-28", type: "lecture", status: "present" },
        { date: "2025-08-27", type: "lecture", status: "absent" },
        { date: "2025-08-26", type: "lecture", status: "present" },
        { date: "2025-08-25", type: "lecture", status: "present" },
        { date: "2025-08-24", type: "lecture", status: "absent" }
      ],
      lastUpdated: new Date()
    };

    const response: ApiResponse = {
      success: true,
      message: 'Subject details retrieved successfully',
      data: mockSubjectDetail,
      timestamp: new Date(),
    };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching subject details:', error);
    throw createCustomError('Failed to fetch subject details', 500);
  }
}));

// @desc    Get SGPA/CGPA data for academic page
// @route   GET /api/student/academics
// @access  Private
router.get('/academics', protect, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const enrollmentNumber = req.user!.enrollmentNumber;
  
  try {
    // Mock SGPA/CGPA data - in production, fetch from database
    const mockAcademicData = {
      semesters: [
        {
          semester: 1,
          sgpa: 8.57,
          cgpa: 8.57,
          credits: 19,
          gradePoints: 163,
          status: "completed",
          subjects: [
            { name: "Mathematics I", code: "MATH101", credits: 4, grade: "A", gradePoints: 9 },
            { name: "Physics I", code: "PHY101", credits: 3, grade: "A+", gradePoints: 10 },
            { name: "Chemistry", code: "CHE101", credits: 3, grade: "B+", gradePoints: 8 },
            { name: "English", code: "ENG101", credits: 2, grade: "A", gradePoints: 9 },
            { name: "Programming", code: "CS101", credits: 4, grade: "A+", gradePoints: 10 },
            { name: "Workshop", code: "ME101", credits: 3, grade: "A", gradePoints: 9 }
          ],
          academicYear: "2022-23",
          publishedDate: "2023-01-15"
        },
        {
          semester: 2,
          sgpa: 8.75,
          cgpa: 8.66,
          credits: 22,
          gradePoints: 192,
          status: "completed",
          subjects: [
            { name: "Mathematics II", code: "MATH102", credits: 4, grade: "A+", gradePoints: 10 },
            { name: "Physics II", code: "PHY102", credits: 3, grade: "A", gradePoints: 9 },
            { name: "Data Structures", code: "CS102", credits: 4, grade: "A+", gradePoints: 10 },
            { name: "Digital Logic", code: "ECE101", credits: 3, grade: "A", gradePoints: 9 },
            { name: "Environmental Science", code: "ENV101", credits: 2, grade: "B+", gradePoints: 8 },
            { name: "Engineering Drawing", code: "ME102", credits: 3, grade: "A", gradePoints: 9 },
            { name: "Communication Skills", code: "ENG102", credits: 3, grade: "A", gradePoints: 9 }
          ],
          academicYear: "2022-23",
          publishedDate: "2023-06-15"
        },
        {
          semester: 3,
          sgpa: 9.20,
          cgpa: 8.84,
          credits: 22,
          gradePoints: 202,
          status: "completed",
          subjects: [
            { name: "Mathematics III", code: "MATH201", credits: 4, grade: "A+", gradePoints: 10 },
            { name: "Object Oriented Programming", code: "CS201", credits: 4, grade: "A+", gradePoints: 10 },
            { name: "Computer Organization", code: "CS202", credits: 3, grade: "A+", gradePoints: 10 },
            { name: "Database Management", code: "CS203", credits: 3, grade: "A", gradePoints: 9 },
            { name: "Discrete Mathematics", code: "MATH202", credits: 3, grade: "A+", gradePoints: 10 },
            { name: "Economics", code: "ECO201", credits: 2, grade: "A", gradePoints: 9 },
            { name: "Technical Writing", code: "ENG201", credits: 3, grade: "A", gradePoints: 9 }
          ],
          academicYear: "2023-24",
          publishedDate: "2024-01-15"
        },
        {
          semester: 4,
          sgpa: 8.95,
          cgpa: 8.87,
          credits: 23,
          gradePoints: 206,
          status: "completed",
          subjects: [
            { name: "Design & Analysis of Algorithms", code: "CS301", credits: 4, grade: "A+", gradePoints: 10 },
            { name: "Operating Systems", code: "CS302", credits: 4, grade: "A", gradePoints: 9 },
            { name: "Computer Networks", code: "CS303", credits: 3, grade: "A+", gradePoints: 10 },
            { name: "Software Engineering", code: "CS304", credits: 3, grade: "A", gradePoints: 9 },
            { name: "Theory of Computation", code: "CS305", credits: 3, grade: "A", gradePoints: 9 },
            { name: "Probability & Statistics", code: "MATH301", credits: 3, grade: "B+", gradePoints: 8 },
            { name: "Humanities Elective", code: "HUM301", credits: 3, grade: "A", gradePoints: 9 }
          ],
          academicYear: "2023-24",
          publishedDate: "2024-06-15"
        },
        {
          semester: 5,
          sgpa: 8.65,
          cgpa: 8.78,
          credits: 23,
          gradePoints: 199,
          status: "completed",
          subjects: [
            { name: "Machine Learning", code: "CS401", credits: 4, grade: "A", gradePoints: 9 },
            { name: "Compiler Design", code: "CS402", credits: 4, grade: "A+", gradePoints: 10 },
            { name: "Computer Graphics", code: "CS403", credits: 3, grade: "A", gradePoints: 9 },
            { name: "Web Technologies", code: "CS404", credits: 3, grade: "A", gradePoints: 9 },
            { name: "Information Security", code: "CS405", credits: 3, grade: "B+", gradePoints: 8 },
            { name: "Management", code: "MGT401", credits: 3, grade: "A", gradePoints: 9 },
            { name: "Technical Elective I", code: "CS406", credits: 3, grade: "A", gradePoints: 9 }
          ],
          academicYear: "2024-25",
          publishedDate: "2025-01-15"
        },
        {
          semester: 6,
          sgpa: 8.40,
          cgpa: 8.72,
          credits: 19,
          gradePoints: 160,
          status: "completed",
          subjects: [
            { name: "Artificial Intelligence", code: "CS501", credits: 4, grade: "A", gradePoints: 9 },
            { name: "Mobile App Development", code: "CS502", credits: 4, grade: "A+", gradePoints: 10 },
            { name: "Cloud Computing", code: "CS503", credits: 3, grade: "B+", gradePoints: 8 },
            { name: "Project Management", code: "MGT501", credits: 3, grade: "A", gradePoints: 9 },
            { name: "Technical Elective II", code: "CS504", credits: 3, grade: "A", gradePoints: 9 },
            { name: "Mini Project", code: "CS505", credits: 2, grade: "A", gradePoints: 9 }
          ],
          academicYear: "2024-25",
          publishedDate: "2025-06-15"
        },
        {
          semester: 7,
          sgpa: null, // Current semester
          cgpa: 8.72, // Carried forward
          credits: 18,
          gradePoints: null,
          status: "ongoing",
          subjects: [
            { name: "Ad-hoc and Wireless Networks", code: "18B14CI744", credits: 3, grade: null, gradePoints: null },
            { name: "Algorithms Analysis and Design", code: "18B14CI844", credits: 3, grade: null, gradePoints: null },
            { name: "Graph Algorithms and Applications", code: "18B14CI645", credits: 3, grade: null, gradePoints: null },
            { name: "Introduction to Financial Markets", code: "24B19HS792", credits: 3, grade: null, gradePoints: null },
            { name: "Major Project Part-1", code: "18B19CI791", credits: 3, grade: null, gradePoints: null },
            { name: "Operations Research", code: "18B14MA845", credits: 3, grade: null, gradePoints: null }
          ],
          academicYear: "2025-26",
          publishedDate: null
        }
      ],
      overall: {
        currentCGPA: 8.72,
        totalCredits: 126,
        totalSemesters: 6,
        rank: null, // Can be added if available
        percentage: 87.2,
        classification: "First Class with Distinction"
      },
      trends: {
        cgpaProgress: [8.57, 8.66, 8.84, 8.87, 8.78, 8.72],
        sgpaProgress: [8.57, 8.75, 9.20, 8.95, 8.65, 8.40],
        predictions: {
          expectedCGPA: 8.75,
          targetCGPA: 9.0,
          requiredSGPA: 9.5
        }
      },
      lastUpdated: new Date()
    };

    const response: ApiResponse = {
      success: true,
      message: 'Academic data retrieved successfully',
      data: mockAcademicData,
      timestamp: new Date(),
    };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching academic data:', error);
    throw createCustomError('Failed to fetch academic data', 500);
  }
}));

// @desc    Get specific semester details
// @route   GET /api/student/academics/:semester
// @access  Private
router.get('/academics/:semester', protect, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const { semester } = req.params;
  const enrollmentNumber = req.user!.enrollmentNumber;
  
  try {
    // Mock specific semester data
    const semesterNum = parseInt(semester);
    
    if (semesterNum < 1 || semesterNum > 8) {
      throw createCustomError('Invalid semester number', 400);
    }

    // This would fetch specific semester data from database
    const mockSemesterData = {
      semester: semesterNum,
      sgpa: semesterNum <= 6 ? 8.5 + (Math.random() * 1) : null,
      cgpa: 8.72,
      credits: 22,
      gradePoints: semesterNum <= 6 ? 187 + (Math.random() * 20) : null,
      status: semesterNum <= 6 ? "completed" : semesterNum === 7 ? "ongoing" : "upcoming",
      subjects: [
        // This would be actual subject data for the semester
      ],
      academicYear: semesterNum <= 2 ? "2022-23" : semesterNum <= 4 ? "2023-24" : semesterNum <= 6 ? "2024-25" : "2025-26",
      publishedDate: semesterNum <= 6 ? "2025-01-15" : null,
      examSchedule: semesterNum === 7 ? [
        { subject: "Ad-hoc and Wireless Networks", date: "2025-12-01", time: "09:00 AM" },
        { subject: "Algorithms Analysis", date: "2025-12-03", time: "09:00 AM" }
      ] : null
    };

    const response: ApiResponse = {
      success: true,
      message: `Semester ${semesterNum} data retrieved successfully`,
      data: mockSemesterData,
      timestamp: new Date(),
    };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching semester details:', error);
    throw createCustomError('Failed to fetch semester details', 500);
  }
}));

// @desc    Get dashboard summary data
// @route   GET /api/student/dashboard
// @access  Private
router.get('/dashboard', protect, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const enrollmentNumber = req.user!.enrollmentNumber;
  
  try {
    // Aggregate data for dashboard overview
    const dashboardData = {
      profile: {
        name: "Aditya Vyas",
        enrollmentNumber: enrollmentNumber,
        semester: 7,
        course: "B.T.(CSE)"
      },
      attendanceSummary: {
        averageAttendance: 52.33,
        totalSubjects: 6,
        criticalSubjects: 2,
        warningSubjects: 3,
        goodSubjects: 0
      },
      academicSummary: {
        currentCGPA: 8.72,
        currentSemester: 7,
        totalCredits: 126,
        expectedGraduation: "May 2026"
      },
      recentActivities: [
        { type: "attendance", message: "Attendance updated for Operations Research", time: "2 hours ago" },
        { type: "grade", message: "SGPA published for Semester 6", time: "1 day ago" },
        { type: "alert", message: "Low attendance in Algorithms Analysis", time: "3 days ago" }
      ],
      quickStats: {
        classesToday: 3,
        assignmentsPending: 2,
        upcomingExams: 5,
        notifications: 1
      },
      lastSync: new Date()
    };

    const response: ApiResponse = {
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: dashboardData,
      timestamp: new Date(),
    };

    res.json(response);
  } catch (error) {
    logger.error('Error fetching dashboard:', error);
    throw createCustomError('Failed to fetch dashboard data', 500);
  }
}));

// @desc    Force sync with WebKiosk
// @route   POST /api/student/sync
// @access  Private
router.post('/sync', protect, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  const enrollmentNumber = req.user!.enrollmentNumber;
  const { syncType = 'full' } = req.body; // full, attendance_only, sgpa_only
  
  try {
    // This would trigger actual WebKiosk sync
    logger.info(`Sync requested for ${enrollmentNumber}, type: ${syncType}`);
    
    // Mock sync response
    const syncResult = {
      syncedAt: new Date(),
      attendanceUpdated: syncType === 'full' || syncType === 'attendance_only',
      sgpaUpdated: syncType === 'full' || syncType === 'sgpa_only',
      newSubjects: 0,
      changes: [
        { type: 'attendance', subject: 'Operations Research', old: 70, new: 71 }
      ]
    };

    const response: ApiResponse = {
      success: true,
      message: 'Data synced successfully',
      data: syncResult,
      timestamp: new Date(),
    };

    res.json(response);
  } catch (error) {
    logger.error('Error syncing data:', error);
    throw createCustomError('Failed to sync data', 500);
  }
}));

export { router as studentRoutes };
