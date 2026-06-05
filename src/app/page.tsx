import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { RealtimeStats } from "@/components/home/RealtimeStats";
import { FeaturedCourses } from "@/components/home/FeaturedCourses";
import { createClient } from "@/utils/supabase/server";
import { CategoryNavServer } from "@/components/home/CategoryNavServer";
import dynamic from "next/dynamic";
import { LeadGeneration } from "@/components/home/LeadGeneration";
import { ExitPopup } from "@/components/home/ExitPopup";
import { EnrollmentToast } from "@/components/home/EnrollmentToast";

const Testimonials = dynamic(() => import("@/components/home/Testimonials").then(mod => mod.Testimonials), { ssr: true });
const Pricing = dynamic(() => import("@/components/home/Pricing").then(mod => mod.Pricing), { ssr: true });
const EditorPreview = dynamic(() => import("@/components/home/EditorPreview").then(mod => mod.EditorPreview), { ssr: true });
const LearningPaths = dynamic(() => import("@/components/home/LearningPaths").then(mod => mod.LearningPaths), { ssr: true });
const ProjectsPreview = dynamic(() => import("@/components/home/ProjectsPreview").then(mod => mod.ProjectsPreview), { ssr: true });
const AIFeature = dynamic(() => import("@/components/home/AIFeature").then(mod => mod.AIFeature), { ssr: true });
const BundlePackages = dynamic(() => import("@/components/home/BundlePackages").then(mod => mod.BundlePackages), { ssr: true });
const TrustBuilding = dynamic(() => import("@/components/home/TrustBuilding").then(mod => mod.TrustBuilding), { ssr: true });

import { Suspense } from 'react';
import { FeaturedCoursesServer } from "@/components/home/FeaturedCoursesServer";

export const revalidate = 3600; // Cache for 1 hour to improve TTFB

export default async function HomePage() {
  console.log("Rendering home page...");

  return (
    <>
      <Hero />
      <Suspense fallback={<div style={{ padding: "80px", textAlign: "center" }}>Loading domains...</div>}>
        <CategoryNavServer />
      </Suspense>
      <TrustBar />
      <RealtimeStats />
      <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading featured courses...</div>}>
        <FeaturedCoursesServer />
      </Suspense>
      <EditorPreview />
      <LearningPaths />
      <ProjectsPreview />
      <AIFeature />
      <Testimonials />
      <BundlePackages />
      <LeadGeneration />
      <Pricing />
      <TrustBuilding />
      <ExitPopup />
      <EnrollmentToast />
    </>
  );
}
