import { Helmet } from 'react-helmet-async';
import { APP_TITLE } from '@/config';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
}

const defaultMeta = {
  title: `${APP_TITLE} Dashboard`,
  description:
    'Admin dashboard for managing SoftGate Comic platform - manage webtoons, episodes, users, and analytics',
  keywords: 'softgate, comic, admin, dashboard, webtoon, management, analytics',
  ogImage: '/og-image.png',
};

export const SEO = ({
  title,
  description = defaultMeta.description,
  keywords = defaultMeta.keywords,
  canonicalUrl,
  ogImage = defaultMeta.ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
}: SEOProps) => {
  const fullTitle = title ? `${title} | ${APP_TITLE}` : defaultMeta.title;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="noindex, nofollow" />

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export const PageSEO = {
  Dashboard: () => (
    <SEO
      title="Dashboard"
      description="Overview of SoftGate Comic platform statistics, revenue, and user growth"
    />
  ),
  Webtoons: () => (
    <SEO
      title="Webtoons"
      description="Manage webtoons on SoftGate Comic platform - add, edit, delete webtoons"
    />
  ),
  Episodes: () => (
    <SEO
      title="Episodes"
      description="Manage episodes on SoftGate Comic platform - add, edit, delete episodes"
    />
  ),
  Users: () => (
    <SEO
      title="Users"
      description="Manage users on SoftGate Comic platform - view, ban, suspend users"
    />
  ),
  Comments: () => (
    <SEO
      title="Comments"
      description="Moderate comments on SoftGate Comic platform - hide, delete comments"
    />
  ),
  Analytics: () => (
    <SEO title="Analytics" description="View analytics and insights for SoftGate Comic platform" />
  ),
  Settings: () => (
    <SEO
      title="Settings"
      description="Configure SoftGate Comic platform settings and preferences"
    />
  ),
  Login: () => <SEO title="Login" description="Admin login for SoftGate Comic platform" />,
  Media: () => (
    <SEO title="Media Library" description="Manage media files on SoftGate Comic platform" />
  ),
  Reports: () => (
    <SEO title="Reports" description="Manage user reports on SoftGate Comic platform" />
  ),
  ActivityLog: () => (
    <SEO
      title="Activity Log"
      description="View admin activity history on SoftGate Comic platform"
    />
  ),
  Profile: () => (
    <SEO title="Profile" description="Admin profile settings on SoftGate Comic platform" />
  ),
  Revenue: () => (
    <SEO title="Revenue & Payments" description="Manage revenue, transactions, and payouts" />
  ),
  Notifications: () => <SEO title="Notifications" description="View and manage notifications" />,
  Schedule: () => <SEO title="Schedule" description="Manage scheduled episode releases" />,
};
