import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  FileText,
  Globe,
} from 'lucide-react';
import { GitHubIcon } from '@/components/icons/GitHubIcon';
import { LinkedInIcon } from '@/components/icons/LinkedInIcon';

interface Profile {
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  roll_number?: string;
  department?: string;
  course?: string;
  year_of_study?: number;
  cgpa?: number;
  backlogs?: number;
  passing_year?: number;
  tenth_percentage?: number;
  twelfth_percentage?: number;
  skills?: string[];
  resume_url?: string;
  certifications?: string[];
  portfolio_url?: string;
  github_url?: string;
  linkedin_url?: string;
}

interface ViewProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
}

export function ViewProfileDialog({ open, onOpenChange, profile }: ViewProfileDialogProps) {
  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Student Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Details */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Personal Details
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{profile.full_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile.date_of_birth && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{new Date(profile.date_of_birth).toLocaleDateString()}</span>
                </div>
              )}
              {profile.address && (
                <div className="flex items-center gap-2 md:col-span-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.address}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Academic Details */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Academic Details
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {profile.roll_number && (
                <div>
                  <span className="text-sm text-muted-foreground">Roll Number</span>
                  <p className="font-medium">{profile.roll_number}</p>
                </div>
              )}
              {profile.department && (
                <div>
                  <span className="text-sm text-muted-foreground">Department</span>
                  <p className="font-medium">{profile.department}</p>
                </div>
              )}
              {profile.course && (
                <div>
                  <span className="text-sm text-muted-foreground">Course</span>
                  <p className="font-medium">{profile.course}</p>
                </div>
              )}
              {profile.year_of_study && (
                <div>
                  <span className="text-sm text-muted-foreground">Year of Study</span>
                  <p className="font-medium">{profile.year_of_study} Year</p>
                </div>
              )}
              {profile.passing_year && (
                <div>
                  <span className="text-sm text-muted-foreground">Passing Year</span>
                  <p className="font-medium">{profile.passing_year}</p>
                </div>
              )}
              {profile.cgpa !== undefined && profile.cgpa !== null && (
                <div>
                  <span className="text-sm text-muted-foreground">CGPA</span>
                  <p className="font-medium">{profile.cgpa}</p>
                </div>
              )}
              {profile.tenth_percentage !== undefined && profile.tenth_percentage !== null && (
                <div>
                  <span className="text-sm text-muted-foreground">10th Percentage</span>
                  <p className="font-medium">{profile.tenth_percentage}%</p>
                </div>
              )}
              {profile.twelfth_percentage !== undefined && profile.twelfth_percentage !== null && (
                <div>
                  <span className="text-sm text-muted-foreground">12th Percentage</span>
                  <p className="font-medium">{profile.twelfth_percentage}%</p>
                </div>
              )}
              {profile.backlogs !== undefined && (
                <div>
                  <span className="text-sm text-muted-foreground">Backlogs</span>
                  <p className="font-medium">{profile.backlogs}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Certifications */}
          {profile.certifications && profile.certifications.length > 0 && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Certifications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.certifications.map((cert) => (
                    <Badge key={cert} variant="outline">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Links */}
          {(profile.resume_url || profile.portfolio_url || profile.github_url || profile.linkedin_url) && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Profile Links
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {profile.resume_url && (
                  <a
                    href={profile.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium">Resume</p>
                      <p className="text-xs text-muted-foreground">View document</p>
                    </div>
                  </a>
                )}
                {profile.portfolio_url && (
                  <a
                    href={profile.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Portfolio</p>
                      <p className="text-xs text-muted-foreground">View website</p>
                    </div>
                  </a>
                )}
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center">
                      <GitHubIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">GitHub</p>
                      <p className="text-xs text-muted-foreground">View profile</p>
                    </div>
                  </a>
                )}
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#0A66C2]/10 flex items-center justify-center">
                      <LinkedInIcon className="w-5 h-5 text-[#0A66C2]" />
                    </div>
                    <div>
                      <p className="font-medium">LinkedIn</p>
                      <p className="text-xs text-muted-foreground">View profile</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}