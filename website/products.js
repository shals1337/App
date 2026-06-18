/* Midtjysk Fælge og Dæk — data for kategorier og produkter.
   Rediger denne fil for at tilføje, ændre eller fjerne varer.

   Felter til bil-match:
     kind   : "faelge" eller "daek"
     bolt   : boltcirkel for fælge, fx "5x120" (bruges til at matche bilens PCD)
     dia    : fælgdiameter i tommer (bruges til at matche dæk mod bilens fælgstørrelse)
     tyre   : dækstørrelse for dæk-produkter (vises til kunden)
*/

const CATEGORIES = [
  { id: "personbil",  name: "Personbil",     icon: "🚗", desc: "Hatchback, sedan & coupé" },
  { id: "suv",        name: "SUV & 4x4",     icon: "🚙", desc: "Offroad og crossover" },
  { id: "stationcar", name: "Stationcar",    icon: "🚘", desc: "Familie & ladrum" },
  { id: "varevogn",   name: "Varevogn",      icon: "🚐", desc: "Erhverv & transport" },
  { id: "sport",      name: "Sportsvogn",    icon: "🏎️", desc: "Performance & let vægt" },
  { id: "elbil",      name: "Elbil",         icon: "⚡", desc: "Aero & lavt rullemodstand" },
  { id: "veteran",    name: "Veteran",       icon: "🚥", desc: "Klassiske & retro mål" },
  { id: "trailer",    name: "Trailer",       icon: "🛻", desc: "Anhænger & campingvogn" },
];

const PRODUCTS = [
  {
    id: "p1", name: "Sølv alufælg 16\"", condition: "brugt", category: "personbil",
    kind: "faelge", bolt: "5x112", dia: 16,
    spec: "16\" · 5x112 · ET45 · sæt à 4 stk.", price: 2400,
  },
  {
    id: "p2", name: "Sortlakeret alufælg 18\"", condition: "ny", category: "suv",
    kind: "faelge", bolt: "5x120", dia: 18,
    spec: "18\" · 5x120 · ET40 · sæt à 4 stk.", price: 5200,
  },
  {
    id: "p3", name: "Vinterdæk Michelin 205/55 R16", condition: "ny", category: "personbil",
    kind: "daek", dia: 16, tyre: "205/55 R16",
    spec: "205/55 R16 · 91H · sæt à 4 stk.", price: 3600,
  },
  {
    id: "p4", name: "Stålfælge med hjulkapsler 15\"", condition: "brugt", category: "personbil",
    kind: "faelge", bolt: "4x100", dia: 15,
    spec: "15\" · 4x100 · ET40 · sæt à 4 stk.", price: 900,
  },
  {
    id: "p5", name: "Diamantslebne fælge 19\"", condition: "ny", category: "sport",
    kind: "faelge", bolt: "5x112", dia: 19,
    spec: "19\" · 5x112 · ET35 · sæt à 4 stk.", price: 7400,
  },
  {
    id: "p6", name: "Sommerdæk Continental 225/45 R17", condition: "ny", category: "stationcar",
    kind: "daek", dia: 17, tyre: "225/45 R17",
    spec: "225/45 R17 · 94Y · sæt à 4 stk.", price: 4200,
  },
  {
    id: "p7", name: "Varevognsfælge forstærket 16\"", condition: "ny", category: "varevogn",
    kind: "faelge", bolt: "5x120", dia: 16,
    spec: "16\" · 5x120 · ET68 · sæt à 4 stk.", price: 4800,
  },
  {
    id: "p8", name: "Brugte sommerdæk 195/65 R15", condition: "brugt", category: "personbil",
    kind: "daek", dia: 15, tyre: "195/65 R15",
    spec: "195/65 R15 · 6 mm mønster · sæt à 4 stk.", price: 1200,
  },
  {
    id: "p9", name: "Offroad alufælge 17\"", condition: "ny", category: "suv",
    kind: "faelge", bolt: "5x120", dia: 17,
    spec: "17\" · 5x120 · ET20 · sæt à 4 stk.", price: 6100,
  },
  {
    id: "p10", name: "Aero-fælge til elbil 18\"", condition: "ny", category: "elbil",
    kind: "faelge", bolt: "5x114.3", dia: 18,
    spec: "18\" · 5x114.3 · ET50 · sæt à 4 stk.", price: 6900,
  },
  {
    id: "p11", name: "Klassiske krydseger-fælge 14\"", condition: "brugt", category: "veteran",
    kind: "faelge", bolt: "4x100", dia: 14,
    spec: "14\" · 4x100 · ET30 · sæt à 4 stk.", price: 2800,
  },
  {
    id: "p12", name: "Trailerfælg med dæk 13\"", condition: "ny", category: "trailer",
    kind: "faelge", bolt: "4x100", dia: 13,
    spec: "13\" · 4x100 · 155/70 R13 · pr. stk.", price: 650,
  },
  {
    id: "p13", name: "Helårsdæk Goodyear 215/60 R17", condition: "ny", category: "suv",
    kind: "daek", dia: 17, tyre: "215/60 R17",
    spec: "215/60 R17 · 96V · sæt à 4 stk.", price: 4700,
  },
  {
    id: "p14", name: "Letvægts racefælge 18\"", condition: "brugt", category: "sport",
    kind: "faelge", bolt: "5x120", dia: 18,
    spec: "18\" · 5x120 · ET32 · sæt à 4 stk.", price: 5400,
  },
  {
    id: "p15", name: "Stationcar alufælge 17\"", condition: "brugt", category: "stationcar",
    kind: "faelge", bolt: "5x112", dia: 17,
    spec: "17\" · 5x112 · ET48 · sæt à 4 stk.", price: 3100,
  },
  {
    id: "p16", name: "Varevogn vinterdæk 215/65 R16C", condition: "ny", category: "varevogn",
    kind: "daek", dia: 16, tyre: "215/65 R16C",
    spec: "215/65 R16C · 109T · sæt à 4 stk.", price: 5200,
  },
];
