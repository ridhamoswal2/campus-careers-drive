import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Calendar,
  FileText,
  Loader2,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';

interface Application {
  id: string;
  status: string;
  applied_at: string;
  updated_at: string;
  admin_remarks: string | null;
  jobs: {
    id: string;
    company_name: string;
    job_title: string;
    location: string;
    job_type: string;
  };
}

export default function StudentApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    async function fetchApplications() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('applications')
          .select(`
            id,
            status,
            applied_at,
            updated_at,
            admin_remarks,
            jobs (
              id,
              company_name,
              job_title,
              location,
              job_type
            )
          `)
          .eq('student_id', user.id)
          .order('applied_at', { ascending: false });

        if (error) throw error;
        setApplications(data as any || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      applied: { className: 'bg-secondary text-secondary-foreground', label: 'Applied' },
      shortlisted: { className: 'bg-teal text-accent-foreground', label: 'Shortlisted' },
      rejected: { className: 'bg-destructive text-destructive-foreground', label: 'Rejected' },
      selected: { className: 'bg-success text-primary-foreground', label: 'Selected' },
      next_round: { className: 'bg-primary text-primary-foreground', label: 'Next Round' },
    };
    const config = variants[status] || { className: 'bg-secondary', label: status };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const filteredApplications = applications.filter((app) => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  const statusCounts = {
    all: applications.length,
    applied: applications.filter((a) => a.status === 'applied').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    selected: applications.filter((a) => a.status === 'selected').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">My Applications</h1>
          <p className="text-muted-foreground">Track the status of your job applications</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
            <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="applied">Applied ({statusCounts.applied})</TabsTrigger>
            <TabsTrigger value="shortlisted">Shortlisted ({statusCounts.shortlisted})</TabsTrigger>
            <TabsTrigger value="selected">Selected ({statusCounts.selected})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({statusCounts.rejected})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredApplications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No applications found</h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === 'all'
                      ? "You haven't applied to any jobs yet"
                      : `No ${activeTab} applications`}
                  </p>
                  {activeTab === 'all' && (
                    <Button asChild>
                      <Link to="/student/jobs">Browse Jobs</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredApplications.map((app) => {
                  if (!app.jobs) return null;
                  return (
                    <Card key={app.id} className="hover-lift">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{app.jobs.job_title}</h3>
                              {getStatusBadge(app.status)}
                            </div>
                            
                            <div className="flex items-center gap-2 text-muted-foreground mb-3">
                              <Building2 className="w-4 h-4" />
                              <span>{app.jobs.company_name}</span>
                              <span className="text-border">•</span>
                              <span>{app.jobs.location}</span>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                Applied: {format(new Date(app.applied_at), 'MMM d, yyyy')}
                              </span>
                              {app.updated_at !== app.applied_at && (
                                <span className="flex items-center gap-1.5">
                                  Updated: {format(new Date(app.updated_at), 'MMM d, yyyy')}
                                </span>
                              )}
                            </div>

                            {app.admin_remarks && (
                              <div className="mt-4 p-3 bg-muted rounded-lg">
                                <p className="text-sm font-medium flex items-center gap-2 mb-1">
                                  <MessageSquare className="w-4 h-4" />
                                  Admin Remarks
                                </p>
                                <p className="text-sm text-muted-foreground">{app.admin_remarks}</p>
                              </div>
                            )}
                          </div>

                          <Button variant="ghost" size="icon" asChild className="hidden md:flex">
                            <Link to={`/student/jobs/${app.jobs.id}`}>
                              <ChevronRight className="w-5 h-5" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
}
