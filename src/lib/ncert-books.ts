export type NcertBook = {
  subject: string;
  title: string;
  code: string; // NCERT textbook code e.g. jesc1
  chapters: number; // approximate chapter count for range
  isCustomHost?: boolean; // Set to true if the book is not on NCERT and needs to be hosted on GitHub
  singleFileName?: string; // If the entire book is a single PDF file (e.g. "Marathi_Class_10.pdf")
  directUrl?: string; // If the book should be fetched directly from a specific URL (e.g., cbseacademic.nic.in)
};

export type NcertClass = {
  class: number;
  books: NcertBook[];
};

export const ncertLibrary: NcertClass[] = [
  {
    class: 6,
    books: [
      { subject: "Mathematics", title: "Ganita Prakash – I", code: "fegp1", chapters: 14 },
      { subject: "Mathematics", title: "Mathematics (Old)", code: "femh1", chapters: 14 },
      { subject: "Science", title: "Curiosity – I", code: "fecu", chapters: 16 },
      { subject: "Science", title: "Science (Old)", code: "fesc1", chapters: 16 },
      { subject: "English", title: "Poorvi", code: "fepr1", chapters: 10 },
      { subject: "English", title: "Honeysuckle", code: "fehs1", chapters: 10 },
      { subject: "English", title: "A Pact with the Sun", code: "feap1", chapters: 10 },
      { subject: "Hindi", title: "Vasant", code: "fhvs1", chapters: 17 },
      { subject: "Hindi", title: "Durva", code: "fhdv1", chapters: 28 },
      { subject: "Hindi", title: "Bal Ram Katha", code: "fhbr1", chapters: 12 },
      { subject: "History", title: "Our Pasts – I", code: "fess1", chapters: 11 },
      { subject: "Geography", title: "The Earth – Our Habitat", code: "fess2", chapters: 8 },
      { subject: "Civics", title: "Social & Political Life – I", code: "fess3", chapters: 9 },
      { subject: "Sanskrit", title: "Ruchira – I", code: "fhsk1", chapters: 15 },
      { subject: "Sanskrit", title: "Manika – I (Suppl.)", code: "fhma1", chapters: 10 },
    ],
  },
  {
    class: 7,
    books: [
      { subject: "Mathematics", title: "Ganita Prakash – II", code: "gegp1", chapters: 15 },
      { subject: "Mathematics", title: "Mathematics (Old)", code: "gemh1", chapters: 15 },
      { subject: "Science", title: "Curiosity – II", code: "gecu1", chapters: 18 },
      { subject: "Science", title: "Science (Old)", code: "gesc1", chapters: 18 },
      { subject: "English", title: "Poorvi", code: "gepr1", chapters: 10 },
      { subject: "English", title: "Honeycomb", code: "gehc1", chapters: 10 },
      { subject: "English", title: "The Alien Hand (Suppl.)", code: "geah1", chapters: 10 },
      { subject: "Hindi", title: "Vasant", code: "ghvs1", chapters: 20 },
      { subject: "Hindi", title: "Durva", code: "ghdv1", chapters: 18 },
      { subject: "History", title: "Our Pasts – II", code: "gess1", chapters: 10 },
      { subject: "Geography", title: "Our Environment", code: "gess2", chapters: 9 },
      { subject: "Civics", title: "Social & Political Life – II", code: "gess3", chapters: 9 },
      { subject: "Sanskrit", title: "Ruchira – II", code: "ghsk1", chapters: 15 },
      { subject: "Sanskrit", title: "Manika – II (Suppl.)", code: "ghma1", chapters: 10 },
    ],
  },
  {
    class: 8,
    books: [
      { subject: "Mathematics", title: "Ganita Prakash – III", code: "hegp1", chapters: 16 },
      { subject: "Mathematics", title: "Mathematics (Old)", code: "hemh1", chapters: 16 },
      { subject: "Science", title: "Curiosity – III", code: "hecu1", chapters: 18 },
      { subject: "Science", title: "Science (Old)", code: "hesc1", chapters: 18 },
      { subject: "English", title: "Poorvi", code: "hepr1", chapters: 10 },
      { subject: "English", title: "Honeydew", code: "hehd1", chapters: 10 },
      { subject: "English", title: "It So Happened (Suppl.)", code: "heih1", chapters: 10 },
      { subject: "Hindi", title: "Vasant", code: "hhvs1", chapters: 18 },
      { subject: "Hindi", title: "Durva", code: "hhdv1", chapters: 23 },
      { subject: "Hindi", title: "Bharat ki Khoj", code: "hhbk1", chapters: 10 },
      { subject: "History", title: "Our Pasts – III (Part I)", code: "hess1", chapters: 7 },
      { subject: "History", title: "Our Pasts – III (Part II)", code: "hess2", chapters: 5 },
      { subject: "Geography", title: "Resources & Development", code: "hess4", chapters: 6 },
      { subject: "Civics", title: "Social & Political Life – III", code: "hess3", chapters: 10 },
      { subject: "Sanskrit", title: "Ruchira – III", code: "hhsk1", chapters: 15 },
      { subject: "Sanskrit", title: "Manika – III (Suppl.)", code: "hhma1", chapters: 10 },
    ],
  },
  {
    class: 9,
    books: [
      { subject: "Mathematics", title: "Mathematics", code: "iemh1", chapters: 15 },
      { subject: "Science", title: "Science", code: "iesc1", chapters: 15 },
      { subject: "English", title: "Beehive", code: "iebe1", chapters: 11 },
      { subject: "English", title: "Moments", code: "iemo1", chapters: 10 },
      { subject: "English", title: "Words and Expressions I", code: "iewe1", chapters: 11 },
      { subject: "English", title: "Kaveri", code: "iekv1", chapters: 12 },
      { subject: "Hindi", title: "Kshitij", code: "ihks1", chapters: 17 },
      { subject: "Hindi", title: "Sparsh", code: "ihsp1", chapters: 13 },
      { subject: "Hindi", title: "Kritika", code: "ihkr1", chapters: 5 },
      { subject: "Hindi", title: "Sanchayan I", code: "ihsa1", chapters: 6 },
      { subject: "History", title: "India & the Contemporary World – I", code: "iess3", chapters: 5 },
      { subject: "Geography", title: "Contemporary India – I", code: "iess1", chapters: 6 },
      { subject: "Economics", title: "Economics", code: "iess2", chapters: 4 },
      { subject: "Civics", title: "Democratic Politics – I", code: "iess4", chapters: 5 },
      { subject: "Sanskrit", title: "Shemushi – I", code: "ihsk1", chapters: 17 },
      { subject: "Sanskrit", title: "Manika – I (Communicative)", code: "ihma1", chapters: 1, singleFileName: "Sanskrit_Manika_9_2023.pdf" },
      { subject: "Marathi", title: "Marathi (Class 9)", code: "imar1", chapters: 1, singleFileName: "AksharBharti-Marathi-9th-English-Medium.pdf" },
      { subject: "English", title: "Literature Reader (CBSE)", code: "iecbse1", chapters: 1, directUrl: "https://cbseacademic.nic.in/web_material/publication/English-Literature_2022-IX.pdf" },
    ],
  },
  {
    class: 10,
    books: [
      { subject: "Mathematics", title: "Mathematics", code: "jemh1", chapters: 14 },
      { subject: "Science", title: "Science", code: "jesc1", chapters: 13 },
      { subject: "English", title: "First Flight", code: "jeff1", chapters: 9 },
      { subject: "English", title: "Footprints Without Feet (Suppl.)", code: "jefp1", chapters: 9 },
      { subject: "English", title: "Words and Expression II", code: "jewe2", chapters: 9 },
      { subject: "Hindi", title: "Kshitij – II", code: "jhks1", chapters: 12 },
      { subject: "Hindi", title: "Sparsh – II", code: "jhsp1", chapters: 14 },
      { subject: "Hindi", title: "Kritika – II", code: "jhkr1", chapters: 3 },
      { subject: "Hindi", title: "Sanchayan II", code: "jhsy1", chapters: 3 },
      { subject: "History", title: "India & the Contemporary World – II", code: "jess3", chapters: 5 },
      { subject: "Geography", title: "Contemporary India – II", code: "jess1", chapters: 7 },
      { subject: "Economics", title: "Understanding Economic Development", code: "jess2", chapters: 5 },
      { subject: "Civics", title: "Democratic Politics – II", code: "jess4", chapters: 5 },
      { subject: "Sanskrit", title: "Shemushi – II", code: "jhsk1", chapters: 10 },
      { subject: "Sanskrit", title: "Vyakaran Vrithi (Practice)", code: "jhva1", chapters: 12 },
      { subject: "Sanskrit", title: "Abhyaswaan Bhav II", code: "jsab1", chapters: 14 },
      { subject: "Sanskrit", title: "Manika – II (Communicative)", code: "jhma1", chapters: 1, directUrl: "https://raw.githubusercontent.com/sriram12345678900/ncert-books/main/Sanskrit_Manika_10_2023_compressed.pdf" },
      { subject: "Marathi", title: "Marathi (Class 10)", code: "jmar1", chapters: 1, directUrl: "https://raw.githubusercontent.com/sriram12345678900/ncert-books/main/AksharBharti-Marathi-10th-English-Medium-.pdf" },
      { subject: "English", title: "Literature Reader (CBSE)", code: "jecbse1", chapters: 1, directUrl: "https://cbseacademic.nic.in/web_material/publication/LitratureReader_ClassX_2023.pdf" },
    ],
  },
];

export const subjects = ["All", "Science", "Mathematics", "History", "Geography", "Civics", "Economics", "Hindi", "Sanskrit", "Marathi", "English"];

export const subjectColors: Record<string, string> = {
  Science: "from-emerald-500 to-teal-600",
  Mathematics: "from-blue-500 to-indigo-600",
  History: "from-amber-500 to-orange-600",
  Geography: "from-green-500 to-lime-600",
  Civics: "from-purple-500 to-violet-600",
  Economics: "from-rose-500 to-pink-600",
  Hindi: "from-red-500 to-rose-600",
  Sanskrit: "from-yellow-500 to-amber-600",
  Marathi: "from-fuchsia-500 to-purple-600",
  English: "from-sky-500 to-cyan-600",
};

export function getBookUrl(code: string, chapters: number): string {
  return `https://ncert.nic.in/textbook.php?${code}=0-${chapters}`;
}
