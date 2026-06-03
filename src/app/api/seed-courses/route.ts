import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

const MBA_COURSES = [
  // Core MBA Programs
  { title: "Master of Business Administration (MBA)", slug: "mba", description: "Comprehensive MBA program covering all core business disciplines.", category: "MBA", icon: "🎓", gradient: "linear-gradient(135deg, #1E3A8A, #3B82F6)", difficulty: "Advanced" },
  { title: "Executive MBA (EMBA)", slug: "emba", description: "MBA designed for working executives with leadership experience.", category: "MBA", icon: "💼", gradient: "linear-gradient(135deg, #1e1b4b, #4338ca)", difficulty: "Advanced" },
  { title: "Online MBA", slug: "online-mba", description: "Flexible online MBA program for professionals.", category: "MBA", icon: "💻", gradient: "linear-gradient(135deg, #1E3A8A, #2563eb)", difficulty: "Advanced" },
  { title: "Global MBA", slug: "global-mba", description: "International business MBA with a global perspective.", category: "MBA", icon: "🌍", gradient: "linear-gradient(135deg, #064E3B, #10B981)", difficulty: "Advanced" },
  { title: "Integrated MBA", slug: "integrated-mba", description: "5-year integrated MBA combining undergraduate and postgraduate studies.", category: "MBA", icon: "🔗", gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)", difficulty: "Intermediate" },
  { title: "Mini MBA", slug: "mini-mba", description: "Condensed business program covering MBA essentials.", category: "MBA", icon: "⚡", gradient: "linear-gradient(135deg, #F59E0B, #EF4444)", difficulty: "Beginner" },

  // Business Strategy & Management
  { title: "Business Strategy", slug: "business-strategy", description: "Master the art of business strategy and competitive advantage.", category: "Business Strategy", icon: "📈", gradient: "linear-gradient(135deg, #1E3A8A, #3B82F6)", difficulty: "Intermediate" },
  { title: "Strategic Management", slug: "strategic-management", description: "Learn long-term planning and strategic decision-making.", category: "Business Strategy", icon: "🎯", gradient: "linear-gradient(135deg, #312E81, #6366F1)", difficulty: "Advanced" },
  { title: "Corporate Strategy", slug: "corporate-strategy", description: "Develop corporate-level strategic thinking.", category: "Business Strategy", icon: "🏢", gradient: "linear-gradient(135deg, #1e1b4b, #4338ca)", difficulty: "Advanced" },
  { title: "Competitive Analysis", slug: "competitive-analysis", description: "Analyze markets and competitors to gain business advantages.", category: "Business Strategy", icon: "🔍", gradient: "linear-gradient(135deg, #374151, #6B7280)", difficulty: "Intermediate" },
  { title: "Business Development", slug: "business-development", description: "Drive growth through strategic partnerships and opportunities.", category: "Business Strategy", icon: "🚀", gradient: "linear-gradient(135deg, #065F46, #10B981)", difficulty: "Intermediate" },
  { title: "Change Management", slug: "change-management", description: "Lead organizational transformation effectively.", category: "Business Strategy", icon: "🔄", gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)", difficulty: "Intermediate" },
  { title: "Crisis Management", slug: "crisis-management", description: "Handle business crises and build organizational resilience.", category: "Business Strategy", icon: "🆘", gradient: "linear-gradient(135deg, #7F1D1D, #EF4444)", difficulty: "Advanced" },
  { title: "Family Business Management", slug: "family-business-management", description: "Manage and grow family-owned enterprises.", category: "Business Strategy", icon: "👨‍👩‍👧", gradient: "linear-gradient(135deg, #78350F, #F59E0B)", difficulty: "Intermediate" },
  { title: "International Business", slug: "international-business", description: "Navigate global markets and international trade.", category: "Business Strategy", icon: "🌐", gradient: "linear-gradient(135deg, #064E3B, #10B981)", difficulty: "Intermediate" },
  { title: "Business Communication", slug: "business-communication", description: "Master professional communication in the workplace.", category: "Business Strategy", icon: "💬", gradient: "linear-gradient(135deg, #1E3A8A, #60a5fa)", difficulty: "Beginner" },

  // Marketing
  { title: "Digital Marketing", slug: "digital-marketing", description: "Master modern digital marketing strategies and tools.", category: "Marketing", icon: "📱", gradient: "linear-gradient(135deg, #7C3AED, #EC4899)", difficulty: "Beginner" },
  { title: "Social Media Marketing", slug: "social-media-marketing", description: "Grow brands across social media platforms.", category: "Marketing", icon: "📲", gradient: "linear-gradient(135deg, #EC4899, #F97316)", difficulty: "Beginner" },
  { title: "SEO Optimization", slug: "seo-optimization", description: "Optimize websites to rank higher in search engines.", category: "Marketing", icon: "🔍", gradient: "linear-gradient(135deg, #065F46, #10B981)", difficulty: "Intermediate" },
  { title: "Content Marketing", slug: "content-marketing", description: "Create and distribute valuable content to attract customers.", category: "Marketing", icon: "✍️", gradient: "linear-gradient(135deg, #F59E0B, #EF4444)", difficulty: "Beginner" },
  { title: "Brand Management", slug: "brand-management", description: "Build and manage powerful brand identities.", category: "Marketing", icon: "🏷️", gradient: "linear-gradient(135deg, #4C1D95, #8B5CF6)", difficulty: "Intermediate" },
  { title: "Influencer Marketing", slug: "influencer-marketing", description: "Leverage influencers for brand growth.", category: "Marketing", icon: "⭐", gradient: "linear-gradient(135deg, #EC4899, #F97316)", difficulty: "Beginner" },
  { title: "Email Marketing", slug: "email-marketing", description: "Design and execute high-converting email campaigns.", category: "Marketing", icon: "📧", gradient: "linear-gradient(135deg, #1E3A8A, #3B82F6)", difficulty: "Beginner" },
  { title: "Performance Marketing", slug: "performance-marketing", description: "Drive measurable results with data-driven marketing.", category: "Marketing", icon: "📊", gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)", difficulty: "Intermediate" },
  { title: "Market Research", slug: "market-research", description: "Conduct effective market and consumer research.", category: "Marketing", icon: "📋", gradient: "linear-gradient(135deg, #374151, #6B7280)", difficulty: "Intermediate" },
  { title: "Consumer Behaviour", slug: "consumer-behaviour", description: "Understand consumer psychology and purchasing decisions.", category: "Marketing", icon: "🧠", gradient: "linear-gradient(135deg, #831843, #F43F5E)", difficulty: "Intermediate" },
  { title: "Advertising & Media Planning", slug: "advertising-media-planning", description: "Plan and execute effective advertising campaigns.", category: "Marketing", icon: "📺", gradient: "linear-gradient(135deg, #1e1b4b, #4338ca)", difficulty: "Intermediate" },
  { title: "Sales Management", slug: "sales-management", description: "Lead and optimize sales teams and strategies.", category: "Marketing", icon: "🤝", gradient: "linear-gradient(135deg, #065F46, #10B981)", difficulty: "Intermediate" },

  // Finance
  { title: "Corporate Finance", slug: "corporate-finance", description: "Financial management decisions in corporations.", category: "Finance", icon: "🏦", gradient: "linear-gradient(135deg, #064E3B, #10B981)", difficulty: "Advanced" },
  { title: "Investment Banking", slug: "investment-banking", description: "Understand investment banking operations and deals.", category: "Finance", icon: "💹", gradient: "linear-gradient(135deg, #1E3A8A, #3B82F6)", difficulty: "Advanced" },
  { title: "Financial Modeling", slug: "financial-modeling", description: "Build financial models for business decision-making.", category: "Finance", icon: "📉", gradient: "linear-gradient(135deg, #312E81, #6366F1)", difficulty: "Advanced" },
  { title: "Stock Market Trading", slug: "stock-market-trading", description: "Learn to trade stocks and understand capital markets.", category: "Finance", icon: "📈", gradient: "linear-gradient(135deg, #065F46, #10B981)", difficulty: "Intermediate" },
  { title: "Wealth Management", slug: "wealth-management", description: "Manage and grow personal and institutional wealth.", category: "Finance", icon: "💰", gradient: "linear-gradient(135deg, #78350F, #F59E0B)", difficulty: "Advanced" },
  { title: "Risk Management", slug: "risk-management", description: "Identify and mitigate financial and business risks.", category: "Finance", icon: "🛡️", gradient: "linear-gradient(135deg, #7F1D1D, #EF4444)", difficulty: "Advanced" },
  { title: "Banking Operations", slug: "banking-operations", description: "Understand core banking processes and systems.", category: "Finance", icon: "🏧", gradient: "linear-gradient(135deg, #1E3A8A, #2563eb)", difficulty: "Intermediate" },
  { title: "Financial Analysis", slug: "financial-analysis", description: "Analyze financial statements and business performance.", category: "Finance", icon: "🔢", gradient: "linear-gradient(135deg, #374151, #6B7280)", difficulty: "Intermediate" },
  { title: "Portfolio Management", slug: "portfolio-management", description: "Construct and manage investment portfolios.", category: "Finance", icon: "📊", gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)", difficulty: "Advanced" },
  { title: "Taxation", slug: "taxation", description: "Understand tax laws, planning, and compliance.", category: "Finance", icon: "📑", gradient: "linear-gradient(135deg, #78350F, #B45309)", difficulty: "Intermediate" },
  { title: "Auditing", slug: "auditing", description: "Learn the principles and practices of auditing.", category: "Finance", icon: "🔎", gradient: "linear-gradient(135deg, #374151, #111827)", difficulty: "Intermediate" },
  { title: "FinTech", slug: "fintech", description: "Explore financial technology innovations.", category: "Finance", icon: "💡", gradient: "linear-gradient(135deg, #0F6E56, #15B8A6)", difficulty: "Intermediate" },
  { title: "Cryptocurrency & Blockchain Finance", slug: "cryptocurrency-blockchain-finance", description: "Understand crypto assets and blockchain-based finance.", category: "Finance", icon: "₿", gradient: "linear-gradient(135deg, #78350F, #F59E0B)", difficulty: "Intermediate" },

  // Accounting
  { title: "Financial Accounting", slug: "financial-accounting", description: "Core principles of financial accounting and reporting.", category: "Accounting", icon: "📒", gradient: "linear-gradient(135deg, #1E3A8A, #3B82F6)", difficulty: "Beginner" },
  { title: "Cost Accounting", slug: "cost-accounting", description: "Track and analyze production costs.", category: "Accounting", icon: "🧮", gradient: "linear-gradient(135deg, #374151, #6B7280)", difficulty: "Intermediate" },
  { title: "Management Accounting", slug: "management-accounting", description: "Use accounting data for internal business decisions.", category: "Accounting", icon: "📊", gradient: "linear-gradient(135deg, #312E81, #6366F1)", difficulty: "Intermediate" },
  { title: "GST & Taxation", slug: "gst-taxation", description: "Master GST filing, compliance, and tax management.", category: "Accounting", icon: "📑", gradient: "linear-gradient(135deg, #065F46, #10B981)", difficulty: "Intermediate" },
  { title: "Tally ERP", slug: "tally-erp", description: "Use Tally ERP for accounting and business management.", category: "Accounting", icon: "🖥️", gradient: "linear-gradient(135deg, #1e1b4b, #4338ca)", difficulty: "Beginner" },
  { title: "Payroll Management", slug: "payroll-management", description: "Manage employee salaries, taxes, and compliance.", category: "Accounting", icon: "💵", gradient: "linear-gradient(135deg, #065F46, #10B981)", difficulty: "Beginner" },
  { title: "IFRS Standards", slug: "ifrs-standards", description: "International financial reporting standards explained.", category: "Accounting", icon: "🌐", gradient: "linear-gradient(135deg, #374151, #6B7280)", difficulty: "Advanced" },
  { title: "SAP FICO", slug: "sap-fico", description: "SAP Financial Accounting and Controlling module training.", category: "Accounting", icon: "⚙️", gradient: "linear-gradient(135deg, #1E3A8A, #3B82F6)", difficulty: "Advanced" },
  { title: "Bookkeeping", slug: "bookkeeping", description: "Learn fundamental bookkeeping practices.", category: "Accounting", icon: "📔", gradient: "linear-gradient(135deg, #78350F, #B45309)", difficulty: "Beginner" },

  // HR
  { title: "Human Resource Management", slug: "human-resource-management", description: "Manage people and organizational effectiveness.", category: "HR", icon: "👨‍💼", gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)", difficulty: "Intermediate" },
  { title: "Talent Acquisition", slug: "talent-acquisition", description: "Recruit, screen, and hire top talent.", category: "HR", icon: "🎯", gradient: "linear-gradient(135deg, #065F46, #10B981)", difficulty: "Intermediate" },
  { title: "Payroll & Compensation", slug: "payroll-compensation", description: "Design compensation structures and manage payroll.", category: "HR", icon: "💰", gradient: "linear-gradient(135deg, #78350F, #F59E0B)", difficulty: "Intermediate" },
  { title: "Organizational Behaviour", slug: "organizational-behaviour", description: "Study how people interact within organizations.", category: "HR", icon: "🏢", gradient: "linear-gradient(135deg, #312E81, #6366F1)", difficulty: "Intermediate" },
  { title: "Employee Relations", slug: "employee-relations", description: "Build positive workplace relationships and culture.", category: "HR", icon: "🤝", gradient: "linear-gradient(135deg, #065F46, #10B981)", difficulty: "Beginner" },
  { title: "HR Analytics", slug: "hr-analytics", description: "Use data analytics to improve HR decisions.", category: "HR", icon: "📊", gradient: "linear-gradient(135deg, #1E3A8A, #3B82F6)", difficulty: "Intermediate" },
  { title: "Leadership Development", slug: "leadership-development", description: "Build strong leaders at every organizational level.", category: "HR", icon: "👑", gradient: "linear-gradient(135deg, #78350F, #F59E0B)", difficulty: "Intermediate" },
  { title: "Training & Development", slug: "training-development", description: "Design and deliver effective employee training programs.", category: "HR", icon: "📚", gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)", difficulty: "Intermediate" },
  { title: "Performance Management", slug: "performance-management", description: "Set goals and manage employee performance.", category: "HR", icon: "📈", gradient: "linear-gradient(135deg, #065F46, #10B981)", difficulty: "Intermediate" },

  // Operations & Supply Chain
  { title: "Operations Management", slug: "operations-management", description: "Optimize business operations for efficiency.", category: "Operations", icon: "⚙️", gradient: "linear-gradient(135deg, #374151, #6B7280)", difficulty: "Intermediate" },
  { title: "Supply Chain Management", slug: "supply-chain-management", description: "Manage the flow of goods from production to delivery.", category: "Operations", icon: "🚚", gradient: "linear-gradient(135deg, #1E3A8A, #3B82F6)", difficulty: "Intermediate" },
  { title: "Logistics Management", slug: "logistics-management", description: "Plan and control the movement of goods.", category: "Operations", icon: "🏭", gradient: "linear-gradient(135deg, #064E3B, #10B981)", difficulty: "Intermediate" },
  { title: "Procurement Management", slug: "procurement-management", description: "Sourcing and purchasing for organizations.", category: "Operations", icon: "🛒", gradient: "linear-gradient(135deg, #78350F, #B45309)", difficulty: "Intermediate" },
  { title: "Inventory Management", slug: "inventory-management", description: "Track and manage stock levels effectively.", category: "Operations", icon: "📦", gradient: "linear-gradient(135deg, #374151, #111827)", difficulty: "Beginner" },
  { title: "Lean Six Sigma", slug: "lean-six-sigma", description: "Eliminate waste and reduce variation in processes.", category: "Operations", icon: "🔧", gradient: "linear-gradient(135deg, #312E81, #6366F1)", difficulty: "Advanced" },
  { title: "Production Planning", slug: "production-planning", description: "Plan and schedule manufacturing operations.", category: "Operations", icon: "🏗️", gradient: "linear-gradient(135deg, #374151, #6B7280)", difficulty: "Intermediate" },
  { title: "Quality Management", slug: "quality-management", description: "Maintain and improve product and service quality.", category: "Operations", icon: "✅", gradient: "linear-gradient(135deg, #065F46, #10B981)", difficulty: "Intermediate" },

  // Business Analytics
  { title: "Business Analytics", slug: "business-analytics", description: "Use analytics to drive strategic business decisions.", category: "Analytics", icon: "📊", gradient: "linear-gradient(135deg, #1E3A8A, #3B82F6)", difficulty: "Intermediate" },
  { title: "Data Analytics for Business", slug: "data-analytics-business", description: "Apply data analysis techniques to business problems.", category: "Analytics", icon: "📉", gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)", difficulty: "Intermediate" },
  { title: "Power BI", slug: "power-bi", description: "Create interactive dashboards and business reports.", category: "Analytics", icon: "⚡", gradient: "linear-gradient(135deg, #F59E0B, #EF4444)", difficulty: "Beginner" },
  { title: "Excel for Business", slug: "excel-for-business", description: "Master Excel for business data analysis and reporting.", category: "Analytics", icon: "📋", gradient: "linear-gradient(135deg, #065F46, #10B981)", difficulty: "Beginner" },
  { title: "Tableau", slug: "tableau", description: "Visualize and analyze data with Tableau.", category: "Analytics", icon: "📊", gradient: "linear-gradient(135deg, #1E3A8A, #60a5fa)", difficulty: "Intermediate" },
  { title: "AI for Business", slug: "ai-for-business", description: "Leverage AI tools and strategies in business.", category: "Analytics", icon: "🤖", gradient: "linear-gradient(135deg, #4C1D95, #8B5CF6)", difficulty: "Intermediate" },
  { title: "Predictive Analytics", slug: "predictive-analytics", description: "Forecast trends using advanced analytics techniques.", category: "Analytics", icon: "🔮", gradient: "linear-gradient(135deg, #312E81, #6366F1)", difficulty: "Advanced" },
  { title: "Business Intelligence", slug: "business-intelligence", description: "Transform data into actionable business insights.", category: "Analytics", icon: "💡", gradient: "linear-gradient(135deg, #0F6E56, #15B8A6)", difficulty: "Intermediate" },
  { title: "Decision Science", slug: "decision-science", description: "Apply data-driven methods to business decision-making.", category: "Analytics", icon: "🧠", gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)", difficulty: "Advanced" },

  // Entrepreneurship
  { title: "Entrepreneurship", slug: "entrepreneurship", description: "Build and launch your own successful business.", category: "Entrepreneurship", icon: "🚀", gradient: "linear-gradient(135deg, #F59E0B, #EF4444)", difficulty: "Beginner" },
  { title: "Startup Fundamentals", slug: "startup-fundamentals", description: "Core concepts every startup founder needs to know.", category: "Entrepreneurship", icon: "💡", gradient: "linear-gradient(135deg, #065F46, #10B981)", difficulty: "Beginner" },
  { title: "Venture Capital", slug: "venture-capital", description: "Understand how venture capital funding works.", category: "Entrepreneurship", icon: "💰", gradient: "linear-gradient(135deg, #1E3A8A, #3B82F6)", difficulty: "Advanced" },
  { title: "Fundraising for Startups", slug: "fundraising-startups", description: "Raise capital for your startup effectively.", category: "Entrepreneurship", icon: "📈", gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)", difficulty: "Intermediate" },
  { title: "Product Management", slug: "product-management", description: "Lead product development from idea to launch.", category: "Entrepreneurship", icon: "🎯", gradient: "linear-gradient(135deg, #0F6E56, #15B8A6)", difficulty: "Intermediate" },
  { title: "Startup Scaling", slug: "startup-scaling", description: "Scale your startup from growth to enterprise.", category: "Entrepreneurship", icon: "📊", gradient: "linear-gradient(135deg, #312E81, #6366F1)", difficulty: "Advanced" },
  { title: "Innovation Management", slug: "innovation-management", description: "Foster and manage innovation in organizations.", category: "Entrepreneurship", icon: "💡", gradient: "linear-gradient(135deg, #F59E0B, #F97316)", difficulty: "Intermediate" },
  { title: "Business Pitching", slug: "business-pitching", description: "Craft and deliver winning investor pitches.", category: "Entrepreneurship", icon: "🎤", gradient: "linear-gradient(135deg, #831843, #F43F5E)", difficulty: "Intermediate" },
  { title: "Startup Legal Basics", slug: "startup-legal-basics", description: "Legal essentials every startup founder needs.", category: "Entrepreneurship", icon: "⚖️", gradient: "linear-gradient(135deg, #451A03, #92400E)", difficulty: "Beginner" },

  // Leadership & Soft Skills
  { title: "Leadership Skills", slug: "leadership-skills", description: "Develop essential leadership qualities for success.", category: "Leadership", icon: "👑", gradient: "linear-gradient(135deg, #78350F, #F59E0B)", difficulty: "Beginner" },
  { title: "Public Speaking", slug: "public-speaking", description: "Speak confidently and persuasively in public.", category: "Leadership", icon: "🎤", gradient: "linear-gradient(135deg, #EC4899, #F97316)", difficulty: "Beginner" },
  { title: "Negotiation Skills", slug: "negotiation-skills", description: "Win negotiations in business and life.", category: "Leadership", icon: "🤝", gradient: "linear-gradient(135deg, #065F46, #10B981)", difficulty: "Intermediate" },
  { title: "Team Management", slug: "team-management", description: "Lead high-performing teams to achieve goals.", category: "Leadership", icon: "👥", gradient: "linear-gradient(135deg, #1E3A8A, #3B82F6)", difficulty: "Intermediate" },
  { title: "Emotional Intelligence", slug: "emotional-intelligence", description: "Develop EQ for better relationships and leadership.", category: "Leadership", icon: "❤️", gradient: "linear-gradient(135deg, #831843, #F43F5E)", difficulty: "Beginner" },
  { title: "Time Management", slug: "time-management", description: "Master productivity and prioritization skills.", category: "Leadership", icon: "⏰", gradient: "linear-gradient(135deg, #374151, #6B7280)", difficulty: "Beginner" },
  { title: "Conflict Resolution", slug: "conflict-resolution", description: "Resolve workplace conflicts constructively.", category: "Leadership", icon: "🕊️", gradient: "linear-gradient(135deg, #065F46, #10B981)", difficulty: "Intermediate" },
  { title: "Corporate Etiquette", slug: "corporate-etiquette", description: "Professional behavior and business manners.", category: "Leadership", icon: "🎩", gradient: "linear-gradient(135deg, #374151, #111827)", difficulty: "Beginner" },

  // Specialized Business
  { title: "Hospital Management", slug: "hospital-management", description: "Manage healthcare facilities and operations.", category: "Specialized", icon: "🏥", gradient: "linear-gradient(135deg, #7F1D1D, #EF4444)", difficulty: "Advanced" },
  { title: "Hotel Management", slug: "hotel-management", description: "Manage hospitality operations and guest experience.", category: "Specialized", icon: "🏨", gradient: "linear-gradient(135deg, #78350F, #F59E0B)", difficulty: "Intermediate" },
  { title: "Retail Management", slug: "retail-management", description: "Manage retail stores and consumer businesses.", category: "Specialized", icon: "🛍️", gradient: "linear-gradient(135deg, #EC4899, #F97316)", difficulty: "Intermediate" },
  { title: "Aviation Management", slug: "aviation-management", description: "Manage aviation industry operations.", category: "Specialized", icon: "✈️", gradient: "linear-gradient(135deg, #1E3A8A, #3B82F6)", difficulty: "Advanced" },
  { title: "Event Management", slug: "event-management", description: "Plan and execute successful corporate events.", category: "Specialized", icon: "🎪", gradient: "linear-gradient(135deg, #4C1D95, #8B5CF6)", difficulty: "Intermediate" },
  { title: "Sports Management", slug: "sports-management", description: "Manage sports organizations and athlete careers.", category: "Specialized", icon: "⚽", gradient: "linear-gradient(135deg, #065F46, #10B981)", difficulty: "Intermediate" },
  { title: "Real Estate Management", slug: "real-estate-management", description: "Manage real estate properties and investments.", category: "Specialized", icon: "🏠", gradient: "linear-gradient(135deg, #312E81, #6366F1)", difficulty: "Intermediate" },
  { title: "Luxury Brand Management", slug: "luxury-brand-management", description: "Market and manage luxury brands.", category: "Specialized", icon: "💎", gradient: "linear-gradient(135deg, #374151, #111827)", difficulty: "Advanced" },
  { title: "Healthcare Administration", slug: "healthcare-administration", description: "Manage healthcare systems and administration.", category: "Specialized", icon: "⚕️", gradient: "linear-gradient(135deg, #831843, #F43F5E)", difficulty: "Advanced" },

  // Tech + Business
  { title: "SaaS Business Models", slug: "saas-business-models", description: "Understand and build software-as-a-service businesses.", category: "Tech Business", icon: "☁️", gradient: "linear-gradient(135deg, #0F6E56, #15B8A6)", difficulty: "Intermediate" },
  { title: "E-Commerce Management", slug: "ecommerce-management", description: "Build and manage profitable online stores.", category: "Tech Business", icon: "🛒", gradient: "linear-gradient(135deg, #F59E0B, #EF4444)", difficulty: "Intermediate" },
  { title: "Business Automation", slug: "business-automation", description: "Automate repetitive business processes with tools.", category: "Tech Business", icon: "🤖", gradient: "linear-gradient(135deg, #374151, #6B7280)", difficulty: "Intermediate" },
  { title: "ERP Systems", slug: "erp-systems", description: "Manage business operations with ERP software.", category: "Tech Business", icon: "⚙️", gradient: "linear-gradient(135deg, #1E3A8A, #3B82F6)", difficulty: "Advanced" },
  { title: "CRM Management", slug: "crm-management", description: "Manage customer relationships with CRM tools.", category: "Tech Business", icon: "👥", gradient: "linear-gradient(135deg, #065F46, #10B981)", difficulty: "Intermediate" },
  { title: "AI in Business", slug: "ai-in-business", description: "Apply artificial intelligence to transform business.", category: "Tech Business", icon: "🧠", gradient: "linear-gradient(135deg, #4C1D95, #8B5CF6)", difficulty: "Intermediate" },
  { title: "Cloud Business Solutions", slug: "cloud-business-solutions", description: "Leverage cloud technology for business efficiency.", category: "Tech Business", icon: "☁️", gradient: "linear-gradient(135deg, #312E81, #6366F1)", difficulty: "Intermediate" },

  // Emerging Trends
  { title: "Green Business & Sustainability", slug: "green-business-sustainability", description: "Build environmentally sustainable businesses.", category: "Emerging", icon: "🌱", gradient: "linear-gradient(135deg, #064E3B, #10B981)", difficulty: "Beginner" },
  { title: "ESG Management", slug: "esg-management", description: "Environmental, Social, and Governance business practices.", category: "Emerging", icon: "♻️", gradient: "linear-gradient(135deg, #065F46, #22C55E)", difficulty: "Intermediate" },
  { title: "Remote Team Management", slug: "remote-team-management", description: "Lead distributed teams effectively.", category: "Emerging", icon: "🏠", gradient: "linear-gradient(135deg, #1E3A8A, #3B82F6)", difficulty: "Intermediate" },
  { title: "Creator Economy Business", slug: "creator-economy-business", description: "Build a business in the creator economy.", category: "Emerging", icon: "🎬", gradient: "linear-gradient(135deg, #EC4899, #F97316)", difficulty: "Beginner" },
  { title: "Personal Branding", slug: "personal-branding", description: "Build a powerful personal brand.", category: "Emerging", icon: "✨", gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)", difficulty: "Beginner" },
  { title: "Startup Operations", slug: "startup-operations", description: "Build efficient operational systems for startups.", category: "Emerging", icon: "⚙️", gradient: "linear-gradient(135deg, #374151, #6B7280)", difficulty: "Intermediate" },
  { title: "Business Law", slug: "business-law", description: "Legal frameworks that govern business operations.", category: "Emerging", icon: "⚖️", gradient: "linear-gradient(135deg, #451A03, #92400E)", difficulty: "Intermediate" },
  { title: "Cybersecurity for Managers", slug: "cybersecurity-for-managers", description: "Protect your business from cyber threats.", category: "Emerging", icon: "🔐", gradient: "linear-gradient(135deg, #1e1b4b, #4338ca)", difficulty: "Intermediate" },
];

