# Midtjysk Fælge og Dæk

En ren, responsiv hjemmeside til salg af **brugte og nye fælge og dæk** til alle
bilkategorier. Kunden vælger varer online og **betaler ved afhentning**.

## Funktioner

- **Find din bil** — vælg Mærke → Model → Generation → Motor (fx BMW E39 523i).
  Siden viser boltcirkel/PCD, centerhul, bolte og OE-dækstørrelse, og kan
  filtrere produkterne til kun dem der passer.
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
| `fitment.js` | Bil-database: mærker, modeller, generationer og fælg-/dækdata. |
| `script.js` | Bil-vælger, fit-matchning, filtre, produktliste og forespørgsels-flow. |

## Udvid bil-databasen

`fitment.js` er bygget så den er nem at udvide. Tilføj et mærke, en model eller
en generation efter samme mønster:

```js
"Hyundai": {
  "i30": [
    { code: "PD", years: "2017–", pcd: "5x114.3", bore: 67.1,
      stud: "M12x1.5", oeTyre: "205/55 R16", sizes: [15,16,17,18],
      engines: ["1.0 T-GDI","1.4 T-GDI","1.6 CRDi"] },
  ],
},
```

Et produkt "passer" til bilen når fælgens `bolt` matcher bilens `pcd`, eller når
et dæks diameter (`dia`) indgår i bilens `sizes`. Tallene i `fitment.js` er
vejledende — kontrollér mod bilens registreringsattest.

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
