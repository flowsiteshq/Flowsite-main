import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, ArrowLeft, Clock, BookOpen, GraduationCap, Trophy, CheckCircle2, Play, Presentation, ExternalLink, Swords, Dumbbell, Leaf, UtensilsCrossed, Wrench, Heart, LucideIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import LessonViewer from "@/components/LessonViewer";

// ─── Image URLs ──────────────────────────────────────────────────────────────
const IMAGES = {
  seo: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/kc-seo-YXB5hd5bLLLyHtQmtPC9hW.webp",
  webdev: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/kc-webdev-eiXLmQZQfLk8n3RNLeBvUh.webp",
  crm: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/kc-crm-YzhtQWe4HudLxq3SSmApeM.webp",
  automation: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/kc-automation-hDuALY94zetyFAa2d2ZJuG.webp",
  analytics: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/kc-analytics-fp59dD5WGqryFVLafpWSDa.webp",
  hosting: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/kc-hosting-QCCtHH9CF4Zr9LWWNNHA2w.webp",
  copywriting: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/kc-copywriting-5N39e2ouAiYKFPHqJskRFh.webp",
  social: "https://d2xsxph8kpxj0f.cloudfront.net/310419663031545745/VvLvZnpjR27EmYwxaK3mTG/kc-social-ey8ZW3W4KuANE7hy3iD8FF.webp",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Category = "All" | "SEO" | "Web Dev" | "CRM" | "Automation" | "Analytics" | "Hosting" | "Copywriting" | "Social Media" | "Sales Rebuttals" | "Phone Scripts";

interface Article {
  id: string;
  title: string;
  subtitle: string;
  category: Category;
  image: string;
  readTime: number;
  content: string;
}

// ─── Article Content ──────────────────────────────────────────────────────────
const ARTICLES: Article[] = [
  // ── Sales Rebuttals ──────────────────────────────────────────────────────────
  {
    id: "rebuttal-too-expensive",
    title: "\"IT'S TOO EXPENSIVE\"",
    subtitle: "Turn price objections into value conversations that close deals",
    category: "Sales Rebuttals",
    image: IMAGES.copywriting,
    readTime: 4,
    content: `## Rebuttal: "It's Too Expensive"

This is the most common objection in sales — and it almost never means what it sounds like. When a prospect says "it's too expensive," they usually mean: "I don't yet see enough value to justify the price." Your job is to shift the conversation from cost to return on investment.

### The Core Rebuttal Framework

**Step 1 — Acknowledge:** Never argue or get defensive. Validate their concern first.

**Step 2 — Reframe:** Move from cost to investment. A website isn't an expense — it's a lead-generation machine.

**Step 3 — Quantify:** Make the math undeniable. If one new student is worth $1,200/year, the website pays for itself with a single enrollment.

**Step 4 — Close:** Bring it back to their goal.

### Word-for-Word Scripts

**Script A — The Math Close:**
> "I completely understand — and I want to make sure this makes sense for your business. Let me ask you: what's a new student worth to you over the course of a year? \n\nIf it's $1,200, and our website brings in just 2 new students in the first month — which is conservative based on our other clients — you've already made your money back. After that, every student is pure profit. Does that math make sense for your situation?"

**Script B — The Cost of Doing Nothing:**
> "I hear you. But let me flip this around — what's it costing you right now to NOT have a website that converts? Every month that goes by, competitors are capturing the students who are searching for what you offer. The real question isn't whether you can afford this — it's whether you can afford to keep losing those leads."

**Script C — The Comparison Close:**
> "Compared to what? A Google Ads campaign alone runs $1,500–$3,000 a month and stops the moment you stop paying. Our website is a one-time investment that works 24/7, 365 days a year — and it makes every dollar you spend on ads more effective by converting the traffic instead of losing it."

### Common Variations & Responses

| What They Say | What They Mean | Your Response |
|---------------|----------------|---------------|
| "It's too expensive" | I don't see the value | Use the Math Close |
| "I need to think about it" | I'm not convinced yet | Ask what's holding them back |
| "I can get it cheaper elsewhere" | I want to negotiate | Differentiate on results, not price |
| "We don't have budget right now" | Timing issue | Offer payment plans or a future start date |

### The Payment Plan Close

If budget is genuinely the issue, offer flexibility:
> "We do offer a payment plan — you can split the investment over 3 months, which brings it down to [monthly amount]. That way you're generating leads from day one while spreading out the cost. Would that work better for your situation?"

### What NOT to Do

Never immediately discount your price. Discounting signals that your original price wasn't justified, destroys your credibility, and attracts clients who will always push for more. Instead, add value — throw in an extra landing page, an extra month of support, or a bonus service before you ever touch the price.`,
  },
  {
    id: "rebuttal-think-about-it",
    title: "\"I NEED TO THINK ABOUT IT\"",
    subtitle: "Uncover the real objection hiding behind the stall",
    category: "Sales Rebuttals",
    image: IMAGES.copywriting,
    readTime: 3,
    content: `## Rebuttal: "I Need to Think About It"

"I need to think about it" is rarely about thinking. It's a polite way of saying: "You haven't given me enough reason to say yes right now." The key is to uncover the real objection without being pushy.

### Why This Happens

Prospects stall when:
- They're not fully convinced of the value
- They have a concern they haven't voiced (price, timing, trust)
- They need to consult a partner or spouse
- They're comparing you to a competitor

### The Clarifying Question

The most powerful response is a simple, non-threatening question:

> "Of course — I want you to feel completely confident. Can I ask: is there a specific part of this you'd like to think through? Sometimes there's something I haven't addressed well enough, and I'd rather clear that up now than have you sitting with a question."

This opens the door to the real objection without pressure.

### If They Say "Just the Price"

> "That's fair. Let me ask — if the investment weren't a factor, would this be the right solution for your business? \n\n[If yes] Then let's talk about how to make the numbers work. We do have a payment plan option that spreads it over 3 months. Would that help?"

### If They Say "I Need to Talk to My Partner"

> "Absolutely — that makes total sense. Would it be helpful if I put together a one-page summary you could share with them? I can also jump on a quick call with both of you if that would make the decision easier. When do you think you'd have that conversation?"

### The Urgency Close (Use Sparingly)

Only use this if there's a genuine reason:
> "I completely respect that. I do want to mention — we typically take on 2–3 new client builds per month to make sure every project gets the attention it deserves. We have one slot open for [month]. If you decide to move forward, I'd want to make sure we can hold that for you. Would it help to have a decision by [specific date]?"

### The Follow-Up Sequence

If they still need time, set a specific follow-up:
> "No problem at all. When would be a good time to reconnect — would [specific day] work? I'll send you a quick recap of everything we discussed so it's easy to review."

Never say "I'll follow up in a few days" — always get a specific date and time.`,
  },
  {
    id: "rebuttal-already-have-website",
    title: "\"I ALREADY HAVE A WEBSITE\"",
    subtitle: "Show why an existing website might be costing them students",
    category: "Sales Rebuttals",
    image: IMAGES.webdev,
    readTime: 3,
    content: `## Rebuttal: "I Already Have a Website"

Having a website and having a website that converts are two completely different things. This objection is an opportunity to diagnose their current situation and show them what they're leaving on the table.

### The Diagnostic Approach

Don't argue — ask questions that make them realize the problem themselves:

> "That's great — how's it performing for you? Are you getting consistent leads from it every month?"

Most business owners will admit their website isn't generating leads. That opens the door.

### If They Say "It's Fine"

> "I'm glad it's working for you. Out of curiosity, do you know your current conversion rate — what percentage of visitors actually fill out a form or call you? Industry average for a generic website is around 1–2%. Our clients typically see 5–12% after we rebuild. Even a small improvement in conversion can mean 3–5 extra leads per month. Would it be worth a quick audit to see where yours stands?"

### The Free Audit Offer

Offer to review their current site on the spot:

> "Would you mind if I pulled up your site right now? I can give you a quick assessment — load speed, mobile experience, SEO basics, and whether the calls-to-action are set up to convert. It takes about 5 minutes and you'll walk away with something valuable regardless of whether we work together."

This builds trust and almost always reveals problems that make your pitch obvious.

### Common Issues to Point Out

| Problem | Impact |
|---------|--------|
| Slow load time (over 3 seconds) | 53% of mobile visitors leave |
| No clear CTA above the fold | Visitors don't know what to do |
| No DojoFlow / CRM integration | Leads fall through the cracks |
| Not mobile-optimized | 60%+ of traffic is mobile |
| No local SEO | Invisible to "near me" searches |
| Generic stock photos | Destroys trust and authenticity |

### The Upgrade Pitch

> "What you have is a digital brochure — it tells people you exist. What we build is a lead generation system — it actively converts visitors into enrolled students and plugs directly into your CRM so no lead ever gets lost. There's a big difference between the two."`,
  },
  {
    id: "rebuttal-not-right-time",
    title: "\"IT'S NOT THE RIGHT TIME\"",
    subtitle: "Overcome timing objections and create urgency without pressure",
    category: "Sales Rebuttals",
    image: IMAGES.analytics,
    readTime: 3,
    content: `## Rebuttal: "It's Not the Right Time"

Timing objections are often disguised price or value objections. The prospect hasn't been convinced that acting NOW is more valuable than waiting. Your job is to make the cost of waiting tangible.

### The Cost of Waiting

> "I completely understand — timing matters. Can I ask: what would need to change for the timing to be right? \n\nThe reason I ask is that every month without a high-converting website is a month of leads going to a competitor who does have one. If we're talking about 3–5 extra leads per month, that's 9–15 leads over a quarter — and at your close rate, that's real revenue sitting on the table."

### Seasonal Urgency

For martial arts and fitness businesses, timing is actually critical:

> "Here's something worth considering — the biggest enrollment periods for martial arts schools are September (back-to-school) and January (New Year's resolutions). If we start now, your new site will be live and indexed by Google before those windows open. If we wait, you'll miss both of them. Would it make sense to at least get the process started so you're ready?"

### The Soft Start Option

Reduce the barrier to entry:

> "What if we started with just the core pages — homepage, about, and one program landing page? We can get that live in 2–3 weeks for a fraction of the full investment, and you start generating leads immediately. We can add the rest over time. Would a phased approach work better for your situation?"

### Qualifying the Timeline

Always get specifics:

> "When you say 'not the right time' — are we talking weeks, months, or longer? I want to make sure I follow up at the right moment for you, not just randomly."

This shows respect for their timeline while keeping the door open.`,
  },

  // ── Phone Scripts ─────────────────────────────────────────────────────────────
  {
    id: "script-cold-outreach",
    title: "COLD OUTREACH CALL",
    subtitle: "Word-for-word script for reaching out to new prospects for the first time",
    category: "Phone Scripts",
    image: IMAGES.crm,
    readTime: 5,
    content: `## Cold Outreach Call Script

Use this script when calling a business owner who has never heard of FlowSites. The goal of a cold call is NOT to close — it's to earn a discovery call or demo. Keep it short, confident, and focused on their pain.

### Before You Call

- Research the business: look at their current website, Google reviews, social media
- Know their niche (martial arts, fitness, wellness, etc.)
- Have a specific observation ready about their current online presence

### Opening (First 15 Seconds)

> "Hey [Name], this is [Your Name] with FlowSites. I'll keep this quick — I was looking at [Business Name]'s website and I noticed [specific observation — e.g., 'it doesn't have a way for people to book a free trial directly from the homepage']. Is that something you've been looking to fix?"

**Why this works:** You've done your homework, you're specific, and you're asking a question instead of pitching.

### If They Say "Yes" or "We've been thinking about it"

> "Perfect — that's exactly what we specialize in. We build websites for [their niche] businesses that are connected directly to their CRM so every lead is automatically followed up. We've done this for [mention a relevant client if possible]. \n\nI'd love to show you what that looks like — do you have 20 minutes this week for a quick screen share? I can show you a live example and give you some specific ideas for your business."

### If They Say "We already have a website"

> "I figured you might — most businesses do. The difference is that most websites are digital brochures. What we build are lead generation systems that are connected to your CRM and actually convert visitors into enrolled students. \n\nWould you be open to a quick 20-minute call? I'll pull up your current site and show you exactly what I mean — no obligation, just a useful conversation."

### If They Say "We're not interested"

> "No problem at all — I appreciate you being straight with me. Can I ask: is it the timing, or is there something specific about what I described that doesn't fit? I want to make sure I'm not calling back at the wrong time."

This often reveals the real objection or opens a future opportunity.

### If They Say "Send me an email"

> "I can do that — I want to make sure I send you something actually relevant to your situation though. Can I ask two quick questions first so I'm not wasting your time with something generic?"

Then ask: (1) What's their biggest challenge with their current website? (2) Are they actively trying to grow enrollment?

### Closing the Call

Always end with a specific next step:

> "Great — I'll send that over in the next hour. And I'll follow up [specific day] to make sure you got it and answer any questions. Does [time] work for a quick 5-minute call?"

### Voicemail Script (30 seconds max)

> "Hey [Name], this is [Your Name] with FlowSites. I was looking at [Business Name]'s website and had a specific idea for how to increase your online enrollment. I'll keep it quick — give me a call back at [number] or I'll try you again [specific day]. Talk soon."`,
  },
  {
    id: "script-discovery-call",
    title: "DISCOVERY CALL SCRIPT",
    subtitle: "How to run a 20-minute discovery call that leads to a proposal",
    category: "Phone Scripts",
    image: IMAGES.crm,
    readTime: 6,
    content: `## Discovery Call Script

The discovery call is the most important call in your sales process. Done right, it ends with the prospect asking YOU what the next step is. The secret: ask great questions and listen more than you talk.

### Call Structure (20 Minutes)

**Minutes 0–2:** Rapport & agenda setting
**Minutes 2–10:** Discovery questions
**Minutes 10–15:** Present your solution
**Minutes 15–18:** Handle objections
**Minutes 18–20:** Close for next step

### Opening (Set the Agenda)

> "Thanks for making time, [Name]. I want to make sure this is valuable for you regardless of what we decide at the end. Here's what I'm thinking: I'll ask you a few questions about your business and what you're trying to accomplish — maybe 10 minutes — and then I'll show you specifically how we've helped businesses like yours. Sound good?"

### Discovery Questions

Ask these in a conversational way — not as a checklist:

**Business situation:**
> "Tell me about [Business Name] — how long have you been open, and how many students/clients are you currently serving?"

**Current website:**
> "Walk me through your current website situation. Are you getting leads from it consistently?"

**Pain point:**
> "What's the biggest challenge you're facing right now when it comes to getting new students/clients?"

**Goal:**
> "If we could wave a magic wand — what would your enrollment/client situation look like 6 months from now?"

**CRM/follow-up:**
> "When a lead comes in through your website right now, what happens? How do you follow up with them?"

**Decision process:**
> "When you make a decision like this, is it just you, or is there someone else involved?"

### Presenting Your Solution

After discovery, summarize what you heard before pitching:

> "Based on what you've shared, it sounds like the core issue is [restate their pain in their words]. You're getting some traffic but the site isn't converting it, and when leads do come in, the follow-up is manual and inconsistent. Is that right?"

[After they confirm]

> "That's exactly the problem we solve. Here's what we build: [brief description of your solution tied directly to their pain]. Let me show you a quick example — can you see my screen?"

### Closing for Next Step

> "Based on everything we've talked about, I think we can definitely help you. Here's what I'd suggest as a next step: I'll put together a specific proposal for your business — not a generic quote, but a plan built around what you told me today. I can have that to you by [specific date]. From there, if it makes sense, we can get started. Does that work?"

### Post-Call Follow-Up

Send a follow-up email within 1 hour:
- Subject: "[Business Name] — Website Strategy Recap"
- 3-bullet summary of what they told you
- 3-bullet summary of what you proposed
- Clear next step with date`,
  },
  {
    id: "script-follow-up",
    title: "FOLLOW-UP & CHECK-IN CALLS",
    subtitle: "Scripts for following up after proposals, demos, and past conversations",
    category: "Phone Scripts",
    image: IMAGES.crm,
    readTime: 4,
    content: `## Follow-Up & Check-In Call Scripts

Most sales are lost not because of a bad pitch — but because of no follow-up. Studies show it takes an average of 8 touchpoints to close a deal. Here are scripts for every follow-up scenario.

### After Sending a Proposal (48–72 hours later)

> "Hey [Name], this is [Your Name] from FlowSites. I sent over the proposal for [Business Name] a couple days ago — did you get a chance to look it over? \n\nI wanted to make sure you didn't have any questions and that everything made sense."

**If they haven't looked at it:**
> "No worries — life gets busy. Is there a better time this week when you'll have 10 minutes to review it? I can walk you through it on a quick call so you're not just staring at a document."

**If they have questions:**
> "Great — what stood out to you? Let's go through it together."

### After a Demo (Same Day or Next Day)

> "Hey [Name] — [Your Name] from FlowSites. Just wanted to follow up while everything is fresh. What were your initial thoughts after seeing the demo?"

Listen first. Then:
> "What would need to be true for this to be a clear yes for you?"

### The 2-Week Check-In (If They've Gone Quiet)

> "Hey [Name], [Your Name] here. I know you've been busy — I just wanted to check in and see where things stand. Has anything changed on your end, or is the timing still not quite right?"

This is non-pushy and often re-opens the conversation.

### The "Breakup" Email (After 3+ No Responses)

Send this as a last-resort — it often gets a response:

> "Subject: Should I close your file?
> \n\nHey [Name] — I've reached out a few times and haven't heard back, so I'm guessing either the timing isn't right or this isn't a priority right now. \n\nI'm going to close out your file unless I hear otherwise. If things change down the road, I'm always here. \n\nEither way, I hope [Business Name] continues to grow — you're clearly building something great."

### Existing Client Check-In (Monthly)

> "Hey [Name], just doing my monthly check-in. How's the site performing for you? Anything you'd like to adjust, update, or add? I also wanted to mention — we just launched [new service/feature] that a few of our clients have been loving. Worth a quick conversation if you're interested."

### Key Rules for Follow-Up

- Always reference the last conversation specifically
- Always end with a question or a specific next step
- Never say "just checking in" without adding value
- Space follow-ups: Day 1, Day 3, Day 7, Day 14, Day 30`,
  },
  {
    id: "script-customer-onboarding",
    title: "CLIENT ONBOARDING CALL",
    subtitle: "How to kick off a new project and set expectations that prevent headaches",
    category: "Phone Scripts",
    image: IMAGES.automation,
    readTime: 4,
    content: `## Client Onboarding Call Script

The onboarding call sets the tone for the entire client relationship. Done well, it builds trust, sets clear expectations, and prevents the most common project headaches before they happen.

### When to Use This

Within 24 hours of a client signing and paying their deposit.

### Opening

> "[Name] — congratulations and welcome to FlowSites! I'm really excited to work on this with you. This call is going to take about 20 minutes, and by the end you'll know exactly what happens next, what we need from you, and when you can expect to see your first draft. Sound good?"

### Set Expectations Upfront

> "Before we dive in, I want to be transparent about how we work so there are no surprises. We typically deliver a first draft within [X] business days. We do [X] rounds of revisions included in your package. The biggest thing that affects timeline is how quickly we get content and feedback from you — the faster you respond, the faster we move. Does that all make sense?"

### Gather What You Need

**Brand assets:**
> "First, I need a few things from you. Do you have a logo file — ideally a PNG or SVG with a transparent background? And any brand colors or fonts you use?"

**Content:**
> "For the copy — do you have existing content you want us to use, or would you like us to write it from scratch? We do include copywriting in your package."

**Photos:**
> "Do you have professional photos of your facility, team, and students? Real photos convert significantly better than stock images. If not, we can work with what you have or recommend a photographer."

**CRM access:**
> "For the DojoFlow integration — I'll need your DojoFlow account credentials or API key. I'll send you a secure form to submit those."

### Explain the Process

> "Here's how the next few weeks look: \n\n1. You send us your assets and fill out our intake form — I'll email that right after this call. \n2. We build the first draft and send you a preview link. \n3. You give us feedback and we revise. \n4. We launch. \n\nYou'll have a dedicated point of contact — that's me — and I'll send you weekly updates so you always know where things stand."

### Close the Call

> "Any questions before we wrap up? \n\nPerfect. I'm going to send you two things in the next 30 minutes: the intake form and a checklist of everything we need from you. The faster we get those back, the sooner we can get started. \n\nI'm genuinely excited about this — [Business Name] is going to have a site that actually works for you. Talk soon."`,
  },

  // ── Original articles ─────────────────────────────────────────────────────────
  {
    id: "seo-basics",
    title: "WHAT IS SEO?",
    subtitle: "Learn how search engines rank websites and why it matters for your clients",
    category: "SEO",
    image: IMAGES.seo,
    readTime: 5,
    content: `## What is SEO?

**SEO (Search Engine Optimization)** is the process of improving a website so it appears higher in search engine results pages (SERPs) like Google. When someone searches for "martial arts near me" or "best fitness studio in Dallas," SEO determines which websites show up first.

### Why Does It Matter?

Over 90% of online experiences begin with a search engine. If your client's website doesn't appear on page one of Google, they're essentially invisible to potential customers. Studies show that the first organic result gets roughly 28% of all clicks — and results beyond page one get almost none.

### The Three Pillars of SEO

**1. On-Page SEO** refers to everything on the website itself: the words used, the page titles, headings (H1, H2, H3), image alt text, and URL structure. Every page should be built around a specific keyword that real people search for.

**2. Technical SEO** covers the behind-the-scenes factors: how fast the site loads, whether it works on mobile, if Google can "crawl" and index all the pages, and whether there are any broken links or errors. A technically sound site is the foundation everything else is built on.

**3. Off-Page SEO** is about authority — specifically, how many other reputable websites link back to your client's site (called "backlinks"). Google treats backlinks like votes of confidence. The more high-quality sites that link to you, the more Google trusts you.

### Key SEO Terms to Know

| Term | What It Means |
|------|---------------|
| **Keyword** | The word or phrase someone types into Google |
| **SERP** | Search Engine Results Page — the page Google shows after a search |
| **Organic traffic** | Visitors who find the site through unpaid search results |
| **Backlink** | A link from another website pointing to your client's site |
| **Domain Authority (DA)** | A score (1–100) predicting how well a site will rank |
| **Meta description** | The short text snippet shown under a page title in Google results |
| **Alt text** | A description of an image that helps Google understand what it shows |
| **Crawlability** | Whether Google's bots can access and read all pages on the site |

### How Long Does SEO Take?

SEO is a long-term investment. Most sites begin to see meaningful movement in rankings within 3–6 months of consistent effort. Unlike paid ads that stop the moment you stop paying, SEO compounds over time — a well-optimized site continues to attract traffic for years.

### What FlowSites Does for SEO

Every website we build includes SEO foundations from day one: clean URL structures, fast load times, mobile-first design, proper heading hierarchy, and optimized meta tags. We also offer ongoing SEO add-ons for clients who want to actively climb the rankings.`,
  },
  {
    id: "keyword-research",
    title: "KEYWORD RESEARCH",
    subtitle: "How to find the exact words your clients' customers are searching for",
    category: "SEO",
    image: IMAGES.seo,
    readTime: 4,
    content: `## Keyword Research: Finding What Your Clients' Customers Actually Search For

**Keyword research** is the process of discovering the specific words and phrases that potential customers type into Google when looking for a product or service. It's the foundation of any effective SEO strategy.

### Types of Keywords

**Short-tail keywords** are broad, high-volume terms like "martial arts" or "fitness studio." They get a lot of searches but are extremely competitive and rarely convert well because the searcher's intent is unclear.

**Long-tail keywords** are more specific phrases like "kids martial arts classes in Houston" or "adult beginner karate near me." They have lower search volume but much higher conversion rates because the searcher knows exactly what they want.

**Local keywords** are critical for service businesses. Adding a city, neighborhood, or "near me" to a keyword dramatically increases relevance for local businesses. Google's local algorithm heavily favors these.

### The Intent Behind a Search

Every search has an intent — what the person actually wants to accomplish:

- **Informational:** "what is jiu jitsu" (they want to learn)
- **Navigational:** "MyDojo Martial Arts website" (they want a specific site)
- **Transactional:** "sign up for karate classes Dallas" (they're ready to buy)

The most valuable keywords for your clients are transactional ones — people who are actively looking to enroll, book, or purchase.

### How to Use This in Sales

When pitching a client, you can demonstrate keyword research to show them the exact volume of people searching for their services each month. Tools like Google Keyword Planner, Ahrefs, or SEMrush can show search volume, competition level, and related terms. This turns SEO from an abstract concept into a concrete business opportunity.`,
  },
  {
    id: "website-anatomy",
    title: "ANATOMY OF A WEBSITE",
    subtitle: "Every part of a website explained — from domain to database",
    category: "Web Dev",
    image: IMAGES.webdev,
    readTime: 6,
    content: `## The Anatomy of a Website: Every Part Explained

When clients ask "what exactly are we building?" this guide gives you the vocabulary to explain it clearly and confidently.

### The Domain Name

A **domain name** is the address people type to reach a website (e.g., \`mydojomartialarts.com\`). It's registered through a domain registrar (like GoDaddy or Namecheap) and renewed annually. The part after the dot is called the **TLD (Top-Level Domain)** — .com, .net, .org, etc.

### DNS: The Internet's Phone Book

**DNS (Domain Name System)** translates a human-readable domain name into a numeric IP address that computers use to find the server. When someone types your client's domain, DNS tells their browser exactly which server to connect to. DNS changes can take up to 48 hours to propagate globally — this is why domain transfers sometimes feel slow.

### Web Hosting

**Web hosting** is a service that stores your website's files on a server connected to the internet 24/7. Think of it like renting space on a computer that never turns off. Types include:

- **Shared hosting:** Many websites on one server (cheapest, slowest)
- **VPS (Virtual Private Server):** Your own slice of a server (middle ground)
- **Dedicated hosting:** An entire server just for your site (most powerful)
- **Cloud hosting:** Files distributed across many servers (scalable, reliable)

### Frontend vs. Backend

**Frontend** is everything a visitor sees and interacts with — the design, buttons, text, images, and animations. It's built with HTML (structure), CSS (style), and JavaScript (interactivity).

**Backend** is the server-side logic that powers the site — databases, user authentication, form processing, and API connections. When a lead fills out a contact form, the backend receives that data and routes it to the CRM.

### SSL Certificate

An **SSL certificate** encrypts data between the visitor's browser and the server. Sites with SSL show a padlock icon and use \`https://\` instead of \`http://\`. Google penalizes sites without SSL in rankings, and modern browsers warn visitors that non-SSL sites are "not secure." Every site we build includes SSL.

### CMS vs. Custom Build

A **CMS (Content Management System)** like WordPress lets non-developers update content through a visual interface. A **custom build** is coded from scratch, offering more speed, security, and flexibility — but requires a developer to make changes. FlowSites builds custom sites optimized for performance and CRM integration.`,
  },
  {
    id: "page-speed",
    title: "PAGE SPEED & CORE WEB VITALS",
    subtitle: "Why a slow website kills conversions and how we fix it",
    category: "Web Dev",
    image: IMAGES.webdev,
    readTime: 4,
    content: `## Page Speed & Core Web Vitals: Why Speed = Revenue

A one-second delay in page load time can reduce conversions by 7%. Amazon calculated that a 100-millisecond slowdown cost them 1% in sales. For a martial arts school, a slow website means prospects bounce before they ever see the enrollment form.

### Google's Core Web Vitals

Google uses three specific metrics — called **Core Web Vitals** — to measure user experience and factor them directly into search rankings:

**LCP (Largest Contentful Paint)** measures how long it takes for the main content of a page to load. Google wants this under 2.5 seconds. If your hero image takes 6 seconds to appear, visitors leave.

**FID (First Input Delay)** measures how quickly the page responds when a user tries to interact with it (click a button, fill a form). Should be under 100 milliseconds.

**CLS (Cumulative Layout Shift)** measures how much the page "jumps around" as it loads. If a button shifts position right as someone tries to click it, that's a poor CLS score. Should be under 0.1.

### What Slows a Website Down

The most common culprits are oversized images (a 5MB hero photo is never acceptable), too many third-party scripts (chat widgets, tracking pixels, social embeds), unoptimized fonts, and cheap shared hosting.

### How FlowSites Builds for Speed

Every site we deliver is optimized from the ground up: images are compressed and served in modern WebP format, code is minified and bundled, fonts are loaded efficiently, and we use fast cloud hosting. Our sites consistently score 90+ on Google PageSpeed Insights — a metric you can show clients as proof of quality.`,
  },
  {
    id: "crm-explained",
    title: "WHAT IS A CRM?",
    subtitle: "Customer Relationship Management explained in plain English",
    category: "CRM",
    image: IMAGES.crm,
    readTime: 5,
    content: `## What is a CRM?

**CRM stands for Customer Relationship Management.** It's software that helps businesses track and manage all their interactions with leads and customers in one centralized place. Think of it as a supercharged address book combined with a sales pipeline manager.

### Why Service Businesses Need a CRM

Without a CRM, leads fall through the cracks. A prospect fills out a form on Monday, the owner forgets to follow up by Friday, and that lead signs up with a competitor. A CRM prevents this by automatically logging every lead, tracking where they are in the sales process, and triggering follow-up reminders.

### The Sales Pipeline

A **pipeline** is the visual representation of where each lead is in the journey from "just heard about us" to "enrolled student." Typical stages for a martial arts school might be:

1. **New Lead** — just submitted a form
2. **Contacted** — rep reached out
3. **Trial Scheduled** — booked a free class
4. **Trial Completed** — attended the class
5. **Offer Made** — presented enrollment options
6. **Enrolled** — signed up and paid
7. **Lost** — decided not to join

### DojoFlow Integration

**DojoFlow** is a CRM built specifically for martial arts schools and fitness studios. When we build a website that integrates with DojoFlow, every form submission, every click on a CTA button, and every phone call can be automatically logged as a new lead in the pipeline. This eliminates manual data entry and ensures no lead is ever forgotten.

### Key CRM Terms

| Term | Meaning |
|------|---------|
| **Lead** | A potential customer who has shown interest |
| **Contact** | A person stored in the CRM (lead or existing customer) |
| **Deal / Opportunity** | A specific sales conversation with a lead |
| **Pipeline stage** | Where a lead currently sits in the sales process |
| **Automation** | Rules that trigger actions automatically (e.g., send email when lead submits form) |
| **Tag** | A label applied to a contact for segmentation (e.g., "interested in kids program") |`,
  },
  {
    id: "lead-funnels",
    title: "LEAD FUNNELS EXPLAINED",
    subtitle: "How a website converts a stranger into a paying student",
    category: "CRM",
    image: IMAGES.crm,
    readTime: 4,
    content: `## Lead Funnels: How a Website Converts Strangers into Students

A **lead funnel** (also called a sales funnel or conversion funnel) is the path a visitor takes from first landing on a website to becoming a paying customer. Every element of a well-designed website is intentionally placed to guide visitors through this funnel.

### The Four Stages of a Funnel

**Awareness** — The prospect discovers the business, usually through a Google search, social media ad, or word of mouth. This is where SEO and paid advertising do their job.

**Interest** — They land on the website and start exploring. This is where design, social proof (testimonials, photos), and clear messaging capture their attention and build trust.

**Decision** — They're considering signing up. This is where urgency elements (limited spots, special offers), risk reducers (free trial class, money-back guarantee), and strong CTAs push them toward action.

**Action** — They fill out the form, book a trial, or call. This is the conversion — the moment the website has done its job.

### What Makes a High-Converting Funnel

A high-converting website is engineered around the funnel. Every page has a single, clear goal. The CTA (Call to Action) is visible above the fold. The form is short (name, email, phone — nothing more). Social proof is placed right next to the CTA. Mobile experience is flawless because over 60% of searches happen on phones.

### Funnel Metrics to Know

**Conversion rate** is the percentage of visitors who take the desired action. A typical website converts 1–3% of visitors. A well-optimized funnel can reach 5–10%.

**Bounce rate** is the percentage of visitors who leave without doing anything. A high bounce rate signals a mismatch between what the ad promised and what the page delivers.

**Cost per lead (CPL)** is how much is spent on advertising to acquire one lead. Lowering CPL while maintaining lead quality is the goal of every optimization effort.`,
  },
  {
    id: "marketing-automation",
    title: "MARKETING AUTOMATION",
    subtitle: "How automated follow-ups turn cold leads into enrolled students",
    category: "Automation",
    image: IMAGES.automation,
    readTime: 5,
    content: `## Marketing Automation: Working Smarter, Not Harder

**Marketing automation** is the use of software to automatically send messages, trigger actions, and manage follow-ups based on what a lead does (or doesn't do). Instead of a staff member manually emailing every new lead, the system does it instantly and consistently — every time, without fail.

### Why Automation Matters

Studies show that leads contacted within 5 minutes of submitting a form are 100x more likely to convert than leads contacted after 30 minutes. Most businesses respond in hours or days — or not at all. Automation closes this gap by triggering an immediate response the moment a form is submitted.

### Common Automation Workflows

**New Lead Welcome Sequence:** When a prospect fills out a form → immediately send a welcome text + email → 24 hours later send a reminder about the free trial → 3 days later send a testimonial video → 7 days later send a "last chance" offer.

**No-Show Recovery:** When a trial class is booked but the prospect doesn't show up → automatically send a "we missed you" text → offer to reschedule → follow up 48 hours later.

**Re-engagement Campaign:** When a lead goes cold (no activity in 30 days) → send a "we haven't heard from you" email with a special offer → if no response, move to a long-term nurture sequence.

### Triggers and Actions

Every automation has two parts: a **trigger** (what starts the automation) and an **action** (what the automation does).

| Trigger | Action |
|---------|--------|
| Form submitted | Send welcome email + SMS |
| Trial class booked | Send confirmation + reminder |
| Trial completed | Send enrollment offer |
| Lead goes cold (30 days) | Send re-engagement email |
| Student misses payment | Send payment reminder |

### DojoFlow Automation

DojoFlow has built-in automation tools that connect directly to the website. When a FlowSites website captures a lead, DojoFlow can immediately trigger a text message, add the lead to a pipeline stage, assign it to a staff member, and start an email sequence — all without any manual work.`,
  },
  {
    id: "webhooks-apis",
    title: "WEBHOOKS & APIs",
    subtitle: "How different software systems talk to each other",
    category: "Automation",
    image: IMAGES.automation,
    readTime: 4,
    content: `## Webhooks & APIs: How Software Systems Communicate

When a lead fills out a form on a FlowSites website and that lead instantly appears in DojoFlow — that's an API or webhook doing its job. Understanding these concepts helps you explain integrations to clients.

### What is an API?

**API stands for Application Programming Interface.** It's a set of rules that allows two different software applications to communicate with each other. Think of it like a waiter in a restaurant: the waiter (API) takes your order (request) to the kitchen (server) and brings back your food (response).

When a website sends a lead to a CRM, it's making an API call — sending a structured package of data (name, email, phone, source) to the CRM's server, which then creates a new contact record.

### What is a Webhook?

A **webhook** is like a push notification for software. Instead of one system constantly asking "do you have new data for me?" (polling), a webhook lets one system say "hey, something just happened — here's the data" (pushing).

For example: when a lead submits a form on the website, the website immediately sends a webhook to DojoFlow with all the lead's information. DojoFlow receives it and creates the lead record in real time — no delay, no manual import.

### REST vs. Webhook

| | REST API | Webhook |
|--|----------|---------|
| **Direction** | Your system asks for data | Their system sends data to you |
| **Timing** | On demand | Triggered by an event |
| **Use case** | Fetching existing records | Reacting to new events |
| **Example** | "Get all leads from last week" | "A new lead just submitted a form" |

### Why This Matters for Clients

When you explain that a FlowSites website "integrates with DojoFlow," what you're describing is a webhook or API connection that automatically passes lead data between systems. This eliminates manual data entry, reduces human error, and ensures instant follow-up — which is the core value proposition of the integration.`,
  },
  {
    id: "analytics-explained",
    title: "WEBSITE ANALYTICS",
    subtitle: "Understanding the numbers that tell you if a website is working",
    category: "Analytics",
    image: IMAGES.analytics,
    readTime: 5,
    content: `## Website Analytics: Reading the Numbers That Matter

**Website analytics** is the collection and analysis of data about how visitors interact with a website. The most common tool is Google Analytics, but there are many others. Analytics tells you not just how many people visited, but what they did, where they came from, and whether the site is achieving its goals.

### The Metrics That Matter Most

**Sessions** — The total number of visits to the website in a given time period. One person can create multiple sessions if they visit on different days.

**Users (Unique Visitors)** — The number of individual people who visited, regardless of how many times they came back.

**Pageviews** — The total number of pages viewed. If one visitor looks at 5 pages, that's 5 pageviews but 1 user.

**Bounce Rate** — The percentage of visitors who leave after viewing only one page. A high bounce rate (above 70%) usually signals a problem with the landing page or a mismatch between the ad and the page content.

**Average Session Duration** — How long visitors spend on the site. Longer is generally better — it means they're engaged with the content.

**Conversion Rate** — The percentage of visitors who complete a desired action (fill out a form, call, book a trial). This is the most important metric for a lead-generation website.

### Traffic Sources

Analytics breaks down where visitors come from:

- **Organic** — Found the site through a Google search (SEO)
- **Paid** — Clicked on a Google or Facebook ad
- **Direct** — Typed the URL directly or used a bookmark
- **Referral** — Clicked a link on another website
- **Social** — Came from a social media post or profile

### Using Analytics in Client Conversations

Monthly analytics reports are a powerful retention tool. Showing a client that their website generated 47 leads last month, that organic traffic grew 23% from SEO improvements, and that the contact page has a 12% conversion rate turns the website from a cost into a measurable business asset.`,
  },
  {
    id: "hosting-explained",
    title: "WEB HOSTING EXPLAINED",
    subtitle: "What hosting is, why it matters, and how to explain it to clients",
    category: "Hosting",
    image: IMAGES.hosting,
    readTime: 4,
    content: `## Web Hosting Explained: Where a Website Actually Lives

Every website needs to be stored somewhere. **Web hosting** is the service that provides that storage — a computer (server) connected to the internet 24 hours a day, 7 days a week, that serves your website's files to anyone who visits.

### Types of Hosting

**Shared Hosting** is the cheapest option — your website shares a server with hundreds or thousands of other websites. The problem is that if another site on the same server gets a traffic spike, it can slow down your site. Good for hobby sites, not for business websites.

**VPS (Virtual Private Server)** gives you a dedicated portion of a server. You're still technically sharing hardware, but your resources are guaranteed. Better performance and security than shared hosting.

**Dedicated Hosting** means the entire physical server is yours. Maximum performance and control, but expensive. Usually only needed for very high-traffic sites.

**Cloud Hosting** distributes your website across multiple servers in different locations. If one server has an issue, another takes over instantly. This is what most modern, professional websites use — it's scalable, reliable, and fast.

### Uptime and Reliability

**Uptime** is the percentage of time a website is accessible. 99.9% uptime sounds great, but that still means about 8.7 hours of downtime per year. For a business that relies on its website for leads, downtime = lost revenue. Quality hosting providers offer 99.99% uptime guarantees.

### CDN: Content Delivery Network

A **CDN** stores copies of your website's files on servers around the world. When someone in Los Angeles visits a website hosted in New York, the CDN serves the files from a nearby server instead — dramatically reducing load time. All FlowSites websites use a CDN for maximum speed.

### SSL and Security

**SSL (Secure Sockets Layer)** encrypts the connection between a visitor's browser and the server. Websites with SSL show a padlock in the browser and use \`https://\`. Google requires SSL for good rankings, and browsers warn users about non-SSL sites. Every FlowSites website includes SSL as standard.`,
  },
  {
    id: "copywriting-basics",
    title: "WEBSITE COPYWRITING",
    subtitle: "The words that sell — how great copy converts visitors into leads",
    category: "Copywriting",
    image: IMAGES.copywriting,
    readTime: 5,
    content: `## Website Copywriting: The Words That Do the Selling

**Copywriting** is the art of writing text (called "copy") that persuades someone to take action. On a website, great copy is the difference between a visitor who bounces in 10 seconds and one who fills out a form. Design gets attention; copy closes the deal.

### The Headline Is Everything

The headline is the first thing a visitor reads — and 80% of people never read past it. A great headline answers one question immediately: "What's in it for me?" 

Weak headline: "Welcome to MyDojo Martial Arts Academy"
Strong headline: "Your Child Will Be Confident, Disciplined, and Bully-Proof in 90 Days — Guaranteed"

The strong headline speaks to the parent's desire (confident, disciplined child) and removes risk (guarantee).

### The Problem-Solution Framework

Effective copy follows a simple structure:
1. **Identify the problem** the prospect has ("Struggling to find an activity that actually sticks?")
2. **Agitate the pain** ("Most kids quit sports after one season because they're not challenged or engaged")
3. **Present the solution** ("Our martial arts program builds real confidence through progressive achievement")
4. **Prove it works** (testimonials, before/after stories, stats)
5. **Call to action** ("Book Your Free Trial Class Today")

### Social Proof

**Social proof** is evidence that other people have trusted and benefited from the business. It's one of the most powerful conversion tools on any website. Types include:

- **Testimonials** — Written quotes from happy students/parents
- **Video testimonials** — Even more powerful than written
- **Star ratings** — Google reviews displayed on the site
- **Case studies** — Detailed stories of transformation
- **Numbers** — "500+ students enrolled" or "12 years in business"

### CTAs: Calls to Action

A **CTA (Call to Action)** is the button or link that tells the visitor what to do next. Every page should have one clear, prominent CTA. The best CTAs are specific and benefit-focused:

- Weak: "Submit" or "Click Here"
- Strong: "Book My Free Trial Class" or "Get My Free Website Audit"

The CTA should be above the fold (visible without scrolling), repeated throughout the page, and designed to stand out visually.`,
  },
  {
    id: "social-media-strategy",
    title: "SOCIAL MEDIA FOR BUSINESSES",
    subtitle: "How social media drives leads and supports your website",
    category: "Social Media",
    image: IMAGES.social,
    readTime: 4,
    content: `## Social Media for Businesses: How It Drives Leads and Supports Your Website

Social media is not just about posting photos — for service businesses, it's a lead generation and trust-building machine that works alongside the website.

### The Role of Social Media in the Funnel

Social media primarily operates at the **Awareness** and **Interest** stages of the funnel. A potential student sees a video of a kids' class on Instagram, gets curious, clicks the link in bio, lands on the website, and fills out a form. Social media was the first touchpoint; the website was the closer.

### Organic vs. Paid Social

**Organic social media** is content posted for free — videos, photos, stories, and reels. It builds brand awareness and community over time but has limited reach because platforms only show posts to a fraction of followers.

**Paid social media** (Facebook Ads, Instagram Ads) puts content in front of people who don't follow the account yet, targeted by location, age, interests, and behaviors. For a martial arts school, you can target parents of children aged 5–12 within a 10-mile radius who have shown interest in kids' activities. This is extremely powerful for lead generation.

### Pixel Tracking

A **Facebook Pixel** (now called Meta Pixel) is a small piece of code placed on a website that tracks visitor behavior. When someone visits the website but doesn't fill out a form, the pixel allows you to "retarget" them with ads on Facebook and Instagram — showing them your client's ad as they scroll their feed. Retargeting campaigns typically have 3–5x higher conversion rates than cold traffic campaigns.

### Key Metrics for Social Media

| Metric | What It Measures |
|--------|-----------------|
| **Reach** | How many unique people saw the content |
| **Impressions** | Total number of times content was displayed |
| **Engagement rate** | Likes, comments, shares divided by reach |
| **Click-through rate (CTR)** | Percentage who clicked a link |
| **Cost per lead (CPL)** | Ad spend divided by number of leads generated |

### What FlowSites Builds for Social

Every website we build is optimized for social traffic: fast mobile load times (since social visitors are almost always on phones), Open Graph tags so links share beautifully on Facebook and Instagram, and landing pages designed to convert the warm traffic that social ads generate.`,
  },
  {
    id: "responsive-design",
    title: "RESPONSIVE DESIGN",
    subtitle: "Why your website must look perfect on every device",
    category: "Web Dev",
    image: IMAGES.webdev,
    readTime: 3,
    content: `## Responsive Design: One Website, Every Device

**Responsive design** means a website automatically adjusts its layout, font sizes, and images to look and work correctly on any screen size — from a 27-inch desktop monitor to a 5-inch smartphone.

### Why It's Non-Negotiable

Over 60% of all web traffic now comes from mobile devices. Google uses **mobile-first indexing**, meaning it evaluates the mobile version of your website first when determining search rankings. A site that looks great on desktop but is broken on mobile will rank poorly and lose the majority of its potential visitors.

### How It Works

Responsive design uses **CSS media queries** — rules that tell the browser to apply different styles at different screen widths. A three-column layout on desktop might become a single-column layout on mobile. A large hero image might be replaced with a smaller, cropped version on phones to save load time.

### The Viewport Meta Tag

Every responsive website includes a special line of code in the HTML: \`<meta name="viewport" content="width=device-width, initial-scale=1">\`. Without this, mobile browsers render the page at desktop width and then shrink it — making text tiny and buttons impossible to tap.

### Testing Responsiveness

Every FlowSites website is tested on real devices across multiple screen sizes before delivery. We check iPhones, Android phones, tablets, and various desktop resolutions to ensure a consistent, professional experience everywhere.`,
  },
  {
    id: "google-ads-basics",
    title: "GOOGLE ADS BASICS",
    subtitle: "How paid search advertising works and when to recommend it",
    category: "Analytics",
    image: IMAGES.analytics,
    readTime: 4,
    content: `## Google Ads Basics: Paying to Be at the Top of Search Results

**Google Ads** (formerly Google AdWords) is a paid advertising platform that lets businesses pay to appear at the top of Google search results for specific keywords. Unlike SEO which takes months, Google Ads can generate leads on day one.

### How Google Ads Works

Advertisers bid on keywords — the more competitive the keyword, the higher the cost per click. When someone searches for "martial arts classes near me," Google runs an instant auction among all advertisers bidding on that keyword and shows the winners at the top of the results page (labeled "Sponsored").

You only pay when someone actually clicks your ad — this is called **PPC (Pay Per Click)** advertising.

### Key Google Ads Terms

| Term | Meaning |
|------|---------|
| **CPC (Cost Per Click)** | How much you pay each time someone clicks your ad |
| **CTR (Click-Through Rate)** | Percentage of people who see the ad and click it |
| **Quality Score** | Google's rating of your ad relevance (1–10); higher score = lower cost |
| **Impression** | One display of your ad, regardless of whether it's clicked |
| **Conversion** | When a visitor completes the desired action (form submit, call) |
| **ROAS (Return on Ad Spend)** | Revenue generated per dollar spent on ads |

### Landing Pages Matter

A Google Ad is only as good as the page it sends visitors to. A generic homepage is a poor landing page for a paid ad. The best practice is to create a **dedicated landing page** that matches the ad's message exactly — if the ad says "Free Trial Martial Arts Class," the landing page should say the same thing and have one clear CTA: book the free trial.

This is why FlowSites builds program-specific landing pages as part of our Growth and Authority packages — they dramatically improve ad performance.

### SEO vs. Google Ads

| | SEO | Google Ads |
|--|-----|------------|
| **Cost** | Time investment | Money per click |
| **Speed** | 3–6 months | Immediate |
| **Longevity** | Compounds over time | Stops when budget runs out |
| **Trust** | Higher (organic results) | Lower (marked "Sponsored") |
| **Best for** | Long-term growth | Immediate lead generation |

Most successful businesses use both — ads for immediate leads while SEO builds long-term organic traffic.`,
  },
];

// ─── Category Config ──────────────────────────────────────────────────────────
const CATEGORIES: Category[] = ["All", "Sales Rebuttals", "Phone Scripts", "SEO", "Web Dev", "CRM", "Automation", "Analytics", "Hosting", "Copywriting", "Social Media"];

const CATEGORY_COLORS: Record<Category, string> = {
  "Sales Rebuttals": "bg-red-900/60 text-red-300 hover:bg-red-800/60",
  "Phone Scripts": "bg-teal-900/60 text-teal-300 hover:bg-teal-800/60",
  "All": "bg-slate-800 text-white hover:bg-slate-700",
  "SEO": "bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800/60",
  "Web Dev": "bg-blue-900/60 text-blue-300 hover:bg-blue-800/60",
  "CRM": "bg-orange-900/60 text-orange-300 hover:bg-orange-800/60",
  "Automation": "bg-violet-900/60 text-violet-300 hover:bg-violet-800/60",
  "Analytics": "bg-cyan-900/60 text-cyan-300 hover:bg-cyan-800/60",
  "Hosting": "bg-sky-900/60 text-sky-300 hover:bg-sky-800/60",
  "Copywriting": "bg-yellow-900/60 text-yellow-300 hover:bg-yellow-800/60",
  "Social Media": "bg-pink-900/60 text-pink-300 hover:bg-pink-800/60",
};

const CATEGORY_BADGE_COLORS: Record<Category, string> = {
  "Sales Rebuttals": "bg-red-900 text-red-300",
  "Phone Scripts": "bg-teal-900 text-teal-300",
  "All": "bg-slate-700 text-slate-200",
  "SEO": "bg-emerald-900 text-emerald-300",
  "Web Dev": "bg-blue-900 text-blue-300",
  "CRM": "bg-orange-900 text-orange-300",
  "Automation": "bg-violet-900 text-violet-300",
  "Analytics": "bg-cyan-900 text-cyan-300",
  "Hosting": "bg-sky-900 text-sky-300",
  "Copywriting": "bg-yellow-900 text-yellow-300",
  "Social Media": "bg-pink-900 text-pink-300",
};

// ─── Article Card ─────────────────────────────────────────────────────────────
function ArticleCard({ article, onClick }: { article: Article; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-[oklch(0.13_0.01_260)] rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-white/15 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-[oklch(0.1_0.01_260)]">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.13_0.01_260)] via-transparent to-transparent" />
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_BADGE_COLORS[article.category]}`}>
          {article.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-black text-white leading-tight mb-2 group-hover:text-[oklch(0.65_0.2_25)] transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-white/50 leading-relaxed mb-4 line-clamp-2">
          {article.subtitle}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-white/30 text-xs">
            <Clock size={12} />
            <span>{article.readTime} min read</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[oklch(0.5_0.2_25)] flex items-center justify-center group-hover:bg-[oklch(0.55_0.22_25)] transition-colors">
            <ArrowRight size={14} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Article Detail View ──────────────────────────────────────────────────────
function ArticleDetail({ article, onBack }: { article: Article; onBack: () => void }) {
  // Simple markdown-like renderer for the content
  const renderContent = (text: string) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="text-2xl font-black text-white mt-8 mb-4 first:mt-0">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="text-lg font-bold text-white/90 mt-6 mb-3">
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith("| ")) {
        // Table
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].startsWith("|")) {
          tableLines.push(lines[i]);
          i++;
        }
        const headers = tableLines[0].split("|").filter(Boolean).map(h => h.trim());
        const rows = tableLines.slice(2).map(row => row.split("|").filter(Boolean).map(c => c.trim()));
        elements.push(
          <div key={`table-${i}`} className="overflow-x-auto my-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {headers.map((h, hi) => (
                    <th key={hi} className="text-left py-2 px-3 text-white/60 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-white/5 hover:bg-white/3">
                    {row.map((cell, ci) => (
                      <td key={ci} className="py-2.5 px-3 text-white/70" dangerouslySetInnerHTML={{ __html: cell.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      } else if (line.startsWith("- ")) {
        const listItems: string[] = [];
        while (i < lines.length && lines[i].startsWith("- ")) {
          listItems.push(lines[i].slice(2));
          i++;
        }
        elements.push(
          <ul key={`ul-${i}`} className="my-3 space-y-1.5 pl-4">
            {listItems.map((item, li) => (
              <li key={li} className="text-white/65 text-sm flex gap-2">
                <span className="text-[oklch(0.5_0.2_25)] mt-1 flex-shrink-0">•</span>
                <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>').replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 rounded text-xs text-white/80">$1</code>') }} />
              </li>
            ))}
          </ul>
        );
        continue;
      } else if (line.trim() === "") {
        elements.push(<div key={i} className="h-2" />);
      } else {
        const html = line
          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
          .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-xs text-white/80 font-mono">$1</code>');
        elements.push(
          <p key={i} className="text-white/65 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
        );
      }
      i++;
    }
    return elements;
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Knowledge Center
      </button>

      {/* Hero image */}
      <div className="relative h-56 rounded-2xl overflow-hidden mb-8">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full mb-3 inline-block ${CATEGORY_BADGE_COLORS[article.category]}`}>
            {article.category}
          </span>
          <h1 className="text-3xl font-black text-white leading-tight">{article.title}</h1>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 mb-8 text-white/40 text-sm">
        <div className="flex items-center gap-1.5">
          <Clock size={14} />
          <span>{article.readTime} min read</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BookOpen size={14} />
          <span>{article.subtitle}</span>
        </div>
      </div>

      {/* Content */}
      <div className="bg-[oklch(0.13_0.01_260)] rounded-2xl p-8 border border-white/5">
        {renderContent(article.content)}
      </div>
    </div>
  );
}

