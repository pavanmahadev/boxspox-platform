import React from "react";
import { Database, Palette, Globe } from "lucide-react";

export const projects = [
  {
    id: "ecommerce-dashboard",
    title: "E-commerce Dashboard",
    description: "Build a full-stack dashboard with real-time analytics and inventory management.",
    category: "Full Stack",
    difficulty: "Advanced",
    tags: ["Next.js", "Supabase", "Chart.js"],
    icon: <Database className="text-blue-500" />,
    requirements: [
      "Authentication and User Management",
      "Product Catalog with CRUD operations",
      "Shopping Cart and Checkout flow simulation",
      "Dashboard with real-time sales charts"
    ]
  },
  {
    id: "portfolio-website",
    title: "Portfolio Website",
    description: "Create a stunning personal portfolio with dark mode and smooth animations.",
    category: "Frontend",
    difficulty: "Intermediate",
    tags: ["React", "Framer Motion", "Tailwind"],
    icon: <Palette className="text-pink-500" />,
    requirements: [
      "Responsive design for all devices",
      "Smooth scroll navigation",
      "Project showcase grid",
      "Contact form with basic validation"
    ]
  },
  {
    id: "weather-application",
    title: "Weather Application",
    description: "Fetch live data from weather APIs and display it with dynamic backgrounds.",
    category: "Frontend",
    difficulty: "Beginner",
    tags: ["JavaScript", "APIs", "CSS"],
    icon: <Globe className="text-green-500" />,
    requirements: [
      "Search by city name",
      "Display current temperature, humidity, and wind speed",
      "5-day forecast visualization",
      "Dynamic background based on weather condition"
    ]
  }
];
