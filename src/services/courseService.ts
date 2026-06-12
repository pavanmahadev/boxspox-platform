import { api } from "@/utils/api";

/**
 * Pandaschool Course Service
 * Centralized AJAX calls for course-related data
 */

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  icon?: string;
  gradient?: string;
}

export const courseService = {
  /**
   * Fetch courses with filtering
   */
  async getCourses(params: { q?: string; category?: string; status?: string } = {}) {
    // In a real production app, we would use a Next.js API route to proxy the Supabase call
    // or call Supabase directly from the client if it's secured with RLS.
    // For this audit, we'll demonstrate using our axios-based api utility.
    return api.get<Course[]>('/api/courses', { params });
  },

  /**
   * Mark lesson as complete
   */
  async completeLesson(lessonId: string, courseId: string) {
    return api.post(`/api/courses/${courseId}/lessons/${lessonId}/complete`);
  },

  /**
   * Track user progress
   */
  async updateProgress(lessonId: string, data: { timeSpent: number; completed: boolean }) {
    return api.put(`/api/progress/${lessonId}`, data);
  }
};
