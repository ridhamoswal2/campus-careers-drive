import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Building2,
} from 'lucide-react';
import { format } from 'date-fns';

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  selected: number;
  rejected: number;
  shortlisted: number;
}

interface RecentApplication {
  id: string;
  status: string;
  applied_at: string;
  profiles: {
    full_name: string;
    department: string;
  };
  jobs: {
    job_title: string;
    company_name: string;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    selected: 0,
    rejected: 0,
    shortlisted: 0,
  });
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch job counts
        const { count: totalJobs } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true });

        const { count: activeJobs } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        // Fetch application counts
        const { data: applications } = await supabase
          .from('applications')
          .select('status');

        const totalApplications = applications?.length || 0;
        const selected = applications?.filter((a) => a.status === 'selected').length || 0;
        const rejected = applications?.filter((a) => a.status === 'rejected').length || 0;
        const shortlisted = applications?.filter((a) => a.status === 'shortlisted' || a.status === 'next_round').length || 0;

        setStats({
          totalJobs: totalJobs || 0,
          activeJobs: activeJobs || 0,
          totalApplications,
          selected,
          rejected,
          shortlisted,
        });

        // Fetch recent applications
        const { data: recentApps } = await supabase
          .from('applications')
          .select(`
            id,
            status,
            applied_at,
            profiles:student_id (
              full_name,
              department
            ),
            jobs (
              job_title,
              company_name
            )
          `)
          .order('applied_at', { ascending: false })
          .limit(5);

        setRecentApplications(recentApps as any || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      applied: 'text-muted-foreground',
      shortlisted: 'text-teal',
      rejected: 'text-destructive',
      selected: 'text-success',
      next_round: 'text-primary',
    };
    return colors[status] || 'text-muted-foreground';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage placements and track applications</p>
          </div>
          <Button variant="coral" asChild>
            <Link to="/admin/post-job">
              <PlusCircle className="w-4 h-4" />
              Post New Job
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: 'Total Jobs', value: stats.totalJobs, icon: Briefcase, color: 'text-primary bg-primary/10', link: '/admin/manage-jobs' },
            { label: 'Active Jobs', value: stats.activeJobs, icon: TrendingUp, color: 'text-teal bg-teal/10', link: '/admin/manage-jobs' },
            { label: 'Applications', value: stats.totalApplications, icon: Users, color: 'text-coral bg-coral/10', link: '/admin/applications' },
            { label: 'Shortlisted', value: stats.shortlisted, icon: TrendingUp, color: 'text-warning bg-warning/10', link: '/admin/applications?status=shortlisted' },
            { label: 'Selected', value: stats.selected, icon: CheckCircle, color: 'text-success bg-success/10', link: '/admin/applications?status=selected' },
            { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-destructive bg-destructive/10', link: '/admin/applications?status=rejected' },
          ].map((stat) => (
            <Link key={stat.label} to={stat.link}>
              <Card className="hover-lift cursor-pointer hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-display font-bold">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Recent Applications</CardTitle>
                <CardDescription>Latest student applications</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/applications">
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
                <p className="text-muted-foreground text-center py-8">No applications yet</p>
              ) : (
                recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{app.profiles?.full_name || 'Unknown'}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          Applied for {app.jobs?.job_title} at {app.jobs?.company_name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(app.applied_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <span className={`text-sm font-medium capitalize ${getStatusColor(app.status)}`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Link
                to="/admin/post-job"
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-coral/50 hover:bg-coral/5 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-coral/10 flex items-center justify-center">
                  <PlusCircle className="w-6 h-6 text-coral" />
                </div>
                <div>
                  <h4 className="font-medium">Post New Job</h4>
                  <p className="text-sm text-muted-foreground">Create a new job listing</p>
                </div>
              </Link>

              <Link
                to="/admin/manage-jobs"
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Manage Jobs</h4>
                  <p className="text-sm text-muted-foreground">Edit or close job listings</p>
                </div>
              </Link>

              <Link
                to="/admin/applications"
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-teal/50 hover:bg-teal/5 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-teal" />
                </div>
                <div>
                  <h4 className="font-medium">Review Applications</h4>
                  <p className="text-sm text-muted-foreground">Process student applications</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
