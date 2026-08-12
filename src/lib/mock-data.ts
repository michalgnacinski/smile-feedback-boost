export type TableQr = {
  id: string;
  label: string;
  scans: number;
  clicks: number;
};

export const restaurants = [
  { id: "la-torre", name: "Pizzeria La Torre", city: "Kraków" },
  { id: "cafe-nova", name: "Cafe Nova", city: "Warszawa" },
];

export const googleReviewLink = "https://g.page/r/ExampleID/review";

export const qrTables: TableQr[] = [
  { id: "t1", label: "Stolik #01", scans: 74, clicks: 51 },
  { id: "t2", label: "Stolik #02", scans: 63, clicks: 40 },
  { id: "t3", label: "Stolik #03", scans: 48, clicks: 31 },
  { id: "t4", label: "Bar / Lada", scans: 63, clicks: 42 },
];

export const scanSeries = [
  { day: "30.07", skany: 9 },
  { day: "31.07", skany: 12 },
  { day: "01.08", skany: 14 },
  { day: "02.08", skany: 22 },
  { day: "03.08", skany: 17 },
  { day: "04.08", skany: 11 },
  { day: "05.08", skany: 15 },
  { day: "06.08", skany: 19 },
  { day: "07.08", skany: 24 },
  { day: "08.08", skany: 28 },
  { day: "09.08", skany: 21 },
  { day: "10.08", skany: 18 },
  { day: "11.08", skany: 20 },
  { day: "12.08", skany: 26 },
];

export const conversion = (t: TableQr) =>
  t.scans === 0 ? 0 : Math.round((t.clicks / t.scans) * 1000) / 10;