// ─── Sales Decks Data ─────────────────────────────────────────────────────────
interface SalesDeck {
  id: string;
  industry: string;
  title: string;
  description: string;
  slideCount: number;
  deckUrl: string;
  iconColor: string;
  borderColor: string;
  icon: LucideIcon;
}

const SALES_DECKS: SalesDeck[] = [
  {
    id: "martial-arts",
    industry: "Martial Arts & Dojos",
    title: "Martial Arts & Dojos Sales Deck",
    description: "High-converting pitch deck for martial arts schools and dojos. Covers DojoFlow integration, automated enrollment funnels, and the ROI of a lead-generating website.",
    slideCount: 12,
    deckUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031545745/FAciCjJmvkCLmLVM.pdf",
    iconColor: "text-red-400",
    borderColor: "border-red-500/20 hover:border-red-500/40",
    icon: Swords,
  },
  {
    id: "fitness-studios",
    industry: "Fitness Studios & Gyms",
    title: "Fitness Studios & Gyms Sales Deck",
    description: "Purpose-built pitch deck for fitness studios, gyms, and personal trainers. Highlights lead capture automation, membership conversion, and class booking integration.",
    slideCount: 12,
    deckUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031545745/mbtbmvjncLzAqFgm.pdf",
    iconColor: "text-orange-400",
    borderColor: "border-orange-500/20 hover:border-orange-500/40",
    icon: Dumbbell,
  },
  {
    id: "health-wellness",
    industry: "Health & Wellness",
    title: "Health & Wellness Sales Deck",
    description: "Tailored pitch deck for health and wellness businesses — spas, yoga studios, holistic practices. Emphasizes trust-building design, online booking, and client journey automation.",
    slideCount: 12,
    deckUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031545745/HfyifvYNwonFSDPH.pdf",
    iconColor: "text-emerald-400",
    borderColor: "border-emerald-500/20 hover:border-emerald-500/40",
    icon: Leaf,
  },
  {
    id: "restaurants",
    industry: "Restaurants",
    title: "Restaurants Sales Deck",
    description: "Restaurant-specific pitch deck covering online ordering integration, reservation systems, menu SEO, and automated review generation to fill more tables.",
    slideCount: 12,
    deckUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031545745/UmzdXQIQgqXwGmua.pdf",
    iconColor: "text-yellow-400",
    borderColor: "border-yellow-500/20 hover:border-yellow-500/40",
    icon: UtensilsCrossed,
  },
  {
    id: "service-businesses",
    industry: "Service Businesses",
    title: "Service Businesses Sales Deck",
    description: "Built-tough pitch deck for contractors, HVAC, plumbing, and other service businesses. Focuses on instant lead response, local SEO dominance, and booking more jobs.",
    slideCount: 12,
    deckUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031545745/ZvvuLOJmgiZggGtb.pdf",
    iconColor: "text-amber-400",
    borderColor: "border-amber-500/20 hover:border-amber-500/40",
    icon: Wrench,
  },
  {
    id: "counseling",
    industry: "Counseling & Mental Health",
    title: "Counseling & Mental Health Sales Deck",
    description: "Compassionate, trust-focused pitch deck for therapists and mental health practices. Covers HIPAA-conscious design, online intake forms, and automated client communication.",
    slideCount: 12,
    deckUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310419663031545745/uhgFEoLgyZtYntLz.pdf",
    iconColor: "text-teal-400",
    borderColor: "border-teal-500/20 hover:border-teal-500/40",
    icon: Heart,
  },
];

