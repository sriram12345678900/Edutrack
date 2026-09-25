import React from 'react';

export type RobloxFaceType = 'smile' | 'cool' | 'wink' | 'star' | 'ninja' | 'fire' | 'laser' | 'classic' | 'chill' | 'genius' | 'laugh' | (string & {});
export type RobloxHatType = 'none' | 'crown' | 'cap' | 'headphones' | 'wizard' | 'cyber_helm' | (string & {});
export type RobloxOutfitType = 'default' | 'hoodie' | 'suit' | 'cyber_armor' | 'topper_robe' | (string & {});
export type RobloxGearType = 'none' | 'sword' | 'wand' | 'trophy' | 'book' | (string & {});
export type RobloxPoseType = 'idle' | 'wave' | 'hero' | 'dance' | 'cheer' | 'levitate' | (string & {});

export interface RobloxAvatarConfig {
  bodyColor?: string;
  headColor?: string;
  torsoColor?: string;
  leftArmColor?: string;
  rightArmColor?: string;
  leftLegColor?: string;
  rightLegColor?: string;
  face?: RobloxFaceType;
  hat?: RobloxHatType;
  outfit?: RobloxOutfitType;
  gear?: RobloxGearType;
  pose?: RobloxPoseType;
  [key: string]: any;
}

export const DEFAULT_ROBLOX_CONFIG: RobloxAvatarConfig = { 
  bodyColor: '#3b82f6',
  face: 'smile',
  hat: 'none',
  outfit: 'default',
  gear: 'none',
  pose: 'idle'
};

export default function RobloxAvatar(props: { config?: RobloxAvatarConfig; className?: string; [key: string]: any }) {
  return <div className="w-full h-full bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 font-bold text-xs">Roblox 3D Avatar</div>;
}
