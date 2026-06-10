// ─── Domain Groups ────────────────────────────────────────────────────────────
export const DOMAIN_GROUPS: Record<string, string[]> = {
  "💻 Technology": [
    "HTML and CSS", "HTML", "CSS", "RWD", "Bootstrap", "Sass", "JavaScript", "TypeScript",
    "React", "Next.js", "Vue", "Angular", "jQuery", "Node.js", "Python", "PHP", "Java",
    "C", "C++", "C#", "Kotlin", "Rust", "Go", "Django", "SQL", "MySQL", "PostgreSQL",
    "MongoDB", "Redis", "GraphQL", "Git", "Bash", "Docker", "Kubernetes", "AWS", "Firebase",
    "AJAX", "JSON", "SVG", "Canvas"
  ],
  "🤖 AI & Data Science": [
    "AI", "Generative AI", "ChatGPT-4", "Machine Learning", "Deep Learning", "DSA",
    "Data Science", "NumPy", "Pandas", "SciPy", "Matplotlib", "Statistics",
    "Data Analytics", "Excel", "Google Sheets", "R", "TensorFlow", "PyTorch",
    "Computer Vision", "NLP", "LLMs", "Prompt Engineering"
  ],
  "🛡️ Cybersecurity": [
    "Cybersecurity", "Ethical Hacking", "Network Security", "Cloud Security",
    "Penetration Testing", "Cryptography", "Information Security", "SOC Analyst"
  ],
  "📊 MBA & Business": [
    "Business Strategy", "Marketing", "Finance", "Accounting", "Operations Management",
    "Organizational Behaviour", "Human Resources", "Economics", "Entrepreneurship",
    "Leadership", "Supply Chain", "Business Analytics", "Project Management",
    "Corporate Finance", "Investment Banking", "Private Equity", "Consulting"
  ],
  "⚖️ Law & Legal": [
    "Constitutional Law", "Contract Law", "Criminal Law", "Civil Law", "Corporate Law",
    "Intellectual Property", "International Law", "Environmental Law", "Family Law",
    "Tax Law", "Labour Law", "Legal Research", "Jurisprudence", "Cyber Law",
    "Banking & Finance Law", "Litigation", "Legal Writing"
  ],
  "🌾 Agriculture": [
    "Agronomy", "Soil Science", "Horticulture", "Plant Pathology", "Animal Husbandry",
    "Fisheries", "Agricultural Economics", "Farm Management", "Irrigation", "Organic Farming",
    "Precision Agriculture", "AgriTech", "Crop Protection", "Food Technology",
    "Sustainable Farming", "Dairy Science", "Poultry Management"
  ],
  "🏥 Healthcare": [
    "Anatomy", "Physiology", "Pharmacology", "Medical Ethics", "Public Health",
    "Epidemiology", "Nursing", "Medical Coding", "Health Informatics", "Clinical Research",
    "Telemedicine", "Mental Health", "Nutrition & Dietetics"
  ],
  "📐 Engineering": [
    "Civil Engineering", "Mechanical Engineering", "Electrical Engineering",
    "Electronics", "Chemical Engineering", "Aerospace", "Structural Analysis",
    "Thermodynamics", "Fluid Mechanics", "AutoCAD", "MATLAB", "IoT", "Robotics",
    "Embedded Systems", "PCB Design"
  ],
  "🎨 Design & Creative": [
    "UI/UX Design", "Graphic Design", "Figma", "Adobe XD", "Illustrator",
    "Photoshop", "Motion Graphics", "3D Modeling", "Blender", "Video Editing",
    "Photography", "Brand Identity", "Typography", "Color Theory"
  ],
};

// Flat list for backward compatibility
export const CATEGORIES = Array.from(new Set(Object.values(DOMAIN_GROUPS).flat()));

export const slugifyCategory = (c: string) => 
  c.toLowerCase()
   .replace(/#/g, "-sharp")
   .replace(/\+/g, "-plus")
   .replace(/[^a-z0-9]+/g, "-")
   .replace(/(^-|-$)/g, "");
