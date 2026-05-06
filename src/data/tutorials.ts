export interface Tutorial {
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  lessons: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
}

export interface Lesson {
  slug: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  content: string;
  code?: string;
  language?: string;
}

export const tutorials: Tutorial[] = [
  {
    slug: "html",
    title: "HTML",
    description: "Learn the building blocks of the web. HTML is the standard markup language for creating web pages.",
    icon: "🌐",
    color: "#e34c26",
    gradient: "linear-gradient(135deg, #e34c26, #f06529)",
    lessons: 15,
    difficulty: "Beginner",
    category: "Web Fundamentals",
  },
  {
    slug: "css",
    title: "CSS",
    description: "Style your web pages with beautiful layouts, colors, animations, and responsive designs.",
    icon: "🎨",
    color: "#264de4",
    gradient: "linear-gradient(135deg, #264de4, #2965f1)",
    lessons: 18,
    difficulty: "Beginner",
    category: "Web Fundamentals",
  },
  {
    slug: "javascript",
    title: "JavaScript",
    description: "Add interactivity to your websites. JavaScript is the programming language of the web.",
    icon: "⚡",
    color: "#f7df1e",
    gradient: "linear-gradient(135deg, #f7df1e, #e8c800)",
    lessons: 25,
    difficulty: "Beginner",
    category: "Programming",
  },
  {
    slug: "python",
    title: "Python",
    description: "A powerful, versatile language for web development, data science, AI, and automation.",
    icon: "🐍",
    color: "#3776ab",
    gradient: "linear-gradient(135deg, #3776ab, #ffd43b)",
    lessons: 22,
    difficulty: "Beginner",
    category: "Programming",
  },
  {
    slug: "react",
    title: "React",
    description: "Build modern user interfaces with the most popular JavaScript library.",
    icon: "⚛️",
    color: "#61dafb",
    gradient: "linear-gradient(135deg, #61dafb, #087ea4)",
    lessons: 20,
    difficulty: "Intermediate",
    category: "Frameworks",
  },
  {
    slug: "sql",
    title: "SQL",
    description: "Master database queries. Learn to store, retrieve, and manipulate data efficiently.",
    icon: "🗄️",
    color: "#00758f",
    gradient: "linear-gradient(135deg, #00758f, #f29111)",
    lessons: 16,
    difficulty: "Beginner",
    category: "Database",
  },
  {
    slug: "nodejs",
    title: "Node.js",
    description: "Build scalable server-side applications with JavaScript runtime.",
    icon: "🟢",
    color: "#68a063",
    gradient: "linear-gradient(135deg, #68a063, #3c873a)",
    lessons: 18,
    difficulty: "Intermediate",
    category: "Backend",
  },
  {
    slug: "typescript",
    title: "TypeScript",
    description: "Add type safety to JavaScript. Build more reliable and maintainable applications.",
    icon: "🔷",
    color: "#3178c6",
    gradient: "linear-gradient(135deg, #3178c6, #235a97)",
    lessons: 14,
    difficulty: "Intermediate",
    category: "Programming",
  },
];

