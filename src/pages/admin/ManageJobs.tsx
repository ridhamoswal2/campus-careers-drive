import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Building2,
  MapPin,
  Calendar,
  Users,
  Loader2,
  PlusCircle,
  Briefcase,
  Edit,
  Eye,
  Search,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';

interface Job {
  id: string;
  company_name: string;
  job_title: string;
  location: string;
  job_type: string;
  openings: number;
  applications_count: number;
  deadline: string;
  is_active: boolean;
  created_at: string;
}

export default function ManageJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || job.job_type === typeFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && job.is_active) ||
      (statusFilter === 'inactive' && !job.is_active);
    return matchesSearch && matchesType && matchesStatus;
  });

  async function fetchJobs() {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }

  const toggleJobStatus = async (jobId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ is_active: !currentStatus })
        .eq('id', jobId);

      if (error) throw error;

      setJobs(jobs.map((job) =>
        job.id === jobId ? { ...job, is_active: !currentStatus } : job
      ));

      toast.success(`Job ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
    }
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
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Manage Jobs</h1>
            <p className="text-muted-foreground">View and manage all job postings</p>
          </div>
          <Button variant="coral" asChild>
            <Link to="/admin/post-job">
              <PlusCircle className="w-4 h-4" />
              Post New Job
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by job title or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="part_time">Part-time</SelectItem>
                  <SelectItem value="full_time">Full-time</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-coral" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {jobs.length === 0 ? 'No jobs posted yet' : 'No jobs found'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {jobs.length === 0 ? 'Create your first job listing' : 'Try adjusting your filters'}
              </p>
              {jobs.length === 0 && (
                <Button asChild variant="coral">
                  <Link to="/admin/post-job">Post a Job</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((job) => {
              const isPastDeadline = new Date(job.deadline) < new Date();
              const isFull = job.applications_count >= job.openings;

              return (
                <Card key={job.id} className={`${!job.is_active ? 'opacity-60' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{job.job_title}</h3>
                          {getJobTypeBadge(job.job_type)}
                          {!job.is_active && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                          {isPastDeadline && job.is_active && (
                            <Badge variant="destructive">Deadline Passed</Badge>
                          )}
                          {isFull && job.is_active && (
                            <Badge variant="outline" className="border-warning text-warning">Seats Full</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-muted-foreground mb-3">
                          <Building2 className="w-4 h-4" />
                          <span>{job.company_name}</span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            Deadline: {format(new Date(job.deadline), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            {job.applications_count}/{job.openings} applications
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Active</span>
                          <Switch
                            checked={job.is_active}
                            onCheckedChange={() => toggleJobStatus(job.id, job.is_active)}
                          />
                        </div>
                        
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/edit-job/${job.id}`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/applications?job=${job.id}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            Applications
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
