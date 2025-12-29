import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  Briefcase,
  MapPin,
  Plus,
  X,
  Loader2,
  Save,
  ArrowLeft,
} from 'lucide-react';
import { z } from 'zod';
import EligibilitySelector from '@/components/admin/EligibilitySelector';

const jobSchema = z.object({
  company_name: z.string().min(2, 'Company name is required'),
  job_title: z.string().min(2, 'Job title is required'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  location: z.string().min(2, 'Location is required'),
  job_type: z.enum(['internship', 'part_time', 'full_time']),
  openings: z.number().min(1, 'At least 1 opening is required'),
  deadline: z.string().min(1, 'Deadline is required'),
});

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newSkill, setNewSkill] = useState('');
  
  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    description: '',
    responsibilities: '',
    required_skills: [] as string[],
    eligibility_criteria: '',
    location: '',
    salary_range: '',
    job_type: 'full_time' as 'internship' | 'part_time' | 'full_time',
    openings: 1,
    deadline: '',
    selection_process: '',
    extra_info: '',
  });

  // Eligibility state
  const [eligibleDepartments, setEligibleDepartments] = useState<string[]>([]);
  const [eligibleCourses, setEligibleCourses] = useState<string[]>([]);
  const [eligibleYears, setEligibleYears] = useState<number[]>([]);

  useEffect(() => {
    if (id) {
      fetchJob();
    }
  }, [id]);

  async function fetchJob() {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          company_name: data.company_name || '',
          job_title: data.job_title || '',
          description: data.description || '',
          responsibilities: data.responsibilities || '',
          required_skills: data.required_skills || [],
          eligibility_criteria: data.eligibility_criteria || '',
          location: data.location || '',
          salary_range: data.salary_range || '',
          job_type: data.job_type || 'full_time',
          openings: data.openings || 1,
          deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '',
          selection_process: data.selection_process || '',
          extra_info: data.extra_info || '',
        });
        setEligibleDepartments(data.eligible_departments || []);
        setEligibleCourses(data.eligible_courses || []);
        setEligibleYears(data.eligible_years || []);
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
      navigate('/admin/manage-jobs');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.required_skills.includes(newSkill.trim())) {
      handleChange('required_skills', [...formData.required_skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    handleChange('required_skills', formData.required_skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      jobSchema.parse({
        ...formData,
        openings: Number(formData.openings),
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0].toString()] = error.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          company_name: formData.company_name,
          job_title: formData.job_title,
          description: formData.description,
          responsibilities: formData.responsibilities || null,
          required_skills: formData.required_skills.length > 0 ? formData.required_skills : null,
          eligibility_criteria: formData.eligibility_criteria || null,
          location: formData.location,
          salary_range: formData.salary_range || null,
          job_type: formData.job_type,
          openings: Number(formData.openings),
          deadline: new Date(formData.deadline).toISOString(),
          selection_process: formData.selection_process || null,
          eligible_departments: eligibleDepartments as ("AIIT" | "AIT" | "ASFT" | "AIBAS" | "OTHER")[],
          eligible_courses: eligibleCourses as ("BCA" | "MCA" | "BTECH")[],
          eligible_years: eligibleYears,
          extra_info: formData.extra_info || null,
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Job updated successfully!');
      navigate('/admin/manage-jobs');
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/manage-jobs')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Edit Job</h1>
            <p className="text-muted-foreground">Update job listing details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company & Job Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Company & Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  placeholder="Google, Microsoft, etc."
                  className={errors.company_name ? 'border-destructive' : ''}
                />
                {errors.company_name && <p className="text-sm text-destructive">{errors.company_name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title *</Label>
                <Input
                  id="job_title"
                  value={formData.job_title}
                  onChange={(e) => handleChange('job_title', e.target.value)}
                  placeholder="Software Engineer, Data Analyst, etc."
                  className={errors.job_title ? 'border-destructive' : ''}
                />
                {errors.job_title && <p className="text-sm text-destructive">{errors.job_title}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  rows={5}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="responsibilities">Responsibilities (Optional)</Label>
                <Textarea
                  id="responsibilities"
                  value={formData.responsibilities}
                  onChange={(e) => handleChange('responsibilities', e.target.value)}
                  placeholder="List the key responsibilities..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Required Skills</Label>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.required_skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="px-3 py-1.5">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="ml-2 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="eligibility_criteria">Additional Eligibility Criteria (Optional)</Label>
                <Textarea
                  id="eligibility_criteria"
                  value={formData.eligibility_criteria}
                  onChange={(e) => handleChange('eligibility_criteria', e.target.value)}
                  placeholder="Minimum CGPA, specific requirements, etc."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Eligibility Selector */}
          <EligibilitySelector
            selectedDepartments={eligibleDepartments}
            selectedCourses={eligibleCourses}
            selectedYears={eligibleYears}
            onDepartmentsChange={setEligibleDepartments}
            onCoursesChange={setEligibleCourses}
            onYearsChange={setEligibleYears}
          />

          {/* Job Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Job Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Bangalore, Remote, etc."
                  className={errors.location ? 'border-destructive' : ''}
                />
                {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary_range">Salary / Stipend (Optional)</Label>
                <Input
                  id="salary_range"
                  value={formData.salary_range}
                  onChange={(e) => handleChange('salary_range', e.target.value)}
                  placeholder="₹10-15 LPA, ₹25,000/month, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_type">Job Type *</Label>
                <Select
                  value={formData.job_type}
                  onValueChange={(value) => handleChange('job_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full-time</SelectItem>
                    <SelectItem value="part_time">Part-time</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="openings">Number of Openings *</Label>
                <Input
                  id="openings"
                  type="number"
                  min="1"
                  value={formData.openings}
                  onChange={(e) => handleChange('openings', e.target.value)}
                  className={errors.openings ? 'border-destructive' : ''}
                />
                {errors.openings && <p className="text-sm text-destructive">{errors.openings}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleChange('deadline', e.target.value)}
                  className={errors.deadline ? 'border-destructive' : ''}
                />
                {errors.deadline && <p className="text-sm text-destructive">{errors.deadline}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="selection_process">Selection Process (Optional)</Label>
                <Input
                  id="selection_process"
                  value={formData.selection_process}
                  onChange={(e) => handleChange('selection_process', e.target.value)}
                  placeholder="Online Test → Interview → HR Round"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="extra_info">Extra Information (Optional)</Label>
                <Textarea
                  id="extra_info"
                  value={formData.extra_info}
                  onChange={(e) => handleChange('extra_info', e.target.value)}
                  placeholder="Any additional information about this job..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/manage-jobs')}>
              Cancel
            </Button>
            <Button type="submit" variant="coral" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
