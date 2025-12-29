import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Loader2,
  TrendingUp,
  Users,
  Briefcase,
  CheckCircle,
} from 'lucide-react';

interface AnalyticsData {
  totalJobs: number;
  totalApplications: number;
  totalSelected: number;
  selectionRate: number;
  jobTypeStats: { name: string; value: number }[];
  statusStats: { name: string; value: number }[];
  departmentStats: { name: string; applications: number }[];
}

const COLORS = ['hsl(234, 89%, 58%)', 'hsl(173, 80%, 40%)', 'hsl(16, 100%, 66%)', 'hsl(38, 92%, 50%)', 'hsl(142, 76%, 36%)'];

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData>({
    totalJobs: 0,
    totalApplications: 0,
    totalSelected: 0,
    selectionRate: 0,
    jobTypeStats: [],
    statusStats: [],
    departmentStats: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      // Fetch total jobs
      const { count: totalJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });

      // Fetch all applications with profiles
      const { data: applications } = await supabase
        .from('applications')
        .select(`
          status,
          profiles:student_id (
            department
          )
        `);

      // Fetch jobs for type stats
      const { data: jobs } = await supabase
        .from('jobs')
        .select('job_type');

      const totalApplications = applications?.length || 0;
      const totalSelected = applications?.filter((a) => a.status === 'selected').length || 0;
      const selectionRate = totalApplications > 0 ? (totalSelected / totalApplications) * 100 : 0;

      // Job type stats
      const jobTypeCounts: Record<string, number> = {};
      jobs?.forEach((job) => {
        const type = job.job_type;
        jobTypeCounts[type] = (jobTypeCounts[type] || 0) + 1;
      });
      const jobTypeLabels: Record<string, string> = {
        internship: 'Internship',
        part_time: 'Part-time',
        full_time: 'Full-time',
      };
      const jobTypeStats = Object.entries(jobTypeCounts).map(([name, value]) => ({
        name: jobTypeLabels[name] || name,
        value,
      }));

      // Status stats
      const statusCounts: Record<string, number> = {};
      applications?.forEach((app) => {
        statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
      });
      const statusLabels: Record<string, string> = {
        applied: 'Applied',
        shortlisted: 'Shortlisted',
        next_round: 'Next Round',
        selected: 'Selected',
        rejected: 'Rejected',
      };
      const statusStats = Object.entries(statusCounts).map(([name, value]) => ({
        name: statusLabels[name] || name,
        value,
      }));

      // Department stats
      const deptCounts: Record<string, number> = {};
      applications?.forEach((app: any) => {
        const dept = app.profiles?.department || 'Unknown';
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
      });
      const departmentStats = Object.entries(deptCounts)
        .map(([name, applications]) => ({ name, applications }))
        .sort((a, b) => b.applications - a.applications)
        .slice(0, 6);

      setData({
        totalJobs: totalJobs || 0,
        totalApplications,
        totalSelected,
        selectionRate,
        jobTypeStats,
        statusStats,
        departmentStats,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-coral" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track placement statistics and insights</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Jobs', value: data.totalJobs, icon: Briefcase, color: 'text-primary bg-primary/10' },
            { label: 'Applications', value: data.totalApplications, icon: Users, color: 'text-coral bg-coral/10' },
            { label: 'Selected', value: data.totalSelected, icon: CheckCircle, color: 'text-success bg-success/10' },
            { label: 'Selection Rate', value: `${data.selectionRate.toFixed(1)}%`, icon: TrendingUp, color: 'text-teal bg-teal/10' },
          ].map((stat) => (
            <Card key={stat.label}>
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
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Application Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>Distribution of application statuses</CardDescription>
            </CardHeader>
            <CardContent>
              {data.statusStats.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No data available</p>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.statusStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {data.statusStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Job Types</CardTitle>
              <CardDescription>Distribution of job types posted</CardDescription>
            </CardHeader>
            <CardContent>
              {data.jobTypeStats.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No data available</p>
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.jobTypeStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {data.jobTypeStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Department-wise Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Department-wise Applications</CardTitle>
            <CardDescription>Number of applications by department</CardDescription>
          </CardHeader>
          <CardContent>
            {data.departmentStats.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.departmentStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="applications" fill="hsl(234, 89%, 58%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
