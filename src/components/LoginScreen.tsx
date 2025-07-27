import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, GraduationCap, Lock, User, Calendar } from 'lucide-react';
import { useStudent } from '@/contexts/StudentContext';
import { useToast } from '@/hooks/use-toast';

const LoginScreen: React.FC = () => {
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const { state, login } = useStudent();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!enrollmentNumber || !dateOfBirth || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await login(enrollmentNumber, password);
      toast({
        title: "Login Successful!",
        description: "Welcome to JUET Attendance Buddy",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-hero animate-gradient-shift bg-[length:200%_200%]">
      <div className="w-full max-w-md animate-fade-in">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse-gentle"></div>
            <GraduationCap className="h-20 w-20 mx-auto text-white relative z-10 animate-bounce-gentle" />
          </div>
          <h1 className="text-4xl font-bold text-white mt-6 mb-2">
            JUET Buddy
          </h1>
          <p className="text-white/80 text-lg">
            Your Smart Attendance Companion
          </p>
        </div>

        {/* Login Card */}
        <Card className="glass backdrop-blur-xl border-white/20 shadow-strong">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to access your academic dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="enrollment" className="text-sm font-medium">
                  Enrollment Number
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="enrollment"
                    type="text"
                    placeholder="221B034"
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    className="pl-10 h-12 border-0 bg-muted/50 focus:bg-muted/80 transition-all duration-200"
                    disabled={state.syncStatus.isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob" className="text-sm font-medium">
                  Date of Birth
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="pl-10 h-12 border-0 bg-muted/50 focus:bg-muted/80 transition-all duration-200"
                    disabled={state.syncStatus.isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 border-0 bg-muted/50 focus:bg-muted/80 transition-all duration-200"
                    disabled={state.syncStatus.isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-primary hover:opacity-90 transition-all duration-200 font-semibold shadow-medium"
                disabled={state.syncStatus.isLoading}
              >
                {state.syncStatus.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {state.syncStatus.error && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive text-sm text-center">
                  {state.syncStatus.error}
                </p>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Securely connects to WebKiosk • Auto-syncs your data
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-white/60 text-sm">
            Made with ❤️ for JUET Students
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;