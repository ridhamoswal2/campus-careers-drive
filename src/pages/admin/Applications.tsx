import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Search,
  Users,
  Loader2,
  ExternalLink,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  Filter,
  Download,
  User,
} from 'lucide-react';
import { format } from 'date-fns';
import { ViewProfileDialog } from '@/components/admin/ViewProfileDialog';
import { exportApplicationsToExcel } from '@/utils/exportToExcel';

type ApplicationStatus = 'applied' | 'shortlisted' | 'rejected' | 'selected' | 'next_round';

interface Application {
  id: string;
  status: ApplicationStatus;
  applied_at: string;
  admin_remarks: string | null;
  job_id: string;
  student_id: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
    department: string;
    year_of_study: number;
    cgpa: number;
    skills: string[];
    resume_url: string;
  };
  jobs: {
    id: string;
    job_title: string;
    company_name: string;
  };
}

interface Job {
  id: string;
  job_title: string;
  company_name: string;
}

export default function AdminApplications() {
  const [searchParams] = useSearchParams();
  const jobFilter = searchParams.get('job') || 'all';

  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(jobFilter);
  
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('applied');
  const [remarks, setRemarks] = useState('');
  const [updating, setUpdating] = useState(false);
  const [viewProfileOpen, setViewProfileOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      // Fetch jobs for filter
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id, job_title, company_name')
        .order('created_at', { ascending: false });

      setJobs(jobsData || []);

      // Fetch applications with profile data
      const { data: appsData, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          applied_at,
          admin_remarks,
          job_id,
          student_id,
          jobs (
            id,
            job_title,
            company_name
          )
        `)
        .order('applied_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for each application
      const applicationsWithProfiles = await Promise.all(
        (appsData || []).map(async (app) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email, phone, department, year_of_study, cgpa, skills, resume_url')
            .eq('user_id', app.student_id)
            .maybeSingle();
          
          return {
            ...app,
            profiles: profileData
          };
        })
      );

      setApplications(applicationsWithProfiles as any || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedApp || !newStatus) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status: newStatus as ApplicationStatus,
          admin_remarks: remarks || null,
        })
        .eq('id', selectedApp.id);

      if (error) throw error;

      setApplications(applications.map((app) =>
        app.id === selectedApp.id
          ? { ...app, status: newStatus as ApplicationStatus, admin_remarks: remarks || null }
          : app
      ));

      toast.success('Application status updated');
      setSelectedApp(null);
      setNewStatus('applied');
      setRemarks('');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const openUpdateDialog = (app: Application) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setRemarks(app.admin_remarks || '');
  };

  const openViewProfile = async (studentId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', studentId)
        .maybeSingle();
      
      if (data) {
        setSelectedProfile(data);
        setViewProfileOpen(true);
      }
    } catch (error) {
      toast.error('Failed to load profile');
    }
  };

  const handleExport = () => {
    const selectedJobData = jobs.find((j) => j.id === selectedJob);
    if (selectedJob === 'all') {
      toast.error('Please select a specific job to export');
      return;
    }
    if (filteredApplications.length === 0) {
      toast.error('No applications to export');
      return;
    }
    exportApplicationsToExcel(
      filteredApplications,
      selectedJobData?.job_title || 'Job',
      selectedJobData?.company_name || 'Company'
    );
    toast.success('Applications exported successfully');
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesJob = selectedJob === 'all' || app.job_id === selectedJob;
    return matchesSearch && matchesStatus && matchesJob;
  });

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Applications</h1>
            <p className="text-muted-foreground">Review and manage student applications</p>
          </div>
          {selectedJob !== 'all' && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export to Excel
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger className="w-[200px]">
                  <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filter by Job" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.job_title} - {job.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="next_round">Next Round</SelectItem>
                  <SelectItem value="selected">Selected</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-coral" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No applications found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || selectedJob !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No applications have been received yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredApplications.map((app) => (
              <Card key={app.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{app.profiles?.full_name || 'Unknown'}</h3>
                        {getStatusBadge(app.status)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        Applied for <span className="font-medium">{app.jobs?.job_title}</span> at{' '}
                        <span className="font-medium">{app.jobs?.company_name}</span>
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{app.profiles?.email}</span>
                        </div>
                        {app.profiles?.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span>{app.profiles.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <GraduationCap className="w-4 h-4" />
                          <span>{app.profiles?.department} | Year {app.profiles?.year_of_study}</span>
                        </div>
                        {app.profiles?.cgpa && (
                          <div className="text-muted-foreground">
                            CGPA: <span className="font-medium">{app.profiles.cgpa}</span>
                          </div>
                        )}
                      </div>

                      {app.profiles?.skills && app.profiles.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {app.profiles.skills.slice(0, 5).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {app.profiles.skills.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{app.profiles.skills.length - 5}
                            </Badge>
                          )}
                        </div>
                      )}

                      {app.admin_remarks && (
                        <p className="text-sm text-muted-foreground mt-3 p-2 bg-muted rounded">
                          <span className="font-medium">Remarks:</span> {app.admin_remarks}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground mt-3">
                        Applied on {format(new Date(app.applied_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" onClick={() => openViewProfile(app.student_id)}>
                        <User className="w-4 h-4 mr-1" />
                        View Profile
                      </Button>
                      {app.profiles?.resume_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={app.profiles.resume_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Resume
                          </a>
                        </Button>
                      )}
                      <Button variant="coral" size="sm" onClick={() => openUpdateDialog(app)}>
                        Update Status
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Update Status Dialog */}
        <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Application Status</DialogTitle>
              <DialogDescription>
                Update the status for {selectedApp?.profiles?.full_name}'s application
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={newStatus} onValueChange={(val) => setNewStatus(val as ApplicationStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="next_round">Next Round</SelectItem>
                    <SelectItem value="selected">Selected</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Remarks (Optional)</label>
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add any notes or feedback..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedApp(null)}>
                Cancel
              </Button>
              <Button variant="coral" onClick={handleUpdateStatus} disabled={updating}>
                {updating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Profile Dialog */}
        <ViewProfileDialog
          open={viewProfileOpen}
          onOpenChange={setViewProfileOpen}
          profile={selectedProfile}
        />
      </div>
    </AdminLayout>
  );
}
