
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface AdAsset {
  id: string;
  type: 'logo' | 'product' | 'mascot' | 'banner';
  url: string; // Base64 or URL
  description: string;
}

export interface Advertisement {
  id: string;
  brandName: string;
  slogan: string;
  color: string;
  cpm: number;
  assets: AdAsset[]; // Multiple assets
}

export interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  createdAt: number;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  creator: string;
  creatorAvatar?: string;
  code: string; 
  likes: number;
  isLiked?: boolean; // New: Track if current user liked
  comments: number;
  commentsList?: Comment[]; // New: List of actual comments
  shares: number;
  tags: string[];
  createdAt: number;
  sponsoredBy?: Advertisement;
}

export interface GameGenerationParams {
  prompt: string;
  ad?: Advertisement | null;
}
