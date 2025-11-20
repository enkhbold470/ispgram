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
    emoji: [''],
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
      { label: 'Who:', description: 'De Anza ISP students' },
      { label: 'Theme:', description: 'Photos from home, travels, or the US' },
      { label: 'Deadline:', description: 'Nov 28'},
      { label: 'Scoring:', description: 'More likes = higher rank' },
      { label: 'Winners:', description: 'Top entries featured in ISP Office and more coming up!' },
    ],
  },

  features: [
    {
      icon: Upload,
      title: 'Easy Upload',
      description: 'Share photos and captions from anywhere',
      color: 'text-sky-600' as const,
    },
    {
      icon: Heart,
      title: 'Like Photos',
      description: 'Like your favorites and boost friends',
      color: 'text-indigo-600' as const,
    },
    {
      icon: Trophy,
      title: 'Leaderboard',
      description: 'See live rankings—top entries get featured!',
      color: 'text-amber-500' as const,
    },
  ],

  // Footer
  footer: {
    text: 'De Anza ISP Photo Contest • Ends Nov 28 💙',
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