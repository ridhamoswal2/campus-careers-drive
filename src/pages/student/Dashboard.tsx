import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  FileText,
  CheckCircle,
  Clock,
  ArrowRight,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

interface DashboardStats {
  totalJobs: number;
  appliedJobs: number;
  shortlisted: number;
  selected: number;
}

interface RecentJob {
  id: string;
  company_name: string;
  job_title: string;
  location: string;
  job_type: string;
  deadline: string;
  openings: number;
  applications_count: number;
}

interface RecentApplication {
  id: string;
  status: string;
  applied_at: string;
  jobs: {
    company_name: string;
    job_title: string;
  };
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    appliedJobs: 0,
    shortlisted: 0,
    selected: 0,
  });
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        // Fetch total active jobs
        const { count: jobsCount } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .gt('deadline', new Date().toISOString());

        // Fetch user's applications
        const { data: applications } = await supabase
          .from('applications')
          .select('status')
          .eq('student_id', user.id);

        const appliedCount = applications?.length || 0;
        const shortlistedCount = applications?.filter(a => a.status === 'shortlisted' || a.status === 'next_round').length || 0;
        const selectedCount = applications?.filter(a => a.status === 'selected').length || 0;

        setStats({
          totalJobs: jobsCount || 0,
          appliedJobs: appliedCount,
          shortlisted: shortlistedCount,
          selected: selectedCount,
        });

        // Fetch recent jobs
        const { data: jobs } = await supabase
          .from('jobs')
          .select('id, company_name, job_title, location, job_type, deadline, openings, applications_count')
          .eq('is_active', true)
          .gt('deadline', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentJobs(jobs || []);

        // Fetch recent applications
        const { data: recentApps } = await supabase
          .from('applications')
          .select(`
            id,
            status,
            applied_at,
            jobs (
              company_name,
              job_title
            )
          `)
          .eq('student_id', user.id)
          .order('applied_at', { ascending: false })
          .limit(5);

        setRecentApplications(recentApps as any || []);

        // Check profile completion
        const { data: profile } = await supabase
          .from('profiles')
          .select('profile_completed')
          .eq('user_id', user.id)
          .single();

        setProfileCompleted(profile?.profile_completed || false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      applied: { variant: 'secondary', label: 'Applied' },
      shortlisted: { variant: 'default', label: 'Shortlisted' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      selected: { variant: 'default', label: 'Selected' },
      next_round: { variant: 'outline', label: 'Next Round' },
    };
    const config = variants[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant} className={status === 'selected' ? 'bg-success' : status === 'shortlisted' ? 'bg-teal' : ''}>{config.label}</Badge>;
  };

  const getJobTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      internship: 'Internship',
      part_time: 'Part-time',
      full_time: 'Full-time',
    };
    return <Badge variant="outline">{labels[type] || type}</Badge>;
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Welcome back!</h1>
            <p className="text-muted-foreground">Here's what's happening with your job search</p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/student/jobs">
              <Briefcase className="w-4 h-4" />
              Browse Jobs
            </Link>
          </Button>
        </div>

        {/* Profile Completion Alert */}
        {!profileCompleted && !loading && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <p className="font-medium">Complete your profile</p>
                  <p className="text-sm text-muted-foreground">Add your skills, resume, and details to apply for jobs</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/student/profile">Complete Profile</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Available Jobs', value: stats.totalJobs, icon: Briefcase, color: 'text-primary bg-primary/10', link: '/student/jobs' },
            { label: 'Applied', value: stats.appliedJobs, icon: FileText, color: 'text-teal bg-teal/10', link: '/student/applications' },
            { label: 'Shortlisted', value: stats.shortlisted, icon: Clock, color: 'text-warning bg-warning/10', link: '/student/applications?status=shortlisted' },
            { label: 'Selected', value: stats.selected, icon: CheckCircle, color: 'text-success bg-success/10', link: '/student/applications?status=selected' },
          ].map((stat) => (
            <Link key={stat.label} to={stat.link}>
              <Card className="hover-lift cursor-pointer hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl md:text-3xl font-display font-bold">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Recent Job Openings</CardTitle>
                <CardDescription>Latest opportunities for you</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/student/jobs">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentJobs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No jobs available at the moment</p>
              ) : (
                recentJobs.map((job) => (
                  <Link
                    key={job.id}
                    to={`/student/jobs/${job.id}`}
                    className="block p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{job.job_title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Building2 className="w-3.5 h-3.5" />
                          <span className="truncate">{job.company_name}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(job.deadline), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getJobTypeBadge(job.job_type)}
                        {job.applications_count >= job.openings && (
                          <Badge variant="destructive" className="text-xs">Seats Full</Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Your Applications</CardTitle>
                <CardDescription>Track your application status</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/student/applications">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentApplications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You haven't applied to any jobs yet</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/student/jobs">Browse Jobs</Link>
                  </Button>
                </div>
              ) : (
                recentApplications.filter(app => app.jobs).map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-lg border border-border"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{app.jobs?.job_title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{app.jobs?.company_name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Applied {format(new Date(app.applied_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentLayout>
  );
}
