/**
 * Seed data for the Knowledge Center Lessons & Quizzes system.
 * Each lesson has 5 steps and a 5-question quiz.
 */

export interface SeedStep {
  stepNumber: number;
  title: string;
  content: string;
}

export interface SeedQuestion {
  questionNumber: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SeedLesson {
  slug: string;
  title: string;
  description: string;
  category: string;
  estimatedMinutes: number;
  sortOrder: number;
  steps: SeedStep[];
  questions: SeedQuestion[];
}

export const SEED_LESSONS: SeedLesson[] = [
  {
    "slug": "seo-basics",
    "title": "SEO Basics",
    "description": "Learn what Search Engine Optimization is, why it matters, and the core factors that determine where your site ranks on Google.",
    "category": "SEO",
    "estimatedMinutes": 8,
    "sortOrder": 1,
    "steps": [
      {
        "stepNumber": 1,
        "title": "What is SEO?",
        "content": "Search Engine Optimization (SEO) is the practice of improving a website so it appears higher in search engine results pages (SERPs) like Google or Bing -- without paying for ads.\n\nWhen someone searches \"martial arts classes near me,\" Google scans billions of pages and ranks them by relevance and authority. SEO is how you tell Google: \"My page is the best answer to this search.\"\n\n**Why it matters for your clients:** 93% of online experiences begin with a search engine. A business that ranks on page 1 gets 10x more clicks than one on page 2. For service businesses like martial arts schools, fitness studios, and counseling practices, local SEO can be the single biggest driver of new student or client inquiries.\n\n**Organic vs. Paid:** SEO produces organic (free) traffic. Pay-Per-Click (PPC) ads like Google Ads produce paid traffic. Both have their place, but SEO compounds over time -- a well-optimized page can drive leads for years."
      },
      {
        "stepNumber": 2,
        "title": "How Search Engines Work",
        "content": "Search engines use three core processes:\n\n**1. Crawling** -- Google sends bots (called \"spiders\" or \"crawlers\") to discover web pages by following links. If your page isn't linked from anywhere, Google may never find it.\n\n**2. Indexing** -- Once a page is crawled, Google analyzes its content and stores it in a massive database called the index. Only indexed pages can appear in search results.\n\n**3. Ranking** -- When someone searches, Google's algorithm evaluates hundreds of factors to rank indexed pages by relevance and quality.\n\n**Key ranking factors:**\n- **Relevance:** Does the page content match the search query?\n- **Authority:** How many quality websites link to this page?\n- **User Experience:** Is the page fast, mobile-friendly, and easy to use?\n- **Content Quality:** Is the content original, comprehensive, and helpful?\n- **Technical Health:** Is the site properly structured for crawling?"
      },
      {
        "stepNumber": 3,
        "title": "On-Page SEO",
        "content": "On-page SEO refers to optimizations you make directly on your web pages.\n\n**Title Tag** -- The clickable headline in search results. Should include your primary keyword and be 50-60 characters. Example: \"Martial Arts Classes in Austin | MyDojo\"\n\n**Meta Description** -- The 155-character summary below the title in search results. Doesn't directly affect rankings but dramatically affects click-through rate.\n\n**Headings (H1, H2, H3)** -- Structure your content with headings. Each page should have one H1 (the main topic) and multiple H2s/H3s for subtopics. Include keywords naturally.\n\n**URL Structure** -- Clean, descriptive URLs rank better. Use: /martial-arts-classes-austin/ instead of /page?id=123\n\n**Image Alt Text** -- Describe images in alt text. Google can't \"see\" images, so alt text helps it understand what the image shows.\n\n**Keyword Placement** -- Include your target keyword naturally in the first 100 words, in at least one heading, and in the alt text of images.\n\n**Internal Links** -- Link to other relevant pages on your site. This helps Google discover more pages and distributes \"link equity.\""
      },
      {
        "stepNumber": 4,
        "title": "Local SEO",
        "content": "Local SEO is critical for service businesses because most of their customers are nearby. When someone searches \"karate school near me,\" Google shows a \"Local Pack\" -- a map with 3 business listings -- before the regular results.\n\n**Google Business Profile (GBP)** -- This is the single most important local SEO asset. Claim and fully optimize your GBP:\n- Complete every field (hours, services, description, photos)\n- Choose the most specific business categories\n- Add 20+ high-quality photos\n- Respond to every review (positive and negative)\n- Post weekly updates\n\n**NAP Consistency** -- Your Name, Address, and Phone number must be identical everywhere online (website, GBP, Yelp, Facebook, directories). Inconsistencies confuse Google.\n\n**Local Citations** -- Get listed in local directories: Yelp, Yellow Pages, Angi, Chamber of Commerce. Each citation reinforces your local presence.\n\n**Reviews** -- Google reviews directly impact Local Pack rankings. Aim for 50+ reviews with an average above 4.5. Ask every satisfied student to leave a review.\n\n**Local Keywords** -- Include your city and neighborhood in page content: \"martial arts classes in [City]\" not just \"martial arts classes.\""
      },
      {
        "stepNumber": 5,
        "title": "Link Building & Authority",
        "content": "**Domain Authority (DA)** is a score (0-100) that predicts how well a website will rank. It's primarily built through backlinks -- links from other websites to yours.\n\n**Why backlinks matter:** Google treats links as votes of confidence. A link from a respected website (like a local newspaper or industry association) signals that your content is trustworthy and authoritative.\n\n**How to build backlinks:**\n- **Local press:** Get featured in local news stories about your school's community impact\n- **Sponsorships:** Sponsor local events, sports teams, or charities that link back to you\n- **Guest posting:** Write articles for local business blogs or industry publications\n- **Partnerships:** Exchange links with complementary businesses (e.g., a pediatrician linking to your kids' martial arts program)\n- **Directories:** Get listed in relevant directories (martial arts associations, local business directories)\n- **Testimonials:** Give testimonials to vendors/suppliers -- they often link back to your site\n\n**What to avoid:** Buying links, link farms, or any \"black hat\" tactics. Google penalizes these heavily and the penalties can be devastating.\n\n**Patience required:** Building domain authority takes 6-12+ months of consistent effort. There are no shortcuts."
      }
    ],
    "questions": [
      {
        "questionNumber": 1,
        "question": "What does SEO stand for?",
        "options": [
          "Search Engine Optimization",
          "Social Engagement Online",
          "Site Enhancement Operations",
          "Search Experience Optimization"
        ],
        "correctIndex": 0,
        "explanation": "SEO stands for Search Engine Optimization -- the practice of improving a website to rank higher in organic (unpaid) search results on engines like Google."
      },
      {
        "questionNumber": 2,
        "question": "Which of the following is the MOST important local SEO asset for a martial arts school?",
        "options": [
          "Having a Facebook page",
          "Google Business Profile",
          "A YouTube channel",
          "Instagram followers"
        ],
        "correctIndex": 1,
        "explanation": "Google Business Profile (GBP) is the most critical local SEO asset. It directly controls your appearance in Google Maps and the Local Pack -- the 3 business listings that appear before regular search results for local queries."
      },
      {
        "questionNumber": 3,
        "question": "What is a backlink?",
        "options": [
          "A link from your website to another website",
          "A link from another website to your website",
          "A link in your website's navigation menu",
          "A broken link on your website"
        ],
        "correctIndex": 1,
        "explanation": "A backlink is a link FROM another website TO your website. Google treats backlinks as votes of confidence -- the more quality backlinks you have, the higher your domain authority and search rankings."
      },
      {
        "questionNumber": 4,
        "question": "What is the ideal length for a title tag?",
        "options": [
          "20-30 characters",
          "50-60 characters",
          "100-120 characters",
          "150+ characters"
        ],
        "correctIndex": 1,
        "explanation": "Title tags should be 50-60 characters. Shorter than 50 characters wastes valuable space; longer than 60 characters gets truncated in search results, cutting off your message."
      },
      {
        "questionNumber": 5,
        "question": "What does NAP stand for in local SEO?",
        "options": [
          "Name, Address, Phone",
          "Navigation, Analytics, Performance",
          "Network, Authority, Pages",
          "Name, Audience, Profile"
        ],
        "correctIndex": 0,
        "explanation": "NAP stands for Name, Address, and Phone number. Consistency of your NAP information across all online listings (website, Google Business Profile, Yelp, directories) is a critical local SEO ranking factor."
      }
    ]
  },
  {
    "slug": "website-anatomy",
    "title": "Website Anatomy",
    "description": "Understand the technical building blocks of websites: domains, hosting, DNS, HTML/CSS/JavaScript, and how they all work together.",
    "category": "Web Dev",
    "estimatedMinutes": 10,
    "sortOrder": 2,
    "steps": [
      {
        "stepNumber": 1,
        "title": "Domains and DNS",
        "content": "A **domain name** is the human-readable address of a website (e.g., mydojo.com). Behind the scenes, every domain points to an IP address -- a numerical location of a server.\n\n**DNS (Domain Name System)** is the internet's phone book. When you type mydojo.com, your browser asks a DNS server: \"What IP address does this domain point to?\" DNS returns the answer and your browser connects to that server.\n\n**Key DNS records:**\n- **A Record** -- Points a domain to an IPv4 address (e.g., 192.168.1.1)\n- **CNAME Record** -- Points a subdomain to another domain (e.g., www to mydojo.com)\n- **MX Record** -- Directs email to the right mail server\n- **TXT Record** -- Verification records for Google, email authentication (SPF, DKIM)\n\n**Domain registrars** are companies where you purchase domains: GoDaddy, Namecheap, Google Domains. The domain registration is separate from hosting -- you can buy a domain at Namecheap and host the site on a different server.\n\n**TTL (Time to Live)** -- How long DNS records are cached. When changing DNS settings, lower TTL first (to 300 seconds) so changes propagate faster."
      },
      {
        "stepNumber": 2,
        "title": "Web Hosting",
        "content": "**Web hosting** is the service that stores your website files on a server and makes them accessible via the internet 24/7.\n\n**Types of hosting:**\n\n**Shared Hosting** -- Your site shares a server with hundreds of others. Cheapest option ($3-10/mo) but slowest. Good for starter sites with low traffic. Examples: Bluehost, HostGator.\n\n**VPS (Virtual Private Server)** -- A dedicated portion of a server. Better performance and more control. $20-100/mo. Good for growing businesses.\n\n**Dedicated Server** -- An entire physical server for your site. Maximum performance and control. $100-500+/mo. For high-traffic sites.\n\n**Cloud Hosting** -- Distributed across multiple servers. Scales automatically with traffic. Pay-as-you-go pricing. Examples: AWS, Google Cloud, DigitalOcean.\n\n**Managed WordPress Hosting** -- Specialized hosting optimized for WordPress with automatic updates, security, and backups. Examples: WP Engine, Kinsta, Flywheel.\n\n**What matters most:**\n- **Uptime:** Look for 99.9%+ uptime guarantee\n- **Speed:** Server response time under 200ms\n- **Support:** 24/7 support with fast response times\n- **Backups:** Daily automated backups\n- **SSL:** Free SSL certificate included"
      },
      {
        "stepNumber": 3,
        "title": "HTML, CSS, and JavaScript",
        "content": "Every website is built with three core technologies:\n\n**HTML (HyperText Markup Language)** -- The structure and content of a webpage. HTML uses \"tags\" to define elements:\n- Headings: h1, h2, h3\n- Paragraphs: p\n- Links: a href\n- Images: img src\n- Buttons: button\n\nThink of HTML as the skeleton of a webpage.\n\n**CSS (Cascading Style Sheets)** -- Controls the visual appearance of HTML elements. CSS defines:\n- Colors and backgrounds\n- Fonts and typography\n- Layout and spacing\n- Animations and transitions\n- Responsive design (how the site looks on different screen sizes)\n\nThink of CSS as the skin and clothing of a webpage.\n\n**JavaScript (JS)** -- Adds interactivity and dynamic behavior. JavaScript handles:\n- Form validation\n- Pop-ups and modals\n- Sliders and carousels\n- Real-time updates (like live chat)\n- Connecting to external APIs\n\nThink of JavaScript as the muscles and nervous system of a webpage.\n\n**Modern frameworks** like React, Vue, and Angular are built on top of JavaScript to make complex web applications easier to build and maintain."
      },
      {
        "stepNumber": 4,
        "title": "CMS and Page Builders",
        "content": "Most business websites are built on a **CMS (Content Management System)** -- software that lets non-developers create and manage website content without writing code.\n\n**WordPress** -- Powers 43% of all websites. Highly flexible with thousands of themes and plugins. Requires some technical knowledge to maintain properly. Best for: blogs, business sites, e-commerce.\n\n**Webflow** -- Visual design tool that generates clean code. No plugins needed. Faster and more secure than WordPress. Best for: agencies, marketing sites, portfolios.\n\n**Squarespace** -- All-in-one platform with beautiful templates. Limited customization but very easy to use. Best for: small businesses, creatives, restaurants.\n\n**Wix** -- Drag-and-drop builder. Easy to use but can create messy code that hurts SEO. Best for: very small businesses with simple needs.\n\n**Shopify** -- Purpose-built for e-commerce. Best for: online stores.\n\n**What FlowSites uses:** We primarily build on WordPress and Webflow, depending on the client's needs and budget. Both produce professional results with excellent SEO capabilities when properly configured.\n\n**Page Builders** (Elementor, Divi, Beaver Builder) are WordPress plugins that add drag-and-drop editing. They make design easier but can slow down sites if not optimized."
      },
      {
        "stepNumber": 5,
        "title": "SSL, Security, and Performance",
        "content": "**SSL (Secure Sockets Layer)** -- The technology that encrypts data between a user's browser and your server. Sites with SSL show a padlock icon and use HTTPS instead of HTTP.\n\n**Why SSL matters:**\n- Google ranks HTTPS sites higher than HTTP\n- Browsers show \"Not Secure\" warnings for HTTP sites, destroying trust\n- Required for any site that collects personal information\n- Free SSL certificates are available through Let's Encrypt\n\n**Website Security Basics:**\n- Keep WordPress, themes, and plugins updated\n- Use strong, unique passwords and two-factor authentication\n- Install a security plugin (Wordfence, Sucuri)\n- Regular backups (daily, stored off-site)\n- Use a reputable hosting provider with server-level security\n\n**Performance Basics:**\n- **Page speed** directly affects SEO rankings and conversion rates\n- Compress images before uploading (use WebP format)\n- Use a CDN (Content Delivery Network) to serve files from servers near the user\n- Enable browser caching\n- Minimize CSS and JavaScript files\n\n**Core Web Vitals** -- Google's metrics for page experience:\n- **LCP (Largest Contentful Paint):** How fast the main content loads (target: under 2.5s)\n- **FID (First Input Delay):** How fast the page responds to interaction (target: under 100ms)\n- **CLS (Cumulative Layout Shift):** How stable the layout is while loading (target: under 0.1)"
      }
    ],
    "questions": [
      {
        "questionNumber": 1,
        "question": "What does DNS stand for?",
        "options": [
          "Domain Name System",
          "Digital Network Service",
          "Direct Navigation Software",
          "Dynamic Name Server"
        ],
        "correctIndex": 0,
        "explanation": "DNS stands for Domain Name System -- the internet's phone book that translates human-readable domain names (like mydojo.com) into IP addresses that computers use to connect to servers."
      },
      {
        "questionNumber": 2,
        "question": "Which technology controls the visual appearance (colors, fonts, layout) of a website?",
        "options": [
          "HTML",
          "JavaScript",
          "CSS",
          "PHP"
        ],
        "correctIndex": 2,
        "explanation": "CSS (Cascading Style Sheets) controls all visual aspects of a webpage -- colors, fonts, spacing, layout, and responsive design. HTML provides the structure, JavaScript adds interactivity."
      },
      {
        "questionNumber": 3,
        "question": "What does HTTPS indicate about a website?",
        "options": [
          "The website is hosted on a fast server",
          "The website has an SSL certificate and encrypts data",
          "The website is registered with Google",
          "The website has been verified as legitimate"
        ],
        "correctIndex": 1,
        "explanation": "HTTPS indicates the website has an SSL certificate that encrypts data between the user's browser and the server. Google ranks HTTPS sites higher, and browsers show security warnings for HTTP sites."
      },
      {
        "questionNumber": 4,
        "question": "What is a CMS?",
        "options": [
          "A type of web hosting",
          "Content Management System -- software for managing website content without coding",
          "A CSS framework for styling websites",
          "A tool for measuring website performance"
        ],
        "correctIndex": 1,
        "explanation": "A CMS (Content Management System) is software that lets non-developers create and manage website content without writing code. WordPress powers 43% of all websites and is the most popular CMS."
      },
      {
        "questionNumber": 5,
        "question": "What is LCP (Largest Contentful Paint)?",
        "options": [
          "A measure of how many images are on a page",
          "A Google Core Web Vital measuring how fast the main content loads (target: under 2.5s)",
          "The largest image file on a webpage",
          "A tool for compressing CSS files"
        ],
        "correctIndex": 1,
        "explanation": "LCP (Largest Contentful Paint) is a Google Core Web Vital that measures how fast the main content of a page loads. Google's target is under 2.5 seconds. Slow LCP hurts both user experience and SEO rankings."
      }
    ]
  },
  {
    "slug": "crm-fundamentals",
    "title": "CRM Fundamentals",
    "description": "Master CRM concepts: pipelines, contact records, automations, and how DojoFlow connects your website to your enrollment process.",
    "category": "CRM",
    "estimatedMinutes": 9,
    "sortOrder": 3,
    "steps": [
      {
        "stepNumber": 1,
        "title": "What is a CRM?",
        "content": "A **CRM (Customer Relationship Management)** system is software that helps businesses manage interactions with leads and customers throughout the entire relationship lifecycle -- from first contact to loyal client.\n\n**Why CRMs exist:** Before CRMs, businesses tracked leads in spreadsheets, sticky notes, or just memory. Leads fell through the cracks. Follow-ups were forgotten. Revenue was lost.\n\n**What a CRM does:**\n- Stores all contact information in one place\n- Tracks every interaction (calls, emails, texts, meetings)\n- Manages the sales pipeline (where each lead is in the process)\n- Automates follow-up sequences\n- Provides reporting on conversion rates and revenue\n\n**DojoFlow** is a CRM specifically designed for martial arts schools and fitness businesses. It integrates directly with your website so that every form submission, every lead, every enrollment flows automatically into your pipeline.\n\n**The core value proposition:** A CRM doesn't just organize data -- it ensures no lead is ever forgotten. Studies show that 80% of sales require 5+ follow-up contacts, but most businesses give up after 1-2. A CRM with automation makes consistent follow-up effortless."
      },
      {
        "stepNumber": 2,
        "title": "Sales Pipelines",
        "content": "A **sales pipeline** is a visual representation of where each lead is in the journey from \"stranger\" to \"paying customer.\" It's typically displayed as a Kanban board with stages as columns.\n\n**Typical martial arts school pipeline:**\n1. **New Lead** -- Just filled out a form or called\n2. **Contacted** -- Made first contact (call, text, email)\n3. **Intro Class Scheduled** -- Booked their free trial\n4. **Intro Class Completed** -- Attended the trial\n5. **Proposal Sent** -- Received pricing/enrollment info\n6. **Enrolled** -- Signed up and paid\n7. **Lost** -- Decided not to enroll\n\n**Why pipelines matter:**\n- Gives every team member visibility into the status of every lead\n- Identifies bottlenecks (where leads are getting stuck)\n- Enables accurate revenue forecasting\n- Ensures consistent follow-up at each stage\n\n**Pipeline metrics to track:**\n- **Conversion rate:** What % of leads reach each stage?\n- **Average deal time:** How many days from lead to enrollment?\n- **Stage-by-stage drop-off:** Where are you losing the most leads?\n\n**DojoFlow integration:** When someone fills out a form on your FlowSites website, they automatically appear in your DojoFlow pipeline at the \"New Lead\" stage."
      },
      {
        "stepNumber": 3,
        "title": "Contact Records",
        "content": "The heart of any CRM is the **contact record** -- a centralized profile for each lead or customer that stores everything you know about them and every interaction you've had.\n\n**What a contact record contains:**\n- **Basic info:** Name, phone, email, address\n- **Lead source:** How they found you (Google, Facebook, referral, walk-in)\n- **Program interest:** Kids karate, adult BJJ, self-defense, etc.\n- **Activity timeline:** Every call, text, email, note logged chronologically\n- **Pipeline stage:** Where they are in the enrollment process\n- **Tags:** Labels for segmentation (e.g., \"hot lead,\" \"price objection,\" \"referred by John\")\n- **Assigned rep:** Which team member owns this relationship\n\n**Best practices:**\n- Log every interaction immediately after it happens\n- Use tags consistently so you can filter and segment\n- Add notes with context (\"Has two kids, interested in family plan, called back twice\")\n- Set follow-up reminders so nothing falls through the cracks\n\n**The 360-degree view:** When any team member opens a contact record, they should be able to see the complete history and immediately understand the relationship without asking anyone."
      },
      {
        "stepNumber": 4,
        "title": "CRM Integrations",
        "content": "A CRM becomes exponentially more powerful when it integrates with the other tools in your tech stack.\n\n**Website integration (most important):**\nEvery form on your website should feed directly into your CRM. When a prospect fills out a \"Free Trial\" form, their information should appear instantly in your pipeline -- no manual data entry required.\n\n**Email integration:**\nConnect your email so all emails to/from leads are automatically logged in their contact record. No more switching between Gmail and your CRM.\n\n**SMS integration:**\nText messages sent through the CRM are logged automatically. Two-way texting lets you have conversations directly in the CRM interface.\n\n**Calendar integration:**\nWhen an intro class is scheduled, it appears in both the CRM and your calendar. Automated reminders are sent to the prospect.\n\n**Payment integration:**\nWhen a student enrolls and pays, the CRM updates their status automatically.\n\n**Zapier/Make (automation platforms):**\nIf your CRM doesn't have a native integration with a tool you use, Zapier can connect almost anything. Example: When a new lead appears in DojoFlow, automatically add them to a Facebook Custom Audience for retargeting ads.\n\n**DojoFlow + FlowSites:** Our websites are built with native DojoFlow integration -- forms, tracking, and pipeline updates happen automatically without any manual work."
      },
      {
        "stepNumber": 5,
        "title": "CRM Reporting",
        "content": "A CRM is only as valuable as the insights you extract from it. Good CRM reporting answers the questions that drive business decisions.\n\n**Key reports every school should run:**\n\n**Lead Source Report:** Where are your leads coming from? (Google organic, Google Ads, Facebook, referrals, walk-ins) This tells you where to invest your marketing budget.\n\n**Conversion Rate Report:** What % of leads become enrolled students? Break this down by lead source -- some sources produce more qualified leads than others.\n\n**Pipeline Velocity:** How long does it take from first contact to enrollment? Identify which stages take the longest and optimize your process there.\n\n**Rep Performance:** If you have multiple staff handling leads, who has the best conversion rate? Use this for coaching and training.\n\n**Lost Lead Analysis:** Why are leads not enrolling? Common reasons: price, timing, location, program fit. Understanding this helps you address objections proactively.\n\n**Revenue Forecast:** Based on current pipeline, how much revenue will you generate next month? This helps with staffing and capacity planning.\n\n**Monthly trend:** Are lead volume and conversion rates improving month-over-month? This is your north star metric for marketing effectiveness."
      }
    ],
    "questions": [
      {
        "questionNumber": 1,
        "question": "What does CRM stand for?",
        "options": [
          "Customer Revenue Management",
          "Customer Relationship Management",
          "Client Record Management",
          "Conversion Rate Monitoring"
        ],
        "correctIndex": 1,
        "explanation": "CRM stands for Customer Relationship Management -- software that helps businesses manage all interactions with leads and customers throughout the entire relationship lifecycle."
      },
      {
        "questionNumber": 2,
        "question": "What is a sales pipeline?",
        "options": [
          "A tool for sending bulk emails",
          "A visual representation of where each lead is in the journey from stranger to paying customer",
          "A report showing monthly revenue",
          "A list of all your current students"
        ],
        "correctIndex": 1,
        "explanation": "A sales pipeline is a visual representation (usually a Kanban board) showing where each lead is in the journey from first contact to enrollment. It helps teams track progress, identify bottlenecks, and ensure consistent follow-up."
      },
      {
        "questionNumber": 3,
        "question": "Studies show that 80% of sales require how many follow-up contacts?",
        "options": [
          "1-2 contacts",
          "3-4 contacts",
          "5+ contacts",
          "10+ contacts"
        ],
        "correctIndex": 2,
        "explanation": "Studies show 80% of sales require 5 or more follow-up contacts. Most businesses give up after 1-2 attempts, which is why CRM automation is so valuable -- it ensures consistent follow-up without relying on memory."
      },
      {
        "questionNumber": 4,
        "question": "What is the primary benefit of integrating your website forms with your CRM?",
        "options": [
          "It makes your website load faster",
          "Lead information flows automatically into your pipeline without manual data entry",
          "It improves your Google search rankings",
          "It sends automatic invoices to new leads"
        ],
        "correctIndex": 1,
        "explanation": "Website-CRM integration means every form submission automatically creates a contact record in your pipeline. This eliminates manual data entry, ensures no leads are missed, and enables immediate automated follow-up."
      },
      {
        "questionNumber": 5,
        "question": "What does a Lead Source Report tell you?",
        "options": [
          "How many leads you have in total",
          "Where your leads are coming from (Google, Facebook, referrals, etc.)",
          "How much each lead is worth",
          "Which leads are most likely to enroll"
        ],
        "correctIndex": 1,
        "explanation": "A Lead Source Report shows which marketing channels are generating your leads (Google organic, Google Ads, Facebook, referrals, walk-ins). This data tells you where to invest your marketing budget for maximum ROI."
      }
    ]
  },
  {
    "slug": "marketing-automation",
    "title": "Marketing Automation",
    "description": "Learn how to set up automated email and SMS sequences that nurture leads and follow up without any manual effort.",
    "category": "Automation",
    "estimatedMinutes": 9,
    "sortOrder": 4,
    "steps": [
      {
        "stepNumber": 1,
        "title": "Triggers and Actions",
        "content": "Every automation is built from two components: **triggers** (what starts the automation) and **actions** (what happens as a result).\n\n**Common triggers:**\n- Form submitted on website\n- Lead added to pipeline\n- Pipeline stage changed\n- Specific date/time reached\n- Lead tag added or removed\n- Email opened or link clicked\n- No activity for X days\n\n**Common actions:**\n- Send email\n- Send SMS text\n- Create task for a team member\n- Move lead to different pipeline stage\n- Add or remove a tag\n- Notify a team member\n- Wait X days before next action\n\n**Example automation (new lead):**\n1. TRIGGER: Form submitted on website\n2. ACTION: Add lead to pipeline as \"New Lead\"\n3. ACTION: Send welcome SMS immediately\n4. ACTION: Send welcome email immediately\n5. ACTION: Create task: \"Call this lead within 1 hour\"\n6. ACTION: Wait 1 day\n7. ACTION: If no response, send follow-up email\n8. ACTION: Wait 2 days\n9. ACTION: If still no response, send final SMS\n\nThis sequence runs automatically for every single lead, 24/7, without any manual effort."
      },
      {
        "stepNumber": 2,
        "title": "Email Sequences",
        "content": "An **email sequence** (also called a drip campaign) is a series of pre-written emails sent automatically over time to nurture a lead toward enrollment.\n\n**The 5-email new lead sequence:**\n\n**Email 1 (Immediately):** Welcome + what to expect\n- Subject: \"Welcome to [School Name] -- here's what happens next\"\n- Content: Thank them for interest, introduce the school, set expectations for the free trial\n\n**Email 2 (Day 2):** Social proof\n- Subject: \"What [City] parents are saying about [School Name]\"\n- Content: 2-3 student testimonials with photos, emphasize transformation\n\n**Email 3 (Day 4):** Address objections\n- Subject: \"Common questions about starting martial arts\"\n- Content: FAQ addressing price, time commitment, fitness level, age concerns\n\n**Email 4 (Day 7):** Urgency/scarcity\n- Subject: \"Your free trial expires soon\"\n- Content: Remind them the offer is time-limited, make it easy to book\n\n**Email 5 (Day 14):** Last chance\n- Subject: \"Still thinking about it? Let's talk.\"\n- Content: Personal-feeling email offering to answer questions directly\n\n**Key principles:**\n- Each email should have ONE clear call to action\n- Write as if you're talking to one person, not a mass audience\n- Subject lines determine open rates -- test multiple versions"
      },
      {
        "stepNumber": 3,
        "title": "SMS Automation",
        "content": "SMS (text message) automation is one of the highest-ROI channels available. Text messages have a **98% open rate** compared to ~20% for email, and most are read within 3 minutes.\n\n**Best practices for SMS:**\n- Keep messages under 160 characters\n- Always identify yourself: \"Hi [Name], this is [Rep] from [School]\"\n- Include a clear call to action\n- Never send between 9pm-8am\n- Always provide an opt-out option (\"Reply STOP to unsubscribe\")\n\n**High-converting SMS templates:**\n\n**Immediate response (within 5 minutes of form submission):**\n\"Hi [Name]! This is [Rep] from [School]. Thanks for your interest in our [Program] -- I'd love to get you set up with a free trial class. When works best for you this week?\"\n\n**Appointment reminder (24 hours before):**\n\"Hi [Name]! Just a reminder about your free trial class tomorrow at [Time]. We're excited to meet you! Reply with any questions.\"\n\n**No-show follow-up:**\n\"Hi [Name], we missed you today! Life gets busy -- let's reschedule your free class. When works for you this week?\"\n\n**The 5-minute rule:** Research shows that responding to a new lead within 5 minutes increases conversion rates by 9x compared to waiting 30 minutes. Automation makes this possible even when your staff is teaching."
      },
      {
        "stepNumber": 4,
        "title": "Lead Scoring and Segmentation",
        "content": "Not all leads are equal. **Lead scoring** assigns points to leads based on their behavior and characteristics, helping your team prioritize who to contact first.\n\n**Scoring factors:**\n- Filled out a specific form (intro class request = high score)\n- Opened multiple emails\n- Clicked links in emails\n- Visited the pricing page\n- Came from a referral (usually higher quality)\n- Has children (for kids programs)\n- Local zip code\n\n**Segmentation** divides your leads into groups so you can send more relevant messages.\n\n**Useful segments:**\n- **By program interest:** Kids karate vs. adult BJJ vs. self-defense\n- **By lead source:** Google leads vs. Facebook leads vs. referrals\n- **By engagement:** Opened emails vs. never opened\n- **By stage:** New leads vs. leads who attended a trial\n- **By age group:** Kids programs vs. teen programs vs. adult programs\n\n**Why segmentation matters:** A 45-year-old adult interested in self-defense has completely different motivations than a parent looking for kids karate. Sending the same message to both reduces relevance and conversion rates.\n\n**Practical application:** Create separate email sequences for each major program. The messaging, testimonials, and objections addressed should be specific to that audience."
      },
      {
        "stepNumber": 5,
        "title": "Automation Best Practices",
        "content": "Automation is powerful, but poorly designed automations can damage your brand. Here are the key principles:\n\n**1. Don't over-automate personal touchpoints**\nAutomation should handle routine follow-up, but high-value moments (first phone call, enrollment conversation) should be personal. Use automation to create opportunities for human connection, not replace it.\n\n**2. Write conversationally**\nAutomated messages should sound like they came from a real person. Avoid corporate language. Use the recipient's first name. Write like you talk.\n\n**3. Test before launching**\nSend test messages to yourself. Check every email on mobile (60%+ of emails are opened on phones). Verify all links work. Check personalization tags populate correctly.\n\n**4. Monitor and optimize**\nTrack open rates, click rates, and conversion rates for every sequence. If an email has a low open rate, test a new subject line. If a sequence isn't converting, rewrite the content.\n\n**5. Respect opt-outs immediately**\nIf someone replies STOP or unsubscribes, remove them from all sequences immediately. This is both legally required and basic respect.\n\n**6. Timing matters**\nBest email send times: Tuesday-Thursday, 10am-11am or 2pm-3pm local time. Worst times: Monday morning, Friday afternoon, weekends.\n\n**7. Keep sequences short**\nMost leads decide within 14 days. A 5-7 email sequence over 2 weeks is usually sufficient. Longer sequences have diminishing returns and higher unsubscribe rates."
      }
    ],
    "questions": [
      {
        "questionNumber": 1,
        "question": "What are the two core components of every automation?",
        "options": [
          "Emails and SMS messages",
          "Triggers and Actions",
          "Leads and Customers",
          "Forms and Pipelines"
        ],
        "correctIndex": 1,
        "explanation": "Every automation consists of a Trigger (what starts the automation, like a form submission) and Actions (what happens as a result, like sending an email or creating a task)."
      },
      {
        "questionNumber": 2,
        "question": "What is the approximate open rate for SMS text messages?",
        "options": [
          "20%",
          "45%",
          "75%",
          "98%"
        ],
        "correctIndex": 3,
        "explanation": "SMS text messages have a 98% open rate, compared to approximately 20% for email. Most texts are read within 3 minutes of receipt, making SMS automation one of the highest-ROI channels for lead follow-up."
      },
      {
        "questionNumber": 3,
        "question": "According to research, how much does responding to a new lead within 5 minutes increase conversion rates compared to waiting 30 minutes?",
        "options": [
          "2x",
          "5x",
          "9x",
          "20x"
        ],
        "correctIndex": 2,
        "explanation": "Research shows that responding to a new lead within 5 minutes increases conversion rates by 9x compared to waiting 30 minutes. This is why immediate automated SMS responses are so valuable -- they ensure no lead waits."
      },
      {
        "questionNumber": 4,
        "question": "What is lead segmentation?",
        "options": [
          "Scoring leads based on their likelihood to convert",
          "Dividing leads into groups to send more relevant, targeted messages",
          "Removing inactive leads from your pipeline",
          "Assigning leads to different sales representatives"
        ],
        "correctIndex": 1,
        "explanation": "Lead segmentation divides your leads into groups (by program interest, lead source, age group, etc.) so you can send more relevant messages. Segmented campaigns typically have significantly higher conversion rates than generic mass messages."
      },
      {
        "questionNumber": 5,
        "question": "What are the best days and times to send marketing emails?",
        "options": [
          "Monday morning and Friday afternoon",
          "Tuesday-Thursday, 10am-11am or 2pm-3pm local time",
          "Weekends when people have more free time",
          "Any time -- email timing doesn't matter"
        ],
        "correctIndex": 1,
        "explanation": "Research consistently shows Tuesday-Thursday between 10am-11am and 2pm-3pm local time produce the highest open and click rates. Monday mornings and Friday afternoons have the lowest engagement as people are transitioning in/out of the work week."
      }
    ]
  },
  {
    "slug": "website-analytics",
    "title": "Website Analytics",
    "description": "Learn to read Google Analytics, understand traffic sources, track conversions, and use data to improve your website's performance.",
    "category": "Analytics",
    "estimatedMinutes": 8,
    "sortOrder": 5,
    "steps": [
      {
        "stepNumber": 1,
        "title": "Traffic Sources",
        "content": "Understanding where your website traffic comes from is essential for knowing which marketing efforts are working.\n\n**The 6 main traffic sources in Google Analytics:**\n\n**1. Organic Search** -- Visitors who found you through unpaid Google/Bing search results. This is SEO traffic. High-quality because these users are actively searching for what you offer.\n\n**2. Direct** -- Visitors who typed your URL directly or came from a bookmark. Usually existing customers or people who heard about you offline.\n\n**3. Referral** -- Visitors who clicked a link on another website. Could be a directory listing, a blog mention, or a partner site.\n\n**4. Social** -- Visitors from social media platforms (Facebook, Instagram, TikTok, YouTube).\n\n**5. Paid Search** -- Visitors from Google Ads or other paid search campaigns. You pay per click.\n\n**6. Email** -- Visitors who clicked a link in an email campaign.\n\n**What to look for:**\n- Which source sends the most traffic?\n- Which source has the highest conversion rate?\n- Which source sends the most qualified leads?\n\nA source that sends 1,000 visitors but zero conversions is less valuable than a source that sends 50 visitors and 10 conversions."
      },
      {
        "stepNumber": 2,
        "title": "Key Metrics",
        "content": "**Sessions vs. Users:** A \"session\" is a single visit to your website. A \"user\" is a unique person. One user can have multiple sessions.\n\n**Bounce Rate:** The percentage of visitors who leave after viewing only one page. High bounce rate (70%+) often indicates the page isn't matching visitor expectations.\n\n**Average Session Duration:** How long visitors spend on your site. Longer = more engaged. Under 30 seconds is a red flag.\n\n**Pages per Session:** How many pages a visitor views per visit. Higher = more engaged and interested.\n\n**Conversion Rate:** The percentage of visitors who complete a desired action (fill out a form, call, book a trial). This is the most important metric.\n\n**Goal Completions:** The total number of times visitors completed a conversion goal.\n\n**New vs. Returning Visitors:** New visitors are discovering you for the first time. Returning visitors are already familiar with your brand.\n\n**Exit Pages:** Which pages do visitors leave from most often? High exit rates on important pages (like your pricing page) indicate problems.\n\n**Landing Page Performance:** Which pages do visitors enter your site from? These pages need to be optimized for first impressions.\n\n**Device breakdown:** What percentage of visitors use mobile vs. desktop? Most service business sites see 60-70% mobile traffic."
      },
      {
        "stepNumber": 3,
        "title": "Setting Up Conversion Tracking",
        "content": "Conversion tracking is the process of measuring when visitors complete valuable actions on your website. Without it, you're flying blind.\n\n**What to track:**\n- Form submissions (contact forms, free trial requests)\n- Phone calls (using call tracking numbers)\n- Button clicks (\"Book Now,\" \"Call Us\")\n- Time on page (for content engagement)\n- Scroll depth (how far down the page visitors read)\n\n**Google Analytics 4 (GA4) setup:**\n1. Create a GA4 property in Google Analytics\n2. Add the GA4 tracking code to your website\n3. Set up conversion events for form submissions and calls\n4. Link GA4 to Google Search Console for SEO data\n5. Link GA4 to Google Ads for ad performance data\n\n**Google Tag Manager (GTM):** A tool that lets you add and manage tracking codes without editing website code. Highly recommended for managing multiple tracking scripts.\n\n**Call tracking:** Use a service like CallRail to assign unique phone numbers to different marketing channels. This tells you exactly which channel (Google Ads, organic search, Facebook) generated each phone call.\n\n**UTM parameters:** Add tracking codes to your URLs in marketing campaigns. Example: yoursite.com/free-trial?utm_source=facebook&utm_medium=paid&utm_campaign=summer2024\n\nThis tells Google Analytics exactly which Facebook campaign sent that visitor."
      },
      {
        "stepNumber": 4,
        "title": "Reading Reports",
        "content": "Google Analytics can be overwhelming. Here's how to focus on what matters.\n\n**Weekly check (5 minutes):**\n- Total sessions vs. last week (is traffic up or down?)\n- Conversion rate vs. last week (are more visitors converting?)\n- Top traffic sources (any unusual changes?)\n\n**Monthly review (30 minutes):**\n- Traffic by source: Which channels are growing? Which are declining?\n- Conversion rate by source: Which channels convert best?\n- Top landing pages: Which pages drive the most conversions?\n- Device breakdown: Is mobile performance improving?\n- User flow: Where do visitors go after landing? Where do they drop off?\n\n**Quarterly analysis (1-2 hours):**\n- Year-over-year comparison (seasonal patterns)\n- Long-term trend analysis\n- ROI calculation by channel\n- Identify pages with high traffic but low conversion (optimization opportunities)\n\n**Red flags to investigate:**\n- Sudden drop in organic traffic (Google algorithm update or technical issue)\n- High bounce rate on key pages (content mismatch or slow load time)\n- Conversion rate declining (form broken, pricing change, competitor)\n- Mobile conversion rate much lower than desktop (mobile UX problem)"
      },
      {
        "stepNumber": 5,
        "title": "Data-Driven Decisions",
        "content": "Data is only valuable if you act on it. Here's how to turn analytics insights into concrete improvements.\n\n**A/B Testing:** Test two versions of a page element to see which performs better. Test one thing at a time: headline, CTA button color, form length, hero image. Run tests for at least 2 weeks with enough traffic to be statistically significant.\n\n**Heatmaps:** Tools like Hotjar or Microsoft Clarity show where visitors click, scroll, and move their mouse. Heatmaps reveal:\n- Which elements attract attention\n- How far down the page visitors scroll (\"fold\" analysis)\n- Which CTAs are being clicked\n- Where visitors get confused or frustrated\n\n**Session recordings:** Watch actual recordings of real visitor sessions. Nothing reveals UX problems faster than watching real people struggle with your website.\n\n**Form analytics:** Track form abandonment -- where do people start filling out a form but give up? Long forms lose people. Each additional field reduces conversion rate by ~10%.\n\n**The optimization loop:**\n1. Identify a page with high traffic but low conversion rate\n2. Use heatmaps and recordings to understand visitor behavior\n3. Form a hypothesis: \"Visitors are leaving because the CTA isn't visible on mobile\"\n4. Make one change\n5. Run an A/B test\n6. Measure results\n7. Implement the winner and move to the next optimization\n\nThis systematic approach compounds over time -- small improvements add up to dramatic conversion rate gains."
      }
    ],
    "questions": [
      {
        "questionNumber": 1,
        "question": "What is 'Organic Search' traffic in Google Analytics?",
        "options": [
          "Traffic from paid Google Ads",
          "Visitors who found your site through unpaid search results",
          "Traffic from social media platforms",
          "Direct traffic from bookmarks"
        ],
        "correctIndex": 1,
        "explanation": "Organic Search traffic consists of visitors who found your website through unpaid (free) search results on Google, Bing, or other search engines. This is the traffic generated by your SEO efforts."
      },
      {
        "questionNumber": 2,
        "question": "What does 'Bounce Rate' measure?",
        "options": [
          "How fast your website loads",
          "The percentage of visitors who leave after viewing only one page",
          "How many times visitors return to your site",
          "The percentage of form submissions that fail"
        ],
        "correctIndex": 1,
        "explanation": "Bounce Rate is the percentage of visitors who leave your website after viewing only one page without taking any action. A high bounce rate (70%+) often indicates the page content doesn't match visitor expectations."
      },
      {
        "questionNumber": 3,
        "question": "What are UTM parameters used for?",
        "options": [
          "Speeding up website load times",
          "Adding tracking codes to URLs to identify which marketing campaign sent a visitor",
          "Encrypting form data for security",
          "Compressing images on your website"
        ],
        "correctIndex": 1,
        "explanation": "UTM parameters are tracking codes added to URLs (e.g., ?utm_source=facebook&utm_campaign=summer) that tell Google Analytics exactly which marketing campaign, channel, and ad sent a specific visitor to your website."
      },
      {
        "questionNumber": 4,
        "question": "What is A/B testing?",
        "options": [
          "Testing your website on two different browsers",
          "Testing two versions of a page element to see which performs better",
          "Running your website on two different servers",
          "Comparing your analytics to a competitor's"
        ],
        "correctIndex": 1,
        "explanation": "A/B testing (also called split testing) involves showing two different versions of a page element to different visitors to determine which version performs better. You test one element at a time (headline, button, image) for statistically valid results."
      },
      {
        "questionNumber": 5,
        "question": "What is the most important metric on a service business website?",
        "options": [
          "Total page views",
          "Average session duration",
          "Conversion rate (percentage of visitors who fill out a form or call)",
          "Number of unique visitors"
        ],
        "correctIndex": 2,
        "explanation": "Conversion rate -- the percentage of visitors who complete a desired action (form submission, phone call, booking) -- is the most important metric. A site with 100 visitors and a 10% conversion rate generates more leads than a site with 1,000 visitors and a 0.5% conversion rate."
      }
    ]
  }
];

/**
 * Seed all lessons, steps, and quiz questions into the database.
 * Idempotent: skips lessons that already exist (matched by slug).
 */
export async function seedAllLessons(): Promise<{ seeded: number; skipped: number }> {
  const { getDb } = await import("./db");
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { lessons, lessonSteps, quizQuestions } = await import("../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  let seeded = 0;
  let skipped = 0;

  for (const seedLesson of SEED_LESSONS) {
    // Check if lesson already exists
    const existing = await db.select().from(lessons).where(eq(lessons.slug, seedLesson.slug));
    if (existing.length > 0) {
      skipped++;
      continue;
    }

    // Insert lesson
    const [inserted] = await db.insert(lessons).values({
      slug: seedLesson.slug,
      title: seedLesson.title,
      description: seedLesson.description,
      category: seedLesson.category,
      estimatedMinutes: seedLesson.estimatedMinutes,
      sortOrder: seedLesson.sortOrder,
    });

    const lessonId = (inserted as any).insertId as number;

    // Insert steps
    for (const step of seedLesson.steps) {
      await db.insert(lessonSteps).values({
        lessonId,
        stepNumber: step.stepNumber,
        title: step.title,
        content: step.content,
      });
    }

    // Insert quiz questions
    for (const q of seedLesson.questions) {
      await db.insert(quizQuestions).values({
        lessonId,
        questionNumber: q.questionNumber,
        question: q.question,
        options: JSON.stringify(q.options),
        correctIndex: q.correctIndex,
        explanation: q.explanation ?? null,
      });
    }

    seeded++;
  }

  return { seeded, skipped };
}
