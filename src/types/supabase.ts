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
      barrel_measurements: {
        Row: {
          after_abv_percent: number | null
          after_volume_l: number | null
          barrel_number: string | null
          barrel_uuid: string | null
          before_abv_percent: number | null
          before_volume_l: number | null
          created_at: string
          id: string
          lal_after: number | null
          lal_before: number | null
          lal_loss: number | null
          measured_at: string
          measurement_type: string
          organization_id: string | null
          source_key: string | null
          source_table: string | null
          summary: string | null
          volume_loss_l: number | null
          volume_loss_percent: number | null
        }
        Insert: {
          after_abv_percent?: number | null
          after_volume_l?: number | null
          barrel_number?: string | null
          barrel_uuid?: string | null
          before_abv_percent?: number | null
          before_volume_l?: number | null
          created_at?: string
          id?: string
          lal_after?: number | null
          lal_before?: number | null
          lal_loss?: number | null
          measured_at?: string
          measurement_type?: string
          organization_id?: string | null
          source_key?: string | null
          source_table?: string | null
          summary?: string | null
          volume_loss_l?: number | null
          volume_loss_percent?: number | null
        }
        Update: {
          after_abv_percent?: number | null
          after_volume_l?: number | null
          barrel_number?: string | null
          barrel_uuid?: string | null
          before_abv_percent?: number | null
          before_volume_l?: number | null
          created_at?: string
          id?: string
          lal_after?: number | null
          lal_before?: number | null
          lal_loss?: number | null
          measured_at?: string
          measurement_type?: string
          organization_id?: string | null
          source_key?: string | null
          source_table?: string | null
          summary?: string | null
          volume_loss_l?: number | null
          volume_loss_percent?: number | null
        }
        Relationships: []
      }
      barrel_movements: {
        Row: {
          barrel_number: string | null
          barrel_uuid: string | null
          blend_batch_id: string | null
          created_at: string
          from_status: string | null
          id: string
          moved_at: string
          movement_type: string
          notes: string | null
          organization_id: string | null
          source_key: string | null
          source_table: string | null
          to_status: string
        }
        Insert: {
          barrel_number?: string | null
          barrel_uuid?: string | null
          blend_batch_id?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          moved_at?: string
          movement_type?: string
          notes?: string | null
          organization_id?: string | null
          source_key?: string | null
          source_table?: string | null
          to_status: string
        }
        Update: {
          barrel_number?: string | null
          barrel_uuid?: string | null
          blend_batch_id?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          moved_at?: string
          movement_type?: string
          notes?: string | null
          organization_id?: string | null
          source_key?: string | null
          source_table?: string | null
          to_status?: string
        }
        Relationships: []
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
      barrel_tracking: {
        Row: {
          abv: string | null
          angels_share: string | null
          barrel: string | null
          barrel_id: string | null
          barrel_id_old: string | null
          batch: string | null
          created_at: string | null
          date_filled: string | null
          date_mature: string | null
          group_code: string | null
          id: number | null
          last_inspection: string | null
          location: string | null
          notes_comments: string | null
          organization_id: string | null
          original_volume_l: number | null
          prev_spirit: string | null
          size: string | null
          spirit: string | null
          status: string | null
          tasting_notes: string | null
          volume: string | null
        }
        Insert: {
          abv?: string | null
          angels_share?: string | null
          barrel?: string | null
          barrel_id?: string | null
          barrel_id_old?: string | null
          batch?: string | null
          created_at?: string | null
          date_filled?: string | null
          date_mature?: string | null
          group_code?: string | null
          id?: number | null
          last_inspection?: string | null
          location?: string | null
          notes_comments?: string | null
          organization_id?: string | null
          original_volume_l?: number | null
          prev_spirit?: string | null
          size?: string | null
          spirit?: string | null
          status?: string | null
          tasting_notes?: string | null
          volume?: string | null
        }
        Update: {
          abv?: string | null
          angels_share?: string | null
          barrel?: string | null
          barrel_id?: string | null
          barrel_id_old?: string | null
          batch?: string | null
          created_at?: string | null
          date_filled?: string | null
          date_mature?: string | null
          group_code?: string | null
          id?: number | null
          last_inspection?: string | null
          location?: string | null
          notes_comments?: string | null
          organization_id?: string | null
          original_volume_l?: number | null
          prev_spirit?: string | null
          size?: string | null
          spirit?: string | null
          status?: string | null
          tasting_notes?: string | null
          volume?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "barrel_tracking_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_botanicals: {
        Row: {
          batch_id: string
          batch_type: string
          botanical_name: string
          cost_per_kg: number | null
          created_at: string | null
          expiry_date: string | null
          id: string
          inventory_item_id: string | null
          invoice_reference: string | null
          lot_number: string | null
          notes: string | null
          organization_id: string
          quantity_g: number
          supplier: string | null
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          batch_id: string
          batch_type: string
          botanical_name: string
          cost_per_kg?: number | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          inventory_item_id?: string | null
          invoice_reference?: string | null
          lot_number?: string | null
          notes?: string | null
          organization_id: string
          quantity_g: number
          supplier?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          batch_id?: string
          batch_type?: string
          botanical_name?: string
          cost_per_kg?: number | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          inventory_item_id?: string | null
          invoice_reference?: string | null
          lot_number?: string | null
          notes?: string | null
          organization_id?: string
          quantity_g?: number
          supplier?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_botanicals_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_botanicals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_charges: {
        Row: {
          batch_id: string | null
          charge_abv_percent: number | null
          created_at: string | null
          ethanol_abv_percent: number | null
          ethanol_lal: number | null
          ethanol_source: string | null
          ethanol_volume_l: number | null
          id: string
          organization_id: string | null
          other_abv_percent: number | null
          other_lal: number | null
          other_source: string | null
          other_volume_l: number | null
          total_charge_l: number | null
          total_lal: number | null
          water_volume_l: number | null
        }
        Insert: {
          batch_id?: string | null
          charge_abv_percent?: number | null
          created_at?: string | null
          ethanol_abv_percent?: number | null
          ethanol_lal?: number | null
          ethanol_source?: string | null
          ethanol_volume_l?: number | null
          id?: string
          organization_id?: string | null
          other_abv_percent?: number | null
          other_lal?: number | null
          other_source?: string | null
          other_volume_l?: number | null
          total_charge_l?: number | null
          total_lal?: number | null
          water_volume_l?: number | null
        }
        Update: {
          batch_id?: string | null
          charge_abv_percent?: number | null
          created_at?: string | null
          ethanol_abv_percent?: number | null
          ethanol_lal?: number | null
          ethanol_source?: string | null
          ethanol_volume_l?: number | null
          id?: string
          organization_id?: string | null
          other_abv_percent?: number | null
          other_lal?: number | null
          other_source?: string | null
          other_volume_l?: number | null
          total_charge_l?: number | null
          total_lal?: number | null
          water_volume_l?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_charges_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "signature_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_charges_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_costs: {
        Row: {
          batch_id: string
          batch_type: string
          botanical_cost: number | null
          cost_per_bottle: number | null
          cost_per_liter: number | null
          created_at: string | null
          ethanol_cost: number | null
          id: string
          organization_id: string
          other_materials_cost: number | null
          packaging_cost: number | null
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          batch_id: string
          batch_type: string
          botanical_cost?: number | null
          cost_per_bottle?: number | null
          cost_per_liter?: number | null
          created_at?: string | null
          ethanol_cost?: number | null
          id?: string
          organization_id: string
          other_materials_cost?: number | null
          packaging_cost?: number | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          batch_id?: string
          batch_type?: string
          botanical_cost?: number | null
          cost_per_bottle?: number | null
          cost_per_liter?: number | null
          created_at?: string | null
          ethanol_cost?: number | null
          id?: string
          organization_id?: string
          other_materials_cost?: number | null
          packaging_cost?: number | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_costs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_materials: {
        Row: {
          abv: number | null
          batch_id: string
          batch_type: string
          cost_per_unit: number | null
          created_at: string | null
          id: string
          inventory_item_id: string | null
          invoice_reference: string | null
          item_name: string
          lot_number: string | null
          material_type: string
          notes: string | null
          organization_id: string
          quantity_l: number
          supplier: string | null
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          abv?: number | null
          batch_id: string
          batch_type: string
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          inventory_item_id?: string | null
          invoice_reference?: string | null
          item_name: string
          lot_number?: string | null
          material_type: string
          notes?: string | null
          organization_id: string
          quantity_l: number
          supplier?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          abv?: number | null
          batch_id?: string
          batch_type?: string
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          inventory_item_id?: string | null
          invoice_reference?: string | null
          item_name?: string
          lot_number?: string | null
          material_type?: string
          notes?: string | null
          organization_id?: string
          quantity_l?: number
          supplier?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_materials_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_materials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_packaging: {
        Row: {
          batch_id: string
          batch_type: string
          cost_per_unit: number | null
          created_at: string | null
          id: string
          inventory_item_id: string | null
          invoice_reference: string | null
          item_name: string
          notes: string | null
          organization_id: string
          packaging_type: string
          quantity_used: number
          supplier: string | null
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          batch_id: string
          batch_type: string
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          inventory_item_id?: string | null
          invoice_reference?: string | null
          item_name: string
          notes?: string | null
          organization_id: string
          packaging_type: string
          quantity_used: number
          supplier?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          batch_id?: string
          batch_type?: string
          cost_per_unit?: number | null
          created_at?: string | null
          id?: string
          inventory_item_id?: string | null
          invoice_reference?: string | null
          item_name?: string
          notes?: string | null
          organization_id?: string
          packaging_type?: string
          quantity_used?: number
          supplier?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_packaging_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batch_packaging_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          batch_code: string
          bottle_count: number | null
          bottle_size_ml: number | null
          cost_per_bottle: number | null
          cost_per_liter: number | null
          created_at: string | null
          date: string | null
          final_abv_percent: number | null
          final_lal: number | null
          final_volume_l: number | null
          id: string
          notes: string | null
          organization_id: string
          product_name: string
          product_type: string
          production_run_id: string | null
          recipe_id: string | null
          status: string
          still_used: string | null
          total_cost: number | null
          updated_at: string | null
        }
        Insert: {
          batch_code: string
          bottle_count?: number | null
          bottle_size_ml?: number | null
          cost_per_bottle?: number | null
          cost_per_liter?: number | null
          created_at?: string | null
          date?: string | null
          final_abv_percent?: number | null
          final_lal?: number | null
          final_volume_l?: number | null
          id?: string
          notes?: string | null
          organization_id?: string
          product_name: string
          product_type?: string
          production_run_id?: string | null
          recipe_id?: string | null
          status?: string
          still_used?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Update: {
          batch_code?: string
          bottle_count?: number | null
          bottle_size_ml?: number | null
          cost_per_bottle?: number | null
          cost_per_liter?: number | null
          created_at?: string | null
          date?: string | null
          final_abv_percent?: number | null
          final_lal?: number | null
          final_volume_l?: number | null
          id?: string
          notes?: string | null
          organization_id?: string
          product_name?: string
          product_type?: string
          production_run_id?: string | null
          recipe_id?: string | null
          status?: string
          still_used?: string | null
          total_cost?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batches_production_run_id_fkey"
            columns: ["production_run_id"]
            isOneToOne: false
            referencedRelation: "distillation_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      botanicals: {
        Row: {
          batch_id: string | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string | null
          ratio_percent: number | null
          weight_g: number | null
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id?: string | null
          ratio_percent?: number | null
          weight_g?: number | null
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string | null
          ratio_percent?: number | null
          weight_g?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "botanicals_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "signature_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "botanicals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bottling_runs: {
        Row: {
          bottle_entries: Json | null
          created_at: string | null
          dilution_phases: Json | null
          id: string
          mode: string | null
          notes: string | null
          organization_id: string | null
          product_name: string
          product_type: string
          selected_batches: Json | null
          summary: Json | null
          updated_at: string | null
        }
        Insert: {
          bottle_entries?: Json | null
          created_at?: string | null
          dilution_phases?: Json | null
          id?: string
          mode?: string | null
          notes?: string | null
          organization_id?: string | null
          product_name: string
          product_type: string
          selected_batches?: Json | null
          summary?: Json | null
          updated_at?: string | null
        }
        Update: {
          bottle_entries?: Json | null
          created_at?: string | null
          dilution_phases?: Json | null
          id?: string
          mode?: string | null
          notes?: string | null
          organization_id?: string | null
          product_name?: string
          product_type?: string
          selected_batches?: Json | null
          summary?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bottling_runs_organization_id_fkey"
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
      combined_dilutions: {
        Row: {
          abv_percent: number | null
          batch_id: string | null
          created_at: string | null
          filtered_water_l: number | null
          final_output_volume_l: number | null
          id: string
          lal: number | null
          new_make_l: number | null
          new_volume_l: number | null
          organization_id: string | null
        }
        Insert: {
          abv_percent?: number | null
          batch_id?: string | null
          created_at?: string | null
          filtered_water_l?: number | null
          final_output_volume_l?: number | null
          id?: string
          lal?: number | null
          new_make_l?: number | null
          new_volume_l?: number | null
          organization_id?: string | null
        }
        Update: {
          abv_percent?: number | null
          batch_id?: string | null
          created_at?: string | null
          filtered_water_l?: number | null
          final_output_volume_l?: number | null
          id?: string
          lal?: number | null
          new_make_l?: number | null
          new_volume_l?: number | null
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "combined_dilutions_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "signature_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "combined_dilutions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dilution_steps: {
        Row: {
          abv_percent: number | null
          batch_id: string | null
          created_at: string | null
          date_added: string | null
          filtered_water_l: number | null
          id: string
          lal: number | null
          new_make_l: number | null
          new_volume_l: number | null
          notes: string | null
          organization_id: string | null
          step: number | null
        }
        Insert: {
          abv_percent?: number | null
          batch_id?: string | null
          created_at?: string | null
          date_added?: string | null
          filtered_water_l?: number | null
          id?: string
          lal?: number | null
          new_make_l?: number | null
          new_volume_l?: number | null
          notes?: string | null
          organization_id?: string | null
          step?: number | null
        }
        Update: {
          abv_percent?: number | null
          batch_id?: string | null
          created_at?: string | null
          date_added?: string | null
          filtered_water_l?: number | null
          id?: string
          lal?: number | null
          new_make_l?: number | null
          new_volume_l?: number | null
          notes?: string | null
          organization_id?: string | null
          step?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dilution_steps_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "signature_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dilution_steps_organization_id_fkey"
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
      distillation_logs: {
        Row: {
          abv_percent: number | null
          ambient_temp_c: number | null
          batch_id: string | null
          condenser_temp_c: number | null
          created_at: string | null
          head_temp_c: number | null
          id: string
          lal: number | null
          organization_id: string | null
          phase: Database["public"]["Enums"]["run_phase"] | null
          power_notes: string | null
          time: string | null
          volume_l: number | null
        }
        Insert: {
          abv_percent?: number | null
          ambient_temp_c?: number | null
          batch_id?: string | null
          condenser_temp_c?: number | null
          created_at?: string | null
          head_temp_c?: number | null
          id?: string
          lal?: number | null
          organization_id?: string | null
          phase?: Database["public"]["Enums"]["run_phase"] | null
          power_notes?: string | null
          time?: string | null
          volume_l?: number | null
        }
        Update: {
          abv_percent?: number | null
          ambient_temp_c?: number | null
          batch_id?: string | null
          condenser_temp_c?: number | null
          created_at?: string | null
          head_temp_c?: number | null
          id?: string
          lal?: number | null
          organization_id?: string | null
          phase?: Database["public"]["Enums"]["run_phase"] | null
          power_notes?: string | null
          time?: string | null
          volume_l?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "distillation_logs_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "signature_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distillation_logs_organization_id_fkey"
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
          organization_id: string | null
          plates: string | null
          power_setting: string | null
          product_id: string | null
          recipe_id: string | null
          sku: string
          status: string
          steeping_end_time: string | null
          steeping_start_time: string | null
          steeping_temp_c: number | null
          step_number: number | null
          step_payload: Json | null
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
          organization_id?: string | null
          plates?: string | null
          power_setting?: string | null
          product_id?: string | null
          recipe_id?: string | null
          sku: string
          status?: string
          steeping_end_time?: string | null
          steeping_start_time?: string | null
          steeping_temp_c?: number | null
          step_number?: number | null
          step_payload?: Json | null
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
          organization_id?: string | null
          plates?: string | null
          power_setting?: string | null
          product_id?: string | null
          recipe_id?: string | null
          sku?: string
          status?: string
          steeping_end_time?: string | null
          steeping_start_time?: string | null
          steeping_temp_c?: number | null
          step_number?: number | null
          step_payload?: Json | null
          still_used?: string
          tails_abv_percent?: number | null
          tails_lal?: number | null
          tails_segments?: Json | null
          tails_volume_l?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dry_season_gin_batches: {
        Row: {
          batch_id: string
          boiler_abv_percent: number | null
          boiler_charge_l: number | null
          boiler_lal: number | null
          bottles_700ml: number | null
          bottling_date: string | null
          created_at: string | null
          created_by: string | null
          distillation_date: string | null
          distillation_duration_hours: number | null
          distillation_notes: string | null
          distillation_start_time: string | null
          final_abv_percent: number | null
          final_volume_l: number | null
          heart_yield_percent: number | null
          id: string
          lal_filled: number | null
          notes: string | null
          organization_id: string | null
          product_name: string | null
          product_type: string | null
          raw_log: Json | null
          sku: string | null
          still_used: string | null
          total_lal_collected: number | null
        }
        Insert: {
          batch_id: string
          boiler_abv_percent?: number | null
          boiler_charge_l?: number | null
          boiler_lal?: number | null
          bottles_700ml?: number | null
          bottling_date?: string | null
          created_at?: string | null
          created_by?: string | null
          distillation_date?: string | null
          distillation_duration_hours?: number | null
          distillation_notes?: string | null
          distillation_start_time?: string | null
          final_abv_percent?: number | null
          final_volume_l?: number | null
          heart_yield_percent?: number | null
          id: string
          lal_filled?: number | null
          notes?: string | null
          organization_id?: string | null
          product_name?: string | null
          product_type?: string | null
          raw_log?: Json | null
          sku?: string | null
          still_used?: string | null
          total_lal_collected?: number | null
        }
        Update: {
          batch_id?: string
          boiler_abv_percent?: number | null
          boiler_charge_l?: number | null
          boiler_lal?: number | null
          bottles_700ml?: number | null
          bottling_date?: string | null
          created_at?: string | null
          created_by?: string | null
          distillation_date?: string | null
          distillation_duration_hours?: number | null
          distillation_notes?: string | null
          distillation_start_time?: string | null
          final_abv_percent?: number | null
          final_volume_l?: number | null
          heart_yield_percent?: number | null
          id?: string
          lal_filled?: number | null
          notes?: string | null
          organization_id?: string | null
          product_name?: string | null
          product_type?: string | null
          raw_log?: Json | null
          sku?: string | null
          still_used?: string | null
          total_lal_collected?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dry_season_gin_batches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dry_season_gin_botanicals: {
        Row: {
          batch_id: string | null
          created_at: string | null
          id: string
          name: string
          organization_id: string | null
          weight_g: number
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          organization_id?: string | null
          weight_g: number
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          weight_g?: number
        }
        Relationships: [
          {
            foreignKeyName: "dry_season_gin_botanicals_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "dry_season_gin_batches"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "dry_season_gin_botanicals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dry_season_gin_dilution: {
        Row: {
          abv_percent: number | null
          batch_id: string | null
          created_at: string | null
          date: string | null
          filtered_water_l: number | null
          id: string
          new_volume_l: number | null
          organization_id: string | null
          stage: number
          start_volume_l: number | null
        }
        Insert: {
          abv_percent?: number | null
          batch_id?: string | null
          created_at?: string | null
          date?: string | null
          filtered_water_l?: number | null
          id?: string
          new_volume_l?: number | null
          organization_id?: string | null
          stage: number
          start_volume_l?: number | null
        }
        Update: {
          abv_percent?: number | null
          batch_id?: string | null
          created_at?: string | null
          date?: string | null
          filtered_water_l?: number | null
          id?: string
          new_volume_l?: number | null
          organization_id?: string | null
          stage?: number
          start_volume_l?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dry_season_gin_dilution_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "dry_season_gin_batches"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "dry_season_gin_dilution_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dry_season_gin_distillation_cuts: {
        Row: {
          abv_percent: number | null
          batch_id: string | null
          created_at: string | null
          cut_type: string
          id: string
          lal: number | null
          notes: string | null
          organization_id: string | null
          volume_l: number | null
        }
        Insert: {
          abv_percent?: number | null
          batch_id?: string | null
          created_at?: string | null
          cut_type: string
          id?: string
          lal?: number | null
          notes?: string | null
          organization_id?: string | null
          volume_l?: number | null
        }
        Update: {
          abv_percent?: number | null
          batch_id?: string | null
          created_at?: string | null
          cut_type?: string
          id?: string
          lal?: number | null
          notes?: string | null
          organization_id?: string | null
          volume_l?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dry_season_gin_distillation_cuts_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "dry_season_gin_batches"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "dry_season_gin_distillation_cuts_organization_id_fkey"
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
      inventory_movements: {
        Row: {
          batch_type: string | null
          cost_per_unit: number | null
          created_at: string | null
          created_by: string | null
          id: string
          invoice_reference: string | null
          item_id: string
          movement_type: string
          notes: string | null
          organization_id: string
          quantity_change: number
          reference_id: string | null
          reference_type: string | null
          supplier: string | null
          total_cost: number | null
          unit: string
        }
        Insert: {
          batch_type?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          invoice_reference?: string | null
          item_id: string
          movement_type: string
          notes?: string | null
          organization_id: string
          quantity_change: number
          reference_id?: string | null
          reference_type?: string | null
          supplier?: string | null
          total_cost?: number | null
          unit: string
        }
        Update: {
          batch_type?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          invoice_reference?: string | null
          item_id?: string
          movement_type?: string
          notes?: string | null
          organization_id?: string
          quantity_change?: number
          reference_id?: string | null
          reference_type?: string | null
          supplier?: string | null
          total_cost?: number | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_organization_id_fkey"
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
      navy_gin_batches: {
        Row: {
          batch_id: string
          boiler_abv_percent: number | null
          boiler_charge_l: number | null
          boiler_lal: number | null
          bottles_700ml: number | null
          bottling_date: string | null
          created_at: string | null
          created_by: string | null
          distillation_date: string | null
          distillation_duration_hours: number | null
          distillation_notes: string | null
          distillation_start_time: string | null
          final_abv_percent: number | null
          final_volume_l: number | null
          heart_yield_percent: number | null
          id: string
          lal_filled: number | null
          notes: string | null
          organization_id: string | null
          product_name: string | null
          product_type: string | null
          raw_log: Json | null
          sku: string | null
          still_used: string | null
          total_lal_collected: number | null
        }
        Insert: {
          batch_id: string
          boiler_abv_percent?: number | null
          boiler_charge_l?: number | null
          boiler_lal?: number | null
          bottles_700ml?: number | null
          bottling_date?: string | null
          created_at?: string | null
          created_by?: string | null
          distillation_date?: string | null
          distillation_duration_hours?: number | null
          distillation_notes?: string | null
          distillation_start_time?: string | null
          final_abv_percent?: number | null
          final_volume_l?: number | null
          heart_yield_percent?: number | null
          id: string
          lal_filled?: number | null
          notes?: string | null
          organization_id?: string | null
          product_name?: string | null
          product_type?: string | null
          raw_log?: Json | null
          sku?: string | null
          still_used?: string | null
          total_lal_collected?: number | null
        }
        Update: {
          batch_id?: string
          boiler_abv_percent?: number | null
          boiler_charge_l?: number | null
          boiler_lal?: number | null
          bottles_700ml?: number | null
          bottling_date?: string | null
          created_at?: string | null
          created_by?: string | null
          distillation_date?: string | null
          distillation_duration_hours?: number | null
          distillation_notes?: string | null
          distillation_start_time?: string | null
          final_abv_percent?: number | null
          final_volume_l?: number | null
          heart_yield_percent?: number | null
          id?: string
          lal_filled?: number | null
          notes?: string | null
          organization_id?: string | null
          product_name?: string | null
          product_type?: string | null
          raw_log?: Json | null
          sku?: string | null
          still_used?: string | null
          total_lal_collected?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "navy_gin_batches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      navy_gin_botanicals: {
        Row: {
          batch_id: string | null
          created_at: string | null
          id: string
          name: string
          organization_id: string | null
          weight_g: number
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          organization_id?: string | null
          weight_g: number
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          weight_g?: number
        }
        Relationships: [
          {
            foreignKeyName: "navy_gin_botanicals_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "navy_gin_batches"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "navy_gin_botanicals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      navy_gin_dilution: {
        Row: {
          abv_percent: number | null
          batch_id: string | null
          created_at: string | null
          date: string | null
          filtered_water_l: number | null
          id: string
          new_volume_l: number | null
          organization_id: string | null
          stage: number
          start_volume_l: number | null
        }
        Insert: {
          abv_percent?: number | null
          batch_id?: string | null
          created_at?: string | null
          date?: string | null
          filtered_water_l?: number | null
          id?: string
          new_volume_l?: number | null
          organization_id?: string | null
          stage: number
          start_volume_l?: number | null
        }
        Update: {
          abv_percent?: number | null
          batch_id?: string | null
          created_at?: string | null
          date?: string | null
          filtered_water_l?: number | null
          id?: string
          new_volume_l?: number | null
          organization_id?: string | null
          stage?: number
          start_volume_l?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "navy_gin_dilution_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "navy_gin_batches"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "navy_gin_dilution_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      navy_gin_distillation_cuts: {
        Row: {
          abv_percent: number | null
          batch_id: string | null
          created_at: string | null
          cut_type: string
          id: string
          lal: number | null
          notes: string | null
          organization_id: string | null
          volume_l: number | null
        }
        Insert: {
          abv_percent?: number | null
          batch_id?: string | null
          created_at?: string | null
          cut_type: string
          id?: string
          lal?: number | null
          notes?: string | null
          organization_id?: string | null
          volume_l?: number | null
        }
        Update: {
          abv_percent?: number | null
          batch_id?: string | null
          created_at?: string | null
          cut_type?: string
          id?: string
          lal?: number | null
          notes?: string | null
          organization_id?: string | null
          volume_l?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "navy_gin_distillation_cuts_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "navy_gin_batches"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "navy_gin_distillation_cuts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      old_roberta_batches: {
        Row: {
          batch_id: string
          charge_l: number | null
          created_at: string
          distillation_date: string | null
          fermentation_date: string | null
          heads_volume_l: number | null
          hearts_abv_percent: number | null
          hearts_lal: number | null
          hearts_volume_l: number | null
          id: string
          notes: string | null
          organization_id: string | null
          product_type: string
          still_used: string | null
          tails_volume_l: number | null
          updated_at: string
          wash_abv_percent: number | null
          wash_volume_l: number | null
        }
        Insert: {
          batch_id: string
          charge_l?: number | null
          created_at?: string
          distillation_date?: string | null
          fermentation_date?: string | null
          heads_volume_l?: number | null
          hearts_abv_percent?: number | null
          hearts_lal?: number | null
          hearts_volume_l?: number | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          product_type?: string
          still_used?: string | null
          tails_volume_l?: number | null
          updated_at?: string
          wash_abv_percent?: number | null
          wash_volume_l?: number | null
        }
        Update: {
          batch_id?: string
          charge_l?: number | null
          created_at?: string
          distillation_date?: string | null
          fermentation_date?: string | null
          heads_volume_l?: number | null
          hearts_abv_percent?: number | null
          hearts_lal?: number | null
          hearts_volume_l?: number | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          product_type?: string
          still_used?: string | null
          tails_volume_l?: number | null
          updated_at?: string
          wash_abv_percent?: number | null
          wash_volume_l?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "old_roberta_batches_organization_id_fkey"
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
          currency: string | null
          id: string
          logo_url: string | null
          max_barrels: number
          max_batches_per_month: number
          max_users: number
          name: string
          settings: Json | null
          slug: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string
          subscription_tier: string
          timezone: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          id?: string
          logo_url?: string | null
          max_barrels?: number
          max_batches_per_month?: number
          max_users?: number
          name: string
          settings?: Json | null
          slug?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string
          subscription_tier?: string
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          id?: string
          logo_url?: string | null
          max_barrels?: number
          max_batches_per_month?: number
          max_users?: number
          name?: string
          settings?: Json | null
          slug?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string
          subscription_tier?: string
          timezone?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      outputs: {
        Row: {
          abv_percent: number | null
          batch_id: string | null
          created_at: string | null
          destination: string | null
          id: string
          lal: number | null
          notes: string | null
          organization_id: string | null
          phase: Database["public"]["Enums"]["run_phase"] | null
          volume_l: number | null
        }
        Insert: {
          abv_percent?: number | null
          batch_id?: string | null
          created_at?: string | null
          destination?: string | null
          id?: string
          lal?: number | null
          notes?: string | null
          organization_id?: string | null
          phase?: Database["public"]["Enums"]["run_phase"] | null
          volume_l?: number | null
        }
        Update: {
          abv_percent?: number | null
          batch_id?: string | null
          created_at?: string | null
          destination?: string | null
          id?: string
          lal?: number | null
          notes?: string | null
          organization_id?: string | null
          phase?: Database["public"]["Enums"]["run_phase"] | null
          volume_l?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "outputs_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "signature_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outputs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      production_batches: {
        Row: {
          created_at: string
          data: Json
          id: string
          organization_id: string | null
          still: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          id: string
          organization_id?: string | null
          still: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          organization_id?: string | null
          still?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_batches_organization_id_fkey"
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
      production_recipes: {
        Row: {
          created_at: string
          data: Json
          description: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          organization_id: string | null
          product_type: string
          recipe_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data?: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          organization_id?: string | null
          product_type: string
          recipe_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          organization_id?: string | null
          product_type?: string
          recipe_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_recipes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          onboarding_completed: boolean | null
          organization_id: string | null
          role: string | null
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          organization_id?: string | null
          role?: string | null
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
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
      rainforest_gin_batches: {
        Row: {
          batch_id: string
          boiler_abv_percent: number | null
          boiler_charge_l: number | null
          boiler_lal: number | null
          bottles_700ml: number | null
          bottling_date: string | null
          created_at: string | null
          created_by: string | null
          distillation_date: string | null
          distillation_duration_hours: number | null
          distillation_notes: string | null
          distillation_start_time: string | null
          final_abv_percent: number | null
          final_volume_l: number | null
          heart_yield_percent: number | null
          id: string
          lal_filled: number | null
          notes: string | null
          organization_id: string | null
          product_name: string | null
          product_type: string | null
          raw_log: Json | null
          sku: string | null
          still_used: string | null
          total_lal_collected: number | null
        }
        Insert: {
          batch_id: string
          boiler_abv_percent?: number | null
          boiler_charge_l?: number | null
          boiler_lal?: number | null
          bottles_700ml?: number | null
          bottling_date?: string | null
          created_at?: string | null
          created_by?: string | null
          distillation_date?: string | null
          distillation_duration_hours?: number | null
          distillation_notes?: string | null
          distillation_start_time?: string | null
          final_abv_percent?: number | null
          final_volume_l?: number | null
          heart_yield_percent?: number | null
          id: string
          lal_filled?: number | null
          notes?: string | null
          organization_id?: string | null
          product_name?: string | null
          product_type?: string | null
          raw_log?: Json | null
          sku?: string | null
          still_used?: string | null
          total_lal_collected?: number | null
        }
        Update: {
          batch_id?: string
          boiler_abv_percent?: number | null
          boiler_charge_l?: number | null
          boiler_lal?: number | null
          bottles_700ml?: number | null
          bottling_date?: string | null
          created_at?: string | null
          created_by?: string | null
          distillation_date?: string | null
          distillation_duration_hours?: number | null
          distillation_notes?: string | null
          distillation_start_time?: string | null
          final_abv_percent?: number | null
          final_volume_l?: number | null
          heart_yield_percent?: number | null
          id?: string
          lal_filled?: number | null
          notes?: string | null
          organization_id?: string | null
          product_name?: string | null
          product_type?: string | null
          raw_log?: Json | null
          sku?: string | null
          still_used?: string | null
          total_lal_collected?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rainforest_gin_batches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rainforest_gin_botanicals: {
        Row: {
          batch_id: string | null
          created_at: string | null
          id: string
          name: string
          organization_id: string | null
          weight_g: number
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          organization_id?: string | null
          weight_g: number
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          weight_g?: number
        }
        Relationships: [
          {
            foreignKeyName: "rainforest_gin_botanicals_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "rainforest_gin_batches"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "rainforest_gin_botanicals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rainforest_gin_dilution: {
        Row: {
          abv_percent: number | null
          batch_id: string | null
          created_at: string | null
          date: string | null
          filtered_water_l: number | null
          id: string
          new_volume_l: number | null
          organization_id: string | null
          stage: number
          start_volume_l: number | null
        }
        Insert: {
          abv_percent?: number | null
          batch_id?: string | null
          created_at?: string | null
          date?: string | null
          filtered_water_l?: number | null
          id?: string
          new_volume_l?: number | null
          organization_id?: string | null
          stage: number
          start_volume_l?: number | null
        }
        Update: {
          abv_percent?: number | null
          batch_id?: string | null
          created_at?: string | null
          date?: string | null
          filtered_water_l?: number | null
          id?: string
          new_volume_l?: number | null
          organization_id?: string | null
          stage?: number
          start_volume_l?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rainforest_gin_dilution_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "rainforest_gin_batches"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "rainforest_gin_dilution_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rainforest_gin_distillation_cuts: {
        Row: {
          abv_percent: number | null
          batch_id: string | null
          created_at: string | null
          cut_type: string
          id: string
          lal: number | null
          notes: string | null
          organization_id: string | null
          volume_l: number | null
        }
        Insert: {
          abv_percent?: number | null
          batch_id?: string | null
          created_at?: string | null
          cut_type: string
          id?: string
          lal?: number | null
          notes?: string | null
          organization_id?: string | null
          volume_l?: number | null
        }
        Update: {
          abv_percent?: number | null
          batch_id?: string | null
          created_at?: string | null
          cut_type?: string
          id?: string
          lal?: number | null
          notes?: string | null
          organization_id?: string | null
          volume_l?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rainforest_gin_distillation_cuts_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "rainforest_gin_batches"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "rainforest_gin_distillation_cuts_organization_id_fkey"
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
          aging_status: string | null
          anti_foam_ml: number | null
          antifoam_added: boolean | null
          barrel_aging_batch_name: string | null
          barrel_aging_notes: string | null
          batch_id: string
          batch_name: string | null
          boiler_abv_percent: number | null
          boiler_elements: string | null
          boiler_lal: number | null
          boiler_volume_l: number | null
          bottling_status: string | null
          brix_curve: Json | null
          calcium_carbonate_g: number | null
          calculated_abv_percent: number | null
          cask_number: string | null
          cask_origin: string | null
          cask_size_l: number | null
          cask_type: string | null
          chems_added: string | null
          citric_acid_g: number | null
          created_at: string | null
          created_by: string | null
          dap_g: number | null
          distillation_date: string | null
          distillation_notes: string | null
          distillation_start_time: string | null
          distillation_status: string | null
          dunder_added: boolean | null
          dunder_batch: string | null
          dunder_ph: number | null
          dunder_type: string | null
          dunder_volume_l: number | null
          early_tails_abv_percent: number | null
          early_tails_cut_abv_percent: number | null
          early_tails_cut_time: string | null
          early_tails_density: number | null
          early_tails_lal: number | null
          early_tails_total_abv_percent: number | null
          early_tails_volume_l: number | null
          expected_bottling_date: string | null
          fermaid_g: number | null
          fermentation_date: string | null
          fermentation_day: number | null
          fermentation_duration_hours: number | null
          fermentation_notes: string | null
          fermentation_readings: Json | null
          fermentation_start_date: string | null
          fermentation_status: string | null
          fill_abv_percent: number | null
          fill_date: string | null
          final_abv_after_dilution_percent: number | null
          final_abv_percent: number | null
          final_brix: number | null
          final_ph: number | null
          final_volume_after_dilution_l: number | null
          first_spirit_abv_percent: number | null
          first_spirit_density: number | null
          first_spirit_pot_temperature_c: number | null
          first_spirit_time: string | null
          flow_l_per_h: number | null
          foreshots_abv_percent: number | null
          foreshots_notes: string | null
          foreshots_time: string | null
          foreshots_volume_l: number | null
          heads_abv_percent: number | null
          heads_added_abv_percent: number | null
          heads_added_lal: number | null
          heads_added_volume_l: number | null
          heads_cut_abv_percent: number | null
          heads_cut_density: number | null
          heads_cut_lal: number | null
          heads_cut_time: string | null
          heads_cut_volume_l: number | null
          heads_lal: number | null
          heads_notes: string | null
          heads_time: string | null
          heads_volume_l: number | null
          heart_yield_percent: number | null
          hearts_abv_percent: number | null
          hearts_cut_abv_percent: number | null
          hearts_cut_density: number | null
          hearts_cut_time: string | null
          hearts_density: number | null
          hearts_lal: number | null
          hearts_notes: string | null
          hearts_time: string | null
          hearts_volume_l: number | null
          id: string
          initial_brix: number | null
          initial_ph: number | null
          initial_temperature_c: number | null
          lal_filled: number | null
          lal_loss: number | null
          late_tails_abv_percent: number | null
          late_tails_cut_abv_percent: number | null
          late_tails_cut_time: string | null
          late_tails_density: number | null
          late_tails_lal: number | null
          late_tails_total_abv_percent: number | null
          late_tails_volume_l: number | null
          maturation_location: string | null
          notes: string | null
          nutrients_added: string | null
          organization_id: string | null
          output_product_name: string | null
          overall_status: string | null
          ph_curve: Json | null
          power_input_boiler_a: number | null
          power_input_changed_to: number | null
          power_input_changed_to_2: number | null
          power_input_pot_a: number | null
          power_input_r1_a: number | null
          power_input_r2_a: number | null
          product_name: string
          product_type: string | null
          r1_heat_starting_time: string | null
          r1_power_input_a: number | null
          r1_temperature_c: number | null
          r2_heat_starting_time: string | null
          r2_power_input_a: number | null
          r2_temperature_c: number | null
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
          status: Database["public"]["Enums"]["production_status"] | null
          still_heat_starting_time: string | null
          still_used: string | null
          substrate_batch: string | null
          substrate_mass_kg: number | null
          substrate_type: string | null
          substrates: Json | null
          tails_abv_percent: number | null
          tails_segments: Json | null
          tails_volume_l: number | null
          temperature_control_settings: string | null
          temperature_curve: Json | null
          total_lal_end: number | null
          total_lal_start: number | null
          updated_at: string | null
          volume_filled_l: number | null
          water_added_for_dilution_l: number | null
          water_mass_kg: number | null
          water_volume_l: number | null
          yeast_mass_g: number | null
          yeast_rehydration_temp_c: number | null
          yeast_rehydration_temperature_c: number | null
          yeast_rehydration_time_min: number | null
          yeast_type: string | null
        }
        Insert: {
          additional_nutrients?: string | null
          aging_status?: string | null
          anti_foam_ml?: number | null
          antifoam_added?: boolean | null
          barrel_aging_batch_name?: string | null
          barrel_aging_notes?: string | null
          batch_id: string
          batch_name?: string | null
          boiler_abv_percent?: number | null
          boiler_elements?: string | null
          boiler_lal?: number | null
          boiler_volume_l?: number | null
          bottling_status?: string | null
          brix_curve?: Json | null
          calcium_carbonate_g?: number | null
          calculated_abv_percent?: number | null
          cask_number?: string | null
          cask_origin?: string | null
          cask_size_l?: number | null
          cask_type?: string | null
          chems_added?: string | null
          citric_acid_g?: number | null
          created_at?: string | null
          created_by?: string | null
          dap_g?: number | null
          distillation_date?: string | null
          distillation_notes?: string | null
          distillation_start_time?: string | null
          distillation_status?: string | null
          dunder_added?: boolean | null
          dunder_batch?: string | null
          dunder_ph?: number | null
          dunder_type?: string | null
          dunder_volume_l?: number | null
          early_tails_abv_percent?: number | null
          early_tails_cut_abv_percent?: number | null
          early_tails_cut_time?: string | null
          early_tails_density?: number | null
          early_tails_lal?: number | null
          early_tails_total_abv_percent?: number | null
          early_tails_volume_l?: number | null
          expected_bottling_date?: string | null
          fermaid_g?: number | null
          fermentation_date?: string | null
          fermentation_day?: number | null
          fermentation_duration_hours?: number | null
          fermentation_notes?: string | null
          fermentation_readings?: Json | null
          fermentation_start_date?: string | null
          fermentation_status?: string | null
          fill_abv_percent?: number | null
          fill_date?: string | null
          final_abv_after_dilution_percent?: number | null
          final_abv_percent?: number | null
          final_brix?: number | null
          final_ph?: number | null
          final_volume_after_dilution_l?: number | null
          first_spirit_abv_percent?: number | null
          first_spirit_density?: number | null
          first_spirit_pot_temperature_c?: number | null
          first_spirit_time?: string | null
          flow_l_per_h?: number | null
          foreshots_abv_percent?: number | null
          foreshots_notes?: string | null
          foreshots_time?: string | null
          foreshots_volume_l?: number | null
          heads_abv_percent?: number | null
          heads_added_abv_percent?: number | null
          heads_added_lal?: number | null
          heads_added_volume_l?: number | null
          heads_cut_abv_percent?: number | null
          heads_cut_density?: number | null
          heads_cut_lal?: number | null
          heads_cut_time?: string | null
          heads_cut_volume_l?: number | null
          heads_lal?: number | null
          heads_notes?: string | null
          heads_time?: string | null
          heads_volume_l?: number | null
          heart_yield_percent?: number | null
          hearts_abv_percent?: number | null
          hearts_cut_abv_percent?: number | null
          hearts_cut_density?: number | null
          hearts_cut_time?: string | null
          hearts_density?: number | null
          hearts_lal?: number | null
          hearts_notes?: string | null
          hearts_time?: string | null
          hearts_volume_l?: number | null
          id?: string
          initial_brix?: number | null
          initial_ph?: number | null
          initial_temperature_c?: number | null
          lal_filled?: number | null
          lal_loss?: number | null
          late_tails_abv_percent?: number | null
          late_tails_cut_abv_percent?: number | null
          late_tails_cut_time?: string | null
          late_tails_density?: number | null
          late_tails_lal?: number | null
          late_tails_total_abv_percent?: number | null
          late_tails_volume_l?: number | null
          maturation_location?: string | null
          notes?: string | null
          nutrients_added?: string | null
          organization_id?: string | null
          output_product_name?: string | null
          overall_status?: string | null
          ph_curve?: Json | null
          power_input_boiler_a?: number | null
          power_input_changed_to?: number | null
          power_input_changed_to_2?: number | null
          power_input_pot_a?: number | null
          power_input_r1_a?: number | null
          power_input_r2_a?: number | null
          product_name: string
          product_type?: string | null
          r1_heat_starting_time?: string | null
          r1_power_input_a?: number | null
          r1_temperature_c?: number | null
          r2_heat_starting_time?: string | null
          r2_power_input_a?: number | null
          r2_temperature_c?: number | null
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
          status?: Database["public"]["Enums"]["production_status"] | null
          still_heat_starting_time?: string | null
          still_used?: string | null
          substrate_batch?: string | null
          substrate_mass_kg?: number | null
          substrate_type?: string | null
          substrates?: Json | null
          tails_abv_percent?: number | null
          tails_segments?: Json | null
          tails_volume_l?: number | null
          temperature_control_settings?: string | null
          temperature_curve?: Json | null
          total_lal_end?: number | null
          total_lal_start?: number | null
          updated_at?: string | null
          volume_filled_l?: number | null
          water_added_for_dilution_l?: number | null
          water_mass_kg?: number | null
          water_volume_l?: number | null
          yeast_mass_g?: number | null
          yeast_rehydration_temp_c?: number | null
          yeast_rehydration_temperature_c?: number | null
          yeast_rehydration_time_min?: number | null
          yeast_type?: string | null
        }
        Update: {
          additional_nutrients?: string | null
          aging_status?: string | null
          anti_foam_ml?: number | null
          antifoam_added?: boolean | null
          barrel_aging_batch_name?: string | null
          barrel_aging_notes?: string | null
          batch_id?: string
          batch_name?: string | null
          boiler_abv_percent?: number | null
          boiler_elements?: string | null
          boiler_lal?: number | null
          boiler_volume_l?: number | null
          bottling_status?: string | null
          brix_curve?: Json | null
          calcium_carbonate_g?: number | null
          calculated_abv_percent?: number | null
          cask_number?: string | null
          cask_origin?: string | null
          cask_size_l?: number | null
          cask_type?: string | null
          chems_added?: string | null
          citric_acid_g?: number | null
          created_at?: string | null
          created_by?: string | null
          dap_g?: number | null
          distillation_date?: string | null
          distillation_notes?: string | null
          distillation_start_time?: string | null
          distillation_status?: string | null
          dunder_added?: boolean | null
          dunder_batch?: string | null
          dunder_ph?: number | null
          dunder_type?: string | null
          dunder_volume_l?: number | null
          early_tails_abv_percent?: number | null
          early_tails_cut_abv_percent?: number | null
          early_tails_cut_time?: string | null
          early_tails_density?: number | null
          early_tails_lal?: number | null
          early_tails_total_abv_percent?: number | null
          early_tails_volume_l?: number | null
          expected_bottling_date?: string | null
          fermaid_g?: number | null
          fermentation_date?: string | null
          fermentation_day?: number | null
          fermentation_duration_hours?: number | null
          fermentation_notes?: string | null
          fermentation_readings?: Json | null
          fermentation_start_date?: string | null
          fermentation_status?: string | null
          fill_abv_percent?: number | null
          fill_date?: string | null
          final_abv_after_dilution_percent?: number | null
          final_abv_percent?: number | null
          final_brix?: number | null
          final_ph?: number | null
          final_volume_after_dilution_l?: number | null
          first_spirit_abv_percent?: number | null
          first_spirit_density?: number | null
          first_spirit_pot_temperature_c?: number | null
          first_spirit_time?: string | null
          flow_l_per_h?: number | null
          foreshots_abv_percent?: number | null
          foreshots_notes?: string | null
          foreshots_time?: string | null
          foreshots_volume_l?: number | null
          heads_abv_percent?: number | null
          heads_added_abv_percent?: number | null
          heads_added_lal?: number | null
          heads_added_volume_l?: number | null
          heads_cut_abv_percent?: number | null
          heads_cut_density?: number | null
          heads_cut_lal?: number | null
          heads_cut_time?: string | null
          heads_cut_volume_l?: number | null
          heads_lal?: number | null
          heads_notes?: string | null
          heads_time?: string | null
          heads_volume_l?: number | null
          heart_yield_percent?: number | null
          hearts_abv_percent?: number | null
          hearts_cut_abv_percent?: number | null
          hearts_cut_density?: number | null
          hearts_cut_time?: string | null
          hearts_density?: number | null
          hearts_lal?: number | null
          hearts_notes?: string | null
          hearts_time?: string | null
          hearts_volume_l?: number | null
          id?: string
          initial_brix?: number | null
          initial_ph?: number | null
          initial_temperature_c?: number | null
          lal_filled?: number | null
          lal_loss?: number | null
          late_tails_abv_percent?: number | null
          late_tails_cut_abv_percent?: number | null
          late_tails_cut_time?: string | null
          late_tails_density?: number | null
          late_tails_lal?: number | null
          late_tails_total_abv_percent?: number | null
          late_tails_volume_l?: number | null
          maturation_location?: string | null
          notes?: string | null
          nutrients_added?: string | null
          organization_id?: string | null
          output_product_name?: string | null
          overall_status?: string | null
          ph_curve?: Json | null
          power_input_boiler_a?: number | null
          power_input_changed_to?: number | null
          power_input_changed_to_2?: number | null
          power_input_pot_a?: number | null
          power_input_r1_a?: number | null
          power_input_r2_a?: number | null
          product_name?: string
          product_type?: string | null
          r1_heat_starting_time?: string | null
          r1_power_input_a?: number | null
          r1_temperature_c?: number | null
          r2_heat_starting_time?: string | null
          r2_power_input_a?: number | null
          r2_temperature_c?: number | null
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
          status?: Database["public"]["Enums"]["production_status"] | null
          still_heat_starting_time?: string | null
          still_used?: string | null
          substrate_batch?: string | null
          substrate_mass_kg?: number | null
          substrate_type?: string | null
          substrates?: Json | null
          tails_abv_percent?: number | null
          tails_segments?: Json | null
          tails_volume_l?: number | null
          temperature_control_settings?: string | null
          temperature_curve?: Json | null
          total_lal_end?: number | null
          total_lal_start?: number | null
          updated_at?: string | null
          volume_filled_l?: number | null
          water_added_for_dilution_l?: number | null
          water_mass_kg?: number | null
          water_volume_l?: number | null
          yeast_mass_g?: number | null
          yeast_rehydration_temp_c?: number | null
          yeast_rehydration_temperature_c?: number | null
          yeast_rehydration_time_min?: number | null
          yeast_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rum_production_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      run_totals: {
        Row: {
          batch_id: string | null
          botanicals_g_per_lal: number | null
          created_at: string | null
          hearts_percent_of_run: number | null
          id: string
          organization_id: string | null
          total_collected_l: number | null
          total_lal_out: number | null
          total_run_percent: number | null
        }
        Insert: {
          batch_id?: string | null
          botanicals_g_per_lal?: number | null
          created_at?: string | null
          hearts_percent_of_run?: number | null
          id?: string
          organization_id?: string | null
          total_collected_l?: number | null
          total_lal_out?: number | null
          total_run_percent?: number | null
        }
        Update: {
          batch_id?: string | null
          botanicals_g_per_lal?: number | null
          created_at?: string | null
          hearts_percent_of_run?: number | null
          id?: string
          organization_id?: string | null
          total_collected_l?: number | null
          total_lal_out?: number | null
          total_run_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "run_totals_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "signature_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "run_totals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      signature_batches: {
        Row: {
          boiler_start_time: string | null
          created_at: string | null
          date: string
          id: string
          location: string | null
          organization_id: string | null
          recipe: string
          run_id: string
          sku: string | null
          still_used: string | null
          updated_at: string | null
        }
        Insert: {
          boiler_start_time?: string | null
          created_at?: string | null
          date: string
          id?: string
          location?: string | null
          organization_id?: string | null
          recipe: string
          run_id: string
          sku?: string | null
          still_used?: string | null
          updated_at?: string | null
        }
        Update: {
          boiler_start_time?: string | null
          created_at?: string | null
          date?: string
          id?: string
          location?: string | null
          organization_id?: string | null
          recipe?: string
          run_id?: string
          sku?: string | null
          still_used?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signature_batches_organization_id_fkey"
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
      still_setups: {
        Row: {
          batch_id: string | null
          created_at: string | null
          elements: string | null
          id: string
          options: string | null
          organization_id: string | null
          plates: string | null
          steeping: string | null
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          elements?: string | null
          id?: string
          options?: string | null
          organization_id?: string | null
          plates?: string | null
          steeping?: string | null
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          elements?: string | null
          id?: string
          options?: string | null
          organization_id?: string | null
          plates?: string | null
          steeping?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "still_setups_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "signature_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "still_setups_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tank_history: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_values: Json | null
          notes: string | null
          organization_id: string
          previous_values: Json | null
          tank_id: string
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          notes?: string | null
          organization_id: string
          previous_values?: Json | null
          tank_id: string
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          notes?: string | null
          organization_id?: string
          previous_values?: Json | null
          tank_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tank_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tank_history_tank_id_fkey"
            columns: ["tank_id"]
            isOneToOne: false
            referencedRelation: "tanks"
            referencedColumns: ["id"]
          },
        ]
      }
      tank_movements: {
        Row: {
          abv_after: number | null
          abv_before: number | null
          batch_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          movement_type: string
          notes: string | null
          organization_id: string
          reference_tank_id: string | null
          tank_id: string
          volume_after_l: number | null
          volume_before_l: number | null
          volume_change_l: number
        }
        Insert: {
          abv_after?: number | null
          abv_before?: number | null
          batch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          movement_type: string
          notes?: string | null
          organization_id: string
          reference_tank_id?: string | null
          tank_id: string
          volume_after_l?: number | null
          volume_before_l?: number | null
          volume_change_l: number
        }
        Update: {
          abv_after?: number | null
          abv_before?: number | null
          batch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          movement_type?: string
          notes?: string | null
          organization_id?: string
          reference_tank_id?: string | null
          tank_id?: string
          volume_after_l?: number | null
          volume_before_l?: number | null
          volume_change_l?: number
        }
        Relationships: [
          {
            foreignKeyName: "tank_movements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tank_movements_reference_tank_id_fkey"
            columns: ["reference_tank_id"]
            isOneToOne: false
            referencedRelation: "tanks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tank_movements_tank_id_fkey"
            columns: ["tank_id"]
            isOneToOne: false
            referencedRelation: "tanks"
            referencedColumns: ["id"]
          },
        ]
      }
      tanks: {
        Row: {
          batch: string | null
          batch_id: string | null
          capacity_l: number
          created_at: string | null
          current_abv: number | null
          current_volume_l: number | null
          expected_completion: string | null
          extra_materials: Json | null
          has_lid: boolean | null
          id: string
          infusion_type: string | null
          last_updated_by: string | null
          location: string | null
          notes: string | null
          organization_id: string
          product: string | null
          started_on: string | null
          status: string
          tank_id: string
          tank_name: string
          tank_type: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          batch?: string | null
          batch_id?: string | null
          capacity_l: number
          created_at?: string | null
          current_abv?: number | null
          current_volume_l?: number | null
          expected_completion?: string | null
          extra_materials?: Json | null
          has_lid?: boolean | null
          id?: string
          infusion_type?: string | null
          last_updated_by?: string | null
          location?: string | null
          notes?: string | null
          organization_id: string
          product?: string | null
          started_on?: string | null
          status?: string
          tank_id: string
          tank_name: string
          tank_type: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          batch?: string | null
          batch_id?: string | null
          capacity_l?: number
          created_at?: string | null
          current_abv?: number | null
          current_volume_l?: number | null
          expected_completion?: string | null
          extra_materials?: Json | null
          has_lid?: boolean | null
          id?: string
          infusion_type?: string | null
          last_updated_by?: string | null
          location?: string | null
          notes?: string | null
          organization_id?: string
          product?: string | null
          started_on?: string | null
          status?: string
          tank_id?: string
          tank_name?: string
          tank_type?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tanks_organization_id_fkey"
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
          original_volume_l: number | null
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
          original_volume_l?: number | null
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
          original_volume_l?: number | null
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
      user_organizations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean | null
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      wet_season_gin_batches: {
        Row: {
          batch_id: string
          boiler_abv_percent: number | null
          boiler_charge_l: number | null
          boiler_lal: number | null
          bottles_700ml: number | null
          bottling_date: string | null
          created_at: string | null
          created_by: string | null
          distillation_date: string | null
          distillation_duration_hours: number | null
          distillation_notes: string | null
          distillation_start_time: string | null
          final_abv_percent: number | null
          final_volume_l: number | null
          heart_yield_percent: number | null
          id: string
          lal_filled: number | null
          notes: string | null
          organization_id: string | null
          product_name: string | null
          product_type: string | null
          raw_log: Json | null
          sku: string | null
          still_used: string | null
          total_lal_collected: number | null
        }
        Insert: {
          batch_id: string
          boiler_abv_percent?: number | null
          boiler_charge_l?: number | null
          boiler_lal?: number | null
          bottles_700ml?: number | null
          bottling_date?: string | null
          created_at?: string | null
          created_by?: string | null
          distillation_date?: string | null
          distillation_duration_hours?: number | null
          distillation_notes?: string | null
          distillation_start_time?: string | null
          final_abv_percent?: number | null
          final_volume_l?: number | null
          heart_yield_percent?: number | null
          id: string
          lal_filled?: number | null
          notes?: string | null
          organization_id?: string | null
          product_name?: string | null
          product_type?: string | null
          raw_log?: Json | null
          sku?: string | null
          still_used?: string | null
          total_lal_collected?: number | null
        }
        Update: {
          batch_id?: string
          boiler_abv_percent?: number | null
          boiler_charge_l?: number | null
          boiler_lal?: number | null
          bottles_700ml?: number | null
          bottling_date?: string | null
          created_at?: string | null
          created_by?: string | null
          distillation_date?: string | null
          distillation_duration_hours?: number | null
          distillation_notes?: string | null
          distillation_start_time?: string | null
          final_abv_percent?: number | null
          final_volume_l?: number | null
          heart_yield_percent?: number | null
          id?: string
          lal_filled?: number | null
          notes?: string | null
          organization_id?: string | null
          product_name?: string | null
          product_type?: string | null
          raw_log?: Json | null
          sku?: string | null
          still_used?: string | null
          total_lal_collected?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wet_season_gin_batches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      wet_season_gin_botanicals: {
        Row: {
          batch_id: string | null
          created_at: string | null
          id: string
          name: string
          organization_id: string | null
          weight_g: number
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          organization_id?: string | null
          weight_g: number
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          weight_g?: number
        }
        Relationships: [
          {
            foreignKeyName: "wet_season_gin_botanicals_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "wet_season_gin_batches"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "wet_season_gin_botanicals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      wet_season_gin_dilution: {
        Row: {
          abv_percent: number | null
          batch_id: string | null
          created_at: string | null
          date: string | null
          filtered_water_l: number | null
          id: string
          new_volume_l: number | null
          organization_id: string | null
          stage: number
          start_volume_l: number | null
        }
        Insert: {
          abv_percent?: number | null
          batch_id?: string | null
          created_at?: string | null
          date?: string | null
          filtered_water_l?: number | null
          id?: string
          new_volume_l?: number | null
          organization_id?: string | null
          stage: number
          start_volume_l?: number | null
        }
        Update: {
          abv_percent?: number | null
          batch_id?: string | null
          created_at?: string | null
          date?: string | null
          filtered_water_l?: number | null
          id?: string
          new_volume_l?: number | null
          organization_id?: string | null
          stage?: number
          start_volume_l?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wet_season_gin_dilution_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "wet_season_gin_batches"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "wet_season_gin_dilution_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      wet_season_gin_distillation_cuts: {
        Row: {
          abv_percent: number | null
          batch_id: string | null
          created_at: string | null
          cut_type: string
          id: string
          lal: number | null
          notes: string | null
          organization_id: string | null
          volume_l: number | null
        }
        Insert: {
          abv_percent?: number | null
          batch_id?: string | null
          created_at?: string | null
          cut_type: string
          id?: string
          lal?: number | null
          notes?: string | null
          organization_id?: string | null
          volume_l?: number | null
        }
        Update: {
          abv_percent?: number | null
          batch_id?: string | null
          created_at?: string | null
          cut_type?: string
          id?: string
          lal?: number | null
          notes?: string | null
          organization_id?: string | null
          volume_l?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wet_season_gin_distillation_cuts_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "wet_season_gin_batches"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "wet_season_gin_distillation_cuts_organization_id_fkey"
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
        Args: { p_display_name: string; p_org_name: string; p_user_id: string }
        Returns: Json
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      user_org_ids: { Args: never; Returns: string[] }
    }
    Enums: {
      production_status: "draft" | "in_progress" | "completed" | "archived"
      run_phase: "Foreshots" | "Heads" | "Middle Run (Hearts)" | "Tails"
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
    Enums: {
      production_status: ["draft", "in_progress", "completed", "archived"],
      run_phase: ["Foreshots", "Heads", "Middle Run (Hearts)", "Tails"],
    },
  },
} as const
