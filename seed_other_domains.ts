import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

const DOMAINS_TO_SEED = [
  {
    category_name: "📊 MBA & Business",
    courses: [
      {
        title: "Business Strategy",
        slug: "business-strategy",
        description: "Master the art of business strategy and competitive advantage.",
        category: "MBA",
        icon: "📈",
        gradient: "linear-gradient(135deg, #1E3A8A, #3B82F6)",
        difficulty: "Intermediate",
      },
      {
        title: "Marketing 101",
        slug: "marketing",
        description: "Learn the fundamentals of modern marketing.",
        category: "Marketing",
        icon: "📢",
        gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)",
        difficulty: "Beginner",
      }
    ]
  },
  {
    category_name: "⚖️ Law & Legal",
    courses: [
      {
        title: "Constitutional Law",
        slug: "constitutional-law",
        description: "Deep dive into constitutional principles and case law.",
        category: "Law",
        icon: "⚖️",
        gradient: "linear-gradient(135deg, #451A03, #92400E)",
        difficulty: "Advanced",
      },
      {
        title: "Contract Law",
        slug: "contract-law",
        description: "Understand the essentials of drafting and enforcing contracts.",
        category: "Law",
        icon: "📜",
        gradient: "linear-gradient(135deg, #78350F, #B45309)",
        difficulty: "Intermediate",
      }
    ]
  },
  {
    category_name: "🌾 Agriculture",
    courses: [
      {
        title: "Agronomy Basics",
        slug: "agronomy",
        description: "Introduction to soil science and crop production.",
        category: "Agriculture",
        icon: "🌱",
        gradient: "linear-gradient(135deg, #064E3B, #10B981)",
        difficulty: "Beginner",
      },
      {
        title: "Organic Farming",
        slug: "organic-farming",
        description: "Learn sustainable and organic farming techniques.",
        category: "Agriculture",
        icon: "🚜",
        gradient: "linear-gradient(135deg, #14532D, #22C55E)",
        difficulty: "Intermediate",
      }
    ]
  },
  {
    category_name: "🏥 Healthcare",
    courses: [
      {
        title: "Human Anatomy",
        slug: "anatomy",
        description: "Comprehensive study of the human body.",
        category: "Healthcare",
        icon: "🦴",
        gradient: "linear-gradient(135deg, #7F1D1D, #EF4444)",
        difficulty: "Advanced",
      },
      {
        title: "Nutrition & Dietetics",
        slug: "nutrition",
        description: "Learn about human nutrition and diet planning.",
        category: "Healthcare",
        icon: "🍎",
        gradient: "linear-gradient(135deg, #831843, #F43F5E)",
        difficulty: "Beginner",
      }
    ]
  },
  {
    category_name: "📐 Engineering",
    courses: [
      {
        title: "Civil Engineering Basics",
        slug: "civil-engineering",
        description: "Fundamentals of structural design and construction.",
        category: "Engineering",
        icon: "🏗️",
        gradient: "linear-gradient(135deg, #1E3A8A, #3B82F6)",
        difficulty: "Intermediate",
      },
      {
        title: "Robotics",
        slug: "robotics",
        description: "Introduction to robotics and automation.",
        category: "Engineering",
        icon: "🤖",
        gradient: "linear-gradient(135deg, #312E81, #6366F1)",
        difficulty: "Advanced",
      }
    ]
  },
  {
    category_name: "🎨 Design & Creative",
    courses: [
      {
        title: "UI/UX Design Masterclass",
        slug: "ui-ux-design",
        description: "Learn to design beautiful and functional user interfaces.",
        category: "Design",
        icon: "✨",
        gradient: "linear-gradient(135deg, #4C1D95, #8B5CF6)",
        difficulty: "Beginner",
      },
      {
        title: "Graphic Design with Photoshop",
        slug: "photoshop",
        description: "Master Adobe Photoshop for graphic design.",
        category: "Design",
        icon: "🎨",
        gradient: "linear-gradient(135deg, #1E40AF, #3B82F6)",
        difficulty: "Intermediate",
      }
    ]
  }
];

async function seed() {
  console.log('Starting seed...');

  // Get admin instructor
  const { data: admin, error: adminErr } = await supabase.from('users').select('*').eq('role', 'admin').limit(1);
  const instructorId = admin && admin.length > 0 ? admin[0].id : null;
  
  for (const domain of DOMAINS_TO_SEED) {
    console.log(`Seeding domain: ${domain.category_name}`);
    for (const c of domain.courses) {
      // Check if course exists
      const { data: existing } = await supabase.from('courses').select('id').eq('slug', c.slug).single();
      
      let courseId;
      if (!existing) {
        const { data, error } = await supabase.from('courses').insert({
          title: c.title,
          slug: c.slug,
          description: c.description,
          category: c.category,
          category_name: domain.category_name,
          icon: c.icon,
          gradient: c.gradient,
          difficulty: c.difficulty,
          status: 'published',
          price: 0,
          exam_fee: 0,
          instructor_id: instructorId
        }).select('id').single();
        
        if (error) {
          console.error(`Error inserting course ${c.title}:`, error.message);
          continue;
        }
        courseId = data.id;
        console.log(`  Inserted course: ${c.title}`);
      } else {
        courseId = existing.id;
        console.log(`  Course already exists: ${c.title}`);
      }

      // Add a module and a lesson
      const { data: existingModule } = await supabase.from('modules').select('id').eq('course_id', courseId).limit(1);
      if (!existingModule || existingModule.length === 0) {
        const { data: mod, error: modErr } = await supabase.from('modules').insert({
          course_id: courseId,
          title: 'Introduction to ' + c.title,
          order_index: 1,
        }).select('id').single();

        if (modErr) {
          console.error(`  Error inserting module for ${c.title}:`, modErr.message);
          continue;
        }

        const { error: lessonErr } = await supabase.from('lessons').insert({
          module_id: mod.id,
          title: 'Welcome to ' + c.title,
          slug: 'welcome',
          content: '## Welcome to this course!\n\nThis is the introductory lesson. More content coming soon.',
          lesson_type: 'text',
          order_index: 1
        });

        if (lessonErr) {
          console.error(`  Error inserting lesson for ${c.title}:`, lessonErr.message);
        } else {
          console.log(`  Inserted module and lesson for: ${c.title}`);
        }
      }
    }
  }
  
  console.log('Seed completed!');
}

seed();
