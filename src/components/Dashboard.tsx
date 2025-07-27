import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  LogOut, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Clock,
  User,
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useStudent } from '@/contexts/StudentContext';
import { Subject, AttendanceStatus } from '@/types';
import AttendanceChart from './AttendanceChart';
import SGPAChart from './SGPAChart';

const Dashboard: React.FC = () => {
  const { state, logout, syncData } = useStudent();
  const { studentData, syncStatus } = state;

  if (!studentData) return null;

  const getAttendanceStatus = (percentage: number): AttendanceStatus => {
    if (percentage >= 75) return 'excellent';
    if (percentage >= 65) return 'good';
    return 'poor';
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'excellent': return 'bg-success text-success-foreground';
      case 'good': return 'bg-warning text-warning-foreground';
      case 'poor': return 'bg-destructive text-destructive-foreground';
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />;
      case 'good': return <AlertCircle className="h-4 w-4" />;
      case 'poor': return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const lowAttendanceSubjects = studentData.subjects.filter(subject => subject.percentage < 75);
  const currentSemesterSGPA = studentData.sgpaCgpa[studentData.sgpaCgpa.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground shadow-medium">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{studentData.user.name}</h1>
                <p className="text-primary-foreground/80">
                  {studentData.user.enrollmentNumber} • {studentData.user.course}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={syncData}
                disabled={syncStatus.isLoading}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncStatus.isLoading ? 'animate-spin' : ''}`} />
                Sync
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-card backdrop-blur-sm border-0 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-primary" />
                Overall Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">
                {studentData.overallAttendance}%
              </div>
              <Progress 
                value={studentData.overallAttendance} 
                className="h-2"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Across all subjects
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card backdrop-blur-sm border-0 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-secondary" />
                Current SGPA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary mb-2">
                {currentSemesterSGPA?.sgpa || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">
                CGPA: {currentSemesterSGPA?.cgpa || 'N/A'}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Semester {studentData.user.semester}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card backdrop-blur-sm border-0 shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2 text-accent" />
                Last Sync
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold mb-2">
                {syncStatus.lastSync ? 
                  new Date(syncStatus.lastSync).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Never'
                }
              </div>
              <p className="text-sm text-muted-foreground">
                {syncStatus.lastSync ? 
                  new Date(syncStatus.lastSync).toLocaleDateString() : 
                  'No data available'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {lowAttendanceSubjects.length > 0 && (
          <Card className="border-warning bg-warning/5">
            <CardHeader>
              <CardTitle className="text-warning flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Attendance Alert
              </CardTitle>
              <CardDescription>
                {lowAttendanceSubjects.length} subject(s) below 75% attendance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lowAttendanceSubjects.map(subject => (
                  <div key={subject.id} className="flex justify-between items-center">
                    <span className="font-medium">{subject.name}</span>
                    <Badge variant="destructive">{subject.percentage}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-card backdrop-blur-sm border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-primary" />
                Attendance Overview
              </CardTitle>
              <CardDescription>
                Subject-wise attendance visualization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceChart subjects={studentData.subjects} />
            </CardContent>
          </Card>

          <Card className="bg-gradient-card backdrop-blur-sm border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-secondary" />
                Academic Progress
              </CardTitle>
              <CardDescription>
                SGPA/CGPA trend over semesters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SGPAChart data={studentData.sgpaCgpa} />
            </CardContent>
          </Card>
        </div>

        {/* Subject Cards */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <GraduationCap className="h-6 w-6 mr-2 text-primary" />
            Subject Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentData.subjects.map((subject) => {
              const status = getAttendanceStatus(subject.percentage);
              const totalAttended = subject.attendance.lectures.attended + 
                                   subject.attendance.tutorials.attended + 
                                   subject.attendance.practicals.attended;
              const totalClasses = subject.attendance.lectures.total + 
                                  subject.attendance.tutorials.total + 
                                  subject.attendance.practicals.total;
              
              return (
                <Card key={subject.id} className="bg-gradient-card backdrop-blur-sm border-0 shadow-soft hover:shadow-medium transition-all duration-200 animate-fade-in">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-sm font-semibold line-clamp-2">
                          {subject.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {subject.code}
                        </CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(status)} text-xs`}>
                        {getStatusIcon(status)}
                        <span className="ml-1">{subject.percentage}%</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Progress value={subject.percentage} className="h-2" />
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>Lectures:</span>
                          <span>{subject.attendance.lectures.attended}/{subject.attendance.lectures.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tutorials:</span>
                          <span>{subject.attendance.tutorials.attended}/{subject.attendance.tutorials.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Practicals:</span>
                          <span>{subject.attendance.practicals.attended}/{subject.attendance.practicals.total}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-xs font-medium">Total:</span>
                        <span className="text-sm font-bold">
                          {totalAttended}/{totalClasses}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;