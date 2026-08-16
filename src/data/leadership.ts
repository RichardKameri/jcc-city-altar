export const pastoralTeam = [
  { name: "Pst Lawrence Gachara", role: "Lead Pastor" },
  { name: "Pst Sammy Mbatia", role: "Assistant Pastor" },
  { name: "Pst Eric Banner", role: "Pastor" },
  { name: "Pst Barzil Mwakulomba", role: "Pastor" },
  { name: "Pst Stephen Mulili", role: "Pastor" },
  { name: "Pst Kelvin Kyalo", role: "Pastor" },
  { name: "Pst Jane Mutua", role: "Pastor" },
];

export const deaconry = [
  { name: "James Maina", role: "Lead Deacon" },
  { name: "Caston Munyao", role: "Deacon" },
  { name: "Mathew Munyao", role: "Deacon" },
  { name: "Faith Robert", role: "Deacon" },
  { name: "Peter Mutua", role: "Deacon" },
  { name: "Irene Musisi", role: "Deacon" },
];

export const newTeam = [
  "Peter Ndeto",
  "Steve Kiango",
  "Peter Aminga",
  "Polly N.",
  "Nicholas Mutinda",
  "Derrick Wafula",
];

export const regionalOverseers = [
  { region: "East 2 (Jogoo Rd)", leaders: "Mr Kisoi / Muthama" },
  { region: "East 1 (Thika Rd)", leaders: "Dcn Faith / Amos" },
  { region: "West", leaders: "Dcn Maina / Onesmus" },
  { region: "North", leaders: "Peter Aminga / Joy Ann" },
  { region: "South", leaders: "Peter Ndeto / Jacob Wafula" },
  { region: "Central", leaders: "Muema / Martin Ruthoga" },
];

export interface Department {
  name: string;
  pastor?: string;
  deacon?: string;
  leader?: string;
  assistant?: string;
}

export interface MinistryDetail {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  pastor?: string;
  deacon?: string;
  leader?: string;
  assistant?: string;
  departments: Department[];
}

