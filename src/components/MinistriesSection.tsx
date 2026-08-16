import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, User, Heart, Baby, BookOpen } from "lucide-react";
import youthImg from "@/assets/yout.jpeg";
import menImg from "@/assets/men.jpeg";
import womenImg from "@/assets/Women.jpeg";
import childrenImg from "@/assets/Children.jpeg";
// import discipleshipImg from "@/assets/Discipleship.jpeg";
import dorcas from "@/assets/Dorcas.jpeg"
import destiny from "@/assets/destiny-life-ministry.jpeg"
import youth from "@/assets/youth-m.jpeg"
import media from "@/assets/media.jpg"
// import deacons from "@/assets/deacons.jpg"
import pastoral from "@/assets/pastoral.jpg"
import ushering from "@/assets/ushering.jpg"
import hbc from "@/assets/hbc.jpg"
import hbc1 from "@/assets/hbc1.jpg"
import choir from "@/assets/choir.jpg"
import desciples from "@/assets/ChatGPT Image Jun 12, 2026, 03_10_10 AM.png"

const ministries = [
  {
    icon: Baby,
    image: childrenImg,
    title: "Children's Ministry",
    slug: "children",
    desc: "Nurturing young hearts with biblical foundations through fun, age-appropriate, and Christ-centered activities. / The Children’s Ministry caters to the spiritual growth of kids, usually from toddlers to pre-teens. Through age-appropriate Bible stories, songs, crafts, and games, children learn about God’s love in a fun and safe environment. The goal is to plant seeds of faith and help children build a personal relationship with Jesus.",
  },
  {
    icon: Baby,
    image: pastoral,
    title: "Teens Ministry",
    slug: "teens",
    desc: "The Teens Ministry, often overlapping with Youth Ministry but sometimes focused on the younger teen years (ages 13–16), is designed to guide teenagers through formative years of personal, emotional, and spiritual development. Programs include interactive Bible lessons, fun events, and mentorship to build strong Christian foundations.",
  },
  {
    icon: Users,
    image: youth,
    title: "Youth Ministry",
    slug: "youth",
    desc: "Empowering the next generation to live out their faith boldly through worship, mentorship, and purposeful community. / The Youth Ministry serves young people, typically ages 13 to 18, by providing a dynamic environment where they can explore faith, build friendships, and discover their purpose. Through engaging worship, relevant teaching, retreats, and community service, the ministry helps youth navigate life with Christ-centered values.",
  },
  {
    icon: User,
    image: menImg,
    title: "Men's Ministry",
    slug: "men",
    desc: "Raising godly men of integrity, vision, and spiritual strength to lead their families and impact society. / The Men’s Ministry focuses on encouraging and equipping men to grow in their faith, lead in their families, and serve in their communities. Through regular gatherings, Bible studies, mentorship, and service projects, the ministry fosters brotherhood, accountability, and spiritual development among men of all ages.",
  },
  {
    icon: BookOpen,
    image: media,
    title: "Media Ministry",
    slug: "media",
    desc: "The Media Ministry plays a crucial role in spreading the Gospel through technology and creative content. This ministry manages audio-visual needs during services, live streaming, social media, photography, and graphic design. It ensures that the message of Christ reaches people both inside and outside the church."
  },
  {
    icon: Heart,
    image: womenImg,
    title: "Women's Ministry",
    slug: "women",
    desc: "Empowering women to grow in faith, purpose, and sisterhood through prayer, discipleship, and fellowship. / The Women’s Ministry is dedicated to nurturing the spiritual growth of women through fellowship, prayer, and biblical teaching. It provides a supportive space for women to connect, encourage each other, and deepen their relationship with God. Activities often include conferences, small group studies, and outreach events",
  },
  {
    icon: BookOpen,
    image: desciples,
    title: "Discipleship",
    slug: "discipleship",
    desc: "Walking believers from new birth into spiritual maturity through the systematic study and application of God's Word.",
  },
  {
    icon: BookOpen,
    image: dorcas,
    title: "Dorcas Ministry",
    slug: "dorcas",
    desc: "This ministry is centered around serving individuals and families in need within the community. It includes initiatives like food distribution, clothing drives, financial assistance, and support for the homeless or vulnerable. Rooted in compassion and service, this ministry reflects the love of Christ through practical help and hope."
  },
  {
    icon: BookOpen,
    image: hbc,
    title: "Hospitality Ministry",
    slug: "hospitok",
    desc: "The Hospitality Ministry focuses on creating a warm, welcoming environment for everyone who enters the church. From greeting guests to serving refreshments and helping with seating, this ministry reflects the love of Christ through kindness and care."
  },
  {
    icon: BookOpen,
    image: childrenImg,
    title: "Prison Ministry",
    slug: "prison",
    desc: "The Prison Ministry is dedicated to sharing the love, hope, and transforming power of Jesus Christ with those who are incarcerated. Through prison visits, Bible studies, counseling, prayer, and rehabilitation support, the ministry seeks to bring spiritual renewal, restoration, and encouragement to inmates and their families."
  },
  {
    icon: BookOpen,
    image: childrenImg,
    title: "Health and Fitness Ministry",
    slug: "health and fitness",
    desc: "The Health and Fitness Ministry promotes holistic well-being by encouraging members to care for their physical, mental, and spiritual health. Through wellness programs, health education, fitness activities, and healthy lifestyle initiatives, the ministry helps believers honor God through healthy living."
  },
  {
    icon: BookOpen,
    image: childrenImg,
    title: "Evangelism Ministry",
    slug: "evangelism",
    desc: "The Evangelism Ministry is committed to fulfilling the Great Commission by sharing the Gospel of Jesus Christ with the community and beyond. Through outreach programs, missions, personal witnessing, and community engagement, the ministry seeks to lead people into a saving relationship with Christ."
  },
  {
    icon: BookOpen,
    image: childrenImg,
    title: "Intercessory Ministry",
    slug: "intercessory",
    desc: "The Intercessory Ministry is devoted to prayer, standing in the gap for individuals, families, the church, the community, and nations. Through dedicated prayer meetings, fasting, and spiritual warfare, intercessors seek God's guidance, protection, healing, and breakthrough on behalf of others."
  },
  {
    icon: BookOpen,
    image: destiny,
    title: "Destiny Life Ministry",
    slug: "destiny",
    desc: "The Media Ministry plays a crucial role in spreading the Gospel through technology and creative content. This ministry manages audio-visual needs during services, live streaming, social media, photography, and graphic design. It ensures that the message of Christ reaches people both inside and outside the church."
  },
  {
    icon: BookOpen,
    image: choir,
    title: "Choir Ministry",
    slug: "choir",
    desc: "The Media Ministry plays a crucial role in spreading the Gospel through technology and creative content. This ministry manages audio-visual needs during services, live streaming, social media, photography, and graphic design. It ensures that the message of Christ reaches people both inside and outside the church."
  },
  {
    icon: BookOpen,
    image: ushering,
    title: "Ushering Ministry",
    slug: "ushering",
    desc: "The Media Ministry plays a crucial role in spreading the Gospel through technology and creative content. This ministry manages audio-visual needs during services, live streaming, social media, photography, and graphic design. It ensures that the message of Christ reaches people both inside and outside the church."
  },
  {
    icon: BookOpen,
    image: hbc1,
    title: "Home Bible Church Ministry",
    slug: "hbc",
    desc: "The Media Ministry plays a crucial role in spreading the Gospel through technology and creative content. This ministry manages audio-visual needs during services, live streaming, social media, photography, and graphic design. It ensures that the message of Christ reaches people both inside and outside the church."
  },
];

