import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  ArrowLeft,
  CheckCircle,
  Clock,
  Loader2,
  Briefcase,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Job {
  id: string;
  company_name: string;
  job_title: string;
  description: string;
  responsibilities: string | null;
  required_skills: string[] | null;
  eligibility_criteria: string | null;
  location: string;
  salary_range: string | null;
  job_type: string;
  openings: number;
  applications_count: number;
  deadline: string;
  selection_process: string | null;
  is_active: boolean;
}

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id || !user) return;

      try {
        // Fetch job details
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', id)
          .single();

        if (jobError) throw jobError;
        setJob(jobData);

        // Check if already applied
        const { data: applicationData } = await supabase
          .from('applications')
          .select('id')
          .eq('job_id', id)
          .eq('student_id', user.id)
          .maybeSingle();

        setHasApplied(!!applicationData);

        // Check profile completion
        const { data: profileData } = await supabase
          .from('profiles')
          .select('profile_completed, resume_url')
          .eq('user_id', user.id)
          .single();

        setProfileComplete(profileData?.profile_completed || !!profileData?.resume_url);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load job details');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, user]);

  const handleApply = async () => {
    if (!job || !user) return;

    setApplying(true);
    try {
      const { error } = await supabase.from('applications').insert({
        job_id: job.id,
        student_id: user.id,
        status: 'applied',
      });

      if (error) {
        if (error.message.includes('duplicate')) {
          toast.error('You have already applied for this job');
        } else {
          throw error;
        }
      } else {
        setHasApplied(true);
        toast.success('Application submitted successfully!');
      }
    } catch (error) {
      console.error('Error applying:', error);
      toast.error('Failed to submit application');
    } finally {
      setApplying(false);
      setShowConfirmDialog(false);
    }
  };

  const getJobTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      internship: 'Internship',
      part_time: 'Part-time',
      full_time: 'Full-time',
    };
    const colors: Record<string, string> = {
      internship: 'bg-teal/10 text-teal border-teal/20',
      part_time: 'bg-warning/10 text-warning border-warning/20',
      full_time: 'bg-primary/10 text-primary border-primary/20',
    };
    return (
      <Badge variant="outline" className={colors[type]}>
        {labels[type] || type}
      </Badge>
    );
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </StudentLayout>
    );
  }

  if (!job) {
    return (
      <StudentLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Job not found</h3>
            <p className="text-muted-foreground mb-4">This job may have been removed or is no longer available</p>
            <Button onClick={() => navigate('/student/jobs')}>Browse Jobs</Button>
          </CardContent>
        </Card>
      </StudentLayout>
    );
  }

  const isFull = job.applications_count >= job.openings;
  const isPastDeadline = new Date(job.deadline) < new Date();
  const canApply = !hasApplied && !isFull && !isPastDeadline && job.is_active;

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="-ml-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        {/* Job Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-display font-bold">{job.job_title}</h1>
                  {getJobTypeBadge(job.job_type)}
                </div>
                
                <div className="flex items-center gap-2 text-lg text-muted-foreground mb-4">
                  <Building2 className="w-5 h-5" />
                  <span className="font-medium">{job.company_name}</span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                  {job.salary_range && (
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      {job.salary_range}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Deadline: {format(new Date(job.deadline), 'MMM d, yyyy')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {job.applications_count}/{job.openings} positions filled
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {hasApplied ? (
                  <Button disabled className="min-w-[160px]">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Applied
                  </Button>
                ) : isFull ? (
                  <Button disabled variant="secondary" className="min-w-[160px]">
                    Seats Full
                  </Button>
                ) : isPastDeadline ? (
                  <Button disabled variant="secondary" className="min-w-[160px]">
                    <Clock className="w-4 h-4 mr-2" />
                    Deadline Passed
                  </Button>
                ) : (
                  <Button
                    variant="hero"
                    className="min-w-[160px]"
                    onClick={() => setShowConfirmDialog(true)}
                  >
                    Apply Now
                  </Button>
                )}

                {!profileComplete && canApply && (
                  <p className="text-xs text-warning flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Complete profile first
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Job Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-muted-foreground">{job.description}</p>
            </CardContent>
          </Card>

          {job.responsibilities && (
            <Card>
              <CardHeader>
                <CardTitle>Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-muted-foreground">{job.responsibilities}</p>
              </CardContent>
            </Card>
          )}

          {job.required_skills && job.required_skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {job.eligibility_criteria && (
            <Card>
              <CardHeader>
                <CardTitle>Eligibility Criteria</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-muted-foreground">{job.eligibility_criteria}</p>
              </CardContent>
            </Card>
          )}

          {job.selection_process && (
            <Card>
              <CardHeader>
                <CardTitle>Selection Process</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-muted-foreground">{job.selection_process}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Apply Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Application</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to apply for <strong>{job.job_title}</strong> at <strong>{job.company_name}</strong>.
                {!profileComplete && (
                  <span className="block mt-2 text-warning">
                    Note: Your profile is incomplete. Consider updating it before applying.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleApply} disabled={applying}>
                {applying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Submit Application
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </StudentLayout>
  );
}
