import { about } from '../content.js'

export default function About() {
  return (
    <section className="section" id="about">
      <h2 className="section__title">{about.heading}</h2>
      <div className="about__text">
        {about.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  )
}
