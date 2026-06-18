# Midtjysk Fælge og Dæk

En ren, responsiv hjemmeside til salg af **brugte og nye fælge og dæk** til alle
bilkategorier. Kunden vælger varer online og **betaler ved afhentning**.

## Funktioner

- **Alle bilkategorier** — personbil, SUV/4x4, stationcar, varevogn, sportsvogn,
  elbil, veteran og trailer.
- **Produktfiltrering** — filtrér på type (ny/brugt) og bilkategori.
- **Forespørgsel / kurv** — læg varer i en forespørgsel og send navn + telefon.
- **Betal ved afhentning** — tydeligt kommunikeret i hele flowet (kontant/MobilePay).
- **Responsivt design** — virker på mobil, tablet og desktop. Ingen byggeproces.

## Filer

| Fil | Formål |
|-----|--------|
| `index.html` | Sidens struktur og indhold. |
| `styles.css` | Alt design og layout. |
| `products.js` | Data: bilkategorier og produkter (rediger her for at ændre udvalget). |
| `script.js` | Filtre, produktliste og forespørgsels-flow. |

## Kør lokalt

Åbn `index.html` direkte i en browser, eller start en lokal server:

```bash
cd website
python3 -m http.server 8000
# åbn http://localhost:8000
```

## Tilpas

- **Produkter:** rediger `PRODUCTS` i `products.js`.
- **Kategorier:** rediger `CATEGORIES` i `products.js`.
- **Kontaktoplysninger:** ret telefon, e-mail og adresse i `index.html` (`#kontakt`).
- **Farver:** ret CSS-variablerne i toppen af `styles.css` (`:root`).

> Bemærk: Forespørgsels- og kontaktformularerne er pt. demo (viser en
> bekræftelse i browseren). Kobl dem til e-mail eller et backend-endpoint for
> at modtage rigtige henvendelser.
