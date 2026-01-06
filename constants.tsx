
import { StyleOption, SceneOption, PoseOption, Option, HairColor, Hairstyle, SkinTone } from './types';
import { Language } from './translations';

export const getBackgroundStyles = (lang: Language): StyleOption[] => [
  {
    id: 'white-studio',
    label: lang === 'en' ? 'White Studio' : 'Studio Blanc',
    description: lang === 'en' ? 'Clean, minimalist infinite floor with soft lighting.' : 'Sol infini minimaliste et propre avec un éclairage doux.',
    previewUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=400&h=300'
  },
  {
    id: 'marble',
    label: lang === 'en' ? 'Marble Luxury' : 'Marbre de Luxe',
    description: lang === 'en' ? 'Elegant white marble surface with soft reflections.' : 'Surface élégante en marbre blanc avec des reflets doux.',
    previewUrl: 'https://images.unsplash.com/photo-1582266255765-fa5cf1a1d501?auto=format&fit=crop&q=80&w=400&h=300'
  },
  {
    id: 'dark',
    label: lang === 'en' ? 'Dark Noir' : 'Noir Obscur',
    description: lang === 'en' ? 'Sophisticated charcoal texture with dramatic lighting.' : 'Texture charbon sophistiquée avec un éclairage dramatique.',
    previewUrl: 'https://images.unsplash.com/photo-1517639493569-5666a7b2f494?auto=format&fit=crop&q=80&w=400&h=300'
  },
  {
    id: 'lifestyle',
    label: lang === 'en' ? 'Lifestyle' : 'Lifestyle',
    description: lang === 'en' ? 'Modern home setting with warm natural sunlight.' : 'Cadre domestique moderne avec une lumière naturelle chaude.',
    previewUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400&h=300'
  }
];

export const getSceneOptions = (lang: Language): SceneOption[] => [
  { id: 'studio', label: lang === 'en' ? 'Studio' : 'Studio', icon: '📸' },
  { id: 'gym', label: lang === 'en' ? 'Gym' : 'Salle de sport', icon: '🏋️' },
  { id: 'urban', label: lang === 'en' ? 'Urban City' : 'Urbain', icon: '🏙️' },
  { id: 'nature', label: lang === 'en' ? 'Outdoor Nature' : 'Nature', icon: '🌲' },
  { id: 'home', label: lang === 'en' ? 'Home Lifestyle' : 'Maison', icon: '🏠' }
];

export const getPoseOptions = (lang: Language): PoseOption[] => [
  { id: 'neutral', label: lang === 'en' ? 'Standing / Neutral' : 'Debout / Neutre', icon: '🧍' },
  { id: 'action', label: lang === 'en' ? 'Action / In-use' : 'Action / En usage', icon: '🏃' },
  { id: 'closeup', label: lang === 'en' ? 'Close-up Focus' : 'Focus Gros Plan', icon: '🔍' },
  { id: 'side', label: lang === 'en' ? 'Side-angle Dynamic' : 'Angle Latéral', icon: '📐' }
];

export const HAIR_COLOR_OPTIONS: Option<HairColor>[] = [
  { id: 'black', label: 'Black', color: '#1a1a1a' },
  { id: 'brown', label: 'Brown', color: '#4d2a1a' },
  { id: 'blonde', label: 'Blonde', color: '#e6be8a' },
  { id: 'red', label: 'Red', color: '#a52a2a' },
  { id: 'grey', label: 'Grey', color: '#a0a0a0' }
];

export const getHairstyleOptions = (lang: Language): Option<Hairstyle>[] => [
  { id: 'short', label: lang === 'en' ? 'Short' : 'Court' },
  { id: 'medium', label: lang === 'en' ? 'Medium' : 'Moyen' },
  { id: 'long', label: lang === 'en' ? 'Long' : 'Long' },
  { id: 'curly', label: lang === 'en' ? 'Curly' : 'Bouclé' },
  { id: 'straight', label: lang === 'en' ? 'Straight' : 'Lisse' },
  { id: 'tied', label: lang === 'en' ? 'Tied-up' : 'Attaché' }
];

