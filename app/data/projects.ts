/**
 * The work shown in the second section, one card each.
 *
 * TO FILL THIS IN
 *   1. Edit the six entries below, or add and remove entries freely. The grid
 *      reflows for any count.
 *   2. Drop a photo for each at  public/projects/<id>.(jpg|png|webp)  and set
 *      `image` to that path. Landscape works best: the card crops to 16:10 and
 *      the shot is centred, so keep the subject away from the very edges.
 *   3. Anything left without an `image` renders a labelled empty frame naming
 *      the file it is waiting for, so a half-filled deck still looks deliberate
 *      rather than broken.
 *
 * `tag` is the small chip over the photo. `detail` and `points` only appear once
 * the card is opened, so they can carry the substance the blurb has no room for.
 * `href` is optional; leave it off and the card simply does not link anywhere.
 */
export type Project = {
  id: string;
  title: string;
  tag: string;
  blurb: string;
  detail: string;
  points: string[];
  image?: string;
  video?: string;
  href?: string;
};

export const PROJECTS: Project[] = [
  {
    id: 'booking-app',
    title: 'Booking | React Native',
    tag: 'Mobile',
    blurb: 'Custom booking apps that help businesses manage appointments without manual scheduling.',
    detail: 'Whether you run a salon, clinic, consultancy, rental service, or any appointment-based business, I\'ll design and develop a clean, easy-to-use booking system tailored to your needs.',
    points: ['React Native', 'Mobile App', 'Scheduling', 'Google Maps'],
    image: '/projects/booking-app.jpg',
    video: '/projects/booking-app.mp4',
  },
  {
    id: 'ev-industry',
    title: 'EV Mechanic Finder',
    tag: 'Mobile',
    blurb: 'Helping EV drivers find mechanics they can trust with location-based search and in-app booking.',
    detail: 'I built a React Native app with location-based search, mechanic profiles, and in-app booking to solve this. The app streamlines discovery for a niche market that lacked a dedicated trusted-mechanic directory.',
    points: ['React Native', 'Firebase', 'Redux', 'API Integration'],
    image: '/projects/ev-industry-app.jpg',
    video: '/projects/ev-industry-app.mp4',
  },
  {
    id: 'outsourcing-firm',
    title: 'Outsourcing Firm Site',
    tag: 'Web',
    blurb: 'Designed, developed, and deployed a full website for an outsourcing and recruitment company.',
    detail: 'Delivered a fast, responsive site built to represent an international client base and support lead generation, handling everything from design to deployment using Next.js and React.',
    points: ['Next.js', 'React', 'API Integration', 'SEO Performance'],
    image: '/projects/outsourcing-web.jpg',
  },
  {
    id: 'travel-startup',
    title: 'AI Trip Planner App',
    tag: 'AI',
    blurb: 'An AI-powered trip planning and scheduling app that helps travelers find things to do nearby.',
    detail: 'Combined React Native for the mobile experience with LLM integration to generate personalized, real-time itinerary suggestions for travelers passing through airports or cities.',
    points: ['Next.js', 'Machine Learning', 'GraphQL', 'Firebase'],
    image: '/projects/travel-web.jpg',
    href: 'https://www.guidego.app/',
  },
  {
    id: 'saas-platform',
    title: 'Dopebase Website',
    tag: 'Web',
    blurb: 'Built the full marketing website for Dopebase, a platform giving developers fast access to production-ready app templates.',
    detail: 'Focused on clear conversion-driven messaging and a fast, responsive Next.js build to support the platform\'s developer audience.',
    points: ['Next.js', 'React', 'Payment Gateway', 'SEO Writing'],
    image: '/projects/saas-web.jpg',
  },
  {
    id: 'chewata-awaqi',
    title: 'Chewata Awaqi Events',
    tag: 'Web',
    blurb: 'A vibrant gaming and events company that brings the digital world to life through immersive tournaments.',
    detail: 'I built a fast, responsive website using Next.js, Tailwind CSS, ShadCN UI, and Prisma. The site features event listings, a media gallery, and dynamic content management.',
    points: ['Next.js', 'React', 'UI/UX Prototyping', 'Agile Project Management'],
    image: '/projects/chewata-event.jpg',
  },
  {
    id: '3d-museum',
    title: 'Interactive 3D Museum',
    tag: 'Web',
    blurb: 'A fully interactive 3D museum experience to explore immersive design, accessibility, and global usability.',
    detail: 'Built as a personal project with Three.js for 3D rendering, multilingual support via i18next, and AI text-to-speech for accessibility.',
    points: ['Three.js', 'AI Text-to-Speech', 'React', 'Modeling'],
    image: '/projects/3d-museum.jpg',
    href: 'https://vr-museum.vercel.app/',
  },
  {
    id: 'dopebase-admin',
    title: 'Dopebase Admin Panel',
    tag: 'Platform',
    blurb: 'Seamlessly managed users, analyzed data, and automated workflows for an open-source platform.',
    detail: 'Built the administration panel with Next.js, Firebase, Auth0, and Tailwind CSS to handle the back-office operations of the platform.',
    points: ['Next.js', 'Firebase', 'Tailwind CSS', 'Auth0'],
    image: '/projects/dopebase-admin.jpg',
    href: 'https://dopebase.com/',
  },
  {
    id: 'instaflutter-docs',
    title: 'Instaflutter Docs',
    tag: 'Web',
    blurb: 'A clean, developer-friendly documentation site using Docusaurus for prebuilt Flutter plugins.',
    detail: 'Created structured guides, code examples, and search functionality—making plugin adoption smooth and efficient for developers of all levels.',
    points: ['Next.js', 'File Documentation', 'Agile Software Development', 'Tailwind CSS'],
    image: '/projects/instaflutter-doc.jpg',
    href: 'https://dopebase.com/docs/flutter/getting-started-with-flutter',
  }
];
