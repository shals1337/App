import { profile } from '../content.js'

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__inner">
        <p className="hero__eyebrow">{profile.tagline}</p>
        <h1 className="hero__title">
          Hi, I’m <span className="hero__name">{profile.name}</span>
        </h1>
        <p className="hero__intro">{profile.intro}</p>
        <a className="btn" href="#about">
          Learn more
        </a>
      </div>
      <div className="hero__glow" aria-hidden="true" />
    </section>
  )
}
