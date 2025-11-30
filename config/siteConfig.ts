import { GraduationCap, Trophy, Heart, Upload } from "lucide-react";

export const siteConfig = {
  // Basic Site Info
  name: 'ISPGram',
  title: 'ISPGram Photo Contest',
  description: 'The contest has ended! Browse the gallery and see the final results.',
  shortDescription: 'Contest ended Nov 28. View the gallery and results!',

  // Navigation
  // Contest ended - removed submit/My Post tab
  navigation: [
    // { href: '/submit', label: 'My Post' }, // Contest ended - upload disabled
    { href: '/vote', label: 'Gallery' },
    { href: '/results', label: 'Results' },
  ],

  // Hero Section
  hero: {
    emoji: [''],
    icon: GraduationCap,
    title: 'ISPGram Photo Contest',
    subtitle: 'Contest Has Ended!',
    description: 'Thank you for participating! Browse the gallery and see the final results below.',
    ctaButtons: [
      // Contest ended - upload button disabled
      // {
      //   href: '/submit',
      //   label: 'Upload Your Photo',
      //   icon: Upload,
      //   variant: 'primary' as const,
      // },
      {
        href: '/vote',
        label: 'View Gallery',
        icon: Heart,
        variant: 'primary' as const,
      },
      {
        href: '/results',
        label: 'See Results',
        icon: Trophy,
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
      { label: 'Status:', description: 'Contest ended Nov 28, 2025'},
      { label: 'Scoring:', description: 'More likes = higher rank' },
      { label: 'Winners:', description: 'Top entries featured in ISP Office and more coming up!' },
    ],
  },

  features: [
    // Contest ended - upload feature info updated
    {
      icon: Upload,
      title: 'Contest Ended',
      description: 'Submissions closed on Nov 28, 2025',
      color: 'text-sky-600' as const,
    },
    {
      icon: Heart,
      title: 'Photo Gallery',
      description: 'Browse all submitted photos',
      color: 'text-indigo-600' as const,
    },
    {
      icon: Trophy,
      title: 'Final Results',
      description: 'See the winners and rankings!',
      color: 'text-amber-500' as const,
    },
  ],

  // Footer
  footer: {
    text: 'De Anza ISP Photo Contest • Ended Nov 28, 2025 💙',
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