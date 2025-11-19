import type { LinkedInLearningAsset } from './types';

const minutes = (value: number) => value * 60;

export const sampleLinkedInLearningAssets: LinkedInLearningAsset[] = [
  {
    urn: 'urn:li:learningCourse:library-self-service-essentials',
    title: 'Library Self-Service Essentials',
    description:
      'Follow a librarian-led blueprint to design, pilot, and launch intuitive self-service stations that reduce queue time and improve member satisfaction.',
    url: 'https://www.linkedin.com/learning/',
    imageUrl:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
    durationInSeconds: minutes(42),
    durationFormatted: '42m',
    skillLevel: 'INTERMEDIATE',
    releasedAt: '2024-03-12T00:00:00Z',
    topics: ['library technology', 'service design', 'customer experience'],
    authors: [{ name: 'Jamie Alvarez', title: 'Digital Services Lead' }],
    contentType: 'COURSE',
  },
  {
    urn: 'urn:li:learningCourse:barcode-automation',
    title: 'Barcode & RFID Automation for Libraries',
    description:
      'Hands-on course that walks through selecting scanners, calibrating RFID pads, and monitoring circulation analytics with LinkedIn Learning labs.',
    url: 'https://www.linkedin.com/learning/',
    imageUrl:
      'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80',
    durationInSeconds: minutes(55),
    durationFormatted: '55m',
    skillLevel: 'BEGINNER',
    releasedAt: '2023-11-02T00:00:00Z',
    topics: ['rfid', 'automation', 'self-checkout'],
    authors: [{ name: 'Brooke Chang', title: 'Solutions Architect' }],
    contentType: 'COURSE',
  },
  {
    urn: 'urn:li:learningCourse:data-driven-library-ops',
    title: 'Data-Driven Library Operations',
    description:
      'Translate circulation and learning analytics into measurable KPIs, dashboards, and predictive staffing plans.',
    url: 'https://www.linkedin.com/learning/',
    imageUrl:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80',
    durationInSeconds: minutes(68),
    durationFormatted: '1h 8m',
    skillLevel: 'ADVANCED',
    releasedAt: '2024-07-18T00:00:00Z',
    topics: ['data analytics', 'power bi', 'reporting'],
    authors: [
      { name: 'Amina Osman', title: 'Analytics Strategist' },
      { name: 'Luca Moretti', title: 'Insights Consultant' },
    ],
    contentType: 'COURSE',
  },
  {
    urn: 'urn:li:learningCourse:inclusive-library-programming',
    title: 'Inclusive Library Programming & Outreach',
    description:
      'Plan inclusive programming, craft accessible communication, and partner with community groups using practical toolkits.',
    url: 'https://www.linkedin.com/learning/',
    imageUrl:
      'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80',
    durationInSeconds: minutes(37),
    durationFormatted: '37m',
    skillLevel: 'BEGINNER',
    releasedAt: '2022-09-10T00:00:00Z',
    topics: ['community engagement', 'communications', 'leadership'],
    authors: [{ name: 'Isabella Maher', title: 'Community Manager' }],
    contentType: 'COURSE',
  },
  {
    urn: 'urn:li:learningCourse:ai-for-librarians',
    title: 'AI Literacy for Librarians',
    description:
      'Understand how generative AI can optimize cataloguing, discovery, and research consultations with ethical guardrails.',
    url: 'https://www.linkedin.com/learning/',
    imageUrl:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
    durationInSeconds: minutes(50),
    durationFormatted: '50m',
    skillLevel: 'INTERMEDIATE',
    releasedAt: '2024-01-05T00:00:00Z',
    topics: ['artificial intelligence', 'cataloguing', 'ethics'],
    authors: [{ name: 'Priya Raman', title: 'AI Program Manager' }],
    contentType: 'COURSE',
  },
  {
    urn: 'urn:li:learningCourse:service-design-sprint',
    title: 'Service Design Sprint for Campus Libraries',
    description:
      'Run a five-day sprint to map patron journeys, ideate improvements, prototype flows, and test before investing in new hardware.',
    url: 'https://www.linkedin.com/learning/',
    imageUrl:
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
    durationInSeconds: minutes(32),
    durationFormatted: '32m',
    skillLevel: 'INTERMEDIATE',
    releasedAt: '2023-05-25T00:00:00Z',
    topics: ['service design', 'design thinking', 'rapid prototyping'],
    authors: [{ name: 'Marcus Ibarra', title: 'Innovation Coach' }],
    contentType: 'COURSE',
  },
];
