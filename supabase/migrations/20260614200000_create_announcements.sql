-- Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('site_wide', 'course')),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Policies for Admins (Full access)
CREATE POLICY "Admins have full access to announcements"
    ON public.announcements
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Policies for Instructors (Can insert/update/read course announcements for their courses)
CREATE POLICY "Instructors can read their course announcements"
    ON public.announcements
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = announcements.course_id
            AND courses.instructor_id = auth.uid()
        )
    );

CREATE POLICY "Instructors can insert their course announcements"
    ON public.announcements
    FOR INSERT
    WITH CHECK (
        type = 'course' AND
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = announcements.course_id
            AND courses.instructor_id = auth.uid()
        )
        AND created_by = auth.uid()
    );

CREATE POLICY "Instructors can update their course announcements"
    ON public.announcements
    FOR UPDATE
    USING (
        type = 'course' AND
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = announcements.course_id
            AND courses.instructor_id = auth.uid()
        )
        AND created_by = auth.uid()
    );

CREATE POLICY "Instructors can delete their course announcements"
    ON public.announcements
    FOR DELETE
    USING (
        type = 'course' AND
        EXISTS (
            SELECT 1 FROM public.courses
            WHERE courses.id = announcements.course_id
            AND courses.instructor_id = auth.uid()
        )
    );

-- Policies for Students (Can read site_wide announcements and announcements for courses they are enrolled in)
CREATE POLICY "Users can read site-wide announcements"
    ON public.announcements
    FOR SELECT
    USING (type = 'site_wide');

CREATE POLICY "Students can read their enrolled course announcements"
    ON public.announcements
    FOR SELECT
    USING (
        type = 'course' AND
        EXISTS (
            SELECT 1 FROM public.enrollments
            WHERE enrollments.course_id = announcements.course_id
            AND enrollments.user_id = auth.uid()
        )
    );

-- Grant permissions
GRANT ALL ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
