/* Midtjysk Fælge og Dæk — bil-fitmentdata.
 *
 * Struktur:  Mærke -> Model -> Generationer.
 * Hver generation har fælg-/dækdata der gælder for den generation:
 *   code     : intern kode/karrosseri (fx "E39")
 *   years    : produktionsår
 *   pcd      : boltcirkel (antal x diameter i mm), fx "5x120"
 *   bore     : centerhul / nav-diameter i mm, fx 74.1
 *   stud     : bolt-/møtrikgevind, fx "M12x1.5"
 *   oeTyre   : original dækstørrelse fra fabrikken
 *   sizes    : fælgdiametre i tommer der typisk passer (til dækmatch)
 *   engines  : motorvarianter (kun til præcist valg — fitment er ens i generationen)
 *
 * Tallene dækker de mest gængse varianter. Tjek altid mod bilens
 * registreringsattest / eksisterende fælg ved tvivl (særligt centerhul).
 */

const FITMENT = {
  "BMW": {
    "3-serie": [
      { code: "E46", years: "1998–2006", pcd: "5x120", bore: 72.6, stud: "M12x1.5", oeTyre: "205/55 R16", sizes: [16,17,18], engines: ["316i","318i","320i","320d","323i","325i","328i","330i","330d"] },
      { code: "E90/E91", years: "2005–2012", pcd: "5x120", bore: 72.6, stud: "M12x1.5", oeTyre: "205/55 R16", sizes: [16,17,18,19], engines: ["316i","318i","320i","320d","323i","325i","330i","330d","335i"] },
      { code: "F30/F31", years: "2012–2019", pcd: "5x120", bore: 72.6, stud: "M14x1.25", oeTyre: "225/50 R17", sizes: [16,17,18,19], engines: ["316i","318d","320i","320d","328i","330i","335i","340i"] },
    ],
    "5-serie": [
      { code: "E39", years: "1995–2003", pcd: "5x120", bore: 74.1, stud: "M12x1.5", oeTyre: "225/55 R16", sizes: [15,16,17,18], engines: ["520i","523i","525i","528i","530i","535i","540i","525d","530d"] },
      { code: "E60/E61", years: "2003–2010", pcd: "5x120", bore: 72.6, stud: "M14x1.25", oeTyre: "225/55 R16", sizes: [16,17,18,19], engines: ["520i","523i","525i","530i","540i","520d","525d","530d","535d"] },
      { code: "F10/F11", years: "2010–2017", pcd: "5x120", bore: 72.6, stud: "M14x1.25", oeTyre: "225/55 R17", sizes: [17,18,19,20], engines: ["520i","528i","530i","535i","520d","525d","530d","535d"] },
    ],
    "X3": [
      { code: "E83", years: "2003–2010", pcd: "5x120", bore: 72.6, stud: "M12x1.5", oeTyre: "235/55 R17", sizes: [17,18,19], engines: ["2.0d","2.5i","3.0i","3.0d"] },
      { code: "F25", years: "2010–2017", pcd: "5x120", bore: 72.6, stud: "M14x1.25", oeTyre: "245/50 R18", sizes: [17,18,19,20], engines: ["xDrive20i","xDrive20d","xDrive28i","xDrive30d","xDrive35i"] },
    ],
  },

  "Audi": {
    "A3": [
      { code: "8P", years: "2003–2012", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "205/55 R16", sizes: [16,17,18], engines: ["1.6","1.4 TFSI","1.8 TFSI","2.0 TFSI","1.9 TDI","2.0 TDI"] },
      { code: "8V", years: "2012–2020", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "205/55 R16", sizes: [16,17,18,19], engines: ["1.0 TFSI","1.4 TFSI","1.8 TFSI","2.0 TFSI","1.6 TDI","2.0 TDI"] },
    ],
    "A4": [
      { code: "B6/B7", years: "2000–2008", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "205/55 R16", sizes: [15,16,17,18], engines: ["1.6","1.8 T","2.0","2.0 TFSI","1.9 TDI","2.0 TDI","3.0 TDI"] },
      { code: "B8", years: "2008–2015", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "225/50 R17", sizes: [16,17,18,19], engines: ["1.8 TFSI","2.0 TFSI","2.0 TDI","3.0 TDI"] },
    ],
    "A6": [
      { code: "C6", years: "2004–2011", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "225/55 R16", sizes: [16,17,18,19], engines: ["2.0 TFSI","2.8 FSI","3.0 TFSI","2.0 TDI","2.7 TDI","3.0 TDI"] },
    ],
    "Q5": [
      { code: "8R", years: "2008–2017", pcd: "5x112", bore: 66.6, stud: "M14x1.5", oeTyre: "235/65 R17", sizes: [17,18,19,20], engines: ["2.0 TFSI","2.0 TDI","3.0 TDI"] },
    ],
  },

  "Volkswagen": {
    "Golf": [
      { code: "Mk5/Mk6", years: "2003–2012", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "195/65 R15", sizes: [15,16,17,18], engines: ["1.4 TSI","1.6","1.6 TDI","2.0 TDI","2.0 TFSI GTI","2.0 TSI R"] },
      { code: "Mk7", years: "2012–2020", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "195/65 R15", sizes: [15,16,17,18,19], engines: ["1.0 TSI","1.4 TSI","1.6 TDI","2.0 TDI","2.0 TSI GTI","2.0 TSI R"] },
    ],
    "Passat": [
      { code: "B6/B7", years: "2005–2014", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "205/55 R16", sizes: [16,17,18], engines: ["1.4 TSI","1.8 TSI","2.0 TSI","1.6 TDI","2.0 TDI"] },
      { code: "B8", years: "2014–2023", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "215/60 R16", sizes: [16,17,18,19], engines: ["1.4 TSI","1.8 TSI","2.0 TSI","1.6 TDI","2.0 TDI"] },
    ],
    "Polo": [
      { code: "6R/6C", years: "2009–2017", pcd: "5x100", bore: 57.1, stud: "M14x1.5", oeTyre: "185/60 R15", sizes: [14,15,16,17], engines: ["1.0","1.2 TSI","1.4 TDI","1.8 TSI GTI"] },
    ],
    "Transporter T5/T6": [
      { code: "T5/T6", years: "2003–2019", pcd: "5x120", bore: 65.1, stud: "M14x1.5", oeTyre: "215/65 R16C", sizes: [16,17,18], engines: ["2.0 TDI","2.5 TDI","2.0 BiTDI"] },
    ],
  },

  "Skoda": {
    "Octavia": [
      { code: "1Z", years: "2004–2013", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "195/65 R15", sizes: [15,16,17,18], engines: ["1.4 TSI","1.6","1.8 TSI","1.6 TDI","2.0 TDI"] },
      { code: "5E", years: "2013–2020", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "205/55 R16", sizes: [15,16,17,18], engines: ["1.0 TSI","1.4 TSI","1.6 TDI","2.0 TDI","2.0 TSI RS"] },
    ],
    "Fabia": [
      { code: "5J/NJ", years: "2007–2021", pcd: "5x100", bore: 57.1, stud: "M14x1.5", oeTyre: "185/60 R15", sizes: [14,15,16], engines: ["1.0","1.2 TSI","1.4 TDI","1.6 TDI"] },
    ],
  },

  "Mercedes-Benz": {
    "C-klasse": [
      { code: "W204", years: "2007–2014", pcd: "5x112", bore: 66.6, stud: "M12x1.5", oeTyre: "205/55 R16", sizes: [16,17,18], engines: ["C180","C200","C250","C300","C200 CDI","C220 CDI","C250 CDI"] },
      { code: "W205", years: "2014–2021", pcd: "5x112", bore: 66.6, stud: "M12x1.5", oeTyre: "205/60 R16", sizes: [16,17,18,19], engines: ["C160","C180","C200","C300","C200 d","C220 d","C250 d"] },
    ],
    "E-klasse": [
      { code: "W211", years: "2002–2009", pcd: "5x112", bore: 66.6, stud: "M12x1.5", oeTyre: "215/55 R16", sizes: [16,17,18], engines: ["E200","E240","E280","E320","E200 CDI","E220 CDI","E280 CDI"] },
      { code: "W212", years: "2009–2016", pcd: "5x112", bore: 66.6, stud: "M12x1.5", oeTyre: "225/55 R16", sizes: [16,17,18,19], engines: ["E200","E250","E300","E350","E200 CDI","E220 CDI","E250 CDI"] },
    ],
  },

  "Ford": {
    "Focus": [
      { code: "Mk2", years: "2004–2011", pcd: "5x108", bore: 63.4, stud: "M12x1.5", oeTyre: "195/65 R15", sizes: [15,16,17,18], engines: ["1.6","1.8","2.0","1.6 TDCi","2.0 TDCi","2.5 ST"] },
      { code: "Mk3", years: "2011–2018", pcd: "5x108", bore: 63.4, stud: "M12x1.5", oeTyre: "205/55 R16", sizes: [16,17,18], engines: ["1.0 EcoBoost","1.6","1.6 TDCi","2.0 TDCi","2.0 ST"] },
    ],
    "Mondeo": [
      { code: "Mk4", years: "2007–2014", pcd: "5x108", bore: 63.4, stud: "M12x1.5", oeTyre: "215/55 R16", sizes: [16,17,18], engines: ["1.6 EcoBoost","2.0","2.0 TDCi","2.2 TDCi"] },
    ],
    "Fiesta": [
      { code: "Mk7", years: "2008–2017", pcd: "4x108", bore: 63.4, stud: "M12x1.5", oeTyre: "175/65 R14", sizes: [14,15,16,17], engines: ["1.0 EcoBoost","1.25","1.4 TDCi","1.6 ST"] },
    ],
  },

  "Opel": {
    "Astra": [
      { code: "H", years: "2004–2010", pcd: "5x110", bore: 65.1, stud: "M12x1.5", oeTyre: "195/65 R15", sizes: [15,16,17,18], engines: ["1.4","1.6","1.8","1.7 CDTI","1.9 CDTI"] },
      { code: "J", years: "2009–2015", pcd: "5x115", bore: 70.1, stud: "M12x1.5", oeTyre: "205/55 R16", sizes: [16,17,18], engines: ["1.4 Turbo","1.6","1.7 CDTI","2.0 CDTI"] },
    ],
    "Insignia": [
      { code: "A", years: "2008–2017", pcd: "5x120", bore: 67.1, stud: "M12x1.5", oeTyre: "215/60 R16", sizes: [16,17,18,19], engines: ["1.6 Turbo","2.0 Turbo","2.0 CDTI"] },
    ],
  },

  "Toyota": {
    "Corolla": [
      { code: "E12", years: "2002–2007", pcd: "5x100", bore: 54.1, stud: "M12x1.5", oeTyre: "195/65 R15", sizes: [15,16], engines: ["1.4","1.6","1.8","2.0 D-4D"] },
      { code: "E21", years: "2018–", pcd: "5x114.3", bore: 60.1, stud: "M12x1.5", oeTyre: "205/55 R16", sizes: [16,17,18], engines: ["1.2 Turbo","1.8 Hybrid","2.0 Hybrid"] },
    ],
    "Avensis": [
      { code: "T25/T27", years: "2003–2018", pcd: "5x114.3", bore: 60.1, stud: "M12x1.5", oeTyre: "205/60 R16", sizes: [16,17,18], engines: ["1.8","2.0","2.2 D-4D","2.0 D-4D"] },
    ],
    "Yaris": [
      { code: "XP90/XP130", years: "2005–2020", pcd: "4x100", bore: 54.1, stud: "M12x1.5", oeTyre: "175/65 R15", sizes: [14,15,16], engines: ["1.0","1.3","1.4 D-4D","1.5 Hybrid"] },
    ],
  },

  "Volvo": {
    "V70/S60": [
      { code: "P3", years: "2007–2016", pcd: "5x108", bore: 63.4, stud: "M12x1.5", oeTyre: "215/55 R16", sizes: [16,17,18], engines: ["2.0 T","T5","D3","D4","D5"] },
    ],
    "XC60": [
      { code: "1. gen", years: "2008–2017", pcd: "5x108", bore: 63.4, stud: "M12x1.5", oeTyre: "235/65 R17", sizes: [17,18,19,20], engines: ["T5","T6","D3","D4","D5"] },
    ],
  },

  "Nissan": {
    "Qashqai": [
      { code: "J10/J11", years: "2007–2021", pcd: "5x114.3", bore: 66.1, stud: "M12x1.25", oeTyre: "215/60 R17", sizes: [16,17,18,19], engines: ["1.2 DIG-T","1.6","1.5 dCi","1.6 dCi"] },
    ],
  },

  "Mazda": {
    "Mazda3": [
      { code: "BL/BM", years: "2009–2018", pcd: "5x114.3", bore: 67.1, stud: "M12x1.5", oeTyre: "205/55 R16", sizes: [16,17,18], engines: ["1.6","2.0","2.2 D","2.0 SkyActiv"] },
    ],
    "Mazda6": [
      { code: "GH/GJ", years: "2007–2018", pcd: "5x114.3", bore: 67.1, stud: "M12x1.5", oeTyre: "205/60 R16", sizes: [16,17,18,19], engines: ["2.0","2.5","2.2 D"] },
    ],
  },

  "Peugeot": {
    "308": [
      { code: "T7/T9", years: "2007–2021", pcd: "4x108", bore: 65.1, stud: "M12x1.25", oeTyre: "195/65 R15", sizes: [15,16,17,18], engines: ["1.2 PureTech","1.6 THP","1.6 HDi","2.0 BlueHDi"] },
    ],
  },
};