export async function POST() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Find the MBA & Business category
  const { data: categories } = await supabase.from("categories").select("*");
  const mbaCategory = categories?.find(c => c.name.includes("MBA") || c.name.includes("Business"));

  if (!mbaCategory) {
    return NextResponse.json({ error: "MBA & Business category not found. Please create it first." }, { status: 404 });
  }

  let seededCount = 0;
  let skippedCount = 0;

  for (const c of MBA_COURSES) {
    const { data: existing } = await supabase.from("courses").select("id").eq("slug", c.slug).single();
    if (existing) { skippedCount++; continue; }

    const { data: course, error } = await supabase.from("courses").insert({
      title: c.title,
      slug: c.slug,
      description: c.description,
      category: c.category,
      category_name: mbaCategory.name,
      category_id: mbaCategory.id,
      icon: c.icon,
      gradient: c.gradient,
      difficulty: c.difficulty,
      status: "published",
      price: 0,
      instructor_id: user.id
    }).select("id").single();

    if (error) { console.error(`Error inserting ${c.title}:`, error.message); continue; }

    const { data: mod } = await supabase.from("modules").insert({
      course_id: course.id,
      title: "Introduction to " + c.title,
      order_index: 1
    }).select("id").single();

    if (mod) {
      await supabase.from("lessons").insert({
        module_id: mod.id,
        title: "Welcome to " + c.title,
        slug: "welcome-" + c.slug,
        content: `## Welcome to ${c.title}!\n\nThis course is part of the MBA & Business domain. You'll learn everything about ${c.title.toLowerCase()} with expert-guided content.\n\n### What You'll Learn\n- Core concepts and fundamentals\n- Practical applications\n- Industry best practices\n- Real-world case studies\n\nLet's get started!`,
        lesson_type: "text",
        order_index: 1
      });
    }
    seededCount++;
  }

  return NextResponse.json({ 
    message: `✅ Successfully added ${seededCount} MBA & Business courses! (${skippedCount} already existed)` 
  });
}
