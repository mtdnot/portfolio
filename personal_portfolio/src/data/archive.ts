export const archiveSections = [
  {
    title: 'Apps',
    type: 'links',
    items: [
      { label: 'AI chat with live2d →', href: 'https://apps.mtdnot.dev/chat/' },
      { label: 'chart8（三重県内の医療と過疎） →', href: 'https://apps.mtdnot.dev/chart8/' },
      { label: 'wordcounter →', href: 'https://apps.mtdnot.dev/wordcounter/' },
    ],
  },
  {
    title: 'Articles / Presentations',
    type: 'links',
    items: [
      { label: 'Intro myself LT →', href: 'https://apps.mtdnot.dev/intromyselfLTrevealjs/' },
      { label: '大LT →', href: 'https://apps.mtdnot.dev/%E5%A4%A7LTrevealjs4up/#/' },
    ],
  },
  {
    title: 'Projects',
    type: 'projects',
    items: [
      {
        title: 'AI Chat Application',
        description: 'AI-powered chat platform using OpenAI API',
        links: [
          { label: 'Live Demo', href: 'https://chat.mtdnot.dev/' },
          { label: 'GitHub', href: 'https://github.com/mtdnot/AIChatApp' },
        ],
      },
      {
        title: 'CNC Pen Plotter',
        description: 'Mechanical device using G-code',
        links: [{ label: 'Demo Video', href: 'https://www.youtube.com/watch?v=cvTdwgvXVYw' }],
      },
      {
        title: 'Fractal Tree',
        description: 'Using OpenGL to render recursive structures',
        links: [{ label: 'Demo Video', href: 'https://youtu.be/BvySqiAc7FI' }],
      },
    ],
  },
  {
    title: 'Other',
    type: 'links',
    items: [{ label: 'NCC →', href: 'https://apps.mtdnot.dev/ncc/' }],
  },
] as const;