export const ministryDetails: Record<string, MinistryDetail> = {
  youth: {
    slug: "youth",
    title: "Youth Ministry",
    tagline: "Empowering the next generation",
    description:
      "We raise bold, Spirit-filled young people who live out their faith through worship, mentorship, and purposeful community.",
    pastor: "Pst Barzil Mwakulomba",
    deacon: "Dcn Derrick",
    leader: "Emmanuel",
    assistant: "Edwin",
    departments: [
      { name: "Youth", pastor: "Pst Barzil", deacon: "Derrick", leader: "Emmanuel", assistant: "Edwin" },
      { name: "Teens", pastor: "Pst Kelvin Kyalo", deacon: "Peter Aminga", leader: "Beulah" },
      { name: "Choir", pastor: "Pst Gachara", deacon: "Faith", leader: "Mathew", assistant: "Christine" },
      { name: "Instrumentalists", pastor: "Pst Gachara", deacon: "Mathew", leader: "Salmon Mbisi" },
      { name: "Media", pastor: "Pst Kelvin Kyalo", deacon: "Mathew", leader: "Christine", assistant: "Merci Mbithe" },
      { name: "Sound", pastor: "Pst Gachara", deacon: "Mathew", leader: "Technician" },
    ],
  },
  men: {
    slug: "men",
    title: "Men's Ministry",
    tagline: "Raising godly men of integrity",
    description:
      "A brotherhood committed to spiritual strength, family leadership, and kingdom impact in society.",
    pastor: "Pst Stephen Mulili",
    deacon: "Overseer Kisoi",
    leader: "Nicholas Mutinda",
    assistant: "Peter Aminga",
    departments: [
      { name: "Men Ministry", pastor: "Pst Steve", deacon: "Overseer Kisoi", leader: "Nicholas", assistant: "Aminga" },
      { name: "Business & Professional", pastor: "Pst Gachara", deacon: "Mathew", leader: "Alfraha" },
      { name: "Young Couples", pastor: "Pst Barzil", deacon: "James Maina", leader: "Derrick" },
      { name: "Health & Fitness", pastor: "Pst Eric", deacon: "Jacob Muthembwa", leader: "Daniel Muthama" },
      { name: "Engineering", pastor: "Pst Eric", deacon: "James Maina", leader: "Brian Mwendwa", assistant: "Eng. Doreen" },
      { name: "Security", pastor: "Pst Eric", leader: "Overseer Muema" },
      { name: "Police Line", pastor: "Pst Eric", leader: "Overseer Muema" },
      { name: "Prison Ministry (Onesmus)", pastor: "Pst Kelvin Kyalo", deacon: "Caston", leader: "Patience Muangare" },
    ],
  },
  women: {
    slug: "women",
    title: "Women's Ministry",
    tagline: "Empowered women of purpose",
    description:
      "A vibrant sisterhood growing in faith, prayer, and discipleship to impact homes, churches, and communities.",
    pastor: "Mrs Pst Gachara",
    deacon: "Dcn Polly",
    leader: "Mrs Pst Gachara",
    departments: [
      { name: "Women Ministry", pastor: "Mrs Pst Gachara", deacon: "Dcn Polly", leader: "Mrs Pst Gachara" },
      { name: "Dorcas", pastor: "Mrs Gachara", deacon: "Mrs Kisoi" },
      { name: "Hospitality", pastor: "Mrs Gachara", leader: "Mrs Muiruri", assistant: "Francisca" },
      { name: "Sanctuary Keeping", pastor: "Mrs Gachara", deacon: "Steve Kiango", leader: "Raphael" },
      { name: "Hospital Ministry", pastor: "Pst Sammy", deacon: "Mutua", leader: "Adeline" },
    ],
  },
  children: {
    slug: "children",
    title: "Children's Ministry",
    tagline: "Nurturing young hearts for Christ",
    description:
      "We build biblical foundations in children through fun, age-appropriate, and Christ-centered activities.",
    pastor: "Mrs Gachara",
    deacon: "Dcn Polly",
    leader: "Everlyn M.",
    departments: [
      { name: "Children Ministry", pastor: "Mrs Gachara", deacon: "Polly", leader: "Everlyn M." },
      { name: "Schools & Colleges", pastor: "Pst Sammy", deacon: "James Maina", leader: "Amos Mwangi" },
    ],
  },
  discipleship: {
    slug: "discipleship",
    title: "Discipleship",
    tagline: "From new birth to spiritual maturity",
    description:
      "Walking believers into maturity through systematic study of God's Word, mentorship, and small groups.",
    pastor: "Pst Sammy Mbatia / Pst Jane Mutua",
    deacon: "Overseer Kisoi",
    departments: [
      { name: "Discipleship", pastor: "Pst Sammy / Pst Jane", leader: "Overseer Kisoi" },
      { name: "Mentorship", pastor: "Pst Sammy Mbatia", deacon: "Steve Kiango", leader: "Dr Christina", assistant: "Sharon" },
      { name: "Evangelism", pastor: "Pst Stephen", deacon: "Mutua", leader: "Peter Ndeto", assistant: "Edwin" },
      { name: "Intercessory", pastor: "Pst Jane", deacon: "Polly" },
      { name: "HBC (Home Bible Church)", leader: "Steve", assistant: "Peter Ndeto" },
      { name: "Destiny Life", pastor: "Pst Sammy", deacon: "James Maina", leader: "Martin" },
      { name: "Ushering", pastor: "Pst Eric Banner", deacon: "Irene Musisi", leader: "Dorine" },
      { name: "Administration", pastor: "Pst Sammy", leader: "Moshell", assistant: "Josephine" },
    ],
  },
};

export const discipleshipGroups = [
  { no: 1, leader: "Pst Sammy", asst: "Vincent Omondi / Joe" },
  { no: 2, leader: "Pst Eric", asst: "Evelyn Mumbe" },
  { no: 3, leader: "Pst Barzil", asst: "Justus Wambua" },
  { no: 4, leader: "Pst Steve", asst: "Betty Mbogo" },
  { no: 5, leader: "Pst Jane", asst: "Martin Ruthoga / Mathew Shiraho" },
  { no: 6, leader: "Pst Kelvin", asst: "Judith" },
  { no: 7, leader: "Mr Kisoi", asst: "Raphael" },
  { no: 8, leader: "Steve Kiango", asst: "Abigael Oduor" },
  { no: 9, leader: "Dcn Mathew", asst: "Beulah Kisoi" },
  { no: 10, leader: "Madam Purity", asst: "Urbanus / Miriam" },
  { no: 11, leader: "Amos Mwangi", asst: "Dorine" },
  { no: 12, leader: "Dcn James Maina", asst: "Dcn Caston" },
  { no: 13, leader: "Dcn Polly", asst: "Jacob Wafula / Eldina Akinyi" },
  { no: 14, leader: "Daniel Muthama", asst: "Serah Mumbi" },
  { no: 15, leader: "Derrick Oduor", asst: "Grace Mutinda / Sarah Kamau" },
  { no: 16, leader: "Dcn Faith", asst: "Magdaline Nduku" },
  { no: 17, leader: "Peter Ndeto", asst: "Patience Muangare / Peter Paul" },
  { no: 18, leader: "Dcn Mutua", asst: "Peter Aminga / Everline" },
  { no: 19, leader: "Emmanuel", asst: "Sylvia Wanza / Yongren Gitonga" },
  { no: 20, leader: "Joy Ann", asst: "Kelvin Namakabwa" },
];