const MinistriesSection = () => {
  return (
    <section id="ministries" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />
      <div className="relative container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-accent font-body font-semibold tracking-[0.2em] uppercase text-base mb-3">
            Our Ministries
          </p>
          <h2 className="font-display text-5xl md:text-6xl font-black mb-6">
            Discover Your <span className="text-vibrant-gradient">Place</span>
          </h2>
          <p className="text-muted-foreground font-body text-xl max-w-2xl mx-auto leading-relaxed">
            Every member has a part to play in building God's kingdom. Find where you belong and grow with us.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {ministries.map((ministry, i) => (
            <motion.div
              key={ministry.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-card border border-border rounded-2xl p-8 text-center hover:border-secondary/60 transition-all duration-500 hover:glow-purple flex flex-col"
            >
              <div className="mb-6 overflow-hidden rounded-2xl">
                <img
                  src={ministry.image}
                  alt={ministry.title}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-purple-gradient flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ministry.icon size={32} className="text-primary-foreground" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">{ministry.title}</h3>
              <p className="text-muted-foreground font-body text-base leading-relaxed mb-6 flex-1">
                {ministry.desc}
              </p>
              <Link
                to={`/Contact`}
                className="inline-block bg-vibrant-gradient text-primary-foreground font-body font-bold text-sm uppercase tracking-wide px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity"
              >
                Serve With Us
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MinistriesSection;
