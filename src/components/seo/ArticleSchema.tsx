import React from 'react';

interface ArticleSchemaProps {
  headline: string;
  description: string;
  authorName?: string;
  publisherName?: string;
  publisherLogo?: string;
  url: string;
  imageUrl?: string;
  datePublished?: string;
  dateModified?: string;
}

export function ArticleSchema({
  headline,
  description,
  authorName = "Boxspox Expert",
  publisherName = "Boxspox",
  publisherLogo = "https://boxspox.in/logo.png",
  url,
  imageUrl = "https://boxspox.in/og-image.png",
  datePublished,
  dateModified
}: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle', // Or Article, but TechArticle is good for tutorials
    headline: headline,
    description: description,
    image: [imageUrl],
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: publisherName,
      logo: {
        '@type': 'ImageObject',
        url: publisherLogo
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || new Date().toISOString(),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
