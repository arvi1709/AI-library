import React from 'react';
import type { Resource, TeamMember } from './types';

export const RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'The Weight of a Name',
    category: ['Caste', 'Identity'],
    shortDescription: 'A personal account of navigating urban life while carrying a last name that reveals a "lower-caste" origin.',
    content: 'Growing up, my last name was just a name. In the city, it felt anonymous. But as I entered college and later the professional world, I began to see the subtle shifts in people\'s eyes when they heard it. It was a key that unlocked a history I hadn\'t fully claimed, a history of oppression and resilience. This is the story of how I learned to carry the weight of my name not as a burden, but as a banner of my heritage and a testament to my ancestors\' survival.',
    imageUrl: 'https://picsum.photos/seed/caste-identity/400/300',
    status: 'published',
    tags: ['Caste System', 'Discrimination', 'Identity', 'Social Justice', 'India'],
    authorName: 'Priya Rao',
  },
  {
    id: '2',
    title: 'Finding My Voice',
    category: ['Gender', 'LGBTQ+'],
    shortDescription: 'The journey of a transgender man\'s self-discovery and transition in a society bound by traditional norms.',
    content: 'For years, my reflection felt like a stranger. I was playing a role assigned to me at birth, and the script was suffocating. The journey to find my true self—to align my body with my soul—was the most challenging and liberating experience of my life. It was a path marked by fear, loss, and immense courage, but it led me to a place of authenticity where I could finally hear my own voice, clear and strong.',
    imageUrl: 'https://picsum.photos/seed/gender-journey/400/300',
    status: 'published',
    tags: ['Transgender', 'Gender Identity', 'Self-Discovery', 'Community', 'Advocacy'],
    authorName: 'Alex Chen',
  },
  {
    id: '3',
    title: 'Two Rivers, One Home',
    category: ['Migration', 'Culture'],
    shortDescription: 'A refugee\'s story of fleeing conflict and building a new life, grappling with memories of the past and hopes for the future.',
    content: 'I carry two rivers inside me: the one that flowed through my childhood village, now a memory clouded by smoke, and the one that runs through this new city, a current of unfamiliar faces and languages. To be a refugee is to live in this constant state of duality—mourning a home you can never return to while building a new one from scratch. This is my story of navigating that current, finding kindness in strangers, and learning that "home" can be a place you build, not just a place you leave behind.',
    imageUrl: 'https://picsum.photos/seed/migration-story/400/300',
    status: 'published',
    tags: ['Refugee Experience', 'Migration', 'Belonging', 'Cultural Identity', 'Resilience'],
    authorName: 'Fatima Al-Jamil',
  },
  {
    id: '4',
    title: 'The Echo of a Protest',
    category: ['Social Justice', 'Activism'],
    shortDescription: 'An activist recounts their experience in a major social movement and the personal transformation that followed.',
    content: 'The first time I joined the protest, my voice was a timid whisper among a roar of thousands. But with every chant, every shared story of injustice, that whisper grew. Activism is not just about changing laws; it\'s about changing yourself. It\'s about unlearning silence and finding a collective strength you never knew you had. The echoes of that protest still live in me, a constant reminder that even the smallest voice can contribute to a chorus of change.',
    imageUrl: 'https://picsum.photos/seed/social-justice/400/300',
    status: 'published',
    tags: ['Activism', 'Social Protest', 'Community Organizing', 'Human Rights', 'Change'],
    authorName: 'David Imani',
  },
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

