import { contact } from '../content.js'

export default function Contact() {
  return (
    <section className="section section--tinted" id="contact">
      <h2 className="section__title">{contact.heading}</h2>
      <p className="contact__text">{contact.text}</p>
      <div className="contact__links">
        {contact.links.map((link) => (
          <a
            className="btn btn--outline"
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
          >
            {link.label}
          </a>
        ))}
      </div>
    </section>
  )
}
