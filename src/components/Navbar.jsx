import { profile } from '../content.js'

const links = [
  { label: 'About', href: '#about' },
  { label: 'Loves', href: '#interests' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  return (
    <header className="navbar">
      <a className="navbar__brand" href="#top">
        {profile.name}
      </a>
      <nav className="navbar__links">
        {links.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  )
}