export const htmlLessons: Lesson[] = [
  {
    slug: "introduction",
    title: "HTML Introduction",
    description: "Learn what HTML is and how it structures web pages.",
    order: 1,
    estimatedMinutes: 5,
    language: "html",
    content: `
# HTML Introduction

**HTML** stands for **H**yper**T**ext **M**arkup **L**anguage. It is the standard markup language for creating web pages.

## What is HTML?

- HTML describes the **structure** of a Web page
- HTML consists of a series of **elements**
- HTML elements tell the browser how to **display** content
- HTML elements label pieces of content such as "this is a heading", "this is a paragraph", "this is a link", etc.

## A Simple HTML Document

Every HTML page starts with a basic structure. The \`<!DOCTYPE html>\` declaration tells the browser this is an HTML5 document.

Try editing the code below and click "Run" to see the result! 👇
    `,
    code: `<!DOCTYPE html>
<html>
<head>
  <title>My First Page</title>
</head>
<body>
  <h1>Hello, World! 🌍</h1>
  <p>This is my first web page.</p>
  <p>HTML is <strong>awesome</strong>!</p>
</body>
</html>`,
  },
  {
    slug: "elements",
    title: "HTML Elements",
    description: "Understand HTML elements, tags, and how they work together.",
    order: 2,
    estimatedMinutes: 8,
    language: "html",
    content: `
# HTML Elements

An HTML element is defined by a **start tag**, some **content**, and an **end tag**.

## Syntax

\`\`\`
<tagname> Content goes here... </tagname>
\`\`\`

## Examples of HTML Elements

| Start tag | Content | End tag |
|-----------|---------|---------|
| \`<h1>\` | My First Heading | \`</h1>\` |
| \`<p>\` | My first paragraph. | \`</p>\` |
| \`<br>\` | *none* | *none* |

## Nested Elements

HTML elements can be nested (elements can contain elements). All HTML documents consist of nested HTML elements.

Try the example below:
    `,
    code: `<!DOCTYPE html>
<html>
<body>

  <h1>HTML Elements</h1>
  
  <p>This is a <strong>bold</strong> word 
     and this is <em>italic</em>.</p>
  
  <h2>A Nested List</h2>
  <ul>
    <li>HTML</li>
    <li>CSS</li>
    <li>JavaScript</li>
  </ul>

  <a href="https://example.com">
    Click me!
  </a>

</body>
</html>`,
  },
  {
    slug: "headings",
    title: "HTML Headings",
    description: "Learn about the six levels of HTML headings.",
    order: 3,
    estimatedMinutes: 5,
    language: "html",
    content: `
# HTML Headings

HTML headings are defined with the \`<h1>\` to \`<h6>\` tags.

\`<h1>\` defines the most important heading. \`<h6>\` defines the least important heading.

## Why Headings Matter

- Search engines use headings to **index** the structure of your web pages
- Users often **skim** a page by its headings
- Use headings to show the **document structure**

> **Note:** Use HTML headings for headings only. Don't use headings to make text **BIG** or **bold** — use CSS for that!

Try all six heading levels:
    `,
    code: `<!DOCTYPE html>
<html>
<body>

  <h1>Heading 1 - Main Title</h1>
  <h2>Heading 2 - Section</h2>
  <h3>Heading 3 - Subsection</h3>
  <h4>Heading 4 - Detail</h4>
  <h5>Heading 5 - Minor</h5>
  <h6>Heading 6 - Smallest</h6>

  <p>Use headings to create a 
     clear page structure!</p>

</body>
</html>`,
  },
  {
    slug: "paragraphs",
    title: "HTML Paragraphs",
    description: "Learn how to create paragraphs and format text in HTML.",
    order: 4,
    estimatedMinutes: 5,
    language: "html",
    content: `
# HTML Paragraphs

The HTML \`<p>\` element defines a paragraph. A paragraph always starts on a new line, and browsers automatically add some white space (margin) before and after a paragraph.

## Display Rules

- You cannot change the display by adding extra spaces or lines in your HTML code
- The browser will automatically remove extra spaces and lines
- Use \`<br>\` for line breaks within paragraphs

Try formatting text below:
    `,
    code: `<!DOCTYPE html>
<html>
<body>

  <h1>HTML Paragraphs</h1>

  <p>This is the first paragraph. 
     It contains important info.</p>

  <p>This paragraph has a<br>
     line break in the middle.</p>

  <hr>

  <p>The <code>&lt;hr&gt;</code> tag above 
     creates a horizontal line.</p>

  <pre>
  This text
    preserves    spaces
      and line breaks!
  </pre>

</body>
</html>`,
  },
  {
    slug: "links",
    title: "HTML Links",
    description: "Create hyperlinks to navigate between pages and websites.",
    order: 5,
    estimatedMinutes: 7,
    language: "html",
    content: `
# HTML Links

Links are found in nearly all web pages. Links allow users to click their way from page to page.

## The \`<a>\` Tag

The HTML \`<a>\` tag defines a hyperlink with these key attributes:

- **href** — Specifies the URL of the page the link goes to
- **target** — Specifies where to open the linked document
- **title** — Extra information about the link (shown as tooltip)

Try creating links:
    `,
    code: `<!DOCTYPE html>
<html>
<body>

  <h1>HTML Links</h1>

  <p><a href="https://www.google.com">
    Visit Google
  </a></p>

  <p><a href="https://example.com" 
        target="_blank"
        title="Opens in new tab">
    Open in New Tab ↗
  </a></p>

  <h2>Link as Button</h2>
  <a href="#" style="
    padding: 12px 24px;
    background: #6366f1;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: bold;
  ">Click Me!</a>

</body>
</html>`,
  },
];
