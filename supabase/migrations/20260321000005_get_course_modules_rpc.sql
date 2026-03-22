CREATE OR REPLACE FUNCTION get_course_modules()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', m.id,
        'title', m.title,
        'emoji', m.emoji,
        'sort_order', m.sort_order,
        'lessons', COALESCE((
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', l.id,
              'module_id', l.module_id,
              'title', l.title,
              'description', l.description,
              'video_url', l.video_url,
              'duration', l.duration,
              'sort_order', l.sort_order,
              'materials', COALESCE((
                SELECT jsonb_agg(
                  jsonb_build_object(
                    'id', mat.id,
                    'lesson_id', mat.lesson_id,
                    'label', mat.label,
                    'url', mat.url,
                    'sort_order', mat.sort_order
                  ) ORDER BY mat.sort_order
                )
                FROM lesson_materials mat
                WHERE mat.lesson_id = l.id
              ), '[]'::jsonb)
            ) ORDER BY l.sort_order
          )
          FROM course_lessons l
          WHERE l.module_id = m.id
        ), '[]'::jsonb)
      ) ORDER BY m.sort_order
    ),
    '[]'::jsonb
  )
  FROM course_modules m;
$$;
