import { useMutation } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useUserPreferences } from './useUserPreferences';
import { useUserProfileDetails } from './useUserProfileDetails';
import { useSavedPosts } from './useSavedPosts';

export const useDataMigration = () => {
  const { user } = useAuth();
  const { migrateFromLocalStorage: migratePreferences } = useUserPreferences();
  const { migrateFromLocalStorage: migrateProfileDetails } = useUserProfileDetails();
  const { migrateFromLocalStorage: migrateSavedPosts } = useSavedPosts();

  const migrateAllData = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Starting data migration from localStorage to database...');

      try {
        // Check if migration has already been completed
        const migrationKey = `migration_completed:${user.id}`;
        const alreadyMigrated = localStorage.getItem(migrationKey);
        
        if (alreadyMigrated) {
          console.log('Migration already completed for this user');
          return { success: true, message: 'Migration already completed' };
        }

        // Migrate preferences
        console.log('Migrating user preferences...');
        await migratePreferences();

        // Migrate profile details
        console.log('Migrating profile details...');
        await migrateProfileDetails();

        // Migrate saved posts
        console.log('Migrating saved posts...');
        await migrateSavedPosts();

        // Mark migration as completed
        localStorage.setItem(migrationKey, 'true');

        console.log('Data migration completed successfully!');
        return { 
          success: true, 
          message: 'All data migrated successfully to database' 
        };

      } catch (error) {
        console.error('Migration failed:', error);
        throw new Error('Failed to migrate data from localStorage to database');
      }
    },
  });

  const checkMigrationStatus = () => {
    if (!user?.id) return false;
    
    const migrationKey = `migration_completed:${user.id}`;
    return localStorage.getItem(migrationKey) === 'true';
  };

  const resetMigrationStatus = () => {
    if (!user?.id) return;
    
    const migrationKey = `migration_completed:${user.id}`;
    localStorage.removeItem(migrationKey);
  };

  return {
    migrateAllData: migrateAllData.mutate,
    isMigrating: migrateAllData.isPending,
    migrationError: migrateAllData.error,
    checkMigrationStatus,
    resetMigrationStatus,
  };
};
