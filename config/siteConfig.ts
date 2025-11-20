import { GraduationCap, Trophy, Heart, Upload } from "lucide-react";

export const siteConfig = {
  // Basic Site Info
  name: 'ISPGram',
  title: 'ISPGram Photo Contest',
  description: 'Upload a photo from anywhere, get likes, and win! Contest ends Nov 28.',
  shortDescription: 'Upload a photo—update anytime until Nov 28.',

  // Navigation
  navigation: [
    { href: '/submit', label: 'My Post' },
    { href: '/vote', label: 'Vote' },
    { href: '/results', label: 'Results' },
  ],

  // Hero Section
  hero: {
    emoji: ['🎓', '📚'],
    icon: GraduationCap,
    title: 'ISPGram Photo Contest',
    subtitle: 'Share Your Adventures Around the World',
    description: 'Upload a photo from anywhere, get likes, and win! Contest ends Nov 28.',
    ctaButtons: [
      {
        href: '/submit',
        label: 'Upload Your Photo',
        icon: Upload,
        variant: 'primary' as const,
      },
      {
        href: '/vote',
        label: 'Like Friends\' Photos',
        icon: Heart,
        variant: 'secondary' as const,
      },
    ],
  },

  // Showcase Section
  showcase: {
    title: 'See It In Action',
    subtitle: 'Preview what\'s happening in the contest',
    items: [
      {
        image: 'https://raw.githubusercontent.com/enkhbold470/ispgram/refs/heads/main/public/iphone14promax-portrait.png',
        title: 'Share Your Adventures',
        description: 'Upload your favorite photos from your travels and watch them come alive in the gallery',
        icon: Upload,
        color: 'from-theme-primary-light to-theme-secondary-light',
        iconColor: 'text-theme-primary',
      },
      {
        image: 'https://raw.githubusercontent.com/enkhbold470/ispgram/refs/heads/main/public/iphone14promax-results.png',
        title: 'Climb the Leaderboard',
        description: 'See real-time rankings and watch entries compete for top spots with likes',
        icon: Trophy,
        color: 'from-theme-accent-light to-theme-tertiary-light',
        iconColor: 'text-theme-accent',
      },
    ],
  },

  // Activity Highlights
  activityHighlights: {
    title: 'Contest Details',
    icon: Trophy,
    items: [
      {
        label: 'Who can participate:',
        description: 'De Anza College ISP students',
      },
      {
        label: 'Photo Theme:',
        description: 'Share pictures from your home country, travels, or the US—show us your adventures!',
      },
      {
        label: 'Deadline:',
        description: 'Contest closes November 28th (you can update your entry anytime before then)',
      },
      {
        label: 'Scoring:',
        description: 'Get likes from friends to climb the leaderboard—the more likes, the higher you rank!',
      },
      {
        label: 'Winner Recognition:',
        description: 'Top entries will be featured in the ISP Office—join the fun and share your story! 🎉',
      },
    ],
  },

  // Features
  features: [
    {
      icon: Upload,
      title: 'Easy Photo Upload',
      description: 'Share your adventures with a photo and caption from anywhere in the world',
      color: 'text-sky-600' as const,
    },
    {
      icon: Heart,
      title: 'Like & Support',
      description: 'Give likes to photos you love and help friends climb the leaderboard',
      color: 'text-indigo-600' as const,
    },
    {
      icon: Trophy,
      title: 'Live Leaderboard',
      description: 'Track rankings in real-time based on likes—winners featured in ISP Office!',
      color: 'text-amber-500' as const,
    },
  ],

  // Footer
  footer: {
    text: 'Presented by the De Anza ISP Office Photo Contest—share your adventures and have fun! Contest closes November 28th. 💙',
  },

  // Theme Colors
  theme: {
    primary: 'sky-600',
    secondary: 'indigo-600',
    accent: 'amber-500',
    gradient: 'from-sky-600 via-indigo-600 to-sky-600',
    bgGradient: 'from-sky-50 via-indigo-50 to-slate-50',
  },
};