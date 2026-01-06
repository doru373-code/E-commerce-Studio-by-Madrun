
export type GenerationMode = 'background' | 'avatar';
export type BackgroundStyle = 'white-studio' | 'marble' | 'dark' | 'lifestyle';
export type Gender = 'male' | 'female';
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
export type Scene = 'studio' | 'gym' | 'urban' | 'nature' | 'home';
export type Pose = 'neutral' | 'action' | 'closeup' | 'side';
export type HairColor = 'black' | 'brown' | 'blonde' | 'red' | 'grey';
export type Hairstyle = 'short' | 'medium' | 'long' | 'curly' | 'straight' | 'tied';
export type SkinTone = 'fair' | 'light' | 'medium' | 'tan' | 'deep';
export type CharacterSource = 'ai' | 'custom';

export interface StyleOption {
  id: BackgroundStyle;
  label: string;
  description: string;
  previewUrl: string;
}

export interface SceneOption {
  id: Scene;
  label: string;
  icon: string;
}

export interface PoseOption {
  id: Pose;
  label: string;
  icon: string;
}

export interface Option<T> {
  id: T;
  label: string;
  color?: string; // For hair and skin swatches
}

export interface GenerationState {
  isGenerating: boolean;
  error: string | null;
  resultUrl: string | null;
}

export interface Discount {
  id: string;
  code: string;
  percentage: number;
  expiryDate: string;
  isActive: boolean;
}

export interface WhitelistedUser {
  id: string;
  email: string;
  grantedAt: string;
  status: 'active' | 'revoked';
}

export interface User {
  email: string;
  password?: string;
  role: 'admin' | 'user';
  createdAt: string;
  subscriptionStatus: 'trialing' | 'active' | 'canceled' | 'none';
  trialEndsAt: string;
  stripeCustomerId?: string;
}

export type AdminSubView = 'overview' | 'users' | 'discounts' | 'logs' | 'payments';
