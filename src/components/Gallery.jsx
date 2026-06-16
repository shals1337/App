import { gallery } from '../content.js'

export default function Gallery() {
  return (
    <section className="section" id="gallery">
      <h2 className="section__title">{gallery.heading}</h2>
      <div className="gallery">
        {gallery.items.map((item, i) => (
          <figure className="gallery__item" key={i}>
            {item.src ? (
              <img src={item.src} alt={item.caption} />
            ) : (
              <div
                className="gallery__placeholder"
                style={{ background: item.color || '#eee' }}
              />
            )}
            <figcaption>{item.caption}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
