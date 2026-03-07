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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      active_sessions: {
        Row: {
          branch_id: string | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_seen: string | null
          login_time: string | null
          role: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          branch_id?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_seen?: string | null
          login_time?: string | null
          role?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          branch_id?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_seen?: string | null
          login_time?: string | null
          role?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "active_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          hub_assignment: string | null
          id: string
          must_change_password: boolean | null
          password_hash: string | null
          role: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          hub_assignment?: string | null
          id?: string
          must_change_password?: boolean | null
          password_hash?: string | null
          role: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          hub_assignment?: string | null
          id?: string
          must_change_password?: boolean | null
          password_hash?: string | null
          role?: string
          status?: string | null
        }
        Relationships: []
      }
      air_cargo_specifications_2026_02_18_18_00: {
        Row: {
          airline_code: string
          airline_name_en: string
          airline_name_mm: string
          created_at: string | null
          destinations_served: Json | null
          dimensional_weight_divisor: number | null
          fragile_handling_fee_usd: number | null
          id: string
          is_active: boolean | null
          max_height_cm: number | null
          max_length_cm: number | null
          max_weight_kg: number | null
          max_width_cm: number | null
          oversized_fee_percentage: number | null
          oversized_threshold_cm: number | null
          volume_weight_divisor: number | null
        }
        Insert: {
          airline_code: string
          airline_name_en: string
          airline_name_mm: string
          created_at?: string | null
          destinations_served?: Json | null
          dimensional_weight_divisor?: number | null
          fragile_handling_fee_usd?: number | null
          id?: string
          is_active?: boolean | null
          max_height_cm?: number | null
          max_length_cm?: number | null
          max_weight_kg?: number | null
          max_width_cm?: number | null
          oversized_fee_percentage?: number | null
          oversized_threshold_cm?: number | null
          volume_weight_divisor?: number | null
        }
        Update: {
          airline_code?: string
          airline_name_en?: string
          airline_name_mm?: string
          created_at?: string | null
          destinations_served?: Json | null
          dimensional_weight_divisor?: number | null
          fragile_handling_fee_usd?: number | null
          id?: string
          is_active?: boolean | null
          max_height_cm?: number | null
          max_length_cm?: number | null
          max_weight_kg?: number | null
          max_width_cm?: number | null
          oversized_fee_percentage?: number | null
          oversized_threshold_cm?: number | null
          volume_weight_divisor?: number | null
        }
        Relationships: []
      }
      approval_requests: {
        Row: {
          created_at: string | null
          id: string
          record_id: string | null
          requested_by: string | null
          status: string | null
          table_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          record_id?: string | null
          requested_by?: string | null
          status?: string | null
          table_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          record_id?: string | null
          requested_by?: string | null
          status?: string | null
          table_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approval_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_workflows_2026_02_28_20_06: {
        Row: {
          approval_notes: string | null
          approved_at: string | null
          approver_role: string
          assigned_approver: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          reference_id: string
          reference_table: string
          request_data: Json | null
          requested_by: string
          status: string | null
          updated_at: string | null
          workflow_type: string
        }
        Insert: {
          approval_notes?: string | null
          approved_at?: string | null
          approver_role: string
          assigned_approver?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reference_id: string
          reference_table: string
          request_data?: Json | null
          requested_by: string
          status?: string | null
          updated_at?: string | null
          workflow_type: string
        }
        Update: {
          approval_notes?: string | null
          approved_at?: string | null
          approver_role?: string
          assigned_approver?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          reference_id?: string
          reference_table?: string
          request_data?: Json | null
          requested_by?: string
          status?: string | null
          updated_at?: string | null
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_workflows_2026_02_28_20_06_assigned_approver_fkey"
            columns: ["assigned_approver"]
            isOneToOne: false
            referencedRelation: "users_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_workflows_2026_02_28_20_06_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          approved_by: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          requested_by: string | null
          status: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          requested_by?: string | null
          status?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          requested_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      assignment_queue_2026_02_19_17_00: {
        Row: {
          assigned_user_id: string | null
          assignment_criteria: Json | null
          branch_id: string | null
          created_at: string | null
          estimated_processing_time: number | null
          id: string
          priority: number | null
          processed_at: string | null
          queue_position: number | null
          queue_type: string
          shipment_id: string
          status: string | null
        }
        Insert: {
          assigned_user_id?: string | null
          assignment_criteria?: Json | null
          branch_id?: string | null
          created_at?: string | null
          estimated_processing_time?: number | null
          id?: string
          priority?: number | null
          processed_at?: string | null
          queue_position?: number | null
          queue_type: string
          shipment_id: string
          status?: string | null
        }
        Update: {
          assigned_user_id?: string | null
          assignment_criteria?: Json | null
          branch_id?: string | null
          created_at?: string | null
          estimated_processing_time?: number | null
          id?: string
          priority?: number | null
          processed_at?: string | null
          queue_position?: number | null
          queue_type?: string
          shipment_id?: string
          status?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string | null
          timestamp: string | null
          trace_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          timestamp?: string | null
          trace_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          timestamp?: string | null
          trace_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_logs_2026_02_17_18_40: {
        Row: {
          action: string | null
          created_at: string | null
          details: Json | null
          entity: string | null
          entity_id: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          details?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          details?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_2026_02_17_18_40_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_17_18_40"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs_2026_02_19_13_00: {
        Row: {
          action: string
          branch_id: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string | null
          session_id: string | null
          severity: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          branch_id?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          severity?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          branch_id?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          session_id?: string | null
          severity?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_2026_02_19_13_00_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_2026_02_19_13_00_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs_2026_02_28_20_06: {
        Row: {
          action: string
          changed_by: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
        }
        Insert: {
          action: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_2026_02_28_20_06_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_approve_policies: {
        Row: {
          enabled: boolean | null
          id: string
          max_cod_amount: number | null
          max_weight: number | null
          name: string
        }
        Insert: {
          enabled?: boolean | null
          id?: string
          max_cod_amount?: number | null
          max_weight?: number | null
          name: string
        }
        Update: {
          enabled?: boolean | null
          id?: string
          max_cod_amount?: number | null
          max_weight?: number | null
          name?: string
        }
        Relationships: []
      }
      branch_daily_metrics: {
        Row: {
          branch_id: string | null
          created_at: string | null
          delivered: number | null
          failed: number | null
          id: string
          metric_date: string
          total_shipments: number | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          delivered?: number | null
          failed?: number | null
          id?: string
          metric_date: string
          total_shipments?: number | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          delivered?: number | null
          failed?: number | null
          id?: string
          metric_date?: string
          total_shipments?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "branch_daily_metrics_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_regions: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      branches: {
        Row: {
          code: string
          created_at: string | null
          environment: string | null
          id: string
          is_active: boolean | null
          name: string
          region_id: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          environment?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          region_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          environment?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          region_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branches_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "branch_regions"
            referencedColumns: ["id"]
          },
        ]
      }
      branches_2026_02_17_18_40: {
        Row: {
          address: Json | null
          code: string
          contact_info: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          code: string
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          code?: string
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      branches_2026_02_19_13_00: {
        Row: {
          address: string
          capacity_info: Json | null
          city: string
          code: string
          country: string | null
          created_at: string | null
          email: string | null
          facilities: Json | null
          id: string
          manager_id: string | null
          name: string
          operating_hours: Json | null
          phone: string | null
          postal_code: string | null
          state: string
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          capacity_info?: Json | null
          city: string
          code: string
          country?: string | null
          created_at?: string | null
          email?: string | null
          facilities?: Json | null
          id?: string
          manager_id?: string | null
          name: string
          operating_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          state: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          capacity_info?: Json | null
          city?: string
          code?: string
          country?: string | null
          created_at?: string | null
          email?: string | null
          facilities?: Json | null
          id?: string
          manager_id?: string | null
          name?: string
          operating_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          state?: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branches_2026_02_19_13_00_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
        ]
      }
      branches_2026_02_28_20_06: {
        Row: {
          address: string
          city: string
          code: string
          country: string
          created_at: string | null
          email: string | null
          id: string
          latitude: number | null
          longitude: number | null
          manager_id: string | null
          name: string
          operating_hours: Json | null
          phone: string | null
          postal_code: string | null
          region_id: string | null
          state: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          city: string
          code: string
          country?: string
          created_at?: string | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          manager_id?: string | null
          name: string
          operating_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          region_id?: string | null
          state: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          city?: string
          code?: string
          country?: string
          created_at?: string | null
          email?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          manager_id?: string | null
          name?: string
          operating_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          region_id?: string | null
          state?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_branches_manager"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_branches_region"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
        ]
      }
      claims_2026_02_28_20_06: {
        Row: {
          approved_by: string | null
          assigned_to: string | null
          claim_amount: number
          claim_number: string
          claim_type: string
          claimant_email: string | null
          claimant_name: string
          claimant_phone: string | null
          claimant_type: string
          created_at: string | null
          description: string
          evidence_urls: string[] | null
          id: string
          investigated_by: string | null
          priority: string | null
          settlement_amount: number | null
          settlement_date: string | null
          settlement_notes: string | null
          shipment_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          assigned_to?: string | null
          claim_amount: number
          claim_number: string
          claim_type: string
          claimant_email?: string | null
          claimant_name: string
          claimant_phone?: string | null
          claimant_type: string
          created_at?: string | null
          description: string
          evidence_urls?: string[] | null
          id?: string
          investigated_by?: string | null
          priority?: string | null
          settlement_amount?: number | null
          settlement_date?: string | null
          settlement_notes?: string | null
          shipment_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          assigned_to?: string | null
          claim_amount?: number
          claim_number?: string
          claim_type?: string
          claimant_email?: string | null
          claimant_name?: string
          claimant_phone?: string | null
          claimant_type?: string
          created_at?: string | null
          description?: string
          evidence_urls?: string[] | null
          id?: string
          investigated_by?: string | null
          priority?: string | null
          settlement_amount?: number | null
          settlement_date?: string | null
          settlement_notes?: string | null
          shipment_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "claims_2026_02_28_20_06_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_2026_02_28_20_06_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_2026_02_28_20_06_investigated_by_fkey"
            columns: ["investigated_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_2026_02_28_20_06_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
        ]
      }
      cod_collections: {
        Row: {
          amount: number
          created_at: string
          deposit_id: string | null
          id: string
          shipment_id: string
          status: string
          way_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          deposit_id?: string | null
          id?: string
          shipment_id: string
          status?: string
          way_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          deposit_id?: string | null
          id?: string
          shipment_id?: string
          status?: string
          way_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cod_collections_deposit_id_fkey"
            columns: ["deposit_id"]
            isOneToOne: false
            referencedRelation: "finance_deposits"
            referencedColumns: ["id"]
          },
        ]
      }
      cod_collections_2026_02_28_20_06: {
        Row: {
          branch_id: string | null
          collected_amount: number
          collected_by: string
          collection_date: string
          collection_number: string
          created_at: string | null
          id: string
          notes: string | null
          remitted_amount: number | null
          remitted_by: string | null
          remitted_date: string | null
          shipment_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          collected_amount: number
          collected_by: string
          collection_date?: string
          collection_number: string
          created_at?: string | null
          id?: string
          notes?: string | null
          remitted_amount?: number | null
          remitted_by?: string | null
          remitted_date?: string | null
          shipment_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          collected_amount?: number
          collected_by?: string
          collection_date?: string
          collection_number?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          remitted_amount?: number | null
          remitted_by?: string | null
          remitted_date?: string | null
          shipment_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cod_collections_2026_02_28_20_06_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cod_collections_2026_02_28_20_06_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cod_collections_2026_02_28_20_06_remitted_by_fkey"
            columns: ["remitted_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cod_collections_2026_02_28_20_06_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions_2026_02_11_14_10: {
        Row: {
          base_commission: number | null
          calculated_by: string
          created_at: string | null
          id: string
          paid_at: string | null
          payment_status: string | null
          performance_bonus: number | null
          period_end: string
          period_start: string
          total_commission: number
          user_id: string
        }
        Insert: {
          base_commission?: number | null
          calculated_by: string
          created_at?: string | null
          id?: string
          paid_at?: string | null
          payment_status?: string | null
          performance_bonus?: number | null
          period_end: string
          period_start: string
          total_commission: number
          user_id: string
        }
        Update: {
          base_commission?: number | null
          calculated_by?: string
          created_at?: string | null
          id?: string
          paid_at?: string | null
          payment_status?: string | null
          performance_bonus?: number | null
          period_end?: string
          period_start?: string
          total_commission?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_2026_02_11_14_10_calculated_by_fkey"
            columns: ["calculated_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_2026_02_11_14_10_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_kyc: {
        Row: {
          kyc_verified: boolean
          nrc_back_url: string | null
          nrc_front_url: string
          nrc_number: string
          submitted_at: string
          user_id: string
        }
        Insert: {
          kyc_verified?: boolean
          nrc_back_url?: string | null
          nrc_front_url: string
          nrc_number: string
          submitted_at?: string
          user_id: string
        }
        Update: {
          kyc_verified?: boolean
          nrc_back_url?: string | null
          nrc_front_url?: string
          nrc_number?: string
          submitted_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_segments_2026_02_11_14_10: {
        Row: {
          created_at: string | null
          created_by: string
          criteria: Json
          customer_count: number | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          criteria: Json
          customer_count?: number | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          criteria?: Json
          customer_count?: number | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_segments_2026_02_11_14_10_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      customers_2026_02_18_17_00: {
        Row: {
          addresses: Json
          created_at: string | null
          customer_code: string
          email: string | null
          full_name: string
          id: string
          phone: string
          preferred_pickup_times: Json | null
          registration_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          addresses: Json
          created_at?: string | null
          customer_code: string
          email?: string | null
          full_name: string
          id?: string
          phone: string
          preferred_pickup_times?: Json | null
          registration_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          addresses?: Json
          created_at?: string | null
          customer_code?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string
          preferred_pickup_times?: Json | null
          registration_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customers_2026_02_19_13_00: {
        Row: {
          address: string
          city: string
          company_name: string | null
          created_at: string | null
          credit_limit: number | null
          customer_code: string
          customer_type: string | null
          email: string | null
          full_name: string
          id: string
          kyc_documents: Json | null
          kyc_status: string | null
          outstanding_balance: number | null
          payment_terms: string | null
          phone: string
          postal_code: string | null
          preferred_delivery_time: string | null
          special_instructions: string | null
          state: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          city: string
          company_name?: string | null
          created_at?: string | null
          credit_limit?: number | null
          customer_code: string
          customer_type?: string | null
          email?: string | null
          full_name: string
          id?: string
          kyc_documents?: Json | null
          kyc_status?: string | null
          outstanding_balance?: number | null
          payment_terms?: string | null
          phone: string
          postal_code?: string | null
          preferred_delivery_time?: string | null
          special_instructions?: string | null
          state: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          city?: string
          company_name?: string | null
          created_at?: string | null
          credit_limit?: number | null
          customer_code?: string
          customer_type?: string | null
          email?: string | null
          full_name?: string
          id?: string
          kyc_documents?: Json | null
          kyc_status?: string | null
          outstanding_balance?: number | null
          payment_terms?: string | null
          phone?: string
          postal_code?: string | null
          preferred_delivery_time?: string | null
          special_instructions?: string | null
          state?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customers_2026_02_28_20_06: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          customer_code: string
          customer_type: string | null
          email: string | null
          id: string
          name: string
          phone: string
          postal_code: string | null
          state: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          customer_code: string
          customer_type?: string | null
          email?: string | null
          id?: string
          name: string
          phone: string
          postal_code?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          customer_code?: string
          customer_type?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string
          postal_code?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      data_entry_automation_2026_02_18_18_00: {
        Row: {
          auto_applied: boolean | null
          confidence_score: number | null
          correction_suggestions: Json | null
          created_at: string | null
          error_message: string | null
          extracted_fields: Json
          id: string
          processing_method: string | null
          processing_time_ms: number | null
          requires_review: boolean | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          source_data: string
          source_file_url: string | null
          source_type: string
          status: string | null
          target_record_id: string | null
          target_table: string | null
          updated_at: string | null
          validation_results: Json | null
        }
        Insert: {
          auto_applied?: boolean | null
          confidence_score?: number | null
          correction_suggestions?: Json | null
          created_at?: string | null
          error_message?: string | null
          extracted_fields: Json
          id?: string
          processing_method?: string | null
          processing_time_ms?: number | null
          requires_review?: boolean | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_data: string
          source_file_url?: string | null
          source_type: string
          status?: string | null
          target_record_id?: string | null
          target_table?: string | null
          updated_at?: string | null
          validation_results?: Json | null
        }
        Update: {
          auto_applied?: boolean | null
          confidence_score?: number | null
          correction_suggestions?: Json | null
          created_at?: string | null
          error_message?: string | null
          extracted_fields?: Json
          id?: string
          processing_method?: string | null
          processing_time_ms?: number | null
          requires_review?: boolean | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          source_data?: string
          source_file_url?: string | null
          source_type?: string
          status?: string | null
          target_record_id?: string | null
          target_table?: string | null
          updated_at?: string | null
          validation_results?: Json | null
        }
        Relationships: []
      }
      deliveries_2026_02_19_13_00: {
        Row: {
          actual_delivery_time: string | null
          cod_collected: number | null
          created_at: string | null
          delivery_attempts: number | null
          delivery_latitude: number | null
          delivery_longitude: number | null
          delivery_notes: string | null
          delivery_sequence: number | null
          delivery_status: string | null
          failure_reason: string | null
          id: string
          photo_proof: Json | null
          recipient_name: string | null
          recipient_phone: string | null
          route_id: string | null
          scheduled_time: string | null
          shipment_id: string | null
          signature_data: string | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery_time?: string | null
          cod_collected?: number | null
          created_at?: string | null
          delivery_attempts?: number | null
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          delivery_notes?: string | null
          delivery_sequence?: number | null
          delivery_status?: string | null
          failure_reason?: string | null
          id?: string
          photo_proof?: Json | null
          recipient_name?: string | null
          recipient_phone?: string | null
          route_id?: string | null
          scheduled_time?: string | null
          shipment_id?: string | null
          signature_data?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery_time?: string | null
          cod_collected?: number | null
          created_at?: string | null
          delivery_attempts?: number | null
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          delivery_notes?: string | null
          delivery_sequence?: number | null
          delivery_status?: string | null
          failure_reason?: string | null
          id?: string
          photo_proof?: Json | null
          recipient_name?: string | null
          recipient_phone?: string | null
          route_id?: string | null
          scheduled_time?: string | null
          shipment_id?: string | null
          signature_data?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_2026_02_19_13_00_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_2026_02_19_13_00_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_personnel_2026_02_18_17_00: {
        Row: {
          average_rating: number | null
          created_at: string | null
          current_location: Json | null
          current_route_id: string | null
          current_status: string | null
          email: string | null
          employment_status: string | null
          full_name: string
          id: string
          personnel_code: string
          phone: string
          role: string
          shift_preferences: Json | null
          success_rate: number | null
          total_deliveries: number | null
          updated_at: string | null
          zone_assignments: string[] | null
        }
        Insert: {
          average_rating?: number | null
          created_at?: string | null
          current_location?: Json | null
          current_route_id?: string | null
          current_status?: string | null
          email?: string | null
          employment_status?: string | null
          full_name: string
          id?: string
          personnel_code: string
          phone: string
          role: string
          shift_preferences?: Json | null
          success_rate?: number | null
          total_deliveries?: number | null
          updated_at?: string | null
          zone_assignments?: string[] | null
        }
        Update: {
          average_rating?: number | null
          created_at?: string | null
          current_location?: Json | null
          current_route_id?: string | null
          current_status?: string | null
          email?: string | null
          employment_status?: string | null
          full_name?: string
          id?: string
          personnel_code?: string
          phone?: string
          role?: string
          shift_preferences?: Json | null
          success_rate?: number | null
          total_deliveries?: number | null
          updated_at?: string | null
          zone_assignments?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_personnel_2026_02_18_17_00_current_route_id_fkey"
            columns: ["current_route_id"]
            isOneToOne: false
            referencedRelation: "route_plans_2026_02_18_17_00"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_records_2026_02_11_14_10: {
        Row: {
          created_at: string | null
          customer_signature: string | null
          delivery_photos: string[] | null
          delivery_status: string | null
          delivery_time: string | null
          id: string
          notes: string | null
          recipient_name: string | null
          rider_id: string
          shipment_id: string
        }
        Insert: {
          created_at?: string | null
          customer_signature?: string | null
          delivery_photos?: string[] | null
          delivery_status?: string | null
          delivery_time?: string | null
          id?: string
          notes?: string | null
          recipient_name?: string | null
          rider_id: string
          shipment_id: string
        }
        Update: {
          created_at?: string | null
          customer_signature?: string | null
          delivery_photos?: string[] | null
          delivery_status?: string | null
          delivery_time?: string | null
          id?: string
          notes?: string | null
          recipient_name?: string | null
          rider_id?: string
          shipment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_records_2026_02_11_14_10_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_records_2026_02_11_14_10_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_records_2026_02_17_18_40: {
        Row: {
          created_at: string | null
          customer_signature: string | null
          delivery_photos: string[] | null
          delivery_status: string | null
          delivery_time: string | null
          id: string
          notes: string | null
          recipient_name: string | null
          rider_id: string
          shipment_id: string
        }
        Insert: {
          created_at?: string | null
          customer_signature?: string | null
          delivery_photos?: string[] | null
          delivery_status?: string | null
          delivery_time?: string | null
          id?: string
          notes?: string | null
          recipient_name?: string | null
          rider_id: string
          shipment_id: string
        }
        Update: {
          created_at?: string | null
          customer_signature?: string | null
          delivery_photos?: string[] | null
          delivery_status?: string | null
          delivery_time?: string | null
          id?: string
          notes?: string | null
          recipient_name?: string | null
          rider_id?: string
          shipment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_records_2026_02_17_18_40_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_17_18_40"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_records_2026_02_17_18_40_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments_2026_02_17_18_40"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_login_credentials_2026_02_19_14_00: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          last_login: string | null
          locked_until: string | null
          login_attempts: number | null
          password_hash: string
          profile_id: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          locked_until?: string | null
          login_attempts?: number | null
          password_hash: string
          profile_id?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          locked_until?: string | null
          login_attempts?: number | null
          password_hash?: string
          profile_id?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      domestic_rates_2026_02_19_13_00: {
        Row: {
          base_rate: number
          created_at: string | null
          effective_from: string
          effective_to: string | null
          from_zone: string
          fuel_surcharge_percent: number | null
          id: string
          per_kg_rate: number | null
          remote_area_surcharge: number | null
          service_type: string
          to_zone: string
          weight_from: number
          weight_to: number
        }
        Insert: {
          base_rate: number
          created_at?: string | null
          effective_from: string
          effective_to?: string | null
          from_zone: string
          fuel_surcharge_percent?: number | null
          id?: string
          per_kg_rate?: number | null
          remote_area_surcharge?: number | null
          service_type: string
          to_zone: string
          weight_from: number
          weight_to: number
        }
        Update: {
          base_rate?: number
          created_at?: string | null
          effective_from?: string
          effective_to?: string | null
          from_zone?: string
          fuel_surcharge_percent?: number | null
          id?: string
          per_kg_rate?: number | null
          remote_area_surcharge?: number | null
          service_type?: string
          to_zone?: string
          weight_from?: number
          weight_to?: number
        }
        Relationships: []
      }
      domestic_shipping_rates_2026_02_18_18_00: {
        Row: {
          base_rate_mmk: number
          cod_fee_mmk: number | null
          cod_percentage: number | null
          created_at: string | null
          delivery_time_days: number | null
          fuel_surcharge_percentage: number | null
          id: string
          insurance_percentage: number | null
          is_active: boolean | null
          metro_multiplier: number | null
          remote_multiplier: number | null
          service_type: string
          standard_multiplier: number | null
          weight_from_kg: number
          weight_to_kg: number
        }
        Insert: {
          base_rate_mmk: number
          cod_fee_mmk?: number | null
          cod_percentage?: number | null
          created_at?: string | null
          delivery_time_days?: number | null
          fuel_surcharge_percentage?: number | null
          id?: string
          insurance_percentage?: number | null
          is_active?: boolean | null
          metro_multiplier?: number | null
          remote_multiplier?: number | null
          service_type: string
          standard_multiplier?: number | null
          weight_from_kg: number
          weight_to_kg: number
        }
        Update: {
          base_rate_mmk?: number
          cod_fee_mmk?: number | null
          cod_percentage?: number | null
          created_at?: string | null
          delivery_time_days?: number | null
          fuel_surcharge_percentage?: number | null
          id?: string
          insurance_percentage?: number | null
          is_active?: boolean | null
          metro_multiplier?: number | null
          remote_multiplier?: number | null
          service_type?: string
          standard_multiplier?: number | null
          weight_from_kg?: number
          weight_to_kg?: number
        }
        Relationships: []
      }
      domestic_tariffs: {
        Row: {
          base_rate: number
          id: string
          region_name: string
          updated_at: string | null
          updated_by: string | null
          zone_label: string
        }
        Insert: {
          base_rate?: number
          id?: string
          region_name: string
          updated_at?: string | null
          updated_by?: string | null
          zone_label: string
        }
        Update: {
          base_rate?: number
          id?: string
          region_name?: string
          updated_at?: string | null
          updated_by?: string | null
          zone_label?: string
        }
        Relationships: []
      }
      electronic_signatures_2026_02_18_18_00: {
        Row: {
          created_at: string | null
          delivery_location: Json | null
          delivery_notes: string | null
          delivery_rider_id: string
          delivery_timestamp: string
          device_info: Json | null
          id: string
          ip_address: unknown
          is_verified: boolean | null
          location_photo_url: string | null
          package_photo_url: string | null
          parcel_id: string
          recipient_photo_url: string | null
          relationship_to_recipient: string | null
          shipment_id: string | null
          signature_data: string
          signature_hash: string
          signature_points: Json | null
          signature_quality_score: number | null
          signer_id_number: string | null
          signer_id_type: string | null
          signer_name: string
          signer_phone: string | null
          updated_at: string | null
          user_agent: string | null
          verification_method: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_location?: Json | null
          delivery_notes?: string | null
          delivery_rider_id: string
          delivery_timestamp: string
          device_info?: Json | null
          id?: string
          ip_address?: unknown
          is_verified?: boolean | null
          location_photo_url?: string | null
          package_photo_url?: string | null
          parcel_id: string
          recipient_photo_url?: string | null
          relationship_to_recipient?: string | null
          shipment_id?: string | null
          signature_data: string
          signature_hash: string
          signature_points?: Json | null
          signature_quality_score?: number | null
          signer_id_number?: string | null
          signer_id_type?: string | null
          signer_name: string
          signer_phone?: string | null
          updated_at?: string | null
          user_agent?: string | null
          verification_method?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_location?: Json | null
          delivery_notes?: string | null
          delivery_rider_id?: string
          delivery_timestamp?: string
          device_info?: Json | null
          id?: string
          ip_address?: unknown
          is_verified?: boolean | null
          location_photo_url?: string | null
          package_photo_url?: string | null
          parcel_id?: string
          recipient_photo_url?: string | null
          relationship_to_recipient?: string | null
          shipment_id?: string | null
          signature_data?: string
          signature_hash?: string
          signature_points?: Json | null
          signature_quality_score?: number | null
          signer_id_number?: string | null
          signer_id_type?: string | null
          signer_name?: string
          signer_phone?: string | null
          updated_at?: string | null
          user_agent?: string | null
          verification_method?: string | null
        }
        Relationships: []
      }
      electronic_signatures_2026_02_19_15_00: {
        Row: {
          created_at: string | null
          id: string
          reference_id: string
          reference_type: string
          signature_data: string
          signature_metadata: Json | null
          signature_type: string
          signed_by: string | null
          signer_id_number: string | null
          signer_name: string
          signer_phone: string | null
          updated_at: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          reference_id: string
          reference_type: string
          signature_data: string
          signature_metadata?: Json | null
          signature_type: string
          signed_by?: string | null
          signer_id_number?: string | null
          signer_name: string
          signer_phone?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          reference_id?: string
          reference_type?: string
          signature_data?: string
          signature_metadata?: Json | null
          signature_type?: string
          signed_by?: string | null
          signer_id_number?: string | null
          signer_name?: string
          signer_phone?: string | null
          updated_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          config: Json | null
          created_at: string | null
          description: string | null
          environment: string | null
          flag_key: string
          id: string
          is_enabled: boolean | null
          name: string
          target_roles: string[] | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          environment?: string | null
          flag_key: string
          id?: string
          is_enabled?: boolean | null
          name: string
          target_roles?: string[] | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          description?: string | null
          environment?: string | null
          flag_key?: string
          id?: string
          is_enabled?: boolean | null
          name?: string
          target_roles?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      finance_deposits: {
        Row: {
          amount: number
          created_at: string
          id: string
          status: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          status?: string
        }
        Relationships: []
      }
      finance_ledger: {
        Row: {
          amount: number
          auth_hash: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          recipient_id: string | null
          reference_id: string | null
          sender_id: string | null
          transaction_type: string
          verified_by: string | null
        }
        Insert: {
          amount: number
          auth_hash?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          recipient_id?: string | null
          reference_id?: string | null
          sender_id?: string | null
          transaction_type: string
          verified_by?: string | null
        }
        Update: {
          amount?: number
          auth_hash?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          recipient_id?: string | null
          reference_id?: string | null
          sender_id?: string | null
          transaction_type?: string
          verified_by?: string | null
        }
        Relationships: []
      }
      financial_transactions_2026_02_11_14_10: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          customer_id: string | null
          id: string
          merchant_id: string | null
          metadata: Json | null
          payment_method: string | null
          payment_status: string | null
          processed_at: string | null
          processed_by: string | null
          reference_number: string | null
          shipment_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          id?: string
          merchant_id?: string | null
          metadata?: Json | null
          payment_method?: string | null
          payment_status?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reference_number?: string | null
          shipment_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          id?: string
          merchant_id?: string | null
          metadata?: Json | null
          payment_method?: string | null
          payment_status?: string | null
          processed_at?: string | null
          processed_by?: string | null
          reference_number?: string | null
          shipment_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_2026_02_11_14_10_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_2026_02_11_14_10_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_2026_02_11_14_10_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_transactions_2026_02_11_14_10_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet_assets: {
        Row: {
          created_at: string | null
          current_location: string | null
          fuel_capacity: number | null
          fuel_level: number | null
          id: string
          last_maintenance_date: string | null
          plate_number: string
          rider_id: string | null
          status: string | null
          vehicle_plate: string | null
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string | null
          current_location?: string | null
          fuel_capacity?: number | null
          fuel_level?: number | null
          id?: string
          last_maintenance_date?: string | null
          plate_number: string
          rider_id?: string | null
          status?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string | null
          current_location?: string | null
          fuel_capacity?: number | null
          fuel_level?: number | null
          id?: string
          last_maintenance_date?: string | null
          plate_number?: string
          rider_id?: string | null
          status?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fleet_assets_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet_telemetry: {
        Row: {
          current_lat: number | null
          current_long: number | null
          id: string
          last_updated: string | null
          rider_id: string | null
          status: string | null
          unit_name: string | null
        }
        Insert: {
          current_lat?: number | null
          current_long?: number | null
          id?: string
          last_updated?: string | null
          rider_id?: string | null
          status?: string | null
          unit_name?: string | null
        }
        Update: {
          current_lat?: number | null
          current_long?: number | null
          id?: string
          last_updated?: string | null
          rider_id?: string | null
          status?: string | null
          unit_name?: string | null
        }
        Relationships: []
      }
      fuel_logs: {
        Row: {
          asset_id: string | null
          cost_per_liter: number | null
          created_at: string | null
          driver_email: string | null
          id: string
          liters_added: number | null
          location: string | null
          odometer_reading: number | null
        }
        Insert: {
          asset_id?: string | null
          cost_per_liter?: number | null
          created_at?: string | null
          driver_email?: string | null
          id?: string
          liters_added?: number | null
          location?: string | null
          odometer_reading?: number | null
        }
        Update: {
          asset_id?: string | null
          cost_per_liter?: number | null
          created_at?: string | null
          driver_email?: string | null
          id?: string
          liters_added?: number | null
          location?: string | null
          odometer_reading?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fuel_logs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "fleet_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      geofences_2026_02_18_18_00: {
        Row: {
          branch_id: string | null
          center_lat: number
          center_lng: number
          created_at: string | null
          entry_alert: boolean | null
          exit_alert: boolean | null
          id: string
          is_active: boolean | null
          name: string
          polygon_coordinates: Json | null
          radius_meters: number
          type: string
          updated_at: string | null
          zone: string | null
        }
        Insert: {
          branch_id?: string | null
          center_lat: number
          center_lng: number
          created_at?: string | null
          entry_alert?: boolean | null
          exit_alert?: boolean | null
          id?: string
          is_active?: boolean | null
          name: string
          polygon_coordinates?: Json | null
          radius_meters: number
          type: string
          updated_at?: string | null
          zone?: string | null
        }
        Update: {
          branch_id?: string | null
          center_lat?: number
          center_lng?: number
          created_at?: string | null
          entry_alert?: boolean | null
          exit_alert?: boolean | null
          id?: string
          is_active?: boolean | null
          name?: string
          polygon_coordinates?: Json | null
          radius_meters?: number
          type?: string
          updated_at?: string | null
          zone?: string | null
        }
        Relationships: []
      }
      geofences_2026_02_19_15_00: {
        Row: {
          alert_on_enter: boolean | null
          alert_on_exit: boolean | null
          branch_id: string | null
          coordinates: Json
          created_at: string | null
          description: string | null
          fence_type: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          radius: number | null
          updated_at: string | null
        }
        Insert: {
          alert_on_enter?: boolean | null
          alert_on_exit?: boolean | null
          branch_id?: string | null
          coordinates: Json
          created_at?: string | null
          description?: string | null
          fence_type: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          radius?: number | null
          updated_at?: string | null
        }
        Update: {
          alert_on_enter?: boolean | null
          alert_on_exit?: boolean | null
          branch_id?: string | null
          coordinates?: Json
          created_at?: string | null
          description?: string | null
          fence_type?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          radius?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      gps_tracking_2026_02_18_18_00: {
        Row: {
          accuracy: number | null
          altitude: number | null
          battery_level: number | null
          created_at: string | null
          device_id: string
          heading: number | null
          id: string
          is_moving: boolean | null
          latitude: number
          location_source: string | null
          longitude: number
          metadata: Json | null
          recorded_at: string
          route_id: string | null
          signal_strength: number | null
          speed: number | null
          uploaded_at: string | null
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          accuracy?: number | null
          altitude?: number | null
          battery_level?: number | null
          created_at?: string | null
          device_id: string
          heading?: number | null
          id?: string
          is_moving?: boolean | null
          latitude: number
          location_source?: string | null
          longitude: number
          metadata?: Json | null
          recorded_at: string
          route_id?: string | null
          signal_strength?: number | null
          speed?: number | null
          uploaded_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          accuracy?: number | null
          altitude?: number | null
          battery_level?: number | null
          created_at?: string | null
          device_id?: string
          heading?: number | null
          id?: string
          is_moving?: boolean | null
          latitude?: number
          location_source?: string | null
          longitude?: number
          metadata?: Json | null
          recorded_at?: string
          route_id?: string | null
          signal_strength?: number | null
          speed?: number | null
          uploaded_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gps_tracking_2026_02_18_18_00_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "route_plans_2026_02_18_17_00"
            referencedColumns: ["id"]
          },
        ]
      }
      gps_tracking_advanced_2026_02_19_15_00: {
        Row: {
          accuracy: number | null
          address: string | null
          altitude: number | null
          battery_level: number | null
          created_at: string | null
          device_id: string
          geofence_status: Json | null
          heading: number | null
          id: string
          latitude: number
          location_type: string | null
          longitude: number
          metadata: Json | null
          recorded_at: string | null
          rider_id: string | null
          shipment_id: string | null
          signal_strength: number | null
          speed: number | null
          vehicle_id: string | null
        }
        Insert: {
          accuracy?: number | null
          address?: string | null
          altitude?: number | null
          battery_level?: number | null
          created_at?: string | null
          device_id: string
          geofence_status?: Json | null
          heading?: number | null
          id?: string
          latitude: number
          location_type?: string | null
          longitude: number
          metadata?: Json | null
          recorded_at?: string | null
          rider_id?: string | null
          shipment_id?: string | null
          signal_strength?: number | null
          speed?: number | null
          vehicle_id?: string | null
        }
        Update: {
          accuracy?: number | null
          address?: string | null
          altitude?: number | null
          battery_level?: number | null
          created_at?: string | null
          device_id?: string
          geofence_status?: Json | null
          heading?: number | null
          id?: string
          latitude?: number
          location_type?: string | null
          longitude?: number
          metadata?: Json | null
          recorded_at?: string | null
          rider_id?: string | null
          shipment_id?: string | null
          signal_strength?: number | null
          speed?: number | null
          vehicle_id?: string | null
        }
        Relationships: []
      }
      international_destinations_2026_02_18_18_00: {
        Row: {
          capital_city_en: string | null
          capital_city_mm: string | null
          cod_available: boolean | null
          country_code: string
          country_name_en: string
          country_name_mm: string
          created_at: string | null
          currency_code: string | null
          customs_clearance_days: number | null
          delivery_time_days: number | null
          economy_available: boolean | null
          express_available: boolean | null
          id: string
          is_active: boolean | null
          max_dimensions_cm: Json | null
          max_weight_kg: number | null
          prohibited_items: Json | null
          region: string | null
          restricted_items: Json | null
          standard_available: boolean | null
          time_zone: string | null
          zone_category: string | null
        }
        Insert: {
          capital_city_en?: string | null
          capital_city_mm?: string | null
          cod_available?: boolean | null
          country_code: string
          country_name_en: string
          country_name_mm: string
          created_at?: string | null
          currency_code?: string | null
          customs_clearance_days?: number | null
          delivery_time_days?: number | null
          economy_available?: boolean | null
          express_available?: boolean | null
          id?: string
          is_active?: boolean | null
          max_dimensions_cm?: Json | null
          max_weight_kg?: number | null
          prohibited_items?: Json | null
          region?: string | null
          restricted_items?: Json | null
          standard_available?: boolean | null
          time_zone?: string | null
          zone_category?: string | null
        }
        Update: {
          capital_city_en?: string | null
          capital_city_mm?: string | null
          cod_available?: boolean | null
          country_code?: string
          country_name_en?: string
          country_name_mm?: string
          created_at?: string | null
          currency_code?: string | null
          customs_clearance_days?: number | null
          delivery_time_days?: number | null
          economy_available?: boolean | null
          express_available?: boolean | null
          id?: string
          is_active?: boolean | null
          max_dimensions_cm?: Json | null
          max_weight_kg?: number | null
          prohibited_items?: Json | null
          region?: string | null
          restricted_items?: Json | null
          standard_available?: boolean | null
          time_zone?: string | null
          zone_category?: string | null
        }
        Relationships: []
      }
      international_rates_2026_02_19_13_00: {
        Row: {
          base_rate: number
          created_at: string | null
          currency: string | null
          customs_clearance_fee: number | null
          destination_country: string
          destination_zone: string | null
          effective_from: string
          effective_to: string | null
          fuel_surcharge_percent: number | null
          id: string
          per_kg_rate: number | null
          service_type: string
          weight_from: number
          weight_to: number
        }
        Insert: {
          base_rate: number
          created_at?: string | null
          currency?: string | null
          customs_clearance_fee?: number | null
          destination_country: string
          destination_zone?: string | null
          effective_from: string
          effective_to?: string | null
          fuel_surcharge_percent?: number | null
          id?: string
          per_kg_rate?: number | null
          service_type: string
          weight_from: number
          weight_to: number
        }
        Update: {
          base_rate?: number
          created_at?: string | null
          currency?: string | null
          customs_clearance_fee?: number | null
          destination_country?: string
          destination_zone?: string | null
          effective_from?: string
          effective_to?: string | null
          fuel_surcharge_percent?: number | null
          id?: string
          per_kg_rate?: number | null
          service_type?: string
          weight_from?: number
          weight_to?: number
        }
        Relationships: []
      }
      international_shipping_rates_2026_02_18_18_00: {
        Row: {
          base_rate_usd: number
          created_at: string | null
          customs_clearance_fee_usd: number | null
          destination_id: string | null
          fuel_surcharge_percentage: number | null
          id: string
          insurance_percentage: number | null
          is_active: boolean | null
          max_insurance_usd: number | null
          min_chargeable_weight_kg: number | null
          remote_area_fee_usd: number | null
          security_fee_usd: number | null
          service_type: string
          volume_weight_divisor: number | null
          weight_from_kg: number
          weight_to_kg: number
        }
        Insert: {
          base_rate_usd: number
          created_at?: string | null
          customs_clearance_fee_usd?: number | null
          destination_id?: string | null
          fuel_surcharge_percentage?: number | null
          id?: string
          insurance_percentage?: number | null
          is_active?: boolean | null
          max_insurance_usd?: number | null
          min_chargeable_weight_kg?: number | null
          remote_area_fee_usd?: number | null
          security_fee_usd?: number | null
          service_type: string
          volume_weight_divisor?: number | null
          weight_from_kg: number
          weight_to_kg: number
        }
        Update: {
          base_rate_usd?: number
          created_at?: string | null
          customs_clearance_fee_usd?: number | null
          destination_id?: string | null
          fuel_surcharge_percentage?: number | null
          id?: string
          insurance_percentage?: number | null
          is_active?: boolean | null
          max_insurance_usd?: number | null
          min_chargeable_weight_kg?: number | null
          remote_area_fee_usd?: number | null
          security_fee_usd?: number | null
          service_type?: string
          volume_weight_divisor?: number | null
          weight_from_kg?: number
          weight_to_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "international_shipping_rates_2026_02_18_18__destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "international_destinations_2026_02_18_18_00"
            referencedColumns: ["id"]
          },
        ]
      }
      intl_tariffs: {
        Row: {
          destination_country: string
          duration_est: string | null
          id: string
          min_weight: string | null
          rate_usd_per_kg: number
          updated_at: string | null
        }
        Insert: {
          destination_country: string
          duration_est?: string | null
          id?: string
          min_weight?: string | null
          rate_usd_per_kg: number
          updated_at?: string | null
        }
        Update: {
          destination_country?: string
          duration_est?: string | null
          id?: string
          min_weight?: string | null
          rate_usd_per_kg?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_2026_02_19_13_00: {
        Row: {
          branch_id: string | null
          category: string | null
          created_at: string | null
          current_stock: number | null
          description: string | null
          id: string
          item_code: string
          item_name: string
          maximum_stock: number | null
          minimum_stock: number | null
          status: string | null
          storage_location: string | null
          supplier_info: Json | null
          unit_cost: number | null
          unit_of_measure: string | null
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          category?: string | null
          created_at?: string | null
          current_stock?: number | null
          description?: string | null
          id?: string
          item_code: string
          item_name: string
          maximum_stock?: number | null
          minimum_stock?: number | null
          status?: string | null
          storage_location?: string | null
          supplier_info?: Json | null
          unit_cost?: number | null
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          category?: string | null
          created_at?: string | null
          current_stock?: number | null
          description?: string | null
          id?: string
          item_code?: string
          item_name?: string
          maximum_stock?: number | null
          minimum_stock?: number | null
          status?: string | null
          storage_location?: string | null
          supplier_info?: Json | null
          unit_cost?: number | null
          unit_of_measure?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_2026_02_19_13_00_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_2026_02_28_20_06: {
        Row: {
          created_at: string | null
          id: string
          location_code: string | null
          notes: string | null
          retrieved_by: string | null
          retrieved_date: string | null
          shipment_id: string
          status: string | null
          stored_by: string | null
          stored_date: string
          updated_at: string | null
          warehouse_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          location_code?: string | null
          notes?: string | null
          retrieved_by?: string | null
          retrieved_date?: string | null
          shipment_id: string
          status?: string | null
          stored_by?: string | null
          stored_date?: string
          updated_at?: string | null
          warehouse_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          location_code?: string | null
          notes?: string | null
          retrieved_by?: string | null
          retrieved_date?: string | null
          shipment_id?: string
          status?: string | null
          stored_by?: string | null
          stored_date?: string
          updated_at?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_2026_02_28_20_06_retrieved_by_fkey"
            columns: ["retrieved_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_2026_02_28_20_06_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_2026_02_28_20_06_stored_by_fkey"
            columns: ["stored_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_2026_02_28_20_06_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements_2026_02_19_13_00: {
        Row: {
          from_location: string | null
          id: string
          inventory_id: string | null
          movement_type: string
          notes: string | null
          performed_by: string | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
          timestamp: string | null
          to_location: string | null
          total_cost: number | null
          unit_cost: number | null
        }
        Insert: {
          from_location?: string | null
          id?: string
          inventory_id?: string | null
          movement_type: string
          notes?: string | null
          performed_by?: string | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          timestamp?: string | null
          to_location?: string | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Update: {
          from_location?: string | null
          id?: string
          inventory_id?: string | null
          movement_type?: string
          notes?: string | null
          performed_by?: string | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          timestamp?: string | null
          to_location?: string | null
          total_cost?: number | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_2026_02_19_13_00_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_2026_02_19_13_00_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items_2026_02_28_20_06: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          quantity: number | null
          shipment_id: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          quantity?: number | null
          shipment_id?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number | null
          shipment_id?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_2026_02_28_20_06_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_2026_02_28_20_06_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices_2026_02_28_20_06: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          balance_amount: number
          created_at: string | null
          created_by: string | null
          discount_amount: number | null
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          merchant_id: string
          notes: string | null
          paid_amount: number | null
          payment_terms: number | null
          status: string | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          balance_amount?: number
          created_at?: string | null
          created_by?: string | null
          discount_amount?: number | null
          due_date: string
          id?: string
          invoice_date?: string
          invoice_number: string
          merchant_id: string
          notes?: string | null
          paid_amount?: number | null
          payment_terms?: number | null
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          balance_amount?: number
          created_at?: string | null
          created_by?: string | null
          discount_amount?: number | null
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          merchant_id?: string
          notes?: string | null
          paid_amount?: number | null
          payment_terms?: number | null
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_2026_02_28_20_06_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_2026_02_28_20_06_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_2026_02_28_20_06_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_data_2026_02_11_14_10: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          metric_name: string
          metric_unit: string | null
          metric_value: number
          period_end: string
          period_start: string
          period_type: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_unit?: string | null
          metric_value: number
          period_end: string
          period_start: string
          period_type: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number
          period_end?: string
          period_start?: string
          period_type?: string
        }
        Relationships: []
      }
      marketing_campaigns_2026_02_11_14_10: {
        Row: {
          budget: number | null
          campaign_type: string
          created_at: string | null
          created_by: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string | null
          target_audience: Json | null
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          campaign_type: string
          created_at?: string | null
          created_by: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          campaign_type?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_2026_02_11_14_10_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
        ]
      }
      master_audit_logs: {
        Row: {
          action_type: string | null
          admin_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          target_user_id: string | null
        }
        Insert: {
          action_type?: string | null
          admin_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string | null
          admin_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      merchants: {
        Row: {
          business_name: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
        }
        Insert: {
          business_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
        }
        Update: {
          business_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      merchants_2026_02_18_17_00: {
        Row: {
          business_address: Json
          business_name: string
          business_type: string | null
          contact_person: string
          created_at: string | null
          email: string
          id: string
          merchant_code: string
          payment_terms: Json | null
          phone: string
          pickup_preferences: Json | null
          registration_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          business_address: Json
          business_name: string
          business_type?: string | null
          contact_person: string
          created_at?: string | null
          email: string
          id?: string
          merchant_code: string
          payment_terms?: Json | null
          phone: string
          pickup_preferences?: Json | null
          registration_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          business_address?: Json
          business_name?: string
          business_type?: string | null
          contact_person?: string
          created_at?: string | null
          email?: string
          id?: string
          merchant_code?: string
          payment_terms?: Json | null
          phone?: string
          pickup_preferences?: Json | null
          registration_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      merchants_2026_02_19_13_00: {
        Row: {
          bank_account_info: Json | null
          business_address: string
          business_hours: Json | null
          business_license: string | null
          business_name: string
          business_type: string | null
          city: string
          commission_rate: number | null
          contact_person: string
          contract_details: Json | null
          created_at: string | null
          credit_limit: number | null
          email: string | null
          id: string
          merchant_code: string
          monthly_volume: number | null
          outstanding_balance: number | null
          phone: string
          pickup_locations: Json | null
          postal_code: string | null
          special_rates: Json | null
          state: string
          status: string | null
          tax_id: string | null
          updated_at: string | null
        }
        Insert: {
          bank_account_info?: Json | null
          business_address: string
          business_hours?: Json | null
          business_license?: string | null
          business_name: string
          business_type?: string | null
          city: string
          commission_rate?: number | null
          contact_person: string
          contract_details?: Json | null
          created_at?: string | null
          credit_limit?: number | null
          email?: string | null
          id?: string
          merchant_code: string
          monthly_volume?: number | null
          outstanding_balance?: number | null
          phone: string
          pickup_locations?: Json | null
          postal_code?: string | null
          special_rates?: Json | null
          state: string
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Update: {
          bank_account_info?: Json | null
          business_address?: string
          business_hours?: Json | null
          business_license?: string | null
          business_name?: string
          business_type?: string | null
          city?: string
          commission_rate?: number | null
          contact_person?: string
          contract_details?: Json | null
          created_at?: string | null
          credit_limit?: number | null
          email?: string | null
          id?: string
          merchant_code?: string
          monthly_volume?: number | null
          outstanding_balance?: number | null
          phone?: string
          pickup_locations?: Json | null
          postal_code?: string | null
          special_rates?: Json | null
          state?: string
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      merchants_2026_02_28_20_06: {
        Row: {
          address: string
          business_license: string | null
          business_name: string
          city: string
          contact_person: string
          country: string | null
          created_at: string | null
          credit_limit: number | null
          email: string
          id: string
          merchant_code: string
          payment_terms: number | null
          phone: string
          postal_code: string | null
          state: string
          status: string | null
          tax_id: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          business_license?: string | null
          business_name: string
          city: string
          contact_person: string
          country?: string | null
          created_at?: string | null
          credit_limit?: number | null
          email: string
          id?: string
          merchant_code: string
          payment_terms?: number | null
          phone: string
          postal_code?: string | null
          state: string
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          business_license?: string | null
          business_name?: string
          city?: string
          contact_person?: string
          country?: string | null
          created_at?: string | null
          credit_limit?: number | null
          email?: string
          id?: string
          merchant_code?: string
          payment_terms?: number | null
          phone?: string
          postal_code?: string | null
          state?: string
          status?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migration_history: {
        Row: {
          executed_at: string | null
          name: string
        }
        Insert: {
          executed_at?: string | null
          name: string
        }
        Update: {
          executed_at?: string | null
          name?: string
        }
        Relationships: []
      }
      myanmar_locations_2026_02_19_13_00: {
        Row: {
          created_at: string | null
          id: string
          is_remote: boolean | null
          postal_code: string | null
          state_division: string
          township: string
          zone: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_remote?: boolean | null
          postal_code?: string | null
          state_division: string
          township: string
          zone?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_remote?: boolean | null
          postal_code?: string | null
          state_division?: string
          township?: string
          zone?: string | null
        }
        Relationships: []
      }
      myanmar_states_divisions_2026_02_18_18_00: {
        Row: {
          base_rate_multiplier: number | null
          capital_en: string | null
          capital_mm: string | null
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name_en: string
          name_mm: string
          type: string
          zone_classification: string | null
        }
        Insert: {
          base_rate_multiplier?: number | null
          capital_en?: string | null
          capital_mm?: string | null
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name_en: string
          name_mm: string
          type: string
          zone_classification?: string | null
        }
        Update: {
          base_rate_multiplier?: number | null
          capital_en?: string | null
          capital_mm?: string | null
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name_en?: string
          name_mm?: string
          type?: string
          zone_classification?: string | null
        }
        Relationships: []
      }
      notifications_2026_02_19_13_00: {
        Row: {
          category: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          read_at: string | null
          recipient_id: string | null
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          read_at?: string | null
          recipient_id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          read_at?: string | null
          recipient_id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_2026_02_19_13_00_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
        ]
      }
      parcels_2026_02_18_17_00: {
        Row: {
          assigned_driver_id: string | null
          assigned_helper_id: string | null
          assigned_rider_id: string | null
          assigned_route_id: string | null
          assigned_vehicle_id: string | null
          cod_amount: number | null
          created_at: string | null
          currency: string | null
          customer_id: string | null
          delivery_address: Json
          delivery_completed_at: string | null
          delivery_fees: number | null
          delivery_scheduled_at: string | null
          delivery_zone: string | null
          dimensions: Json | null
          estimated_distance_km: number | null
          estimated_duration_minutes: number | null
          fragile: boolean | null
          id: string
          item_description: string | null
          item_price: number | null
          merchant_id: string | null
          metadata: Json | null
          parcel_id: string
          pickup_address: Json
          pickup_completed_at: string | null
          pickup_contact_person: string | null
          pickup_instructions: string | null
          pickup_phone: string | null
          pickup_scheduled_at: string | null
          pickup_zone: string | null
          preferred_pickup_time: string | null
          prepaid_amount: number | null
          priority: string | null
          qr_code_data: string | null
          qr_code_generated: boolean | null
          qr_code_printed: boolean | null
          recipient_name: string
          recipient_phone: string
          remarks: string | null
          special_instructions: string | null
          status: string | null
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          assigned_driver_id?: string | null
          assigned_helper_id?: string | null
          assigned_rider_id?: string | null
          assigned_route_id?: string | null
          assigned_vehicle_id?: string | null
          cod_amount?: number | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          delivery_address: Json
          delivery_completed_at?: string | null
          delivery_fees?: number | null
          delivery_scheduled_at?: string | null
          delivery_zone?: string | null
          dimensions?: Json | null
          estimated_distance_km?: number | null
          estimated_duration_minutes?: number | null
          fragile?: boolean | null
          id?: string
          item_description?: string | null
          item_price?: number | null
          merchant_id?: string | null
          metadata?: Json | null
          parcel_id: string
          pickup_address: Json
          pickup_completed_at?: string | null
          pickup_contact_person?: string | null
          pickup_instructions?: string | null
          pickup_phone?: string | null
          pickup_scheduled_at?: string | null
          pickup_zone?: string | null
          preferred_pickup_time?: string | null
          prepaid_amount?: number | null
          priority?: string | null
          qr_code_data?: string | null
          qr_code_generated?: boolean | null
          qr_code_printed?: boolean | null
          recipient_name: string
          recipient_phone: string
          remarks?: string | null
          special_instructions?: string | null
          status?: string | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          assigned_driver_id?: string | null
          assigned_helper_id?: string | null
          assigned_rider_id?: string | null
          assigned_route_id?: string | null
          assigned_vehicle_id?: string | null
          cod_amount?: number | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          delivery_address?: Json
          delivery_completed_at?: string | null
          delivery_fees?: number | null
          delivery_scheduled_at?: string | null
          delivery_zone?: string | null
          dimensions?: Json | null
          estimated_distance_km?: number | null
          estimated_duration_minutes?: number | null
          fragile?: boolean | null
          id?: string
          item_description?: string | null
          item_price?: number | null
          merchant_id?: string | null
          metadata?: Json | null
          parcel_id?: string
          pickup_address?: Json
          pickup_completed_at?: string | null
          pickup_contact_person?: string | null
          pickup_instructions?: string | null
          pickup_phone?: string | null
          pickup_scheduled_at?: string | null
          pickup_zone?: string | null
          preferred_pickup_time?: string | null
          prepaid_amount?: number | null
          priority?: string | null
          qr_code_data?: string | null
          qr_code_generated?: boolean | null
          qr_code_printed?: boolean | null
          recipient_name?: string
          recipient_phone?: string
          remarks?: string | null
          special_instructions?: string | null
          status?: string | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "parcels_2026_02_18_17_00_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers_2026_02_18_17_00"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parcels_2026_02_18_17_00_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants_2026_02_18_17_00"
            referencedColumns: ["id"]
          },
        ]
      }
      payments_2026_02_28_20_06: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string | null
          merchant_id: string | null
          notes: string | null
          payment_date: string
          payment_method: string
          payment_number: string
          processed_by: string | null
          reference_number: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          merchant_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method: string
          payment_number: string
          processed_by?: string | null
          reference_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          merchant_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: string
          payment_number?: string
          processed_by?: string | null
          reference_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_2026_02_28_20_06_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_2026_02_28_20_06_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_2026_02_28_20_06_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_overrides: {
        Row: {
          id: string
          is_allowed: boolean | null
          role_code: string | null
          screen_id: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          is_allowed?: boolean | null
          role_code?: string | null
          screen_id: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          is_allowed?: boolean | null
          role_code?: string | null
          screen_id?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permission_overrides_role_code_fkey"
            columns: ["role_code"]
            isOneToOne: false
            referencedRelation: "rbac_roles"
            referencedColumns: ["role_code"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          code: string
          created_at: string | null
          description: string | null
          domain: string
          id: string
          is_active: boolean | null
          module: string | null
          resource: string
          scope: string
          screen: string | null
        }
        Insert: {
          action: string
          code: string
          created_at?: string | null
          description?: string | null
          domain: string
          id?: string
          is_active?: boolean | null
          module?: string | null
          resource: string
          scope: string
          screen?: string | null
        }
        Update: {
          action?: string
          code?: string
          created_at?: string | null
          description?: string | null
          domain?: string
          id?: string
          is_active?: boolean | null
          module?: string | null
          resource?: string
          scope?: string
          screen?: string | null
        }
        Relationships: []
      }
      pickup_records_2026_02_11_14_10: {
        Row: {
          created_at: string | null
          customer_signature: string | null
          id: string
          notes: string | null
          pickup_photos: string[] | null
          pickup_time: string | null
          rider_id: string
          shipment_id: string
        }
        Insert: {
          created_at?: string | null
          customer_signature?: string | null
          id?: string
          notes?: string | null
          pickup_photos?: string[] | null
          pickup_time?: string | null
          rider_id: string
          shipment_id: string
        }
        Update: {
          created_at?: string | null
          customer_signature?: string | null
          id?: string
          notes?: string | null
          pickup_photos?: string[] | null
          pickup_time?: string | null
          rider_id?: string
          shipment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pickup_records_2026_02_11_14_10_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pickup_records_2026_02_11_14_10_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          app_role: string | null
          branch_id: string | null
          created_at: string | null
          deleted_at: string | null
          email: string
          environment: string | null
          failed_attempts: number | null
          full_name: string | null
          id: string
          is_active: boolean | null
          is_demo: boolean | null
          kyc_status: string | null
          last_login: string | null
          last_login_at: string | null
          last_sign_in_at: string | null
          locked_until: string | null
          mfa_required: boolean | null
          must_change_password: boolean | null
          notes: string | null
          nrc_number: string | null
          permissions: string[] | null
          role: Database["public"]["Enums"]["app_role"] | null
          role_code: string | null
          role_level: string | null
          status: string | null
        }
        Insert: {
          app_role?: string | null
          branch_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email: string
          environment?: string | null
          failed_attempts?: number | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_demo?: boolean | null
          kyc_status?: string | null
          last_login?: string | null
          last_login_at?: string | null
          last_sign_in_at?: string | null
          locked_until?: string | null
          mfa_required?: boolean | null
          must_change_password?: boolean | null
          notes?: string | null
          nrc_number?: string | null
          permissions?: string[] | null
          role?: Database["public"]["Enums"]["app_role"] | null
          role_code?: string | null
          role_level?: string | null
          status?: string | null
        }
        Update: {
          app_role?: string | null
          branch_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          environment?: string | null
          failed_attempts?: number | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_demo?: boolean | null
          kyc_status?: string | null
          last_login?: string | null
          last_login_at?: string | null
          last_sign_in_at?: string | null
          locked_until?: string | null
          mfa_required?: boolean | null
          must_change_password?: boolean | null
          notes?: string | null
          nrc_number?: string | null
          permissions?: string[] | null
          role?: Database["public"]["Enums"]["app_role"] | null
          role_code?: string | null
          role_level?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_code_fkey"
            columns: ["role_code"]
            isOneToOne: false
            referencedRelation: "rbac_roles"
            referencedColumns: ["role_code"]
          },
        ]
      }
      profiles_2026_02_19_13_00: {
        Row: {
          address: string | null
          branch_id: string | null
          created_at: string | null
          department: string | null
          email: string
          emergency_contact: Json | null
          employee_id: string | null
          full_name: string
          hire_date: string | null
          id: string
          performance_metrics: Json | null
          permissions: Json | null
          phone: string | null
          profile_image_url: string | null
          role: string
          salary_info: Json | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          branch_id?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          emergency_contact?: Json | null
          employee_id?: string | null
          full_name: string
          hire_date?: string | null
          id?: string
          performance_metrics?: Json | null
          permissions?: Json | null
          phone?: string | null
          profile_image_url?: string | null
          role?: string
          salary_info?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          branch_id?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          emergency_contact?: Json | null
          employee_id?: string | null
          full_name?: string
          hire_date?: string | null
          id?: string
          performance_metrics?: Json | null
          permissions?: Json | null
          phone?: string | null
          profile_image_url?: string | null
          role?: string
          salary_info?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      qr_codes_2026_02_18_17_00: {
        Row: {
          created_at: string | null
          generated_at: string | null
          generated_by: string | null
          id: string
          is_active: boolean | null
          last_scanned_at: string | null
          last_scanned_by: string | null
          metadata: Json | null
          qr_data: string
          qr_type: string | null
          scan_count: number | null
          shipment_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          is_active?: boolean | null
          last_scanned_at?: string | null
          last_scanned_by?: string | null
          metadata?: Json | null
          qr_data: string
          qr_type?: string | null
          scan_count?: number | null
          shipment_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string
          is_active?: boolean | null
          last_scanned_at?: string | null
          last_scanned_by?: string | null
          metadata?: Json | null
          qr_data?: string
          qr_type?: string | null
          scan_count?: number | null
          shipment_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      qr_codes_advanced_2026_02_19_15_00: {
        Row: {
          created_at: string | null
          data: Json
          expires_at: string | null
          generated_by: string | null
          id: string
          metadata: Json | null
          qr_code: string
          qr_type: string
          reference_id: string
          reference_type: string
          scan_count: number | null
          scanned_at: string | null
          scanned_by: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json
          expires_at?: string | null
          generated_by?: string | null
          id?: string
          metadata?: Json | null
          qr_code: string
          qr_type: string
          reference_id: string
          reference_type: string
          scan_count?: number | null
          scanned_at?: string | null
          scanned_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          expires_at?: string | null
          generated_by?: string | null
          id?: string
          metadata?: Json | null
          qr_code?: string
          qr_type?: string
          reference_id?: string
          reference_type?: string
          scan_count?: number | null
          scanned_at?: string | null
          scanned_by?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      qr_scan_logs_2026_02_18_17_00: {
        Row: {
          device_info: Json | null
          id: string
          notes: string | null
          qr_code_id: string | null
          qr_data: string
          scan_location: Json | null
          scan_result: string | null
          scanned_at: string | null
          scanned_by: string
        }
        Insert: {
          device_info?: Json | null
          id?: string
          notes?: string | null
          qr_code_id?: string | null
          qr_data: string
          scan_location?: Json | null
          scan_result?: string | null
          scanned_at?: string | null
          scanned_by: string
        }
        Update: {
          device_info?: Json | null
          id?: string
          notes?: string | null
          qr_code_id?: string | null
          qr_data?: string
          scan_location?: Json | null
          scan_result?: string | null
          scanned_at?: string | null
          scanned_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "qr_scan_logs_2026_02_18_17_00_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes_2026_02_18_17_00"
            referencedColumns: ["id"]
          },
        ]
      }
      rbac_roles: {
        Row: {
          data_scope: string
          description: string | null
          level: string
          role_code: string
        }
        Insert: {
          data_scope: string
          description?: string | null
          level: string
          role_code: string
        }
        Update: {
          data_scope?: string
          description?: string | null
          level?: string
          role_code?: string
        }
        Relationships: []
      }
      realtime_events_2026_02_18_18_00: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          event_data: Json
          event_type: string
          geofence_id: string | null
          id: string
          location: Json | null
          notification_channels: string[] | null
          notification_sent: boolean | null
          notify_users: string[] | null
          priority: string | null
          processed: boolean | null
          processed_at: string | null
          processing_result: Json | null
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          event_data: Json
          event_type: string
          geofence_id?: string | null
          id?: string
          location?: Json | null
          notification_channels?: string[] | null
          notification_sent?: boolean | null
          notify_users?: string[] | null
          priority?: string | null
          processed?: boolean | null
          processed_at?: string | null
          processing_result?: Json | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          event_data?: Json
          event_type?: string
          geofence_id?: string | null
          id?: string
          location?: Json | null
          notification_channels?: string[] | null
          notification_sent?: boolean | null
          notify_users?: string[] | null
          priority?: string | null
          processed?: boolean | null
          processed_at?: string | null
          processing_result?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "realtime_events_2026_02_18_18_00_geofence_id_fkey"
            columns: ["geofence_id"]
            isOneToOne: false
            referencedRelation: "geofences_2026_02_18_18_00"
            referencedColumns: ["id"]
          },
        ]
      }
      realtime_events_2026_02_19_15_00: {
        Row: {
          created_at: string | null
          device_id: string | null
          event_category: string
          event_data: Json
          event_type: string
          id: string
          is_processed: boolean | null
          processed_at: string | null
          processed_by: string | null
          reference_id: string | null
          reference_type: string | null
          severity: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_id?: string | null
          event_category: string
          event_data?: Json
          event_type: string
          id?: string
          is_processed?: boolean | null
          processed_at?: string | null
          processed_by?: string | null
          reference_id?: string | null
          reference_type?: string | null
          severity?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string | null
          event_category?: string
          event_data?: Json
          event_type?: string
          id?: string
          is_processed?: boolean | null
          processed_at?: string | null
          processed_by?: string | null
          reference_id?: string | null
          reference_type?: string | null
          severity?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      realtime_notifications_2026_02_19_17_00: {
        Row: {
          action_required: boolean | null
          action_url: string | null
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          message: string
          notification_type: string
          priority: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_required?: boolean | null
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message: string
          notification_type: string
          priority?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_required?: boolean | null
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          notification_type?: string
          priority?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      regions_2026_02_28_20_06: {
        Row: {
          code: string
          country: string
          created_at: string | null
          id: string
          manager_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          country?: string
          created_at?: string | null
          id?: string
          manager_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          country?: string
          created_at?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_regions_manager"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
        ]
      }
      reports_2026_02_11_14_10: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string
          data: Json | null
          file_path: string | null
          id: string
          name: string
          parameters: Json | null
          report_type: string
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          data?: Json | null
          file_path?: string | null
          id?: string
          name: string
          parameters?: Json | null
          report_type: string
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          data?: Json | null
          file_path?: string | null
          id?: string
          name?: string
          parameters?: Json | null
          report_type?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_2026_02_11_14_10_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          permission_code: string | null
          role_code: string | null
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_code?: string | null
          role_code?: string | null
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_code?: string | null
          role_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_code_fkey"
            columns: ["permission_code"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "role_permissions_role_code_fkey"
            columns: ["role_code"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["code"]
          },
        ]
      }
      role_permissions_2026_02_28_20_06: {
        Row: {
          api_permission: string
          created_at: string | null
          id: string
          role: string
          screen_permission: string
        }
        Insert: {
          api_permission: string
          created_at?: string | null
          id?: string
          role: string
          screen_permission: string
        }
        Update: {
          api_permission?: string
          created_at?: string | null
          id?: string
          role?: string
          screen_permission?: string
        }
        Relationships: []
      }
      roles: {
        Row: {
          code: string
          created_at: string | null
          default_scope: string
          description: string | null
          hierarchy_level: number
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          default_scope?: string
          description?: string | null
          hierarchy_level: number
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          default_scope?: string
          description?: string | null
          hierarchy_level?: number
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      route_optimizations_2026_02_18_18_00: {
        Row: {
          algorithm_used: string | null
          applied_at: string | null
          computation_time_ms: number | null
          cost_saved_amount: number | null
          created_at: string | null
          distance_saved_km: number | null
          fuel_saved_liters: number | null
          id: string
          optimization_score: number | null
          optimization_type: string | null
          optimized_distance_km: number | null
          optimized_duration_minutes: number | null
          optimized_waypoints: Json
          original_distance_km: number | null
          original_duration_minutes: number | null
          original_waypoints: Json
          route_id: string | null
          status: string | null
          time_saved_minutes: number | null
        }
        Insert: {
          algorithm_used?: string | null
          applied_at?: string | null
          computation_time_ms?: number | null
          cost_saved_amount?: number | null
          created_at?: string | null
          distance_saved_km?: number | null
          fuel_saved_liters?: number | null
          id?: string
          optimization_score?: number | null
          optimization_type?: string | null
          optimized_distance_km?: number | null
          optimized_duration_minutes?: number | null
          optimized_waypoints: Json
          original_distance_km?: number | null
          original_duration_minutes?: number | null
          original_waypoints: Json
          route_id?: string | null
          status?: string | null
          time_saved_minutes?: number | null
        }
        Update: {
          algorithm_used?: string | null
          applied_at?: string | null
          computation_time_ms?: number | null
          cost_saved_amount?: number | null
          created_at?: string | null
          distance_saved_km?: number | null
          fuel_saved_liters?: number | null
          id?: string
          optimization_score?: number | null
          optimization_type?: string | null
          optimized_distance_km?: number | null
          optimized_duration_minutes?: number | null
          optimized_waypoints?: Json
          original_distance_km?: number | null
          original_duration_minutes?: number | null
          original_waypoints?: Json
          route_id?: string | null
          status?: string | null
          time_saved_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "route_optimizations_2026_02_18_18_00_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "route_plans_2026_02_18_17_00"
            referencedColumns: ["id"]
          },
        ]
      }
      route_optimizations_2026_02_19_15_00: {
        Row: {
          actual_duration: number | null
          completed_at: string | null
          created_at: string | null
          end_location: Json | null
          estimated_duration: number | null
          fuel_consumption: number | null
          id: string
          metadata: Json | null
          optimization_algorithm: string | null
          optimized_sequence: Json | null
          rider_id: string | null
          route_name: string
          start_location: Json
          started_at: string | null
          status: string | null
          total_distance: number | null
          updated_at: string | null
          vehicle_id: string | null
          waypoints: Json | null
        }
        Insert: {
          actual_duration?: number | null
          completed_at?: string | null
          created_at?: string | null
          end_location?: Json | null
          estimated_duration?: number | null
          fuel_consumption?: number | null
          id?: string
          metadata?: Json | null
          optimization_algorithm?: string | null
          optimized_sequence?: Json | null
          rider_id?: string | null
          route_name: string
          start_location: Json
          started_at?: string | null
          status?: string | null
          total_distance?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
          waypoints?: Json | null
        }
        Update: {
          actual_duration?: number | null
          completed_at?: string | null
          created_at?: string | null
          end_location?: Json | null
          estimated_duration?: number | null
          fuel_consumption?: number | null
          id?: string
          metadata?: Json | null
          optimization_algorithm?: string | null
          optimized_sequence?: Json | null
          rider_id?: string | null
          route_name?: string
          start_location?: Json
          started_at?: string | null
          status?: string | null
          total_distance?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
          waypoints?: Json | null
        }
        Relationships: []
      }
      route_plans_2026_02_18_17_00: {
        Row: {
          actual_distance_km: number | null
          actual_duration_minutes: number | null
          assigned_driver_id: string | null
          assigned_helper_id: string | null
          assigned_rider_id: string | null
          assigned_vehicle_id: string | null
          completed_at: string | null
          created_at: string | null
          estimated_duration_minutes: number | null
          id: string
          optimized_waypoints: Json | null
          parcels_delivered: number | null
          parcels_failed: number | null
          route_code: string
          route_date: string
          started_at: string | null
          status: string | null
          total_distance_km: number | null
          total_parcels: number | null
          updated_at: string | null
          zone: string
        }
        Insert: {
          actual_distance_km?: number | null
          actual_duration_minutes?: number | null
          assigned_driver_id?: string | null
          assigned_helper_id?: string | null
          assigned_rider_id?: string | null
          assigned_vehicle_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          optimized_waypoints?: Json | null
          parcels_delivered?: number | null
          parcels_failed?: number | null
          route_code: string
          route_date: string
          started_at?: string | null
          status?: string | null
          total_distance_km?: number | null
          total_parcels?: number | null
          updated_at?: string | null
          zone: string
        }
        Update: {
          actual_distance_km?: number | null
          actual_duration_minutes?: number | null
          assigned_driver_id?: string | null
          assigned_helper_id?: string | null
          assigned_rider_id?: string | null
          assigned_vehicle_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          optimized_waypoints?: Json | null
          parcels_delivered?: number | null
          parcels_failed?: number | null
          route_code?: string
          route_date?: string
          started_at?: string | null
          status?: string | null
          total_distance_km?: number | null
          total_parcels?: number | null
          updated_at?: string | null
          zone?: string
        }
        Relationships: []
      }
      routes_2026_02_19_13_00: {
        Row: {
          actual_duration: number | null
          actual_end_time: string | null
          actual_start_time: string | null
          assigned_driver_id: string | null
          assigned_vehicle_id: string | null
          created_at: string | null
          destination_branch_id: string | null
          estimated_duration: number | null
          id: string
          notes: string | null
          origin_branch_id: string | null
          planned_end_time: string | null
          planned_start_time: string | null
          route_code: string
          route_name: string
          route_type: string | null
          shipment_ids: Json | null
          status: string | null
          total_distance: number | null
          updated_at: string | null
          waypoints: Json | null
        }
        Insert: {
          actual_duration?: number | null
          actual_end_time?: string | null
          actual_start_time?: string | null
          assigned_driver_id?: string | null
          assigned_vehicle_id?: string | null
          created_at?: string | null
          destination_branch_id?: string | null
          estimated_duration?: number | null
          id?: string
          notes?: string | null
          origin_branch_id?: string | null
          planned_end_time?: string | null
          planned_start_time?: string | null
          route_code: string
          route_name: string
          route_type?: string | null
          shipment_ids?: Json | null
          status?: string | null
          total_distance?: number | null
          updated_at?: string | null
          waypoints?: Json | null
        }
        Update: {
          actual_duration?: number | null
          actual_end_time?: string | null
          actual_start_time?: string | null
          assigned_driver_id?: string | null
          assigned_vehicle_id?: string | null
          created_at?: string | null
          destination_branch_id?: string | null
          estimated_duration?: number | null
          id?: string
          notes?: string | null
          origin_branch_id?: string | null
          planned_end_time?: string | null
          planned_start_time?: string | null
          route_code?: string
          route_name?: string
          route_type?: string | null
          shipment_ids?: Json | null
          status?: string | null
          total_distance?: number | null
          updated_at?: string | null
          waypoints?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_2026_02_19_13_00_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "profiles_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_2026_02_19_13_00_assigned_vehicle_id_fkey"
            columns: ["assigned_vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_2026_02_19_13_00_destination_branch_id_fkey"
            columns: ["destination_branch_id"]
            isOneToOne: false
            referencedRelation: "branches_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_2026_02_19_13_00_origin_branch_id_fkey"
            columns: ["origin_branch_id"]
            isOneToOne: false
            referencedRelation: "branches_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
        ]
      }
      routes_2026_02_28_20_06: {
        Row: {
          created_at: string | null
          destination_branch_id: string
          distance_km: number | null
          estimated_duration_hours: number | null
          id: string
          name: string
          origin_branch_id: string
          route_code: string
          route_type: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          destination_branch_id: string
          distance_km?: number | null
          estimated_duration_hours?: number | null
          id?: string
          name: string
          origin_branch_id: string
          route_code: string
          route_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          destination_branch_id?: string
          distance_km?: number | null
          estimated_duration_hours?: number | null
          id?: string
          name?: string
          origin_branch_id?: string
          route_code?: string
          route_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_2026_02_28_20_06_destination_branch_id_fkey"
            columns: ["destination_branch_id"]
            isOneToOne: false
            referencedRelation: "branches_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_2026_02_28_20_06_origin_branch_id_fkey"
            columns: ["origin_branch_id"]
            isOneToOne: false
            referencedRelation: "branches_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string | null
          id: string
          severity: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type?: string | null
          id?: string
          severity?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string | null
          id?: string
          severity?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_events_2026_02_11_14_10: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_events_2026_02_11_14_10_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_events_2026_02_11_14_10_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
        ]
      }
      seed_users_import: {
        Row: {
          email: string
          full_name: string
          role: string
        }
        Insert: {
          email: string
          full_name: string
          role: string
        }
        Update: {
          email?: string
          full_name?: string
          role?: string
        }
        Relationships: []
      }
      shipment_approvals: {
        Row: {
          id: string
          notes: string | null
          requested_at: string
          requested_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          shipment_id: string
          status: string
        }
        Insert: {
          id?: string
          notes?: string | null
          requested_at?: string
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          shipment_id: string
          status?: string
        }
        Update: {
          id?: string
          notes?: string | null
          requested_at?: string
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          shipment_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_approvals_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "app_identities"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "shipment_approvals_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_approvals_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "app_identities"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "shipment_approvals_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_approvals_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "finance_cod_pending_v"
            referencedColumns: ["shipment_id"]
          },
          {
            foreignKeyName: "shipment_approvals_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_assignment_rules_2026_02_19_17_00: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          rule_name: string
          rule_type: string
          updated_at: string | null
        }
        Insert: {
          actions: Json
          conditions: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          rule_name: string
          rule_type: string
          updated_at?: string | null
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          rule_name?: string
          rule_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      shipment_status_history_2026_02_11_14_10: {
        Row: {
          created_at: string | null
          id: string
          location: string | null
          metadata: Json | null
          notes: string | null
          shipment_id: string
          status: string
          updated_by: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          notes?: string | null
          shipment_id: string
          status: string
          updated_by: string
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          notes?: string | null
          shipment_id?: string
          status?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_status_history_2026_02_11_14_10_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_status_history_2026_02_11_14_10_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_status_history_2026_02_17_18_40: {
        Row: {
          created_at: string | null
          id: string
          location: string | null
          metadata: Json | null
          notes: string | null
          shipment_id: string
          status: string
          updated_by: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          notes?: string | null
          shipment_id: string
          status: string
          updated_by: string
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          notes?: string | null
          shipment_id?: string
          status?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_status_history_2026_02_17_18_40_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments_2026_02_17_18_40"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_status_history_2026_02_17_18_40_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_17_18_40"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_steps: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          completed_by: string | null
          id: string
          shipment_id: string | null
          step_name: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          completed_by?: string | null
          id?: string
          shipment_id?: string | null
          step_name: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          completed_by?: string | null
          id?: string
          shipment_id?: string | null
          step_name?: string
        }
        Relationships: []
      }
      shipment_tracking_2026_02_19_13_00: {
        Row: {
          branch_id: string | null
          id: string
          location: string | null
          notes: string | null
          shipment_id: string | null
          status: string
          timestamp: string | null
          updated_by: string | null
        }
        Insert: {
          branch_id?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          shipment_id?: string | null
          status: string
          timestamp?: string | null
          updated_by?: string | null
        }
        Update: {
          branch_id?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          shipment_id?: string | null
          status?: string
          timestamp?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipment_tracking_2026_02_19_13_00_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_tracking_2026_02_19_13_00_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_tracking_2026_02_19_13_00_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
        ]
      }
      shipment_workflow_states_2026_02_19_17_00: {
        Row: {
          actual_completion: string | null
          assigned_to_branch_id: string | null
          assigned_to_user_id: string | null
          assigned_to_vehicle_id: string | null
          assignment_reason: string | null
          auto_assigned: boolean | null
          created_at: string | null
          current_state: string
          estimated_completion: string | null
          id: string
          previous_state: string | null
          shipment_id: string
          updated_at: string | null
          workflow_data: Json | null
        }
        Insert: {
          actual_completion?: string | null
          assigned_to_branch_id?: string | null
          assigned_to_user_id?: string | null
          assigned_to_vehicle_id?: string | null
          assignment_reason?: string | null
          auto_assigned?: boolean | null
          created_at?: string | null
          current_state: string
          estimated_completion?: string | null
          id?: string
          previous_state?: string | null
          shipment_id: string
          updated_at?: string | null
          workflow_data?: Json | null
        }
        Update: {
          actual_completion?: string | null
          assigned_to_branch_id?: string | null
          assigned_to_user_id?: string | null
          assigned_to_vehicle_id?: string | null
          assignment_reason?: string | null
          auto_assigned?: boolean | null
          created_at?: string | null
          current_state?: string
          estimated_completion?: string | null
          id?: string
          previous_state?: string | null
          shipment_id?: string
          updated_at?: string | null
          workflow_data?: Json | null
        }
        Relationships: []
      }
      shipments: {
        Row: {
          actual_delivery_time: string | null
          cod_amount: number | null
          created_at: string
          delivery_address: string | null
          destination: string
          id: string
          last_lat: number | null
          last_lng: number | null
          merchant_id: string | null
          origin: string
          pickup_address: string | null
          rider_id: string | null
          status: string | null
          total_amount: number | null
          tracking_id: string
          way_id: string | null
          weight_kg: number | null
        }
        Insert: {
          actual_delivery_time?: string | null
          cod_amount?: number | null
          created_at?: string
          delivery_address?: string | null
          destination: string
          id?: string
          last_lat?: number | null
          last_lng?: number | null
          merchant_id?: string | null
          origin: string
          pickup_address?: string | null
          rider_id?: string | null
          status?: string | null
          total_amount?: number | null
          tracking_id: string
          way_id?: string | null
          weight_kg?: number | null
        }
        Update: {
          actual_delivery_time?: string | null
          cod_amount?: number | null
          created_at?: string
          delivery_address?: string | null
          destination?: string
          id?: string
          last_lat?: number | null
          last_lng?: number | null
          merchant_id?: string | null
          origin?: string
          pickup_address?: string | null
          rider_id?: string | null
          status?: string | null
          total_amount?: number | null
          tracking_id?: string
          way_id?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_rider_id_fkey"
            columns: ["rider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments_2026_02_11_14_10: {
        Row: {
          awb_number: string
          cod_amount: number | null
          created_at: string | null
          created_by: string
          customer_id: string | null
          delivery_address: Json
          id: string
          merchant_id: string | null
          metadata: Json | null
          package_details: Json
          pickup_address: Json
          priority: string | null
          shipping_cost: number
          status: string | null
          tamper_tag_id: string | null
          updated_at: string | null
        }
        Insert: {
          awb_number: string
          cod_amount?: number | null
          created_at?: string | null
          created_by: string
          customer_id?: string | null
          delivery_address: Json
          id?: string
          merchant_id?: string | null
          metadata?: Json | null
          package_details: Json
          pickup_address: Json
          priority?: string | null
          shipping_cost: number
          status?: string | null
          tamper_tag_id?: string | null
          updated_at?: string | null
        }
        Update: {
          awb_number?: string
          cod_amount?: number | null
          created_at?: string | null
          created_by?: string
          customer_id?: string | null
          delivery_address?: Json
          id?: string
          merchant_id?: string | null
          metadata?: Json | null
          package_details?: Json
          pickup_address?: Json
          priority?: string | null
          shipping_cost?: number
          status?: string | null
          tamper_tag_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_2026_02_11_14_10_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_2026_02_11_14_10_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_2026_02_11_14_10_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_2026_02_11_14_10_tamper_tag_id_fkey"
            columns: ["tamper_tag_id"]
            isOneToOne: false
            referencedRelation: "tamper_tags_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments_2026_02_17_18_40: {
        Row: {
          actual_delivery: string | null
          awb_number: string
          cod_amount: number | null
          created_at: string | null
          created_by: string
          customer_id: string | null
          delivery_address: Json
          estimated_delivery: string | null
          id: string
          merchant_id: string | null
          metadata: Json | null
          package_details: Json
          pickup_address: Json
          priority: string | null
          shipping_cost: number
          status: string | null
          tamper_tag_id: string | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery?: string | null
          awb_number: string
          cod_amount?: number | null
          created_at?: string | null
          created_by: string
          customer_id?: string | null
          delivery_address: Json
          estimated_delivery?: string | null
          id?: string
          merchant_id?: string | null
          metadata?: Json | null
          package_details: Json
          pickup_address: Json
          priority?: string | null
          shipping_cost: number
          status?: string | null
          tamper_tag_id?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery?: string | null
          awb_number?: string
          cod_amount?: number | null
          created_at?: string | null
          created_by?: string
          customer_id?: string | null
          delivery_address?: Json
          estimated_delivery?: string | null
          id?: string
          merchant_id?: string | null
          metadata?: Json | null
          package_details?: Json
          pickup_address?: Json
          priority?: string | null
          shipping_cost?: number
          status?: string | null
          tamper_tag_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_2026_02_17_18_40_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_17_18_40"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_2026_02_17_18_40_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_17_18_40"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_2026_02_17_18_40_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_17_18_40"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_2026_02_17_18_40_tamper_tag_id_fkey"
            columns: ["tamper_tag_id"]
            isOneToOne: false
            referencedRelation: "tamper_tags_2026_02_17_18_40"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments_2026_02_19_13_00: {
        Row: {
          actual_delivery_date: string | null
          assigned_rider_id: string | null
          assigned_vehicle_id: string | null
          awb_number: string
          cod_amount: number | null
          contents_description: string | null
          created_at: string | null
          current_location: string | null
          customer_id: string | null
          declared_value: number | null
          destination_branch_id: string | null
          dimensions: Json | null
          expected_delivery_date: string | null
          id: string
          insurance_cost: number | null
          merchant_id: string | null
          origin_branch_id: string | null
          package_type: string | null
          payment_method: string | null
          pickup_date: string | null
          receiver_address: string
          receiver_city: string
          receiver_name: string
          receiver_phone: string
          receiver_state: string
          reference_number: string | null
          sender_address: string
          sender_city: string
          sender_name: string
          sender_phone: string
          sender_state: string
          service_type: string | null
          shipping_cost: number
          special_instructions: string | null
          status: string | null
          total_cost: number
          updated_at: string | null
          weight: number
        }
        Insert: {
          actual_delivery_date?: string | null
          assigned_rider_id?: string | null
          assigned_vehicle_id?: string | null
          awb_number: string
          cod_amount?: number | null
          contents_description?: string | null
          created_at?: string | null
          current_location?: string | null
          customer_id?: string | null
          declared_value?: number | null
          destination_branch_id?: string | null
          dimensions?: Json | null
          expected_delivery_date?: string | null
          id?: string
          insurance_cost?: number | null
          merchant_id?: string | null
          origin_branch_id?: string | null
          package_type?: string | null
          payment_method?: string | null
          pickup_date?: string | null
          receiver_address: string
          receiver_city: string
          receiver_name: string
          receiver_phone: string
          receiver_state: string
          reference_number?: string | null
          sender_address: string
          sender_city: string
          sender_name: string
          sender_phone: string
          sender_state: string
          service_type?: string | null
          shipping_cost: number
          special_instructions?: string | null
          status?: string | null
          total_cost: number
          updated_at?: string | null
          weight: number
        }
        Update: {
          actual_delivery_date?: string | null
          assigned_rider_id?: string | null
          assigned_vehicle_id?: string | null
          awb_number?: string
          cod_amount?: number | null
          contents_description?: string | null
          created_at?: string | null
          current_location?: string | null
          customer_id?: string | null
          declared_value?: number | null
          destination_branch_id?: string | null
          dimensions?: Json | null
          expected_delivery_date?: string | null
          id?: string
          insurance_cost?: number | null
          merchant_id?: string | null
          origin_branch_id?: string | null
          package_type?: string | null
          payment_method?: string | null
          pickup_date?: string | null
          receiver_address?: string
          receiver_city?: string
          receiver_name?: string
          receiver_phone?: string
          receiver_state?: string
          reference_number?: string | null
          sender_address?: string
          sender_city?: string
          sender_name?: string
          sender_phone?: string
          sender_state?: string
          service_type?: string | null
          shipping_cost?: number
          special_instructions?: string | null
          status?: string | null
          total_cost?: number
          updated_at?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "shipments_2026_02_19_13_00_assigned_rider_id_fkey"
            columns: ["assigned_rider_id"]
            isOneToOne: false
            referencedRelation: "profiles_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_2026_02_19_13_00_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_2026_02_19_13_00_destination_branch_id_fkey"
            columns: ["destination_branch_id"]
            isOneToOne: false
            referencedRelation: "branches_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_2026_02_19_13_00_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_2026_02_19_13_00_origin_branch_id_fkey"
            columns: ["origin_branch_id"]
            isOneToOne: false
            referencedRelation: "branches_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments_2026_02_28_20_06: {
        Row: {
          actual_delivery: string | null
          assigned_driver_id: string | null
          assigned_rider_id: string | null
          base_rate: number
          cod_amount: number | null
          cod_collected: boolean | null
          cod_collected_at: string | null
          cod_collected_by: string | null
          created_at: string | null
          current_branch_id: string | null
          current_location: string | null
          customer_id: string | null
          declared_value: number | null
          delivery_instructions: string | null
          destination_branch_id: string | null
          estimated_delivery: string | null
          fuel_surcharge: number | null
          height: number | null
          id: string
          insurance_fee: number | null
          length: number | null
          merchant_id: string | null
          origin_branch_id: string | null
          package_type: string
          pickup_date: string | null
          recipient_address: string
          recipient_city: string
          recipient_name: string
          recipient_phone: string
          recipient_postal_code: string | null
          recipient_state: string
          sender_address: string
          sender_city: string
          sender_name: string
          sender_phone: string
          sender_postal_code: string | null
          sender_state: string
          service_type: string
          special_instructions: string | null
          status: string
          total_amount: number
          tracking_number: string
          updated_at: string | null
          weight: number
          width: number | null
        }
        Insert: {
          actual_delivery?: string | null
          assigned_driver_id?: string | null
          assigned_rider_id?: string | null
          base_rate?: number
          cod_amount?: number | null
          cod_collected?: boolean | null
          cod_collected_at?: string | null
          cod_collected_by?: string | null
          created_at?: string | null
          current_branch_id?: string | null
          current_location?: string | null
          customer_id?: string | null
          declared_value?: number | null
          delivery_instructions?: string | null
          destination_branch_id?: string | null
          estimated_delivery?: string | null
          fuel_surcharge?: number | null
          height?: number | null
          id?: string
          insurance_fee?: number | null
          length?: number | null
          merchant_id?: string | null
          origin_branch_id?: string | null
          package_type: string
          pickup_date?: string | null
          recipient_address: string
          recipient_city: string
          recipient_name: string
          recipient_phone: string
          recipient_postal_code?: string | null
          recipient_state: string
          sender_address: string
          sender_city: string
          sender_name: string
          sender_phone: string
          sender_postal_code?: string | null
          sender_state: string
          service_type: string
          special_instructions?: string | null
          status?: string
          total_amount?: number
          tracking_number: string
          updated_at?: string | null
          weight: number
          width?: number | null
        }
        Update: {
          actual_delivery?: string | null
          assigned_driver_id?: string | null
          assigned_rider_id?: string | null
          base_rate?: number
          cod_amount?: number | null
          cod_collected?: boolean | null
          cod_collected_at?: string | null
          cod_collected_by?: string | null
          created_at?: string | null
          current_branch_id?: string | null
          current_location?: string | null
          customer_id?: string | null
          declared_value?: number | null
          delivery_instructions?: string | null
          destination_branch_id?: string | null
          estimated_delivery?: string | null
          fuel_surcharge?: number | null
          height?: number | null
          id?: string
          insurance_fee?: number | null
          length?: number | null
          merchant_id?: string | null
          origin_branch_id?: string | null
          package_type?: string
          pickup_date?: string | null
          recipient_address?: string
          recipient_city?: string
          recipient_name?: string
          recipient_phone?: string
          recipient_postal_code?: string | null
          recipient_state?: string
          sender_address?: string
          sender_city?: string
          sender_name?: string
          sender_phone?: string
          sender_postal_code?: string | null
          sender_state?: string
          service_type?: string
          special_instructions?: string | null
          status?: string
          total_amount?: number
          tracking_number?: string
          updated_at?: string | null
          weight?: number
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_2026_02_28_20_06_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_2026_02_28_20_06_assigned_rider_id_fkey"
            columns: ["assigned_rider_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_2026_02_28_20_06_cod_collected_by_fkey"
            columns: ["cod_collected_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_2026_02_28_20_06_current_branch_id_fkey"
            columns: ["current_branch_id"]
            isOneToOne: false
            referencedRelation: "branches_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_2026_02_28_20_06_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_2026_02_28_20_06_destination_branch_id_fkey"
            columns: ["destination_branch_id"]
            isOneToOne: false
            referencedRelation: "branches_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_2026_02_28_20_06_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_2026_02_28_20_06_origin_branch_id_fkey"
            columns: ["origin_branch_id"]
            isOneToOne: false
            referencedRelation: "branches_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_calculations_2026_02_18_18_00: {
        Row: {
          actual_weight_kg: number
          additional_charges: Json | null
          airline_code: string | null
          base_rate: number | null
          booking_reference: string | null
          chargeable_weight_kg: number | null
          created_at: string | null
          currency: string | null
          destination_location: Json | null
          dimensions_cm: Json
          estimated_delivery_date: string | null
          estimated_delivery_days: number | null
          id: string
          is_booked: boolean | null
          origin_location: Json | null
          origin_type: string | null
          quote_valid_until: string | null
          service_type: string | null
          total_amount: number | null
          user_id: string | null
          user_type: string | null
          volume_weight_kg: number | null
        }
        Insert: {
          actual_weight_kg: number
          additional_charges?: Json | null
          airline_code?: string | null
          base_rate?: number | null
          booking_reference?: string | null
          chargeable_weight_kg?: number | null
          created_at?: string | null
          currency?: string | null
          destination_location?: Json | null
          dimensions_cm: Json
          estimated_delivery_date?: string | null
          estimated_delivery_days?: number | null
          id?: string
          is_booked?: boolean | null
          origin_location?: Json | null
          origin_type?: string | null
          quote_valid_until?: string | null
          service_type?: string | null
          total_amount?: number | null
          user_id?: string | null
          user_type?: string | null
          volume_weight_kg?: number | null
        }
        Update: {
          actual_weight_kg?: number
          additional_charges?: Json | null
          airline_code?: string | null
          base_rate?: number | null
          booking_reference?: string | null
          chargeable_weight_kg?: number | null
          created_at?: string | null
          currency?: string | null
          destination_location?: Json | null
          dimensions_cm?: Json
          estimated_delivery_date?: string | null
          estimated_delivery_days?: number | null
          id?: string
          is_booked?: boolean | null
          origin_location?: Json | null
          origin_type?: string | null
          quote_valid_until?: string | null
          service_type?: string | null
          total_amount?: number | null
          user_id?: string | null
          user_type?: string | null
          volume_weight_kg?: number | null
        }
        Relationships: []
      }
      support_ticket_messages_2026_02_11_14_10: {
        Row: {
          attachments: string[] | null
          created_at: string | null
          id: string
          is_internal: boolean | null
          message: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          attachments?: string[] | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_2026_02_11_14_10_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_messages_2026_02_11_14_10_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets_2026_02_11_14_10: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string | null
          customer_id: string
          description: string
          id: string
          priority: string | null
          resolved_at: string | null
          shipment_id: string | null
          status: string | null
          subject: string
          ticket_number: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          customer_id: string
          description: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          shipment_id?: string | null
          status?: string | null
          subject: string
          ticket_number: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          customer_id?: string
          description?: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          shipment_id?: string | null
          status?: string | null
          subject?: string
          ticket_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_2026_02_11_14_10_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_2026_02_11_14_10_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_2026_02_11_14_10_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings_2026_02_11_14_10: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_2026_02_11_14_10_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
        ]
      }
      tamper_tags_2026_02_11_14_10: {
        Row: {
          activated_at: string | null
          assigned_at: string | null
          assigned_to: string | null
          batch_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          status: string | null
          tag_code: string
        }
        Insert: {
          activated_at?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          batch_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          tag_code: string
        }
        Update: {
          activated_at?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          batch_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          tag_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "tamper_tags_2026_02_11_14_10_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
        ]
      }
      tamper_tags_2026_02_17_18_40: {
        Row: {
          activated_at: string | null
          assigned_at: string | null
          assigned_to: string | null
          batch_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          status: string | null
          tag_code: string
        }
        Insert: {
          activated_at?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          batch_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          tag_code: string
        }
        Update: {
          activated_at?: string | null
          assigned_at?: string | null
          assigned_to?: string | null
          batch_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          tag_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "tamper_tags_2026_02_17_18_40_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users_2026_02_17_18_40"
            referencedColumns: ["id"]
          },
        ]
      }
      tariffs: {
        Row: {
          base_price: number
          created_by: string | null
          id: string
          township_name: string
          updated_at: string | null
          weight_surcharge_per_kg: number | null
        }
        Insert: {
          base_price: number
          created_by?: string | null
          id?: string
          township_name: string
          updated_at?: string | null
          weight_surcharge_per_kg?: number | null
        }
        Update: {
          base_price?: number
          created_by?: string | null
          id?: string
          township_name?: string
          updated_at?: string | null
          weight_surcharge_per_kg?: number | null
        }
        Relationships: []
      }
      townships_2026_02_18_18_00: {
        Row: {
          code: string
          created_at: string | null
          delivery_time_days: number | null
          delivery_zone: string | null
          distance_from_capital_km: number | null
          id: string
          is_active: boolean | null
          is_cod_available: boolean | null
          name_en: string
          name_mm: string
          postal_code: string | null
          rate_multiplier: number | null
          state_division_id: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          delivery_time_days?: number | null
          delivery_zone?: string | null
          distance_from_capital_km?: number | null
          id?: string
          is_active?: boolean | null
          is_cod_available?: boolean | null
          name_en: string
          name_mm: string
          postal_code?: string | null
          rate_multiplier?: number | null
          state_division_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          delivery_time_days?: number | null
          delivery_zone?: string | null
          distance_from_capital_km?: number | null
          id?: string
          is_active?: boolean | null
          is_cod_available?: boolean | null
          name_en?: string
          name_mm?: string
          postal_code?: string | null
          rate_multiplier?: number | null
          state_division_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "townships_2026_02_18_18_00_state_division_id_fkey"
            columns: ["state_division_id"]
            isOneToOne: false
            referencedRelation: "myanmar_states_divisions_2026_02_18_18_00"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_events_2026_02_28_20_06: {
        Row: {
          branch_id: string | null
          created_at: string | null
          created_by: string | null
          event_type: string
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          notes: string | null
          shipment_id: string
          status: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          event_type: string
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          notes?: string | null
          shipment_id: string
          status: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          event_type?: string
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          notes?: string | null
          shipment_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_2026_02_28_20_06_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_events_2026_02_28_20_06_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_events_2026_02_28_20_06_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions_2026_02_19_13_00: {
        Row: {
          amount: number
          branch_id: string | null
          collected_by: string | null
          created_at: string | null
          currency: string | null
          customer_id: string | null
          id: string
          merchant_id: string | null
          metadata: Json | null
          notes: string | null
          payment_method: string | null
          reference_id: string | null
          reference_type: string | null
          settlement_date: string | null
          settlement_status: string | null
          status: string | null
          transaction_number: string
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          branch_id?: string | null
          collected_by?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          id?: string
          merchant_id?: string | null
          metadata?: Json | null
          notes?: string | null
          payment_method?: string | null
          reference_id?: string | null
          reference_type?: string | null
          settlement_date?: string | null
          settlement_status?: string | null
          status?: string | null
          transaction_number: string
          transaction_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          branch_id?: string | null
          collected_by?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          id?: string
          merchant_id?: string | null
          metadata?: Json | null
          notes?: string | null
          payment_method?: string | null
          reference_id?: string | null
          reference_type?: string | null
          settlement_date?: string | null
          settlement_status?: string | null
          status?: string | null
          transaction_number?: string
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_2026_02_19_13_00_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_2026_02_19_13_00_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "profiles_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_2026_02_19_13_00_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_2026_02_19_13_00_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
        ]
      }
      trusted_merchants: {
        Row: {
          enabled: boolean | null
          merchant_id: string
          risk_tier: string | null
        }
        Insert: {
          enabled?: boolean | null
          merchant_id: string
          risk_tier?: string | null
        }
        Update: {
          enabled?: boolean | null
          merchant_id?: string
          risk_tier?: string | null
        }
        Relationships: []
      }
      user_activity_2026_02_11_14_10: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_2026_02_11_14_10_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
        ]
      }
      user_branch_assignments: {
        Row: {
          assigned_at: string | null
          branch_id: string
          id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          branch_id: string
          id?: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          branch_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_credentials: {
        Row: {
          created_at: string
          password_hash: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          password_hash: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          password_hash?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_credentials_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          assigned_at: string | null
          id: string
          permission_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          permission_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          permission_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown
          is_active: boolean | null
          last_activity: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions_2026_02_11_14_10: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown
          is_active: boolean | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_2026_02_11_14_10_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions_2026_02_28_20_06: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          ip_address: unknown
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_2026_02_28_20_06_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          branch_id: string | null
          created_at: string | null
          created_by: string | null
          email: string
          id: string
          is_active: boolean | null
          is_demo: boolean | null
          role: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          email: string
          id: string
          is_active?: boolean | null
          is_demo?: boolean | null
          role: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          is_demo?: boolean | null
          role?: string
        }
        Relationships: []
      }
      users_2026_02_11_14_10: {
        Row: {
          blocked_at: string | null
          blocked_by: string | null
          blocked_reason: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          is_blocked: boolean | null
          last_login: string | null
          login_attempts: number | null
          metadata: Json | null
          name: string
          password_hash: string
          permissions: string[] | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          username: string
        }
        Insert: {
          blocked_at?: string | null
          blocked_by?: string | null
          blocked_reason?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          is_blocked?: boolean | null
          last_login?: string | null
          login_attempts?: number | null
          metadata?: Json | null
          name: string
          password_hash: string
          permissions?: string[] | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          username: string
        }
        Update: {
          blocked_at?: string | null
          blocked_by?: string | null
          blocked_reason?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          is_blocked?: boolean | null
          last_login?: string | null
          login_attempts?: number | null
          metadata?: Json | null
          name?: string
          password_hash?: string
          permissions?: string[] | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_2026_02_11_14_10_blocked_by_fkey"
            columns: ["blocked_by"]
            isOneToOne: false
            referencedRelation: "users_2026_02_11_14_10"
            referencedColumns: ["id"]
          },
        ]
      }
      users_2026_02_17_18_40: {
        Row: {
          blocked_reason: string | null
          branch_id: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          is_blocked: boolean | null
          last_login: string | null
          login_attempts: number | null
          metadata: Json | null
          name: string
          permissions: string[] | null
          role: string
          updated_at: string | null
          username: string
        }
        Insert: {
          blocked_reason?: string | null
          branch_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          is_blocked?: boolean | null
          last_login?: string | null
          login_attempts?: number | null
          metadata?: Json | null
          name: string
          permissions?: string[] | null
          role: string
          updated_at?: string | null
          username: string
        }
        Update: {
          blocked_reason?: string | null
          branch_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          is_blocked?: boolean | null
          last_login?: string | null
          login_attempts?: number | null
          metadata?: Json | null
          name?: string
          permissions?: string[] | null
          role?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_2026_02_17_18_40_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches_2026_02_17_18_40"
            referencedColumns: ["id"]
          },
        ]
      }
      users_2026_02_28_20_06: {
        Row: {
          app_role: string
          avatar_url: string | null
          branch_id: string | null
          created_at: string | null
          data_scope: string
          email: string
          id: string
          last_login: string | null
          name: string
          phone: string | null
          region_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          app_role: string
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string | null
          data_scope: string
          email: string
          id?: string
          last_login?: string | null
          name: string
          phone?: string | null
          region_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          app_role?: string
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string | null
          data_scope?: string
          email?: string
          id?: string
          last_login?: string | null
          name?: string
          phone?: string | null
          region_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_users_branch"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_users_region"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
        ]
      }
      users_enhanced: {
        Row: {
          auth_user_id: string | null
          department: string | null
          id: string
          is_active: boolean | null
          role: string | null
        }
        Insert: {
          auth_user_id?: string | null
          department?: string | null
          id?: string
          is_active?: boolean | null
          role?: string | null
        }
        Update: {
          auth_user_id?: string | null
          department?: string | null
          id?: string
          is_active?: boolean | null
          role?: string | null
        }
        Relationships: []
      }
      vehicle_tracking_2026_02_19_13_00: {
        Row: {
          accuracy: number | null
          altitude: number | null
          battery_level: number | null
          driver_id: string | null
          engine_status: string | null
          fuel_level: number | null
          heading: number | null
          id: string
          latitude: number | null
          longitude: number | null
          speed: number | null
          timestamp: string | null
          vehicle_id: string | null
        }
        Insert: {
          accuracy?: number | null
          altitude?: number | null
          battery_level?: number | null
          driver_id?: string | null
          engine_status?: string | null
          fuel_level?: number | null
          heading?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          speed?: number | null
          timestamp?: string | null
          vehicle_id?: string | null
        }
        Update: {
          accuracy?: number | null
          altitude?: number | null
          battery_level?: number | null
          driver_id?: string | null
          engine_status?: string | null
          fuel_level?: number | null
          heading?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          speed?: number | null
          timestamp?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_tracking_2026_02_19_13_00_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_tracking_2026_02_19_13_00_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          assigned_rider_id: string | null
          created_at: string
          current_location: Json | null
          fuel_level: number | null
          id: string
          last_service: string | null
          plate_number: string
          status: Database["public"]["Enums"]["vehicle_status"] | null
          type: string | null
          updated_at: string
        }
        Insert: {
          assigned_rider_id?: string | null
          created_at?: string
          current_location?: Json | null
          fuel_level?: number | null
          id?: string
          last_service?: string | null
          plate_number: string
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          assigned_rider_id?: string | null
          created_at?: string
          current_location?: Json | null
          fuel_level?: number | null
          id?: string
          last_service?: string | null
          plate_number?: string
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      vehicles_2026_02_18_17_00: {
        Row: {
          assigned_driver_id: string | null
          capacity_kg: number | null
          capacity_parcels: number | null
          created_at: string | null
          current_location: Json | null
          current_route_id: string | null
          fuel_level: number | null
          id: string
          last_service_date: string | null
          next_service_due: string | null
          plate_number: string
          status: string | null
          updated_at: string | null
          vehicle_code: string
          vehicle_type: string
        }
        Insert: {
          assigned_driver_id?: string | null
          capacity_kg?: number | null
          capacity_parcels?: number | null
          created_at?: string | null
          current_location?: Json | null
          current_route_id?: string | null
          fuel_level?: number | null
          id?: string
          last_service_date?: string | null
          next_service_due?: string | null
          plate_number: string
          status?: string | null
          updated_at?: string | null
          vehicle_code: string
          vehicle_type: string
        }
        Update: {
          assigned_driver_id?: string | null
          capacity_kg?: number | null
          capacity_parcels?: number | null
          created_at?: string | null
          current_location?: Json | null
          current_route_id?: string | null
          fuel_level?: number | null
          id?: string
          last_service_date?: string | null
          next_service_due?: string | null
          plate_number?: string
          status?: string | null
          updated_at?: string | null
          vehicle_code?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_2026_02_18_17_00_current_route_id_fkey"
            columns: ["current_route_id"]
            isOneToOne: false
            referencedRelation: "route_plans_2026_02_18_17_00"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles_2026_02_19_13_00: {
        Row: {
          capacity_volume: number | null
          capacity_weight: number | null
          created_at: string | null
          current_driver_id: string | null
          fuel_efficiency: number | null
          fuel_type: string | null
          home_branch_id: string | null
          id: string
          insurance_info: Json | null
          license_plate: string | null
          maintenance_schedule: Json | null
          make: string | null
          model: string | null
          odometer_reading: number | null
          status: string | null
          updated_at: string | null
          vehicle_number: string
          vehicle_type: string
          year: number | null
        }
        Insert: {
          capacity_volume?: number | null
          capacity_weight?: number | null
          created_at?: string | null
          current_driver_id?: string | null
          fuel_efficiency?: number | null
          fuel_type?: string | null
          home_branch_id?: string | null
          id?: string
          insurance_info?: Json | null
          license_plate?: string | null
          maintenance_schedule?: Json | null
          make?: string | null
          model?: string | null
          odometer_reading?: number | null
          status?: string | null
          updated_at?: string | null
          vehicle_number: string
          vehicle_type: string
          year?: number | null
        }
        Update: {
          capacity_volume?: number | null
          capacity_weight?: number | null
          created_at?: string | null
          current_driver_id?: string | null
          fuel_efficiency?: number | null
          fuel_type?: string | null
          home_branch_id?: string | null
          id?: string
          insurance_info?: Json | null
          license_plate?: string | null
          maintenance_schedule?: Json | null
          make?: string | null
          model?: string | null
          odometer_reading?: number | null
          status?: string | null
          updated_at?: string | null
          vehicle_number?: string
          vehicle_type?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_2026_02_19_13_00_current_driver_id_fkey"
            columns: ["current_driver_id"]
            isOneToOne: false
            referencedRelation: "profiles_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_2026_02_19_13_00_home_branch_id_fkey"
            columns: ["home_branch_id"]
            isOneToOne: false
            referencedRelation: "branches_2026_02_19_13_00"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles_2026_02_28_20_06: {
        Row: {
          assigned_driver_id: string | null
          branch_id: string | null
          capacity_volume: number | null
          capacity_weight: number | null
          created_at: string | null
          fuel_type: string | null
          id: string
          last_maintenance: string | null
          make: string | null
          model: string | null
          next_maintenance: string | null
          status: string | null
          updated_at: string | null
          vehicle_number: string
          vehicle_type: string
          year: number | null
        }
        Insert: {
          assigned_driver_id?: string | null
          branch_id?: string | null
          capacity_volume?: number | null
          capacity_weight?: number | null
          created_at?: string | null
          fuel_type?: string | null
          id?: string
          last_maintenance?: string | null
          make?: string | null
          model?: string | null
          next_maintenance?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_number: string
          vehicle_type: string
          year?: number | null
        }
        Update: {
          assigned_driver_id?: string | null
          branch_id?: string | null
          capacity_volume?: number | null
          capacity_weight?: number | null
          created_at?: string | null
          fuel_type?: string | null
          id?: string
          last_maintenance?: string | null
          make?: string | null
          model?: string | null
          next_maintenance?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_number?: string
          vehicle_type?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_2026_02_28_20_06_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_2026_02_28_20_06_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses_2026_02_28_20_06: {
        Row: {
          address: string
          available_capacity: number | null
          branch_id: string
          created_at: string | null
          id: string
          manager_id: string | null
          name: string
          operating_hours: Json | null
          security_level: string | null
          status: string | null
          temperature_controlled: boolean | null
          total_capacity: number
          updated_at: string | null
          used_capacity: number | null
          warehouse_code: string
        }
        Insert: {
          address: string
          available_capacity?: number | null
          branch_id: string
          created_at?: string | null
          id?: string
          manager_id?: string | null
          name: string
          operating_hours?: Json | null
          security_level?: string | null
          status?: string | null
          temperature_controlled?: boolean | null
          total_capacity: number
          updated_at?: string | null
          used_capacity?: number | null
          warehouse_code: string
        }
        Update: {
          address?: string
          available_capacity?: number | null
          branch_id?: string
          created_at?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          operating_hours?: Json | null
          security_level?: string | null
          status?: string | null
          temperature_controlled?: boolean | null
          total_capacity?: number
          updated_at?: string | null
          used_capacity?: number | null
          warehouse_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_2026_02_28_20_06_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouses_2026_02_28_20_06_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users_2026_02_28_20_06"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      app_identities: {
        Row: {
          auth_user_id: string | null
          customer_id: string | null
          email: string | null
          merchant_id: string | null
          primary_role: string | null
          user_enhanced_id: string | null
          user_id: string | null
        }
        Relationships: []
      }
      finance_cod_pending_v: {
        Row: {
          actual_delivery_time: string | null
          cod_amount: number | null
          cod_status: string | null
          deposit_id: string | null
          shipment_id: string | null
          way_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cod_collections_deposit_id_fkey"
            columns: ["deposit_id"]
            isOneToOne: false
            referencedRelation: "finance_deposits"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      authenticate_demo_user_2026_02_19_14_00: {
        Args: { p_email: string; p_password: string }
        Returns: {
          email: string
          full_name: string
          message: string
          role: string
          success: boolean
          user_id: string
        }[]
      }
      authenticate_user_2026_02_17_18_40: {
        Args: { user_email: string; user_password: string }
        Returns: Json
      }
      auto_assign_resources_2026_02_18_17_00: {
        Args: { p_parcel_ids: string[] }
        Returns: Json
      }
      auto_assign_shipment_2026_02_19_17_00: {
        Args: { p_shipment_data?: Json; p_shipment_id: string }
        Returns: Json
      }
      calculate_distance_km_2026_02_18_17_00: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      calculate_domestic_rate: {
        Args: {
          p_from_state: string
          p_service_type?: string
          p_to_state: string
          p_weight: number
        }
        Returns: Json
      }
      calculate_domestic_rate_2026_02_18_18_00: {
        Args: {
          p_cod_amount?: number
          p_declared_value?: number
          p_service_type: string
          p_township_id: string
          p_weight_kg: number
        }
        Returns: Json
      }
      can_access_branch: { Args: { p_branch: string }; Returns: boolean }
      can_access_hierarchy: {
        Args: { target_branch: string }
        Returns: boolean
      }
      can_access_record: {
        Args: { p_branch_id: string; p_created_by: string }
        Returns: boolean
      }
      change_user_password_2026_02_17_18_40: {
        Args: { new_password: string; user_id: string }
        Returns: Json
      }
      check_geofence_2026_02_18_18_00: {
        Args: { p_geofence_id: string; p_lat: number; p_lng: number }
        Returns: boolean
      }
      check_security_clearance: { Args: never; Returns: boolean }
      clear_must_change_password: { Args: never; Returns: undefined }
      create_managed_user: {
        Args: {
          user_email: string
          user_full_name: string
          user_password: string
          user_role: string
          user_scope?: string
        }
        Returns: string
      }
      create_notification: {
        Args: {
          p_category?: string
          p_message: string
          p_recipient_id: string
          p_reference_id?: string
          p_reference_type?: string
          p_title: string
          p_type?: string
        }
        Returns: string
      }
      create_shipment: {
        Args: {
          p_cod_amount: number
          p_contents_description: string
          p_customer_id: string
          p_declared_value: number
          p_dimensions: Json
          p_insurance_cost: number
          p_merchant_id: string
          p_package_type: string
          p_payment_method: string
          p_receiver_address: string
          p_receiver_city: string
          p_receiver_name: string
          p_receiver_phone: string
          p_receiver_state: string
          p_sender_address: string
          p_sender_city: string
          p_sender_name: string
          p_sender_phone: string
          p_sender_state: string
          p_service_type: string
          p_shipping_cost: number
          p_total_cost: number
          p_weight: number
        }
        Returns: string
      }
      create_shipment_portal: {
        Args: {
          p_item_price: number
          p_receiver_city: string
          p_receiver_name: string
          p_receiver_phone: string
        }
        Returns: {
          shipment_id: string
          way_id: string
        }[]
      }
      current_app_role: { Args: never; Returns: string }
      current_branch: { Args: never; Returns: string }
      current_role: { Args: never; Returns: string }
      current_user_id: { Args: never; Returns: string }
      current_user_role: { Args: never; Returns: string }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      debug_auth_2026_02_17_18_40: {
        Args: { user_email: string; user_password: string }
        Returns: Json
      }
      generate_awb_number: { Args: never; Returns: string }
      generate_customer_code: { Args: never; Returns: string }
      generate_merchant_code: { Args: never; Returns: string }
      generate_parcel_id_2026_02_18_17_00: {
        Args: { p_pickup_zone?: string }
        Returns: string
      }
      generate_qr_code_2026_02_18_17_00: {
        Args: {
          p_generated_by?: string
          p_qr_data: string
          p_qr_type?: string
          p_shipment_id?: string
        }
        Returns: string
      }
      generate_qr_code_advanced_2026_02_19_15_00: {
        Args: {
          p_data?: Json
          p_generated_by?: string
          p_qr_type: string
          p_reference_id: string
          p_reference_type: string
        }
        Returns: {
          message: string
          qr_code: string
          qr_id: string
          success: boolean
        }[]
      }
      generate_transaction_number: { Args: never; Returns: string }
      generate_waybill_id: {
        Args: { p_dst: string; p_org: string; p_tag?: string }
        Returns: string
      }
      get_assignment_queue_2026_02_19_17_00: {
        Args: {
          p_branch_id?: string
          p_limit?: number
          p_queue_type?: string
          p_user_id?: string
        }
        Returns: Json
      }
      get_dashboard_metrics: {
        Args: {
          p_branch_id?: string
          p_date_from?: string
          p_date_to?: string
          p_user_id?: string
        }
        Returns: Json
      }
      get_qr_stats_2026_02_18_17_00: {
        Args: { p_days?: number; p_user_id?: string }
        Returns: {
          most_scanned_data: string
          recent_activity: Json
          total_generated: number
          total_scanned: number
          unique_scanners: number
        }[]
      }
      get_shipment_workflow_2026_02_19_17_00: {
        Args: { p_shipment_id: string }
        Returns: Json
      }
      get_user_permissions: {
        Args: { user_role: string }
        Returns: {
          action: string
          domain: string
          permission_code: string
          resource: string
          scope: string
        }[]
      }
      handle_failed_login: { Args: { p_user_id: string }; Returns: undefined }
      has_permission:
        | { Args: { "": string }; Returns: boolean }
        | {
            Args: { permission_code: string; user_role: string }
            Returns: boolean
          }
      is_admin_user: { Args: never; Returns: boolean }
      is_app_owner: { Args: never; Returns: boolean }
      jwt_claims: { Args: never; Returns: Json }
      jwt_custom_claims: { Args: never; Returns: Json }
      log_audit_event: {
        Args: {
          p_action: string
          p_new_values?: Json
          p_old_values?: Json
          p_resource_id?: string
          p_resource_type: string
          p_user_id: string
        }
        Returns: string
      }
      log_qr_scan_2026_02_18_17_00: {
        Args: {
          p_device_info?: Json
          p_qr_data: string
          p_scan_location?: Json
          p_scanned_by: string
        }
        Returns: string
      }
      process_gps_update_2026_02_18_18_00: {
        Args: {
          p_accuracy?: number
          p_device_id: string
          p_heading?: number
          p_latitude: number
          p_longitude: number
          p_speed?: number
        }
        Returns: Json
      }
      record_cod_collection: {
        Args: {
          p_amount: number
          p_collected_by: string
          p_payment_method: string
          p_shipment_id: string
        }
        Returns: string
      }
      record_gps_location_2026_02_19_15_00: {
        Args: {
          p_accuracy?: number
          p_altitude?: number
          p_battery_level?: number
          p_device_id: string
          p_heading?: number
          p_latitude: number
          p_longitude: number
          p_metadata?: Json
          p_rider_id?: string
          p_shipment_id?: string
          p_speed?: number
          p_vehicle_id?: string
        }
        Returns: {
          location_id: string
          message: string
          success: boolean
        }[]
      }
      save_electronic_signature_2026_02_19_15_00: {
        Args: {
          p_metadata?: Json
          p_reference_id: string
          p_reference_type: string
          p_signature_data: string
          p_signature_type: string
          p_signed_by?: string
          p_signer_id_number?: string
          p_signer_name: string
          p_signer_phone?: string
        }
        Returns: {
          message: string
          signature_id: string
          success: boolean
        }[]
      }
      sc_enforce_state_machine: {
        Args: {
          p_event_type: string
          p_meta: Json
          p_segment: string
          p_shipment_id: string
        }
        Returns: undefined
      }
      scan_qr_code_2026_02_19_15_00: {
        Args: {
          p_qr_code: string
          p_scan_metadata?: Json
          p_scanned_by?: string
        }
        Returns: {
          message: string
          qr_data: Json
          reference_id: string
          reference_type: string
          success: boolean
        }[]
      }
      transition_shipment: {
        Args: { p_next_status: string; p_shipment_id: string }
        Returns: undefined
      }
      update_inventory: {
        Args: {
          p_inventory_id: string
          p_movement_type: string
          p_notes?: string
          p_performed_by: string
          p_quantity: number
          p_reference_id: string
          p_reference_type: string
        }
        Returns: boolean
      }
      update_shipment_status: {
        Args: {
          p_location: string
          p_notes?: string
          p_shipment_id: string
          p_status: string
          p_updated_by: string
        }
        Returns: boolean
      }
      update_shipment_workflow_2026_02_19_17_00: {
        Args: {
          p_new_state: string
          p_notes?: string
          p_shipment_id: string
          p_user_id?: string
        }
        Returns: Json
      }
      validate_password: { Args: { password: string }; Returns: boolean }
      validate_signature_2026_02_18_18_00: {
        Args: { p_signature_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role:
        | "APP_OWNER"
        | "SUPER_ADMIN"
        | "OPERATIONS_ADMIN"
        | "FINANCE_ADMIN"
        | "HR_ADMIN"
        | "SUPERVISOR"
        | "WAREHOUSE_MANAGER"
        | "SUBSTATION_MANAGER"
        | "MARKETING_ADMIN"
        | "CUSTOMER_SERVICE_ADMIN"
        | "FINANCE_USER"
        | "OPERATIONS_STAFF"
        | "CUSTOMER_SERVICE"
        | "MARKETING"
        | "RIDER"
        | "DRIVER"
        | "HELPER"
        | "DATA_ENTRY"
        | "STAFF"
        | "FINANCE_STAFF"
        | "MERCHANT"
        | "CUSTOMER"
        | "ADMIN"
        | "admin"
        | "MANAGER"
        | "CASHIER"
        | "SYS"
        | "HUB_MANAGER"
        | "DISPATCHER"
        | "GUEST"
        | "merchant"
        | "FINANCE_CASHIER"
        | "FINANCE_SENIOR"
        | "OPT_MGR"
      shipment_status:
        | "REGISTERED"
        | "PICKED_UP"
        | "IN_TRANSIT"
        | "ARRIVED_AT_STATION"
        | "OUT_FOR_DELIVERY"
        | "DELIVERED"
        | "FAILED"
        | "RESCHEDULED"
        | "pending_reg"
        | "registered"
      user_role:
        | "APP_OWNER"
        | "SUPER_ADMIN"
        | "FINANCE_ADMIN"
        | "OPERATIONS_ADMIN"
        | "MARKETING_ADMIN"
        | "CUSTOMER_SERVICE_ADMIN"
        | "RDR"
        | "DES"
        | "WH"
        | "SUP"
        | "SSM"
        | "SSR"
        | "MERCHANT"
        | "CUSTOMER"
        | "MARKETING"
        | "CUSTOMER_SERVICE"
        | "FINANCE_USER"
        | "ANALYST"
      vehicle_status: "ACTIVE" | "IN_USE" | "MAINTENANCE" | "OFFLINE" | "IDLE"
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
      app_role: [
        "APP_OWNER",
        "SUPER_ADMIN",
        "OPERATIONS_ADMIN",
        "FINANCE_ADMIN",
        "HR_ADMIN",
        "SUPERVISOR",
        "WAREHOUSE_MANAGER",
        "SUBSTATION_MANAGER",
        "MARKETING_ADMIN",
        "CUSTOMER_SERVICE_ADMIN",
        "FINANCE_USER",
        "OPERATIONS_STAFF",
        "CUSTOMER_SERVICE",
        "MARKETING",
        "RIDER",
        "DRIVER",
        "HELPER",
        "DATA_ENTRY",
        "STAFF",
        "FINANCE_STAFF",
        "MERCHANT",
        "CUSTOMER",
        "ADMIN",
        "admin",
        "MANAGER",
        "CASHIER",
        "SYS",
        "HUB_MANAGER",
        "DISPATCHER",
        "GUEST",
        "merchant",
        "FINANCE_CASHIER",
        "FINANCE_SENIOR",
        "OPT_MGR",
      ],
      shipment_status: [
        "REGISTERED",
        "PICKED_UP",
        "IN_TRANSIT",
        "ARRIVED_AT_STATION",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "FAILED",
        "RESCHEDULED",
        "pending_reg",
        "registered",
      ],
      user_role: [
        "APP_OWNER",
        "SUPER_ADMIN",
        "FINANCE_ADMIN",
        "OPERATIONS_ADMIN",
        "MARKETING_ADMIN",
        "CUSTOMER_SERVICE_ADMIN",
        "RDR",
        "DES",
        "WH",
        "SUP",
        "SSM",
        "SSR",
        "MERCHANT",
        "CUSTOMER",
        "MARKETING",
        "CUSTOMER_SERVICE",
        "FINANCE_USER",
        "ANALYST",
      ],
      vehicle_status: ["ACTIVE", "IN_USE", "MAINTENANCE", "OFFLINE", "IDLE"],
    },
  },
} as const
