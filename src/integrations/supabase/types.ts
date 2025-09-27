export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bookmarks: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          }
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string | null
          roadmap_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id?: string | null
          roadmap_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string | null
          roadmap_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_roadmap_id_fkey",
            columns: ["roadmap_id"],
            isOneToOne: false,
            referencedRelation: "roadmaps",
            referencedColumns: ["id"]
          }
        ]
      }
      communities: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          image: string | null
          members_count: number
          posts_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string | null
          image?: string | null
          members_count?: number
          posts_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string | null
          image?: string | null
          members_count?: number
          posts_count?: number
          created_at?: string
        }
        Relationships: []
      }
      community_members: {
        Row: {
          id: string
          community_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          community_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          community_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          }
        ]
      }
      posts: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          id: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          location: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          location?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          location?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      roadmaps: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string | null
          difficulty: string | null
          status: string
          progress: number
          estimated_time: string | null
          technologies: string[] | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category?: string | null
          difficulty?: string | null
          status?: string
          progress?: number
          estimated_time?: string | null
          technologies?: string[] | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string | null
          difficulty?: string | null
          status?: string
          progress?: number
          estimated_time?: string | null
          technologies?: string[] | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      roadmap_steps: {
        Row: {
          id: string
          roadmap_id: string
          title: string
          description: string | null
          order_index: number
          duration: string | null
          completed: boolean
          due_date: string | null
          notes: string | null
          topics: string[] | null
          task: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          roadmap_id: string
          title: string
          description?: string | null
          order_index: number
          duration?: string | null
          completed?: boolean
          due_date?: string | null
          notes?: string | null
          topics?: string[] | null
          task?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          roadmap_id?: string
          title?: string
          description?: string | null
          order_index?: number
          duration?: string | null
          completed?: boolean
          due_date?: string | null
          notes?: string | null
          topics?: string[] | null
          task?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_steps_roadmap_id_fkey",
            columns: ["roadmap_id"],
            isOneToOne: false,
            referencedRelation: "roadmaps",
            referencedColumns: ["id"]
          }
        ]
      }
      roadmap_step_resources: {
        Row: {
          id: string
          step_id: string
          title: string
          url: string | null
          type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          step_id: string
          title: string
          url?: string | null
          type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          step_id?: string
          title?: string
          url?: string | null
          type?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_step_resources_step_id_fkey",
            columns: ["step_id"],
            isOneToOne: false,
            referencedRelation: "roadmap_steps",
            referencedColumns: ["id"]
          }
        ]
      }
      videos: {
        Row: {
          id: string
          title: string
          thumbnail: string | null
          channel: string | null
          channel_avatar: string | null
          duration: string | null
          views: string | null
          upload_time: string | null
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          thumbnail?: string | null
          channel?: string | null
          channel_avatar?: string | null
          duration?: string | null
          views?: string | null
          upload_time?: string | null
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          thumbnail?: string | null
          channel?: string | null
          channel_avatar?: string | null
          duration?: string | null
          views?: string | null
          upload_time?: string | null
          category?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database['public']

export type Tables<T extends keyof PublicSchema['Tables']>
  = PublicSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof PublicSchema['Tables']>
  = PublicSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof PublicSchema['Tables']>
  = PublicSchema['Tables'][T]['Update']

export type Enums<T extends keyof PublicSchema['Enums']>
  = PublicSchema['Enums'][T]

export const Constants = {
  public: {
    Enums: {},
  },
} as const
