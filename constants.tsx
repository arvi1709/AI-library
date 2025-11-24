import React from 'react';
import type { Resource, TeamMember } from './types';

export const RESOURCES: Resource[] = [];

export const MASTER_CATEGORIES = [
  "Personal Narrative",
  "Identity",
  "Gender",
  "LGBTQ+",
  "Migration",
  "Culture",
  "Social Justice",
  "Activism",
  "Poetry",
  "Hindi Literature",
  "Caste",
  "Education",
  "Technology",
  "History",
  "Art",
  "Science",
  "Philosophy"
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Arvind Kumar',
    role: 'Project Developer',
    imageUrl: '/arvind.webp',
    bio: 'Arvind is a B.TECH CSE AIML Student at SGT University. He is passionate about leveraging AI to create impactful educational tools and has been instrumental in conceptualizing and leading the Living Library 2.0 project.'
  },
  {
    name: 'Deepak Yadav',
    role: 'Project Developer',
    imageUrl: '/deepak.jpg',
    bio: 'Deepak Yadav is a B.TECH CSE AIML Student at SGT University. He passionate developer with a keen eye for UI/UX design. He brought the Living Library 2.0 interface to life with his expertise in React and modern web technologies.'
  },
  {
    name: 'Simarjot Kaur',
    role: 'Creative Content Head',
    imageUrl: '/sjk.jpg',
    bio: 'Simarjot Kaur is the Creative Content Head and a dedicated volunteer at the Living Library. She curates and crafts compelling narratives that resonate with our diverse audience, ensuring that every story is told with authenticity and empathy.'
  },
];

export const MENTORS: TeamMember[] = [
  {
    name: 'Dr. Nazima Parveen',
    role: 'PI (Living Library 2.O Project)',
    imageUrl: '/parveen.jpg',
    bio: 'Dr. Parveen is an Associate Professor and HOD, Department of Social Sciences and Liberal Studies, School of Humanities, Social Sciences and Liberal Arts (SHSL). She brings a wealth of knowledge in social justice and community engagement, guiding the Living Library project with her expertise and passion for inclusive storytelling.'
  },
  {
    name: 'Dr. Nandini Basistha',
    role: 'Academic Mentor',
    imageUrl: '/nandini.jpg',
    bio: 'Dr. Nandini Basistha serves as the Academic Mentor for the Living Library initiative. An Associate Professor in the Department of Liberal Studies & Social Sciences at the School of Humanities, Social Sciences & Liberal Arts, SGT University, Gurugram, she guides students with her expertise and passion for interdisciplinary learning, fostering reflection, dialogue, and intellectual growth.'
  },
  {
    name: 'Dr. Mouparna Roy',
    role: 'Ideation Mentor',
    imageUrl: '/roy.jpeg',
    bio: 'Dr. Mouparna Roy is the visionary mind behind the Living Library project. A dedicated academic and innovator, she believes in the power of storytelling as a bridge between knowledge and empathy. Through her guidance and creative vision, the project was conceptualized to promote dialogue, inclusivity, and shared learning within the community.'
  }
];

export const MOST_VIEWED_AUTHORS: TeamMember[] = [
  {
    name: 'Eleanor Vance',
    role: 'Author',
    imageUrl: 'https://picsum.photos/seed/author1/200/200',
    bio: 'Eleanor is a historian specializing in the Renaissance period, known for her vivid storytelling.'
  },
  {
    name: 'Kenji Tanaka',
    role: 'Author',
    imageUrl: 'https://picsum.photos/seed/author2/200/200',
    bio: 'Kenji writes about the intersection of technology and philosophy, exploring future digital landscapes.'
  },
  {
    name: 'Sofia Rossi',
    role: 'Author',
    imageUrl: 'https://picsum.photos/seed/author3/200/200',
    bio: 'A biologist and author, Sofia makes complex scientific concepts accessible to a wide audience.'
  },
  {
    name: 'Marcus Bell',
    role: 'Author',
    imageUrl: 'https://picsum.photos/seed/author4/200/200',
    bio: 'Marcus is a celebrated poet and short story writer, focusing on themes of nature and identity.'
  }
];

