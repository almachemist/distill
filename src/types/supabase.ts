export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      barrel: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: number
          organization_id: string | null
          type: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: number
          organization_id?: string | null
          type: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: number
          organization_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "barrel_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          color: string | null
          created_at: string | null
          ends_at: string
          id: string
          linked_collection: string | null
          linked_id: string | null
          notes: string | null
          organization_id: string
          resource: string | null
          sku: string | null
          starts_at: string
          status: string
          timezone: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string | null
          ends_at: string
          id?: string
          linked_collection?: string | null
          linked_id?: string | null
          notes?: string | null
          organization_id: string
          resource?: string | null
          sku?: string | null
          starts_at: string
          status: string
          timezone?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string | null
          ends_at?: string
          id?: string
          linked_collection?: string | null
          linked_id?: string | null
          notes?: string | null
          organization_id?: string
          resource?: string | null
          sku?: string | null
          starts_at?: string
          status?: string
          timezone?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      barrel_size: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: number
          liters: number | null
          organization_id: string | null
          size: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: number
          liters?: number | null
          organization_id?: string | null
          size: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: number
          liters?: number | null
          organization_id?: string | null
          size?: string
        }
        Relationships: [
          {
            foreignKeyName: "barrel_size_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      distillation: {
        Row: {
          batch: string | null
          chems_added: string | null
          created_at: string | null
          created_by: string | null
          date_filled: string | null
          dunder_batch: string | null
          dunder_vol: string | null
          id: string
          notes: string | null
          organization_id: string
          substrate1_batch: string | null
          substrate1_name: string | null
          substrate1_vol: string | null
          substrate2_batch: string | null
          substrate2_name: string | null
          substrate2_vol: string | null
          substrate3_batch: string | null
          substrate3_name: string | null
          substrate3_vol: string | null
          substrate4_batch: string | null
          substrate4_name: string | null
          substrate4_vol: string | null
          temp_set: string | null
          updated_at: string | null
          water_vol: string | null
          yeast_added: string | null
          yeast_rehyd_temp: string | null
          yeast_type: string | null
        }
        Insert: {
          batch?: string | null
          chems_added?: string | null
          created_at?: string | null
          created_by?: string | null
          date_filled?: string | null
          dunder_batch?: string | null
          dunder_vol?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          substrate1_batch?: string | null
          substrate1_name?: string | null
          substrate1_vol?: string | null
          substrate2_batch?: string | null
          substrate2_name?: string | null
          substrate2_vol?: string | null
          substrate3_batch?: string | null
          substrate3_name?: string | null
          substrate3_vol?: string | null
          substrate4_batch?: string | null
          substrate4_name?: string | null
          substrate4_vol?: string | null
          temp_set?: string | null
          updated_at?: string | null
          water_vol?: string | null
          yeast_added?: string | null
          yeast_rehyd_temp?: string | null
          yeast_type?: string | null
        }
        Update: {
          batch?: string | null
          chems_added?: string | null
          created_at?: string | null
          created_by?: string | null
          date_filled?: string | null
          dunder_batch?: string | null
          dunder_vol?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          substrate1_batch?: string | null
          substrate1_name?: string | null
          substrate1_vol?: string | null
          substrate2_batch?: string | null
          substrate2_name?: string | null
          substrate2_vol?: string | null
          substrate3_batch?: string | null
          substrate3_name?: string | null
          substrate3_vol?: string | null
          substrate4_batch?: string | null
          substrate4_name?: string | null
          substrate4_vol?: string | null
          temp_set?: string | null
          updated_at?: string | null
          water_vol?: string | null
          yeast_added?: string | null
          yeast_rehyd_temp?: string | null
          yeast_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "distillation_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      fermentation: {
        Row: {
          alcohol_content: string | null
          batch: string | null
          brix_120: string | null
          brix_24: string | null
          brix_48: string | null
          brix_72: string | null
          brix_96: string | null
          brix_final: string | null
          chems_added: string | null
          created_at: string | null
          created_by: string | null
          date_filled: string | null
          dunder_batch: string | null
          dunder_ph: string | null
          dunder_vol: string | null
          id: string
          init_brix: string | null
          init_ph: string | null
          init_sg: string | null
          init_temp: string | null
          notes: string | null
          nutrients_added: string | null
          organization_id: string
          ph_120: string | null
          ph_24: string | null
          ph_48: string | null
          ph_72: string | null
          ph_96: string | null
          ph_final: string | null
          sg_120: string | null
          sg_24: string | null
          sg_48: string | null
          sg_72: string | null
          sg_96: string | null
          sg_final: string | null
          substrate1_batch: string | null
          substrate1_name: string | null
          substrate1_vol: string | null
          substrate2_batch: string | null
          substrate2_name: string | null
          substrate2_vol: string | null
          substrate3_batch: string | null
          substrate3_name: string | null
          substrate3_vol: string | null
          substrate4_batch: string | null
          substrate4_name: string | null
          substrate4_vol: string | null
          temp_120: string | null
          temp_24: string | null
          temp_48: string | null
          temp_72: string | null
          temp_96: string | null
          temp_final: string | null
          temp_set: string | null
          updated_at: string | null
          water_vol: string | null
          yeast_added: string | null
          yeast_rehyd_temp: string | null
          yeast_rehyd_time: string | null
          yeast_type: string | null
        }
        Insert: {
          alcohol_content?: string | null
          batch?: string | null
          brix_120?: string | null
          brix_24?: string | null
          brix_48?: string | null
          brix_72?: string | null
          brix_96?: string | null
          brix_final?: string | null
          chems_added?: string | null
          created_at?: string | null
          created_by?: string | null
          date_filled?: string | null
          dunder_batch?: string | null
          dunder_ph?: string | null
          dunder_vol?: string | null
          id?: string
          init_brix?: string | null
          init_ph?: string | null
          init_sg?: string | null
          init_temp?: string | null
          notes?: string | null
          nutrients_added?: string | null
          organization_id: string
          ph_120?: string | null
          ph_24?: string | null
          ph_48?: string | null
          ph_72?: string | null
          ph_96?: string | null
          ph_final?: string | null
          sg_120?: string | null
          sg_24?: string | null
          sg_48?: string | null
          sg_72?: string | null
          sg_96?: string | null
          sg_final?: string | null
          substrate1_batch?: string | null
          substrate1_name?: string | null
          substrate1_vol?: string | null
          substrate2_batch?: string | null
          substrate2_name?: string | null
          substrate2_vol?: string | null
          substrate3_batch?: string | null
          substrate3_name?: string | null
          substrate3_vol?: string | null
          substrate4_batch?: string | null
          substrate4_name?: string | null
          substrate4_vol?: string | null
          temp_120?: string | null
          temp_24?: string | null
          temp_48?: string | null
          temp_72?: string | null
          temp_96?: string | null
          temp_final?: string | null
          temp_set?: string | null
          updated_at?: string | null
          water_vol?: string | null
          yeast_added?: string | null
          yeast_rehyd_temp?: string | null
          yeast_rehyd_time?: string | null
          yeast_type?: string | null
        }
        Update: {
          alcohol_content?: string | null
          batch?: string | null
          brix_120?: string | null
          brix_24?: string | null
          brix_48?: string | null
          brix_72?: string | null
          brix_96?: string | null
          brix_final?: string | null
          chems_added?: string | null
          created_at?: string | null
          created_by?: string | null
          date_filled?: string | null
          dunder_batch?: string | null
          dunder_ph?: string | null
          dunder_vol?: string | null
          id?: string
          init_brix?: string | null
          init_ph?: string | null
          init_sg?: string | null
          init_temp?: string | null
          notes?: string | null
          nutrients_added?: string | null
          organization_id?: string
          ph_120?: string | null
          ph_24?: string | null
          ph_48?: string | null
          ph_72?: string | null
          ph_96?: string | null
          ph_final?: string | null
          sg_120?: string | null
          sg_24?: string | null
          sg_48?: string | null
          sg_72?: string | null
          sg_96?: string | null
          sg_final?: string | null
          substrate1_batch?: string | null
          substrate1_name?: string | null
          substrate1_vol?: string | null
          substrate2_batch?: string | null
          substrate2_name?: string | null
          substrate2_vol?: string | null
          substrate3_batch?: string | null
          substrate3_name?: string | null
          substrate3_vol?: string | null
          substrate4_batch?: string | null
          substrate4_name?: string | null
          substrate4_vol?: string | null
          temp_120?: string | null
          temp_24?: string | null
          temp_48?: string | null
          temp_72?: string | null
          temp_96?: string | null
          temp_final?: string | null
          temp_set?: string | null
          updated_at?: string | null
          water_vol?: string | null
          yeast_added?: string | null
          yeast_rehyd_temp?: string | null
          yeast_rehyd_time?: string | null
          yeast_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fermentation_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_txns: {
        Row: {
          created_at: string | null
          created_by: string | null
          dt: string | null
          id: string
          item_id: string
          lot_id: string | null
          note: string | null
          organization_id: string
          quantity: number
          txn_type: string
          uom: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          dt?: string | null
          id?: string
          item_id: string
          lot_id?: string | null
          note?: string | null
          organization_id: string
          quantity: number
          txn_type: string
          uom: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          dt?: string | null
          id?: string
          item_id?: string
          lot_id?: string | null
          note?: string | null
          organization_id?: string
          quantity?: number
          txn_type?: string
          uom?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_txns_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_txns_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_txns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          abv_pct: number | null
          category: string | null
          created_at: string | null
          default_uom: string
          id: string
          is_alcohol: boolean | null
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          abv_pct?: number | null
          category?: string | null
          created_at?: string | null
          default_uom?: string
          id?: string
          is_alcohol?: boolean | null
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          abv_pct?: number | null
          category?: string | null
          created_at?: string | null
          default_uom?: string
          id?: string
          is_alcohol?: boolean | null
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      location: {
        Row: {
          active: boolean | null
          capacity: number | null
          created_at: string | null
          id: number
          location: string
          organization_id: string | null
        }
        Insert: {
          active?: boolean | null
          capacity?: number | null
          created_at?: string | null
          id?: number
          location: string
          organization_id?: string | null
        }
        Update: {
          active?: boolean | null
          capacity?: number | null
          created_at?: string | null
          id?: number
          location?: string
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "location_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lots: {
        Row: {
          code: string
          created_at: string | null
          id: string
          invoice_url: string | null
          item_id: string
          note: string | null
          organization_id: string
          qty: number
          received_date: string | null
          updated_at: string | null
        }
        Insert: {
          code?: string
          created_at?: string | null
          id?: string
          invoice_url?: string | null
          item_id: string
          note?: string | null
          organization_id: string
          qty?: number
          received_date?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          invoice_url?: string | null
          item_id?: string
          note?: string | null
          organization_id?: string
          qty?: number
          received_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lots_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      prev_spirit: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: number
          organization_id: string | null
          type: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: number
          organization_id?: string | null
          type: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: number
          organization_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "prev_spirit_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      production_orders: {
        Row: {
          batch_target_l: number
          created_at: string | null
          created_by: string | null
          id: string
          organization_id: string
          product_name: string
          recipe_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          batch_target_l: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          organization_id: string
          product_name: string
          recipe_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          batch_target_l?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          organization_id?: string
          product_name?: string
          recipe_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_orders_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          organization_id: string | null
          role: string | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id: string
          organization_id?: string | null
          role?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          organization_id?: string | null
          role?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          notes: string | null
          organization_id: string
          qty_per_batch: number
          recipe_id: string
          step: string
          uom: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          notes?: string | null
          organization_id: string
          qty_per_batch: number
          recipe_id: string
          step: string
          uom: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          notes?: string | null
          organization_id?: string
          qty_per_batch?: number
          recipe_id?: string
          step?: string
          uom?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          baseline_final_l: number | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string
          target_abv: number | null
          updated_at: string | null
        }
        Insert: {
          baseline_final_l?: number | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id: string
          target_abv?: number | null
          updated_at?: string | null
        }
        Update: {
          baseline_final_l?: number | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string
          target_abv?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      spirit: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: number
          organization_id: string | null
          type: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: number
          organization_id?: string | null
          type: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: number
          organization_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "spirit_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      status: {
        Row: {
          active: boolean | null
          color: string | null
          created_at: string | null
          id: number
          organization_id: string | null
          status: string
        }
        Insert: {
          active?: boolean | null
          color?: string | null
          created_at?: string | null
          id?: number
          organization_id?: string | null
          status: string
        }
        Update: {
          active?: boolean | null
          color?: string | null
          created_at?: string | null
          id?: number
          organization_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking: {
        Row: {
          abv: string | null
          angelsshare: string | null
          barrel: string | null
          barrel_number: string
          batch: string | null
          created_at: string | null
          created_by: string | null
          date_filled: string | null
          date_mature: string | null
          id: string
          last_inspection: string | null
          location: string | null
          notes_comments: string | null
          organization_id: string
          prev_spirit: string | null
          spirit: string | null
          status: string | null
          tasting_notes: string | null
          updated_at: string | null
          volume: string | null
        }
        Insert: {
          abv?: string | null
          angelsshare?: string | null
          barrel?: string | null
          barrel_number: string
          batch?: string | null
          created_at?: string | null
          created_by?: string | null
          date_filled?: string | null
          date_mature?: string | null
          id?: string
          last_inspection?: string | null
          location?: string | null
          notes_comments?: string | null
          organization_id: string
          prev_spirit?: string | null
          spirit?: string | null
          status?: string | null
          tasting_notes?: string | null
          updated_at?: string | null
          volume?: string | null
        }
        Update: {
          abv?: string | null
          angelsshare?: string | null
          barrel?: string | null
          barrel_number?: string
          batch?: string | null
          created_at?: string | null
          created_by?: string | null
          date_filled?: string | null
          date_mature?: string | null
          id?: string
          last_inspection?: string | null
          location?: string | null
          notes_comments?: string | null
          organization_id?: string
          prev_spirit?: string | null
          spirit?: string | null
          status?: string | null
          tasting_notes?: string | null
          updated_at?: string | null
          volume?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_signup: {
        Args: { display_name: string; org_name: string; user_id: string }
        Returns: Json
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

