export interface User {
  uid: string;
  name: string | null;
  email: string | null;
  imageUrl: string;
  followers?: string[];
  following?: string[];
  notifications?: Notification[];
}

export interface Notification {
  id: string;
  type: 'new_story' | 'story_reported';
  message: string;
  timestamp: number;
  read: boolean;
  relatedStoryId?: string;
}

export interface Resource {
  id: string;
  title: string;
  category: string | string[];
  shortDescription: string;
  content: string;
  summary?: string;
  imageUrl: string;
  authorId?: string;
  authorName?: string;
  authorImageUrl?: string;
  fileName?: string;
  status?: 'published' | 'processing' | 'pending_review';
  tags?: string[];
  likes?: string[];
  createdAt?: any;
}

export interface TeamMember {
  name: string;
  role: string;
  imageUrl: string;
  bio: string;
}

export enum MessageAuthor {
  USER = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  author: MessageAuthor;
  text: string;
  relatedStories?: Resource[];
}

export interface Comment {
  id: string;
  resourceId: string;
  authorId: string;
  authorName: string;
  authorImageUrl: string;
  text: string;
  timestamp: number;
}

export interface Report {
  resourceId: string;
  reporterId: string;
  timestamp: number;
  resourceTitle: string;
}
export interface EmpathyRating {
  userId: string;
  rating: number;
}