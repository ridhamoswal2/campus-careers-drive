import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle } from 'lucide-react';

interface ProfileProgressProps {
  profile: {
    full_name?: string;
    phone?: string;
    department?: string;
    roll_number?: string;
    year_of_study?: number;
    cgpa?: number;
    skills?: string[];
    resume_url?: string;
    linkedin_url?: string;
    github_url?: string;
  };
}

interface ProgressItem {
  label: string;
  completed: boolean;
  required: boolean;
}

export function ProfileProgress({ profile }: ProfileProgressProps) {
  const progressItems: ProgressItem[] = [
    { label: 'Full Name', completed: !!profile.full_name, required: true },
    { label: 'Phone Number', completed: !!profile.phone, required: true },
    { label: 'Department', completed: !!profile.department, required: true },
    { label: 'Roll Number', completed: !!profile.roll_number, required: false },
    { label: 'Year of Study', completed: !!profile.year_of_study, required: false },
    { label: 'CGPA', completed: !!profile.cgpa && profile.cgpa > 0, required: true },
    { label: 'Skills', completed: !!profile.skills && profile.skills.length > 0, required: true },
    { label: 'Resume', completed: !!profile.resume_url, required: false },
    { label: 'LinkedIn', completed: !!profile.linkedin_url, required: false },
    { label: 'GitHub', completed: !!profile.github_url, required: false },
  ];

  const completedCount = progressItems.filter((item) => item.completed).length;
  const totalCount = progressItems.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  const requiredItems = progressItems.filter((item) => item.required);
  const requiredCompleted = requiredItems.filter((item) => item.completed).length;
  const allRequiredComplete = requiredCompleted === requiredItems.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Profile Completion</h3>
          <p className="text-xs text-muted-foreground">
            {allRequiredComplete
              ? 'All required fields complete!'
              : `Complete required fields to apply for jobs`}
          </p>
        </div>
        <span className="text-2xl font-bold text-primary">{percentage}%</span>
      </div>

      <Progress value={percentage} className="h-2" />

      <div className="grid grid-cols-2 gap-2 text-sm">
        {progressItems.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 ${
              item.completed ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            {item.completed ? (
              <CheckCircle className="w-4 h-4 text-success" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
            <span>
              {item.label}
              {item.required && !item.completed && (
                <span className="text-destructive ml-1">*</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
