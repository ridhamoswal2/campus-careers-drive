import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import StudentLayout from '@/components/layout/StudentLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  User,
  GraduationCap,
  Briefcase,
  Link as LinkIcon,
  Save,
  Loader2,
  Plus,
  X,
} from 'lucide-react';
import { DEPARTMENTS, COURSES, YEARS } from '@/constants/eligibility';

interface Profile {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  roll_number: string;
  department: string;
  course: string;
  year_of_study: number;
  cgpa: number;
  backlogs: number;
  passing_year: number;
  tenth_percentage: number | null;
  twelfth_percentage: number | null;
  skills: string[];
  resume_url: string;
  certifications: string[];
  portfolio_url: string;
  github_url: string;
  linkedin_url: string;
  profile_completed: boolean;
}

const defaultProfile: Profile = {
  full_name: '',
  email: '',
  phone: '',
  address: '',
  date_of_birth: '',
  roll_number: '',
  department: '',
  course: '',
  year_of_study: 1,
  cgpa: 0,
  backlogs: 0,
  passing_year: new Date().getFullYear() + 1,
  tenth_percentage: null,
  twelfth_percentage: null,
  skills: [],
  resume_url: '',
  certifications: [],
  portfolio_url: '',
  github_url: '',
  linkedin_url: '',
  profile_completed: false,
};

export default function StudentProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newCert, setNewCert] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          setProfile({
            ...defaultProfile,
            ...data,
            department: data.department || '',
            course: data.course || '',
            skills: data.skills || [],
            certifications: data.certifications || [],
            tenth_percentage: data.tenth_percentage ?? null,
            twelfth_percentage: data.twelfth_percentage ?? null,
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const isComplete = !!(
        profile.full_name &&
        profile.phone &&
        profile.department &&
        profile.course &&
        profile.cgpa &&
        profile.skills.length > 0
      );

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone || null,
          address: profile.address || null,
          date_of_birth: profile.date_of_birth || null,
          roll_number: profile.roll_number || null,
          department: (profile.department || null) as "AIIT" | "AIT" | "ASFT" | "AIBAS" | "OTHER" | null,
          course: (profile.course || null) as "BCA" | "MCA" | "BTECH" | null,
          year_of_study: profile.year_of_study,
          passing_year: profile.passing_year || null,
          cgpa: profile.cgpa || null,
          backlogs: profile.backlogs || 0,
          tenth_percentage: profile.tenth_percentage || null,
          twelfth_percentage: profile.twelfth_percentage || null,
          skills: profile.skills,
          certifications: profile.certifications,
          resume_url: profile.resume_url || null,
          portfolio_url: profile.portfolio_url || null,
          github_url: profile.github_url || null,
          linkedin_url: profile.linkedin_url || null,
          profile_completed: isComplete,
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      setProfile({ ...profile, profile_completed: isComplete });
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill) });
  };

  const addCertification = () => {
    if (newCert.trim() && !profile.certifications.includes(newCert.trim())) {
      setProfile({ ...profile, certifications: [...profile.certifications, newCert.trim()] });
      setNewCert('');
    }
  };

  const removeCertification = (cert: string) => {
    setProfile({ ...profile, certifications: profile.certifications.filter((c) => c !== cert) });
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

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">My Profile</h1>
            <p className="text-muted-foreground">
              {profile.profile_completed 
                ? 'Your profile is complete' 
                : 'Complete your profile to apply for jobs'}
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} variant="hero">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        {/* Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.email || user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={profile.date_of_birth || ''}
                onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="Your address"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Academic Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number</Label>
              <Input
                id="rollNumber"
                value={profile.roll_number}
                onChange={(e) => setProfile({ ...profile, roll_number: e.target.value })}
                placeholder="2021001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={profile.department}
                onValueChange={(value) => setProfile({ ...profile, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Select
                value={profile.course}
                onValueChange={(value) => setProfile({ ...profile, course: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {COURSES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearOfStudy">Year of Study</Label>
              <Select
                value={String(profile.year_of_study)}
                onValueChange={(value) => setProfile({ ...profile, year_of_study: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((year) => (
                    <SelectItem key={year.value} value={String(year.value)}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="passingYear">Expected Passing Year</Label>
              <Input
                id="passingYear"
                type="number"
                value={profile.passing_year || ''}
                onChange={(e) => setProfile({ ...profile, passing_year: parseInt(e.target.value) })}
                placeholder="2025"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cgpa">CGPA</Label>
              <Input
                id="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={profile.cgpa || ''}
                onChange={(e) => setProfile({ ...profile, cgpa: parseFloat(e.target.value) })}
                placeholder="8.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backlogs">Backlogs</Label>
              <Input
                id="backlogs"
                type="number"
                min="0"
                value={profile.backlogs || 0}
                onChange={(e) => setProfile({ ...profile, backlogs: parseInt(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenthPercentage">10th Percentage</Label>
              <Input
                id="tenthPercentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={profile.tenth_percentage || ''}
                onChange={(e) => setProfile({ ...profile, tenth_percentage: parseFloat(e.target.value) || null })}
                placeholder="85.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twelfthPercentage">12th Percentage</Label>
              <Input
                id="twelfthPercentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={profile.twelfth_percentage || ''}
                onChange={(e) => setProfile({ ...profile, twelfth_percentage: parseFloat(e.target.value) || null })}
                placeholder="82.3"
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Skills
            </CardTitle>
            <CardDescription>Add your technical and soft skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="px-3 py-1.5">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle>Certifications (Optional)</CardTitle>
            <CardDescription>Add your certifications and achievements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                placeholder="Add a certification..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
              />
              <Button type="button" onClick={addCertification} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.certifications.map((cert) => (
                <Badge key={cert} variant="outline" className="px-3 py-1.5">
                  {cert}
                  <button onClick={() => removeCertification(cert)} className="ml-2 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-primary" />
              Profile Links
            </CardTitle>
            <CardDescription>Add your portfolio and social links</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="resumeUrl">Resume URL</Label>
              <Input
                id="resumeUrl"
                value={profile.resume_url}
                onChange={(e) => setProfile({ ...profile, resume_url: e.target.value })}
                placeholder="https://drive.google.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portfolioUrl">Portfolio URL</Label>
              <Input
                id="portfolioUrl"
                value={profile.portfolio_url}
                onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                placeholder="https://yourportfolio.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input
                id="githubUrl"
                value={profile.github_url}
                onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                placeholder="https://github.com/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
              <Input
                id="linkedinUrl"
                value={profile.linkedin_url}
                onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button (Mobile) */}
        <div className="md:hidden">
          <Button onClick={handleSave} disabled={saving} variant="hero" className="w-full">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>
    </StudentLayout>
  );
}
