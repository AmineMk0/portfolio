export interface Project {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  technologies: string[];
  features?: string[];
  githubUrl?: string;
  liveDemoUrl?: string;
  url?: string;
}

export interface EducationEntry {
  id: string;
  degree: string;
  field?: string;
  icon: 'science' | 'diploma' | 'degree';
  year?: number;
  institution?: string;
  specialization?: string;
  status: 'Completed' | 'Currently Studying';
}

export interface Profile {
  name: string;
  role: string;
  location: string;
  experience: string;
  availability: string;
  photo: string;
  email?: string;
  cvUrl?: string;
  githubUrl?: string;
  contactUrl?: string;
}
