import React from 'react';

interface CourseSchemaProps {
  name: string;
  description: string;
  providerName?: string;
  providerUrl?: string;
  url: string;
  imageUrl?: string;
}

export function CourseSchema({
  name,
  description,
  providerName = "Pandaschool",
  providerUrl = "https://pandaschool.in",
  url,
  imageUrl = "https://pandaschool.in/og-image.png"
}: CourseSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: name,
    description: description,
    provider: {
      '@type': 'Organization',
      name: providerName,
      sameAs: providerUrl,
    },
    url: url,
    image: imageUrl,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      location: {
        '@type': 'VirtualLocation',
        url: url
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
