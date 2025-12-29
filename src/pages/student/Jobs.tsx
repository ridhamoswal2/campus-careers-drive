import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Briefcase,
  Users,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

interface Job {
  id: string;
  company_name: string;
  job_title: string;
  description: string;
  location: string;
  salary_range: string | null;
  job_type: string;
  openings: number;
  applications_count: number;
  deadline: string;
  required_skills: string[] | null;
}

export default function StudentJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .gt('deadline', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === 'all' || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType = typeFilter === 'all' || job.job_type === typeFilter;
    return matchesSearch && matchesLocation && matchesType;
  });

  const uniqueLocations = [...new Set(jobs.map((j) => j.location))];

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

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Browse Jobs</h1>
          <p className="text-muted-foreground">Find your perfect opportunity from {jobs.length} active listings</p>
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
              <div className="flex gap-3">
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-[160px]">
                    <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {uniqueLocations.map((loc) => (
                      <SelectItem key={loc} value={loc.toLowerCase()}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground">
                {searchTerm || locationFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Check back later for new opportunities'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((job) => {
              const isFull = job.applications_count >= job.openings;
              return (
                <Card key={job.id} className="hover-lift overflow-hidden">
                  <CardContent className="p-0">
                    <Link to={`/student/jobs/${job.id}`} className="block p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{job.job_title}</h3>
                            {getJobTypeBadge(job.job_type)}
                            {isFull && (
                              <Badge variant="destructive">Seats Full</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-muted-foreground mb-3">
                            <Building2 className="w-4 h-4" />
                            <span className="font-medium">{job.company_name}</span>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {job.description}
                          </p>

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
                              {job.applications_count}/{job.openings} applied
                            </span>
                          </div>

                          {job.required_skills && job.required_skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {job.required_skills.slice(0, 4).map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {job.required_skills.length > 4 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{job.required_skills.length - 4} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex md:flex-col items-center md:items-end gap-3">
                          <Button
                            variant={isFull ? 'secondary' : 'hero'}
                            disabled={isFull}
                            className="whitespace-nowrap"
                          >
                            {isFull ? 'Closed' : 'View Details'}
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