// ─── Sales Deck Card ──────────────────────────────────────────────────────────
function SalesDeckCard({ deck }: { deck: SalesDeck }) {
  const Icon = deck.icon;
  return (
    <div className={`group flex flex-col bg-card border ${deck.borderColor} rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5`}>
      {/* Header */}
      <div className="p-5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-9 h-9 rounded-lg bg-muted flex items-center justify-center`}>
            <Icon size={18} className={deck.iconColor} />
          </div>
          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
            {deck.slideCount} slides
          </span>
        </div>
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${deck.iconColor}`}>{deck.industry}</p>
        <h3 className="text-sm font-semibold text-foreground leading-snug mb-2">{deck.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{deck.description}</p>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5">
        <a
          href={deck.deckUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground transition-all duration-150"
        >
          <Presentation size={13} />
          Open Deck
          <ExternalLink size={11} className="opacity-50" />
        </a>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
type MainTab = "articles" | "lessons" | "decks";

export default function KnowledgeCenter() {
  const [mainTab, setMainTab] = useState<MainTab>("articles");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const { user } = useAuth();

  const { data: lessons, isLoading: lessonsLoading } = trpc.learning.getLessons.useQuery();
  const { data: myProgress } = trpc.learning.getMyProgress.useQuery(undefined, { enabled: !!user });
  const seedMut = trpc.learning.seedLessons.useMutation();
  const utils = trpc.useUtils();

  const filtered = useMemo(() => {
    return ARTICLES.filter(a => {
      const matchesCategory = activeCategory === "All" || a.category === activeCategory;
      const q = search.toLowerCase();
      const matchesSearch = !q || a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  if (selectedArticle) {
    return (
      <div className="p-6 md:p-8">
        <ArticleDetail article={selectedArticle} onBack={() => setSelectedArticle(null)} />
      </div>
    );
  }

  if (selectedLessonId !== null) {
    return (
      <div className="p-6 md:p-8">
        <LessonViewer lessonId={selectedLessonId} onBack={() => setSelectedLessonId(null)} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white mb-2">Knowledge Center</h1>
        <p className="text-white/50 text-sm">
          Everything your team needs to know about websites, SEO, CRM, and digital marketing — explained in plain English.
        </p>
      </div>

      {/* Main tabs */}
      <div className="flex gap-1 mb-6 bg-[oklch(0.13_0.01_260)] rounded-xl p-1 w-fit">
        <button
          onClick={() => setMainTab("articles")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            mainTab === "articles"
              ? "bg-[oklch(0.5_0.2_25)] text-white shadow"
              : "text-white/50 hover:text-white"
          }`}
        >
          <BookOpen size={15} /> Articles
        </button>
        <button
          onClick={() => setMainTab("lessons")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            mainTab === "lessons"
              ? "bg-[oklch(0.5_0.2_25)] text-white shadow"
              : "text-white/50 hover:text-white"
          }`}
        >
          <GraduationCap size={15} /> Lessons & Quizzes
          {lessons && lessons.length > 0 && (
            <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">{lessons.length}</span>
          )}
        </button>
        <button
          onClick={() => setMainTab("decks")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            mainTab === "decks"
              ? "bg-[oklch(0.5_0.2_25)] text-white shadow"
              : "text-white/50 hover:text-white"
          }`}
        >
          <Presentation size={15} /> Sales Decks
          <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">{SALES_DECKS.length}</span>
        </button>
      </div>

      {/* ── ARTICLES TAB ── */}
      {mainTab === "articles" && (
        <>
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search articles — try 'SEO', 'funnel', 'automation'..."
              className="pl-11 bg-[oklch(0.13_0.01_260)] border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl focus:border-[oklch(0.5_0.2_25)] text-sm"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-[oklch(0.5_0.2_25)] text-white shadow-lg shadow-[oklch(0.5_0.2_25_/_30%)]"
                    : CATEGORY_COLORS[cat]
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {search && (
            <p className="text-white/30 text-xs mb-4">
              {filtered.length} article{filtered.length !== 1 ? "s" : ""} found for "{search}"
            </p>
          )}

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(article => (
                <ArticleCard key={article.id} article={article} onClick={() => setSelectedArticle(article)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-white/30">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No articles found. Try a different search term.</p>
            </div>
          )}
        </>
      )}

      {/* ── SALES DECKS TAB ── */}
      {mainTab === "decks" && (
        <div>
          <div className="mb-6">
            <p className="text-white/50 text-sm">
              Industry-specific sales presentations ready to share with prospects. Each deck is tailored to the unique needs, pain points, and goals of that business type.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SALES_DECKS.map(deck => (
              <SalesDeckCard key={deck.id} deck={deck} />
            ))}
          </div>
        </div>
      )}

      {/* ── LESSONS TAB ── */}
      {mainTab === "lessons" && (
        <div className="space-y-6">
          {lessonsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : !lessons || lessons.length === 0 ? (
            <div className="text-center py-20">
              <GraduationCap size={48} className="mx-auto mb-4 text-white/20" />
              <p className="text-white/50 mb-2">No lessons loaded yet.</p>
              <p className="text-white/30 text-sm mb-6">Click below to load the lesson library.</p>
              <Button
                onClick={async () => {
                  await seedMut.mutateAsync();
                  utils.learning.getLessons.invalidate();
                }}
                disabled={seedMut.isPending}
              >
                {seedMut.isPending ? "Loading..." : "Load Lessons"}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(lessons as Array<{ id: number; title: string; category: string; description: string; estimatedMinutes: number; stepCount: number; questionCount: number }>).map(lesson => {
                const prog = (myProgress as Array<{ lessonId: number; quizPassed: number; completedSteps: number; bestScore: number }> | undefined)?.find(p => p.lessonId === lesson.id);
                const passed = (prog?.quizPassed ?? 0) === 1;
                const completedSteps = prog?.completedSteps ?? 0;
                const progressPct = lesson.stepCount > 0 ? Math.round((completedSteps / lesson.stepCount) * 100) : 0;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLessonId(lesson.id)}
                    className="group text-left bg-[oklch(0.13_0.01_260)] border border-white/10 rounded-2xl overflow-hidden hover:border-[oklch(0.5_0.2_25_/_50%)] hover:shadow-lg hover:shadow-[oklch(0.5_0.2_25_/_10%)] transition-all duration-300"
                  >
                    {/* Color bar by category */}
                    <div className={`h-1.5 w-full ${
                      lesson.category === "SEO" ? "bg-gradient-to-r from-orange-500 to-yellow-500" :
                      lesson.category === "Web Dev" ? "bg-gradient-to-r from-blue-500 to-cyan-500" :
                      lesson.category === "CRM" ? "bg-gradient-to-r from-purple-500 to-pink-500" :
                      lesson.category === "Automation" ? "bg-gradient-to-r from-green-500 to-emerald-500" :
                      lesson.category === "Analytics" ? "bg-gradient-to-r from-cyan-500 to-blue-500" :
                      "bg-gradient-to-r from-red-500 to-orange-500"
                    }`} />
                    <div className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1">{lesson.category}</p>
                          <h3 className="font-bold text-white text-base leading-snug group-hover:text-[oklch(0.7_0.15_25)] transition-colors">
                            {lesson.title}
                          </h3>
                        </div>
                        {passed && (
                          <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-white/50 text-xs line-clamp-2">{lesson.description}</p>
                      <div className="flex items-center justify-between text-xs text-white/40">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {lesson.estimatedMinutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen size={12} /> {lesson.stepCount} steps
                        </span>
                        {lesson.questionCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Trophy size={12} /> {lesson.questionCount} questions
                          </span>
                        )}
                      </div>
                      {/* Progress bar */}
                      {prog && progressPct > 0 && (
                        <div className="space-y-1">
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                passed ? "bg-green-500" : "bg-[oklch(0.5_0.2_25)]"
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <p className="text-xs text-white/30">
                            {passed ? (
                              <span className="text-green-400 flex items-center gap-1"><CheckCircle2 size={11} /> Completed — {prog.bestScore}% score</span>
                            ) : (
                              `${progressPct}% read`
                            )}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[oklch(0.5_0.2_25)] group-hover:gap-2.5 transition-all">
                        <Play size={12} className="fill-current" />
                        {passed ? "Review Lesson" : progressPct > 0 ? "Continue" : "Start Lesson"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
