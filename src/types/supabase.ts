export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
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
      distillation_runs: {
        Row: {
          batch_id: string
          boiler_on_time: string | null
          botanicals: Json | null
          charge_components: Json
          charge_total_abv_percent: number | null
          charge_total_lal: number | null
          charge_total_volume_l: number | null
          created_at: string | null
          created_by: string | null
          date: string
          deflegmator: string | null
          dilution_steps: Json | null
          display_name: string
          final_output_abv_percent: number | null
          final_output_lal: number | null
          final_output_volume_l: number | null
          foreshots_abv_percent: number | null
          foreshots_lal: number | null
          foreshots_volume_l: number | null
          heads_abv_percent: number | null
          heads_lal: number | null
          heads_volume_l: number | null
          hearts_abv_percent: number | null
          hearts_lal: number | null
          hearts_segments: Json | null
          hearts_volume_l: number | null
          heating_elements: string | null
          id: string
          notes: string | null
          plates: string | null
          power_setting: string | null
          product_id: string | null
          recipe_id: string | null
          sku: string
          steeping_end_time: string | null
          steeping_start_time: string | null
          steeping_temp_c: number | null
          still_used: string
          tails_abv_percent: number | null
          tails_lal: number | null
          tails_segments: Json | null
          tails_volume_l: number | null
          updated_at: string | null
        }
        Insert: {
          batch_id: string
          boiler_on_time?: string | null
          botanicals?: Json | null
          charge_components?: Json
          charge_total_abv_percent?: number | null
          charge_total_lal?: number | null
          charge_total_volume_l?: number | null
          created_at?: string | null
          created_by?: string | null
          date: string
          deflegmator?: string | null
          dilution_steps?: Json | null
          display_name: string
          final_output_abv_percent?: number | null
          final_output_lal?: number | null
          final_output_volume_l?: number | null
          foreshots_abv_percent?: number | null
          foreshots_lal?: number | null
          foreshots_volume_l?: number | null
          heads_abv_percent?: number | null
          heads_lal?: number | null
          heads_volume_l?: number | null
          hearts_abv_percent?: number | null
          hearts_lal?: number | null
          hearts_segments?: Json | null
          hearts_volume_l?: number | null
          heating_elements?: string | null
          id?: string
          notes?: string | null
          plates?: string | null
          power_setting?: string | null
          product_id?: string | null
          recipe_id?: string | null
          sku: string
          steeping_end_time?: string | null
          steeping_start_time?: string | null
          steeping_temp_c?: number | null
          still_used: string
          tails_abv_percent?: number | null
          tails_lal?: number | null
          tails_segments?: Json | null
          tails_volume_l?: number | null
          updated_at?: string | null
        }
        Update: {
          batch_id?: string
          boiler_on_time?: string | null
          botanicals?: Json | null
          charge_components?: Json
          charge_total_abv_percent?: number | null
          charge_total_lal?: number | null
          charge_total_volume_l?: number | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          deflegmator?: string | null
          dilution_steps?: Json | null
          display_name?: string
          final_output_abv_percent?: number | null
          final_output_lal?: number | null
          final_output_volume_l?: number | null
          foreshots_abv_percent?: number | null
          foreshots_lal?: number | null
          foreshots_volume_l?: number | null
          heads_abv_percent?: number | null
          heads_lal?: number | null
          heads_volume_l?: number | null
          hearts_abv_percent?: number | null
          hearts_lal?: number | null
          hearts_segments?: Json | null
          hearts_volume_l?: number | null
          heating_elements?: string | null
          id?: string
          notes?: string | null
          plates?: string | null
          power_setting?: string | null
          product_id?: string | null
          recipe_id?: string | null
          sku?: string
          steeping_end_time?: string | null
          steeping_start_time?: string | null
          steeping_temp_c?: number | null
          still_used?: string
          tails_abv_percent?: number | null
          tails_lal?: number | null
          tails_segments?: Json | null
          tails_volume_l?: number | null
          updated_at?: string | null
        }
        Relationships: []
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
      product_pricing: {
        Row: {
          abv: number | null
          category: string
          created_at: string | null
          id: string
          metadata: Json | null
          moq: string | null
          organization_id: string
          product_name: string
          rrp: number | null
          sku: string
          updated_at: string | null
          variation: string
          volume_ml: number | null
          wholesale_ex_gst: number | null
        }
        Insert: {
          abv?: number | null
          category: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          moq?: string | null
          organization_id: string
          product_name: string
          rrp?: number | null
          sku?: string
          updated_at?: string | null
          variation?: string
          volume_ml?: number | null
          wholesale_ex_gst?: number | null
        }
        Update: {
          abv?: number | null
          category?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          moq?: string | null
          organization_id?: string
          product_name?: string
          rrp?: number | null
          sku?: string
          updated_at?: string | null
          variation?: string
          volume_ml?: number | null
          wholesale_ex_gst?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_pricing_organization_id_fkey"
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
          description: string | null
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
          description?: string | null
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
          description?: string | null
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
      rum_production_runs: {
        Row: {
          additional_nutrients: string | null
          anti_foam_ml: number | null
          batch_id: string
          boiler_abv_percent: number | null
          boiler_elements: string | null
          boiler_lal: number | null
          boiler_volume_l: number | null
          brix_curve: Json | null
          calcium_carbonate_g: number | null
          cask_number: string | null
          cask_origin: string | null
          cask_size_l: number | null
          cask_type: string | null
          citric_acid_g: number | null
          created_at: string | null
          created_by: string | null
          dap_g: number | null
          distillation_date: string | null
          distillation_notes: string | null
          distillation_start_time: string | null
          dunder_added: boolean | null
          dunder_ph: number | null
          dunder_type: string | null
          dunder_volume_l: number | null
          expected_bottling_date: string | null
          fermaid_g: number | null
          fermentation_duration_hours: number | null
          fermentation_notes: string | null
          fermentation_start_date: string | null
          fill_abv_percent: number | null
          fill_date: string | null
          final_abv_percent: number | null
          final_brix: number | null
          final_ph: number | null
          foreshots_abv_percent: number | null
          foreshots_notes: string | null
          foreshots_time: string | null
          heads_abv_percent: number | null
          heads_lal: number | null
          heads_notes: string | null
          heads_time: string | null
          heads_volume_l: number | null
          heart_yield_percent: number | null
          hearts_abv_percent: number | null
          hearts_lal: number | null
          hearts_notes: string | null
          hearts_time: string | null
          hearts_volume_l: number | null
          id: string
          initial_brix: number | null
          initial_ph: number | null
          lal_filled: number | null
          lal_loss: number | null
          maturation_location: string | null
          notes: string | null
          output_product_name: string | null
          ph_curve: Json | null
          product_name: string
          product_type: string | null
          retort1_abv_percent: number | null
          retort1_content: string | null
          retort1_elements: string | null
          retort1_lal: number | null
          retort1_volume_l: number | null
          retort2_abv_percent: number | null
          retort2_content: string | null
          retort2_elements: string | null
          retort2_lal: number | null
          retort2_volume_l: number | null
          still_used: string | null
          substrate_batch: string | null
          substrate_mass_kg: number | null
          substrate_type: string | null
          tails_segments: Json | null
          temperature_curve: Json | null
          total_lal_end: number | null
          total_lal_start: number | null
          updated_at: string | null
          volume_filled_l: number | null
          water_mass_kg: number | null
          yeast_mass_g: number | null
          yeast_rehydration_temp_c: number | null
          yeast_rehydration_time_min: number | null
          yeast_type: string | null
        }
        Insert: {
          additional_nutrients?: string | null
          anti_foam_ml?: number | null
          batch_id: string
          boiler_abv_percent?: number | null
          boiler_elements?: string | null
          boiler_lal?: number | null
          boiler_volume_l?: number | null
          brix_curve?: Json | null
          calcium_carbonate_g?: number | null
          cask_number?: string | null
          cask_origin?: string | null
          cask_size_l?: number | null
          cask_type?: string | null
          citric_acid_g?: number | null
          created_at?: string | null
          created_by?: string | null
          dap_g?: number | null
          distillation_date?: string | null
          distillation_notes?: string | null
          distillation_start_time?: string | null
          dunder_added?: boolean | null
          dunder_ph?: number | null
          dunder_type?: string | null
          dunder_volume_l?: number | null
          expected_bottling_date?: string | null
          fermaid_g?: number | null
          fermentation_duration_hours?: number | null
          fermentation_notes?: string | null
          fermentation_start_date?: string | null
          fill_abv_percent?: number | null
          fill_date?: string | null
          final_abv_percent?: number | null
          final_brix?: number | null
          final_ph?: number | null
          foreshots_abv_percent?: number | null
          foreshots_notes?: string | null
          foreshots_time?: string | null
          heads_abv_percent?: number | null
          heads_lal?: number | null
          heads_notes?: string | null
          heads_time?: string | null
          heads_volume_l?: number | null
          heart_yield_percent?: number | null
          hearts_abv_percent?: number | null
          hearts_lal?: number | null
          hearts_notes?: string | null
          hearts_time?: string | null
          hearts_volume_l?: number | null
          id?: string
          initial_brix?: number | null
          initial_ph?: number | null
          lal_filled?: number | null
          lal_loss?: number | null
          maturation_location?: string | null
          notes?: string | null
          output_product_name?: string | null
          ph_curve?: Json | null
          product_name: string
          product_type?: string | null
          retort1_abv_percent?: number | null
          retort1_content?: string | null
          retort1_elements?: string | null
          retort1_lal?: number | null
          retort1_volume_l?: number | null
          retort2_abv_percent?: number | null
          retort2_content?: string | null
          retort2_elements?: string | null
          retort2_lal?: number | null
          retort2_volume_l?: number | null
          still_used?: string | null
          substrate_batch?: string | null
          substrate_mass_kg?: number | null
          substrate_type?: string | null
          tails_segments?: Json | null
          temperature_curve?: Json | null
          total_lal_end?: number | null
          total_lal_start?: number | null
          updated_at?: string | null
          volume_filled_l?: number | null
          water_mass_kg?: number | null
          yeast_mass_g?: number | null
          yeast_rehydration_temp_c?: number | null
          yeast_rehydration_time_min?: number | null
          yeast_type?: string | null
        }
        Update: {
          additional_nutrients?: string | null
          anti_foam_ml?: number | null
          batch_id?: string
          boiler_abv_percent?: number | null
          boiler_elements?: string | null
          boiler_lal?: number | null
          boiler_volume_l?: number | null
          brix_curve?: Json | null
          calcium_carbonate_g?: number | null
          cask_number?: string | null
          cask_origin?: string | null
          cask_size_l?: number | null
          cask_type?: string | null
          citric_acid_g?: number | null
          created_at?: string | null
          created_by?: string | null
          dap_g?: number | null
          distillation_date?: string | null
          distillation_notes?: string | null
          distillation_start_time?: string | null
          dunder_added?: boolean | null
          dunder_ph?: number | null
          dunder_type?: string | null
          dunder_volume_l?: number | null
          expected_bottling_date?: string | null
          fermaid_g?: number | null
          fermentation_duration_hours?: number | null
          fermentation_notes?: string | null
          fermentation_start_date?: string | null
          fill_abv_percent?: number | null
          fill_date?: string | null
          final_abv_percent?: number | null
          final_brix?: number | null
          final_ph?: number | null
          foreshots_abv_percent?: number | null
          foreshots_notes?: string | null
          foreshots_time?: string | null
          heads_abv_percent?: number | null
          heads_lal?: number | null
          heads_notes?: string | null
          heads_time?: string | null
          heads_volume_l?: number | null
          heart_yield_percent?: number | null
          hearts_abv_percent?: number | null
          hearts_lal?: number | null
          hearts_notes?: string | null
          hearts_time?: string | null
          hearts_volume_l?: number | null
          id?: string
          initial_brix?: number | null
          initial_ph?: number | null
          lal_filled?: number | null
          lal_loss?: number | null
          maturation_location?: string | null
          notes?: string | null
          output_product_name?: string | null
          ph_curve?: Json | null
          product_name?: string
          product_type?: string | null
          retort1_abv_percent?: number | null
          retort1_content?: string | null
          retort1_elements?: string | null
          retort1_lal?: number | null
          retort1_volume_l?: number | null
          retort2_abv_percent?: number | null
          retort2_content?: string | null
          retort2_elements?: string | null
          retort2_lal?: number | null
          retort2_volume_l?: number | null
          still_used?: string | null
          substrate_batch?: string | null
          substrate_mass_kg?: number | null
          substrate_type?: string | null
          tails_segments?: Json | null
          temperature_curve?: Json | null
          total_lal_end?: number | null
          total_lal_start?: number | null
          updated_at?: string | null
          volume_filled_l?: number | null
          water_mass_kg?: number | null
          yeast_mass_g?: number | null
          yeast_rehydration_temp_c?: number | null
          yeast_rehydration_time_min?: number | null
          yeast_type?: string | null
        }
        Relationships: []
      }
      sales_items: {
        Row: {
          category: string
          created_at: string | null
          discounts_and_comps: number | null
          gross_sales: number | null
          id: string
          import_batch: string | null
          item_name: string
          item_variation: string
          items_sold: number | null
          net_sales: number | null
          organization_id: string
          period_end: string
          period_granularity: string
          period_start: string
          product_sales: number | null
          raw_payload: Json | null
          refunds: number | null
          sku: string
          tax: number | null
          units_sold: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          discounts_and_comps?: number | null
          gross_sales?: number | null
          id?: string
          import_batch?: string | null
          item_name: string
          item_variation?: string
          items_sold?: number | null
          net_sales?: number | null
          organization_id: string
          period_end: string
          period_granularity: string
          period_start: string
          product_sales?: number | null
          raw_payload?: Json | null
          refunds?: number | null
          sku?: string
          tax?: number | null
          units_sold?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          discounts_and_comps?: number | null
          gross_sales?: number | null
          id?: string
          import_batch?: string | null
          item_name?: string
          item_variation?: string
          items_sold?: number | null
          net_sales?: number | null
          organization_id?: string
          period_end?: string
          period_granularity?: string
          period_start?: string
          product_sales?: number | null
          raw_payload?: Json | null
          refunds?: number | null
          sku?: string
          tax?: number | null
          units_sold?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_items_organization_id_fkey"
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
          barrel_number: string | null
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
          barrel_number?: string | null
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
          barrel_number?: string | null
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
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
  public: {
    Enums: {},
  },
} as const
