// ---------------------------------------------------------------------------
// Edit this file to personalize the site. Everything the pages display lives
// here, so you don't have to touch the components.
// ---------------------------------------------------------------------------

export const profile = {
  name: 'Mia',
  tagline: 'Welcome to my little corner of the internet.',
  intro:
    "Hi, I'm Mia. This is my personal website — a place to share who I am, " +
    'the things I love, and what I’m up to.',
}

export const about = {
  heading: 'About me',
  paragraphs: [
    'Write a few sentences about yourself here — where you’re from, what you ' +
      'do, and what makes you, you.',
    'You can add as many paragraphs as you like. Just edit the text in ' +
      'src/content.js and the page updates automatically.',
  ],
}

export const interests = {
  heading: 'Things I love',
  items: [
    { emoji: '🎨', title: 'Creativity', text: 'Art, design, and making things look pretty.' },
    { emoji: '🎵', title: 'Music', text: 'A good playlist for every mood.' },
    { emoji: '📚', title: 'Reading', text: 'Getting lost in a good story.' },
    { emoji: '☕', title: 'Cozy days', text: 'Warm drinks and quiet afternoons.' },
  ],
}

export const gallery = {
  heading: 'Gallery',
  // Replace these with your own images. Drop files into /public and reference
  // them like "/my-photo.jpg", or use full URLs.
  items: [
    { caption: 'Add your photos here', color: '#ffd6e8' },
    { caption: 'Edit src/content.js', color: '#e0d4ff' },
    { caption: 'Make it yours', color: '#d6f0ff' },
  ],
}

export const contact = {
  heading: 'Say hello',
  text: 'Want to get in touch? Here’s where to find me.',
  links: [
    { label: 'Email', href: 'mailto:hello@example.com' },
    { label: 'Instagram', href: 'https://instagram.com/' },
    { label: 'GitHub', href: 'https://github.com/' },
  ],
}
