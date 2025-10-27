import { GraduationCap, Trophy, Heart, Upload } from "lucide-react";

export const siteConfig = {
  // Basic Site Info
  name: 'ISPGram',
  title: 'ISPGram - De Anza ISP Education Week Activity',
  description: 'Education Week activity by the De Anza ISP Office for the International Student Program—share your photos, enjoy the friendly gamified celebration, and have fun together!',
  shortDescription: 'Share one Education Week experience—photos, projects, or moments (update anytime)',

  // Navigation
  navigation: [
    { href: '/submit', label: 'Submit' },
    { href: '/vote', label: 'Vote' },
    { href: '/results', label: 'Results' },
  ],

  // Hero Section
  hero: {
    emoji: ['🎓', '📚'],
    icon: GraduationCap,
    title: 'ISPGram',
    subtitle: 'De Anza ISP Education Week Activity',
    description: 'Join the Education Week activity hosted by the De Anza ISP Office for the International Student Program—share your photos, enjoy the gamified challenge, and have fun together! Presented with love by the De Anza ISP Office. Have fun, guys! 🌟',
    ctaButtons: [
      {
        href: '/submit',
        label: 'Participate',
        icon: Upload,
        variant: 'primary' as const,
      },
      {
        href: '/vote',
        label: 'Cheer for Your Friends',
        icon: Heart,
        variant: 'secondary' as const,
      },
    ],
  },

  // Activity Highlights
  activityHighlights: {
    title: 'Activity Highlights',
    icon: Trophy,
    items: [
      {
        label: 'Who can participate:',
        description: 'De Anza College ISP students celebrating Education Week',
      },
      {
        label: 'Submissions:',
        description: 'Share one Education Week experience—photos, projects, or moments (update anytime)',
      },
      {
        label: 'Voting:',
        description: 'Celebrate your friends by liking as many entries as you enjoy!',
      },
      {
        label: 'Recognition:',
        description: 'Top entries earn shout-outs from the ISP Office—have fun and get involved! 🎉',
      },
    ],
  },

  // Features
  features: [
    {
      icon: Upload,
      title: 'Easy Sharing',
      description: 'Highlight your Education Week story with a quick photo and caption',
      color: 'text-sky-600' as const,
    },
    {
      icon: Heart,
      title: 'Support Friends',
      description: 'Send hearts to the moments that inspire you and boost their points',
      color: 'text-indigo-600' as const,
    },
    {
      icon: Trophy,
      title: 'Friendly Leaderboard',
      description: 'Follow the friendly competition with real-time recognition',
      color: 'text-amber-500' as const,
    },
  ],

  // Footer
  footer: {
    text: 'Presented by the De Anza ISP Office for International Student Program Education Week activities—have fun, guys! 💙',
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