export const SKIN_TONE_OPTIONS: Option<SkinTone>[] = [
  { id: 'fair', label: 'Fair', color: '#f9ebe0' },
  { id: 'light', label: 'Light', color: '#f3d6c1' },
  { id: 'medium', label: 'Medium', color: '#d9a67e' },
  { id: 'tan', label: 'Tan', color: '#ad7148' },
  { id: 'deep', label: 'Deep', color: '#5e3c25' }
];

export const PROMPT_TEMPLATES: Record<string, string> = {
  'white-studio': 'Professional product photography. Place the main product from the uploaded image on a clean, seamless white studio background. Ensure high-end soft lighting, realistic contact shadows, and an infinite floor effect. The product itself must remain unchanged in its shape and details.',
  'marble': 'Luxury product photography. Place the product on a polished white marble surface with subtle, elegant reflections. Soft side lighting and natural shadows. Background should be slightly out of focus to emphasize the product. The product details must be preserved perfectly.',
  'dark': 'Dramatic product photography. Place the product on a textured dark charcoal slate surface. Moody spotlighting from one side creating a professional chiaroscuro effect. High contrast but clean. The product details should be sharp and unchanged.',
  'lifestyle': 'Lifestyle product photography. Place the product in a bright, modern minimalist living space on a light oak wood table. Soft morning sunlight coming through a nearby window. Shallow depth of field with a blurred home interior background. The product must look integrated but stay true to its original form.'
};

const SCENE_DESCRIPTIONS: Record<string, string> = {
  'studio': 'a high-end, clean professional photography studio with soft multi-point lighting',
  'gym': 'a modern fitness center with sleek gym equipment and blurred weights in the background',
  'urban': 'a vibrant urban city street with modern architecture and soft natural city lighting',
  'nature': 'a beautiful outdoor nature setting like a sun-drenched park or forest trail',
  'home': 'a cozy and modern minimalist home living room with warm natural sunlight'
};

const POSE_DESCRIPTIONS: Record<string, string> = {
  'neutral': 'standing in a natural, relaxed neutral pose looking towards the camera',
  'action': 'captured in a dynamic action pose, actively and realistically using the product in a candid moment',
  'closeup': 'a tight close-up shot focusing primarily on the product being used or held, with the model\'s features artistically blurred',
  'side': 'a dynamic side-profile angle, showing the model and product from a perspective that highlights form and professional composition'
};

export const AVATAR_PROMPT = (
  gender: 'male' | 'female', 
  scene: string, 
  pose: string, 
  hairColor: string, 
  hairstyle: string, 
  skinTone: string
) => {
  const sceneDesc = SCENE_DESCRIPTIONS[scene] || SCENE_DESCRIPTIONS['studio'];
  const poseDesc = POSE_DESCRIPTIONS[pose] || POSE_DESCRIPTIONS['neutral'];
  
  return `Professional lifestyle product photography featuring a realistic, high-end human ${gender} model. 
The model has ${skinTone} skin tone, ${hairColor} hair, and a ${hairstyle} hairstyle. 
The human ${gender} model should be ${poseDesc}, naturally wearing or holding the product from the uploaded image. 
The model is located in ${sceneDesc}.
Match the lighting, shadows, and environmental reflections perfectly between the human, the product, and the ${scene} background. 
The product's shape, color, and specific details must be preserved exactly as they are in the original photo. 
Ensure body proportions are realistic and the product is used correctly according to its intended purpose.
The shot should look like a professional marketing asset with soft bokeh and expert composition.`;
};

export const CUSTOM_CHARACTER_PROMPT = (scene: string, pose: string) => {
  const sceneDesc = SCENE_DESCRIPTIONS[scene] || SCENE_DESCRIPTIONS['studio'];
  const poseDesc = POSE_DESCRIPTIONS[pose] || POSE_DESCRIPTIONS['neutral'];
  
  return `Professional lifestyle product photography. 
Use the person from the provided character image as the consistent human model. 
This person should be ${poseDesc}, naturally wearing or holding the product from the product image. 
Maintain the specific appearance, clothing style (if applicable), and physical features of the person in the reference image.
The setting is ${sceneDesc}.
Ensure the lighting, shadows, and environment match the ${scene} background. 
The product's shape, color, and specific details must be preserved exactly. 
The final result should look like a high-end commercial photoshoot with the character naturally integrated.`;
};
