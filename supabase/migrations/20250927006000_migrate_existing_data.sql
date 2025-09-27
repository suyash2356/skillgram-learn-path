-- Migration script to move existing localStorage data to database
-- This will be run after the new tables are created

-- Function to migrate existing profile data
CREATE OR REPLACE FUNCTION public.migrate_profile_data()
RETURNS void AS $$
DECLARE
  profile_record RECORD;
BEGIN
  -- Migrate basic profile data to user_profile_details
  FOR profile_record IN 
    SELECT user_id, bio, location, title, avatar_url, full_name
    FROM public.profiles 
    WHERE bio IS NOT NULL OR location IS NOT NULL OR title IS NOT NULL
  LOOP
    -- Insert or update user_profile_details
    INSERT INTO public.user_profile_details (
      user_id, bio, location, current_role, updated_at
    ) VALUES (
      profile_record.user_id,
      profile_record.bio,
      profile_record.location,
      profile_record.title,
      NOW()
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
      bio = COALESCE(EXCLUDED.bio, user_profile_details.bio),
      location = COALESCE(EXCLUDED.location, user_profile_details.location),
      current_role = COALESCE(EXCLUDED.current_role, user_profile_details.current_role),
      updated_at = NOW();
  END LOOP;
  
  RAISE NOTICE 'Profile data migration completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to create default collections for existing users
CREATE OR REPLACE FUNCTION public.create_default_collections_for_existing_users()
RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Create default "All" collection for all existing users
  FOR user_record IN 
    SELECT DISTINCT user_id FROM public.profiles
  LOOP
    INSERT INTO public.saved_posts_collections (user_id, name, is_default)
    VALUES (user_record.user_id, 'All', true)
    ON CONFLICT (user_id, name) DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Default collections created for existing users';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to create default preferences for existing users
CREATE OR REPLACE FUNCTION public.create_default_preferences_for_existing_users()
RETURNS void AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Create default preferences for all existing users
  FOR user_record IN 
    SELECT DISTINCT user_id FROM public.profiles
  LOOP
    INSERT INTO public.user_preferences (user_id)
    VALUES (user_record.user_id)
    ON CONFLICT (user_id) DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Default preferences created for existing users';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Run the migration functions
SELECT public.migrate_profile_data();
SELECT public.create_default_collections_for_existing_users();
SELECT public.create_default_preferences_for_existing_users();
