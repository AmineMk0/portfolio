import type { EducationEntry, Profile, Project } from '../types';
import portrait from '../assets/portrait.png';
import carRent from '../assets/carrent.png';
import electroShop from '../assets/electroshop.png';
import linguaLearn from '../assets/lingualearn.png';

// Optional real links: profile.email, contactUrl, githubUrl, cvUrl; project.githubUrl, liveDemoUrl (or legacy url).
export const profile: Profile = {
  name: 'Amine Moutaki', role: 'Fullstack Developer', location: 'Morocco',
  experience: '2+ Years', availability: 'Open for new projects', photo: portrait,
};

export const education: EducationEntry[] = [
  {
    id: 'baccalaureat',
    degree: 'Baccalauréat',
    specialization: 'Sciences Physiques',
    icon: 'science',
    year: 2021,
    status: 'Completed',
  },
  {
    id: 'digital-development',
    degree: 'Technicien Spécialisé',
    field: 'Développement Digital',
    icon: 'diploma',
    institution: 'OFPPT',
    specialization: 'Full Stack Development',
    status: 'Completed',
  },
  {
    id: 'software-engineering',
    degree: 'Licence en Génie Logiciel',
    icon: 'degree',
    institution: 'ESTEM',
    status: 'Currently Studying',
  },
];

export const projects: Project[] = [
  { id: '01', name: 'CarRent', category: 'CAR RENTAL', description: 'Car rental platform with vehicle management, reservations, contracts and invoices.', image: carRent, technologies: ['React', 'Laravel', 'MySQL'], features: ['Vehicle management', 'Reservations', 'Contracts', 'Invoices'] },
  { id: '02', name: 'ElectroShop', category: 'E-COMMERCE', description: 'Complete e-commerce website with product catalog, orders, stock management and admin dashboard.', image: electroShop, technologies: ['React', 'Laravel', 'MySQL'], features: ['Product catalog', 'Orders', 'Stock management', 'Admin dashboard'] },
  { id: '03', name: 'LinguaLearn', category: 'LANGUAGE LEARNING', description: 'Language learning platform with interactive courses, quizzes and progress tracking.', image: linguaLearn, technologies: ['React', 'Laravel', 'MySQL'], features: ['Interactive courses', 'Quizzes', 'Progress tracking'] },
];

