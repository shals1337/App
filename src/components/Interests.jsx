import { interests } from '../content.js'

export default function Interests() {
  return (
    <section className="section section--tinted" id="interests">
      <h2 className="section__title">{interests.heading}</h2>
      <div className="cards">
        {interests.items.map((item) => (
          <article className="card" key={item.title}>
            <span className="card__emoji" aria-hidden="true">
              {item.emoji}
            </span>
            <h3 className="card__title">{item.title}</h3>
            <p className="card__text">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
