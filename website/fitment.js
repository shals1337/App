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
 * Tallene dækker de mest gængse varianter og er VEJLEDENDE. Tjek altid mod
 * bilens registreringsattest / eksisterende fælg ved tvivl (særligt centerhul).
 * Filen er bygget til at blive udvidet — tilføj blot efter samme mønster.
 */

const FITMENT = {
  "Audi": {
    "A1": [
      { code: "8X", years: "2010–2018", pcd: "5x100", bore: 57.1, stud: "M14x1.5", oeTyre: "185/60 R15", sizes: [15,16,17], engines: ["1.2 TFSI","1.4 TFSI","1.6 TDI","2.0 TFSI S1"] },
    ],
    "A3": [
      { code: "8P", years: "2003–2012", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "205/55 R16", sizes: [16,17,18], engines: ["1.6","1.4 TFSI","1.8 TFSI","2.0 TFSI","1.9 TDI","2.0 TDI"] },
      { code: "8V", years: "2012–2020", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "205/55 R16", sizes: [16,17,18,19], engines: ["1.0 TFSI","1.4 TFSI","1.8 TFSI","2.0 TFSI","1.6 TDI","2.0 TDI"] },
    ],
    "A4": [
      { code: "B6/B7", years: "2000–2008", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "205/55 R16", sizes: [15,16,17,18], engines: ["1.6","1.8 T","2.0","2.0 TFSI","1.9 TDI","2.0 TDI","3.0 TDI"] },
      { code: "B8", years: "2008–2015", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "225/50 R17", sizes: [16,17,18,19], engines: ["1.8 TFSI","2.0 TFSI","2.0 TDI","3.0 TDI"] },
    ],
    "A5": [
      { code: "8T", years: "2007–2016", pcd: "5x112", bore: 66.6, stud: "M14x1.5", oeTyre: "225/50 R17", sizes: [17,18,19], engines: ["1.8 TFSI","2.0 TFSI","3.2 FSI","2.0 TDI","3.0 TDI"] },
    ],
    "A6": [
      { code: "C6", years: "2004–2011", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "225/55 R16", sizes: [16,17,18,19], engines: ["2.0 TFSI","2.8 FSI","3.0 TFSI","2.0 TDI","2.7 TDI","3.0 TDI"] },
      { code: "C7", years: "2011–2018", pcd: "5x112", bore: 66.6, stud: "M14x1.5", oeTyre: "225/55 R17", sizes: [17,18,19,20], engines: ["1.8 TFSI","2.0 TFSI","3.0 TFSI","2.0 TDI","3.0 TDI"] },
    ],
    "Q3": [
      { code: "8U", years: "2011–2018", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "215/65 R16", sizes: [16,17,18,19], engines: ["1.4 TFSI","2.0 TFSI","2.0 TDI"] },
    ],
    "Q5": [
      { code: "8R", years: "2008–2017", pcd: "5x112", bore: 66.6, stud: "M14x1.5", oeTyre: "235/65 R17", sizes: [17,18,19,20], engines: ["2.0 TFSI","2.0 TDI","3.0 TDI"] },
    ],
    "Q7": [
      { code: "4L", years: "2006–2015", pcd: "5x130", bore: 71.6, stud: "M14x1.5", oeTyre: "235/65 R18", sizes: [18,19,20,21], engines: ["3.0 TFSI","3.6 FSI","3.0 TDI","4.2 TDI"] },
    ],
  },

  "BMW": {
    "1-serie": [
      { code: "E87", years: "2004–2013", pcd: "5x120", bore: 72.6, stud: "M12x1.5", oeTyre: "195/55 R16", sizes: [16,17,18], engines: ["116i","118i","120i","118d","120d","123d","130i"] },
      { code: "F20/F21", years: "2011–2019", pcd: "5x120", bore: 72.6, stud: "M14x1.25", oeTyre: "205/55 R16", sizes: [16,17,18], engines: ["116i","118i","120i","125i","116d","118d","120d","M135i"] },
    ],
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
    "X1": [
      { code: "E84", years: "2009–2015", pcd: "5x120", bore: 72.6, stud: "M14x1.25", oeTyre: "225/50 R17", sizes: [17,18,19], engines: ["sDrive18i","xDrive20i","xDrive28i","sDrive18d","xDrive20d","xDrive23d"] },
    ],
    "X3": [
      { code: "E83", years: "2003–2010", pcd: "5x120", bore: 72.6, stud: "M12x1.5", oeTyre: "235/55 R17", sizes: [17,18,19], engines: ["2.0d","2.5i","3.0i","3.0d"] },
      { code: "F25", years: "2010–2017", pcd: "5x120", bore: 72.6, stud: "M14x1.25", oeTyre: "245/50 R18", sizes: [17,18,19,20], engines: ["xDrive20i","xDrive20d","xDrive28i","xDrive30d","xDrive35i"] },
    ],
    "X5": [
      { code: "E70", years: "2006–2013", pcd: "5x120", bore: 74.1, stud: "M14x1.25", oeTyre: "255/55 R18", sizes: [18,19,20], engines: ["3.0si","4.8i","xDrive30d","xDrive35d","xDrive40d"] },
    ],
  },

  "Citroën": {
    "C3": [
      { code: "A51/B618", years: "2009–", pcd: "4x108", bore: 65.1, stud: "M12x1.25", oeTyre: "185/65 R15", sizes: [15,16], engines: ["1.2 PureTech","1.4","1.6 HDi","1.6 BlueHDi"] },
    ],
    "C4": [
      { code: "B7", years: "2010–2018", pcd: "4x108", bore: 65.1, stud: "M12x1.25", oeTyre: "195/65 R15", sizes: [15,16,17], engines: ["1.2 PureTech","1.6 VTi","1.6 HDi","2.0 HDi"] },
    ],
    "Berlingo": [
      { code: "B9", years: "2008–2018", pcd: "4x108", bore: 65.1, stud: "M12x1.25", oeTyre: "195/65 R15", sizes: [15,16], engines: ["1.6 VTi","1.6 HDi","1.6 BlueHDi"] },
    ],
  },

  "Dacia": {
    "Duster": [
      { code: "1. gen", years: "2010–2018", pcd: "4x100", bore: 60.1, stud: "M12x1.5", oeTyre: "215/65 R16", sizes: [16], engines: ["1.6 SCe","1.2 TCe","1.5 dCi"] },
    ],
    "Sandero": [
      { code: "II", years: "2012–2020", pcd: "4x100", bore: 60.1, stud: "M12x1.5", oeTyre: "185/65 R15", sizes: [15,16], engines: ["1.0 SCe","0.9 TCe","1.5 dCi"] },
    ],
  },

  "Fiat": {
    "500": [
      { code: "312", years: "2007–", pcd: "4x98", bore: 58.1, stud: "M12x1.25", oeTyre: "175/65 R14", sizes: [14,15,16], engines: ["1.2","0.9 TwinAir","1.4","1.3 MultiJet"] },
    ],
    "Punto": [
      { code: "199", years: "2005–2018", pcd: "4x98", bore: 58.1, stud: "M12x1.25", oeTyre: "185/65 R15", sizes: [15,16,17], engines: ["1.2","1.4","1.3 MultiJet","1.6 MultiJet"] },
    ],
  },

  "Ford": {
    "Fiesta": [
      { code: "Mk7", years: "2008–2017", pcd: "4x108", bore: 63.4, stud: "M12x1.5", oeTyre: "175/65 R14", sizes: [14,15,16,17], engines: ["1.0 EcoBoost","1.25","1.4 TDCi","1.6 ST"] },
    ],
    "Focus": [
      { code: "Mk2", years: "2004–2011", pcd: "5x108", bore: 63.4, stud: "M12x1.5", oeTyre: "195/65 R15", sizes: [15,16,17,18], engines: ["1.6","1.8","2.0","1.6 TDCi","2.0 TDCi","2.5 ST"] },
      { code: "Mk3", years: "2011–2018", pcd: "5x108", bore: 63.4, stud: "M12x1.5", oeTyre: "205/55 R16", sizes: [16,17,18], engines: ["1.0 EcoBoost","1.6","1.6 TDCi","2.0 TDCi","2.0 ST"] },
    ],
    "Kuga": [
      { code: "Mk2", years: "2013–2019", pcd: "5x108", bore: 63.4, stud: "M12x1.5", oeTyre: "235/55 R17", sizes: [17,18,19], engines: ["1.5 EcoBoost","1.6 EcoBoost","2.0 TDCi"] },
    ],
    "Mondeo": [
      { code: "Mk4", years: "2007–2014", pcd: "5x108", bore: 63.4, stud: "M12x1.5", oeTyre: "215/55 R16", sizes: [16,17,18], engines: ["1.6 EcoBoost","2.0","2.0 TDCi","2.2 TDCi"] },
    ],
    "Transit Custom": [
      { code: "V362", years: "2012–", pcd: "5x160", bore: 65.1, stud: "M14x1.5", oeTyre: "215/65 R16C", sizes: [16], engines: ["2.0 EcoBlue","2.2 TDCi"] },
    ],
  },

  "Honda": {
    "Civic": [
      { code: "FK/FN", years: "2006–2011", pcd: "5x114.3", bore: 64.1, stud: "M12x1.5", oeTyre: "195/65 R15", sizes: [15,16,17,18], engines: ["1.4","1.8","2.0 Type R","2.2 i-CTDi"] },
    ],
    "CR-V": [
      { code: "RE/RM", years: "2006–2018", pcd: "5x114.3", bore: 64.1, stud: "M12x1.5", oeTyre: "225/65 R17", sizes: [16,17,18], engines: ["2.0","2.4","2.2 i-DTEC","1.6 i-DTEC"] },
    ],
    "Jazz": [
      { code: "GE/GK", years: "2008–2020", pcd: "4x100", bore: 56.1, stud: "M12x1.5", oeTyre: "175/65 R15", sizes: [14,15,16], engines: ["1.2","1.3","1.4","1.5"] },
    ],
  },

  "Hyundai": {
    "i20": [
      { code: "GB/BC3", years: "2014–", pcd: "4x100", bore: 54.1, stud: "M12x1.5", oeTyre: "185/65 R15", sizes: [14,15,16], engines: ["1.2","1.0 T-GDI","1.4 CRDi"] },
    ],
    "i30": [
      { code: "GD/PD", years: "2011–", pcd: "5x114.3", bore: 67.1, stud: "M12x1.5", oeTyre: "195/65 R15", sizes: [15,16,17,18], engines: ["1.4","1.0 T-GDI","1.4 T-GDI","1.6 CRDi","2.0 T-GDI N"] },
    ],
    "Tucson": [
      { code: "TL", years: "2015–2020", pcd: "5x114.3", bore: 67.1, stud: "M12x1.5", oeTyre: "225/60 R17", sizes: [16,17,18,19], engines: ["1.6 GDI","1.6 T-GDI","1.7 CRDi","2.0 CRDi"] },
    ],
  },

  "Kia": {
    "Ceed": [
      { code: "JD/CD", years: "2012–", pcd: "5x114.3", bore: 67.1, stud: "M12x1.5", oeTyre: "195/65 R15", sizes: [15,16,17], engines: ["1.4","1.0 T-GDI","1.4 T-GDI","1.6 CRDi"] },
    ],
    "Picanto": [
      { code: "TA/JA", years: "2011–", pcd: "4x100", bore: 54.1, stud: "M12x1.5", oeTyre: "175/65 R14", sizes: [14,15,16], engines: ["1.0","1.2","1.0 T-GDI"] },
    ],
    "Sportage": [
      { code: "SL/QL", years: "2010–", pcd: "5x114.3", bore: 67.1, stud: "M12x1.5", oeTyre: "225/60 R17", sizes: [16,17,18,19], engines: ["1.6 GDI","1.6 T-GDI","1.7 CRDi","2.0 CRDi"] },
    ],
  },

  "Mazda": {
    "Mazda2": [
      { code: "DE/DJ", years: "2007–", pcd: "4x100", bore: 54.1, stud: "M12x1.5", oeTyre: "185/60 R15", sizes: [14,15,16], engines: ["1.3","1.5 SkyActiv","1.5 D"] },
    ],
    "Mazda3": [
      { code: "BL/BM", years: "2009–2018", pcd: "5x114.3", bore: 67.1, stud: "M12x1.5", oeTyre: "205/55 R16", sizes: [16,17,18], engines: ["1.6","2.0","2.2 D","2.0 SkyActiv"] },
    ],
    "Mazda6": [
      { code: "GH/GJ", years: "2007–2018", pcd: "5x114.3", bore: 67.1, stud: "M12x1.5", oeTyre: "205/60 R16", sizes: [16,17,18,19], engines: ["2.0","2.5","2.2 D"] },
    ],
    "CX-5": [
      { code: "KE/KF", years: "2012–", pcd: "5x114.3", bore: 67.1, stud: "M12x1.5", oeTyre: "225/65 R17", sizes: [17,18,19], engines: ["2.0 SkyActiv-G","2.5 SkyActiv-G","2.2 SkyActiv-D"] },
    ],
  },

  "Mercedes-Benz": {
    "A-klasse": [
      { code: "W176", years: "2012–2018", pcd: "5x112", bore: 66.6, stud: "M12x1.5", oeTyre: "205/55 R16", sizes: [16,17,18], engines: ["A160","A180","A200","A250","A180 d","A200 d","A220 d","A45 AMG"] },
    ],
    "B-klasse": [
      { code: "W246", years: "2011–2018", pcd: "5x112", bore: 66.6, stud: "M12x1.5", oeTyre: "205/55 R16", sizes: [16,17,18], engines: ["B180","B200","B180 d","B200 d","B220 d"] },
    ],
    "C-klasse": [
      { code: "W204", years: "2007–2014", pcd: "5x112", bore: 66.6, stud: "M12x1.5", oeTyre: "205/55 R16", sizes: [16,17,18], engines: ["C180","C200","C250","C300","C200 CDI","C220 CDI","C250 CDI"] },
      { code: "W205", years: "2014–2021", pcd: "5x112", bore: 66.6, stud: "M12x1.5", oeTyre: "205/60 R16", sizes: [16,17,18,19], engines: ["C160","C180","C200","C300","C200 d","C220 d","C250 d"] },
    ],
    "E-klasse": [
      { code: "W211", years: "2002–2009", pcd: "5x112", bore: 66.6, stud: "M12x1.5", oeTyre: "215/55 R16", sizes: [16,17,18], engines: ["E200","E240","E280","E320","E200 CDI","E220 CDI","E280 CDI"] },
      { code: "W212", years: "2009–2016", pcd: "5x112", bore: 66.6, stud: "M12x1.5", oeTyre: "225/55 R16", sizes: [16,17,18,19], engines: ["E200","E250","E300","E350","E200 CDI","E220 CDI","E250 CDI"] },
    ],
    "GLC": [
      { code: "X253", years: "2015–2022", pcd: "5x112", bore: 66.6, stud: "M14x1.5", oeTyre: "235/60 R18", sizes: [17,18,19,20], engines: ["GLC200","GLC250","GLC300","GLC220 d","GLC250 d"] },
    ],
  },

  "MINI": {
    "Mini": [
      { code: "R56", years: "2006–2013", pcd: "4x100", bore: 56.1, stud: "M12x1.5", oeTyre: "175/65 R15", sizes: [15,16,17], engines: ["One","Cooper","Cooper S","Cooper D","JCW"] },
      { code: "F56", years: "2014–", pcd: "5x112", bore: 66.6, stud: "M14x1.25", oeTyre: "195/55 R16", sizes: [15,16,17,18], engines: ["One","Cooper","Cooper S","Cooper D","JCW"] },
    ],
  },

  "Nissan": {
    "Juke": [
      { code: "F15", years: "2010–2019", pcd: "5x114.3", bore: 66.1, stud: "M12x1.25", oeTyre: "215/60 R16", sizes: [16,17,18], engines: ["1.6","1.2 DIG-T","1.6 DIG-T","1.5 dCi"] },
    ],
    "Micra": [
      { code: "K12/K13", years: "2003–2016", pcd: "4x100", bore: 60.1, stud: "M12x1.25", oeTyre: "175/65 R14", sizes: [14,15,16], engines: ["1.2","1.4","1.5 dCi"] },
    ],
    "Qashqai": [
      { code: "J10/J11", years: "2007–2021", pcd: "5x114.3", bore: 66.1, stud: "M12x1.25", oeTyre: "215/60 R17", sizes: [16,17,18,19], engines: ["1.2 DIG-T","1.6","1.5 dCi","1.6 dCi"] },
    ],
    "X-Trail": [
      { code: "T31/T32", years: "2007–2021", pcd: "5x114.3", bore: 66.1, stud: "M12x1.25", oeTyre: "225/60 R17", sizes: [17,18,19], engines: ["1.6 DIG-T","2.0","1.6 dCi","2.0 dCi"] },
    ],
  },

  "Opel": {
    "Astra": [
      { code: "H", years: "2004–2010", pcd: "5x110", bore: 65.1, stud: "M12x1.5", oeTyre: "195/65 R15", sizes: [15,16,17,18], engines: ["1.4","1.6","1.8","1.7 CDTI","1.9 CDTI"] },
      { code: "J", years: "2009–2015", pcd: "5x115", bore: 70.1, stud: "M12x1.5", oeTyre: "205/55 R16", sizes: [16,17,18], engines: ["1.4 Turbo","1.6","1.7 CDTI","2.0 CDTI"] },
    ],
    "Corsa": [
      { code: "D/E", years: "2006–2019", pcd: "4x100", bore: 56.6, stud: "M12x1.5", oeTyre: "185/65 R15", sizes: [14,15,16,17], engines: ["1.0","1.2","1.4","1.3 CDTI","1.6 Turbo OPC"] },
    ],
    "Insignia": [
      { code: "A", years: "2008–2017", pcd: "5x120", bore: 67.1, stud: "M12x1.5", oeTyre: "215/60 R16", sizes: [16,17,18,19], engines: ["1.6 Turbo","2.0 Turbo","2.0 CDTI"] },
    ],
    "Zafira": [
      { code: "B", years: "2005–2014", pcd: "5x110", bore: 65.1, stud: "M12x1.5", oeTyre: "205/55 R16", sizes: [16,17,18], engines: ["1.6","1.8","1.7 CDTI","1.9 CDTI"] },
    ],
  },

  "Peugeot": {
    "208": [
      { code: "A9", years: "2012–2019", pcd: "4x108", bore: 65.1, stud: "M12x1.25", oeTyre: "185/65 R15", sizes: [15,16,17], engines: ["1.0 VTi","1.2 PureTech","1.6 THP GTI","1.4 HDi","1.6 BlueHDi"] },
    ],
    "308": [
      { code: "T7/T9", years: "2007–2021", pcd: "4x108", bore: 65.1, stud: "M12x1.25", oeTyre: "195/65 R15", sizes: [15,16,17,18], engines: ["1.2 PureTech","1.6 THP","1.6 HDi","2.0 BlueHDi"] },
    ],
    "3008": [
      { code: "P84", years: "2016–", pcd: "5x108", bore: 65.1, stud: "M12x1.25", oeTyre: "215/60 R17", sizes: [16,17,18,19], engines: ["1.2 PureTech","1.6 PureTech","1.5 BlueHDi","2.0 BlueHDi"] },
    ],
  },

  "Renault": {
    "Clio": [
      { code: "III/IV", years: "2005–2019", pcd: "4x100", bore: 60.1, stud: "M12x1.5", oeTyre: "185/65 R15", sizes: [15,16,17], engines: ["1.2","1.2 TCe","0.9 TCe","1.5 dCi","2.0 RS"] },
    ],
    "Megane": [
      { code: "III/IV", years: "2008–", pcd: "5x114.3", bore: 66.1, stud: "M12x1.5", oeTyre: "205/55 R16", sizes: [16,17,18], engines: ["1.2 TCe","1.6","1.5 dCi","1.6 dCi","2.0 RS"] },
    ],
    "Captur": [
      { code: "J5/J8", years: "2013–", pcd: "4x100", bore: 60.1, stud: "M12x1.5", oeTyre: "205/55 R17", sizes: [16,17,18], engines: ["0.9 TCe","1.2 TCe","1.3 TCe","1.5 dCi"] },
    ],
  },

  "Seat": {
    "Ibiza": [
      { code: "6J/6F", years: "2008–", pcd: "5x100", bore: 57.1, stud: "M14x1.5", oeTyre: "185/60 R15", sizes: [14,15,16,17], engines: ["1.0 TSI","1.2 TSI","1.4 TDI","1.6 TDI","1.8 TSI Cupra"] },
    ],
    "Leon": [
      { code: "1P/5F", years: "2005–2020", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "205/55 R16", sizes: [15,16,17,18], engines: ["1.2 TSI","1.4 TSI","1.8 TSI","2.0 TSI Cupra","1.6 TDI","2.0 TDI"] },
    ],
  },

  "Skoda": {
    "Fabia": [
      { code: "5J/NJ", years: "2007–2021", pcd: "5x100", bore: 57.1, stud: "M14x1.5", oeTyre: "185/60 R15", sizes: [14,15,16], engines: ["1.0 TSI","1.2 TSI","1.4 TDI","1.6 TDI"] },
    ],
    "Octavia": [
      { code: "1Z", years: "2004–2013", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "195/65 R15", sizes: [15,16,17,18], engines: ["1.4 TSI","1.6","1.8 TSI","1.6 TDI","2.0 TDI"] },
      { code: "5E", years: "2013–2020", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "205/55 R16", sizes: [15,16,17,18], engines: ["1.0 TSI","1.4 TSI","1.6 TDI","2.0 TDI","2.0 TSI RS"] },
    ],
    "Superb": [
      { code: "3T/3V", years: "2008–", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "215/55 R16", sizes: [16,17,18,19], engines: ["1.4 TSI","1.8 TSI","2.0 TSI","1.6 TDI","2.0 TDI"] },
    ],
    "Kodiaq": [
      { code: "NS", years: "2016–", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "215/65 R17", sizes: [17,18,19], engines: ["1.4 TSI","2.0 TSI","2.0 TDI"] },
    ],
  },

  "Suzuki": {
    "Swift": [
      { code: "FZ/AZ", years: "2010–", pcd: "4x100", bore: 54.1, stud: "M12x1.25", oeTyre: "185/60 R15", sizes: [15,16], engines: ["1.2","1.0 Boosterjet","1.4 Sport","1.3 DDiS"] },
    ],
    "Vitara": [
      { code: "LY", years: "2015–", pcd: "5x114.3", bore: 60.1, stud: "M12x1.25", oeTyre: "215/60 R16", sizes: [16,17], engines: ["1.6","1.4 Boosterjet","1.6 DDiS"] },
    ],
  },

  "Tesla": {
    "Model 3": [
      { code: "—", years: "2017–", pcd: "5x114.3", bore: 64.1, stud: "M14x1.5", oeTyre: "235/45 R18", sizes: [18,19,20], engines: ["Standard Range","Long Range","Performance"] },
    ],
    "Model S": [
      { code: "—", years: "2012–", pcd: "5x120", bore: 64.1, stud: "M14x1.5", oeTyre: "245/45 R19", sizes: [19,20,21], engines: ["75D","85","90D","P100D","Long Range","Plaid"] },
    ],
    "Model Y": [
      { code: "—", years: "2020–", pcd: "5x114.3", bore: 64.1, stud: "M14x1.5", oeTyre: "255/45 R19", sizes: [19,20,21], engines: ["Long Range","Performance"] },
    ],
  },

  "Toyota": {
    "Aygo": [
      { code: "AB1/AB4", years: "2005–2022", pcd: "4x100", bore: 54.1, stud: "M12x1.5", oeTyre: "165/65 R14", sizes: [14,15], engines: ["1.0 VVT-i"] },
    ],
    "Yaris": [
      { code: "XP90/XP130", years: "2005–2020", pcd: "4x100", bore: 54.1, stud: "M12x1.5", oeTyre: "175/65 R15", sizes: [14,15,16], engines: ["1.0","1.3","1.4 D-4D","1.5 Hybrid"] },
    ],
    "Auris": [
      { code: "E150", years: "2006–2012", pcd: "5x100", bore: 54.1, stud: "M12x1.5", oeTyre: "195/65 R15", sizes: [15,16], engines: ["1.33","1.6","2.0 D-4D","1.4 D-4D"] },
    ],
    "Corolla": [
      { code: "E12", years: "2002–2007", pcd: "5x100", bore: 54.1, stud: "M12x1.5", oeTyre: "195/65 R15", sizes: [15,16], engines: ["1.4","1.6","1.8","2.0 D-4D"] },
      { code: "E21", years: "2018–", pcd: "5x114.3", bore: 60.1, stud: "M12x1.5", oeTyre: "205/55 R16", sizes: [16,17,18], engines: ["1.2 Turbo","1.8 Hybrid","2.0 Hybrid"] },
    ],
    "Avensis": [
      { code: "T25/T27", years: "2003–2018", pcd: "5x114.3", bore: 60.1, stud: "M12x1.5", oeTyre: "205/60 R16", sizes: [16,17,18], engines: ["1.8","2.0","2.2 D-4D","2.0 D-4D"] },
    ],
    "RAV4": [
      { code: "XA40", years: "2013–2018", pcd: "5x114.3", bore: 60.1, stud: "M12x1.5", oeTyre: "225/65 R17", sizes: [17,18,19], engines: ["2.0","2.5 Hybrid","2.0 D-4D","2.2 D-4D"] },
    ],
  },

  "Volkswagen": {
    "Up!": [
      { code: "AA", years: "2011–2023", pcd: "4x100", bore: 57.1, stud: "M12x1.5", oeTyre: "165/70 R14", sizes: [14,15,16], engines: ["1.0 MPI","1.0 TSI","e-up!"] },
    ],
    "Polo": [
      { code: "6R/6C", years: "2009–2017", pcd: "5x100", bore: 57.1, stud: "M14x1.5", oeTyre: "185/60 R15", sizes: [14,15,16,17], engines: ["1.0","1.2 TSI","1.4 TDI","1.8 TSI GTI"] },
    ],
    "Golf": [
      { code: "Mk5/Mk6", years: "2003–2012", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "195/65 R15", sizes: [15,16,17,18], engines: ["1.4 TSI","1.6","1.6 TDI","2.0 TDI","2.0 TFSI GTI","2.0 TSI R"] },
      { code: "Mk7", years: "2012–2020", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "195/65 R15", sizes: [15,16,17,18,19], engines: ["1.0 TSI","1.4 TSI","1.6 TDI","2.0 TDI","2.0 TSI GTI","2.0 TSI R"] },
    ],
    "Touran": [
      { code: "1T", years: "2003–2015", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "205/55 R16", sizes: [15,16,17], engines: ["1.4 TSI","1.6","1.6 TDI","2.0 TDI"] },
    ],
    "Passat": [
      { code: "B6/B7", years: "2005–2014", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "205/55 R16", sizes: [16,17,18], engines: ["1.4 TSI","1.8 TSI","2.0 TSI","1.6 TDI","2.0 TDI"] },
      { code: "B8", years: "2014–2023", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "215/60 R16", sizes: [16,17,18,19], engines: ["1.4 TSI","1.8 TSI","2.0 TSI","1.6 TDI","2.0 TDI"] },
    ],
    "Tiguan": [
      { code: "5N", years: "2007–2016", pcd: "5x112", bore: 57.1, stud: "M14x1.5", oeTyre: "215/65 R16", sizes: [16,17,18,19], engines: ["1.4 TSI","2.0 TSI","2.0 TDI"] },
    ],
    "Touareg": [
      { code: "7L", years: "2002–2010", pcd: "5x130", bore: 71.6, stud: "M14x1.5", oeTyre: "255/55 R18", sizes: [17,18,19,20], engines: ["3.2 V6","3.6 V6","2.5 TDI","3.0 TDI","5.0 V10 TDI"] },
    ],
    "Transporter T5/T6": [
      { code: "T5/T6", years: "2003–2019", pcd: "5x120", bore: 65.1, stud: "M14x1.5", oeTyre: "215/65 R16C", sizes: [16,17,18], engines: ["2.0 TDI","2.5 TDI","2.0 BiTDI"] },
    ],
  },

  "Volvo": {
    "V40": [
      { code: "525", years: "2012–2019", pcd: "5x108", bore: 63.4, stud: "M12x1.5", oeTyre: "205/55 R16", sizes: [16,17,18], engines: ["T2","T3","T4","D2","D3","D4"] },
    ],
    "V70/S60": [
      { code: "P3", years: "2007–2016", pcd: "5x108", bore: 63.4, stud: "M12x1.5", oeTyre: "215/55 R16", sizes: [16,17,18], engines: ["2.0 T","T5","D3","D4","D5"] },
    ],
    "XC60": [
      { code: "1. gen", years: "2008–2017", pcd: "5x108", bore: 63.4, stud: "M12x1.5", oeTyre: "235/65 R17", sizes: [17,18,19,20], engines: ["T5","T6","D3","D4","D5"] },
    ],
  },
};
