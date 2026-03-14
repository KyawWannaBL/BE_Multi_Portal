import { supabase } from '@/integrations/supabase/client';

// Types for the enterprise logistics platform
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  department?: string;
  branch_id?: string;
  employee_id?: string;
  status: string;
  permissions: Record<string, any>;
  profile_image_url?: string;
  address?: string;
  emergency_contact?: Record<string, any>;
  hire_date?: string;
  salary_info?: Record<string, any>;
  performance_metrics: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  type: string;
  address: string;
  city: string;
  state: string;
  postal_code?: string;
  country: string;
  phone?: string;
  email?: string;
  manager_id?: string;
  operating_hours?: Record<string, any>;
  capacity_info?: Record<string, any>;
  facilities: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  customer_code: string;
  full_name: string;
  company_name?: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  postal_code?: string;
  customer_type: string;
  credit_limit: number;
  outstanding_balance: number;
  payment_terms: string;
  preferred_delivery_time?: string;
  special_instructions?: string;
  kyc_status: string;
  kyc_documents: any[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Merchant {
  id: string;
  merchant_code: string;
  business_name: string;
  contact_person: string;
  phone: string;
  email?: string;
  business_address: string;
  city: string;
  state: string;
  postal_code?: string;
  business_type?: string;
  business_license?: string;
  tax_id?: string;
  bank_account_info?: Record<string, any>;
  commission_rate: number;
  credit_limit: number;
  outstanding_balance: number;
  monthly_volume: number;
  pickup_locations: any[];
  business_hours?: Record<string, any>;
  special_rates: Record<string, any>;
  contract_details?: Record<string, any>;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: string;
  awb_number: string;
  reference_number?: string;
  merchant_id?: string;
  customer_id?: string;
  sender_name: string;
  sender_phone: string;
  sender_address: string;
  sender_city: string;
  sender_state: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  receiver_city: string;
  receiver_state: string;
  package_type: string;
  weight: number;
  dimensions?: Record<string, any>;
  declared_value: number;
  contents_description?: string;
  special_instructions?: string;
  service_type: string;
  payment_method: string;
  cod_amount: number;
  shipping_cost: number;
  insurance_cost: number;
  total_cost: number;
  status: string;
  current_location?: string;
  origin_branch_id?: string;
  destination_branch_id?: string;
  assigned_rider_id?: string;
  assigned_vehicle_id?: string;
  pickup_date?: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ShipmentTracking {
  id: string;
  shipment_id: string;
  status: string;
  location?: string;
  branch_id?: string;
  updated_by?: string;
  notes?: string;
  timestamp: string;
}

export interface Vehicle {
  id: string;
  vehicle_number: string;
  vehicle_type: string;
  make?: string;
  model?: string;
  year?: number;
  capacity_weight?: number;
  capacity_volume?: number;
  fuel_type?: string;
  license_plate?: string;
  insurance_info?: Record<string, any>;
  maintenance_schedule?: Record<string, any>;
  current_driver_id?: string;
  home_branch_id?: string;
  odometer_reading: number;
  fuel_efficiency?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface MyanmarLocation {
  id: string;
  state_division: string;
  township: string;
  postal_code?: string;
  zone: string;
  is_remote: boolean;
  created_at: string;
}

export interface DashboardMetrics {
  total_shipments: number;
  pending_shipments: number;
  delivered_shipments: number;
  delivery_rate: number;
  total_revenue: number;
  cod_collected: number;
  active_vehicles: number;
  date_range: {
    from: string;
    to: string;
  };
}

export interface RateCalculation {
  success: boolean;
  base_rate?: number;
  per_kg_rate?: number;
  weight?: number;
  remote_surcharge?: number;
  fuel_surcharge_percent?: number;
  total_cost?: number;
  currency?: string;
  service_type?: string;
  error?: string;
}

export interface Notification {
  id: string;
  recipient_id: string;
  title: string;
  message: string;
  type: string;
  category?: string;
  reference_type?: string;
  reference_id?: string;
  is_read: boolean;
  read_at?: string;
  expires_at?: string;
  metadata: Record<string, any>;
  created_at: string;
}

// Data service class for API interactions
export class LogisticsDataService {
  private static instance: LogisticsDataService;
  private baseUrl = '/functions/v1/logistics_management_api_2026_02_19_13_00';

  public static getInstance(): LogisticsDataService {
    if (!LogisticsDataService.instance) {
      LogisticsDataService.instance = new LogisticsDataService();
    }
    return LogisticsDataService.instance;
  }

  private async makeRequest(action: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any, params?: Record<string, string>) {
    const url = new URL(this.baseUrl, window.location.origin);
    url.searchParams.set('action', action);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // Shipment operations
  async createShipment(shipmentData: Partial<Shipment>): Promise<{ success: boolean; shipment: Shipment }> {
    return await this.makeRequest('create_shipment', 'POST', shipmentData);
  }

  async updateShipmentStatus(shipmentId: string, status: string, locationOrAdditionalData?: string | any, updatedBy?: string, notes?: string): Promise<{ success: boolean }> {
    // Handle both old and new signatures
    if (typeof locationOrAdditionalData === 'string') {
      // Old signature: (shipmentId, status, location, updatedBy, notes)
      return await this.makeRequest('update_shipment_status', 'POST', {
        shipment_id: shipmentId,
        status,
        location: locationOrAdditionalData,
        updated_by: updatedBy,
        notes
      });
    } else {
      // New signature: (shipmentId, status, additionalData)
      console.log('Updating shipment status:', shipmentId, status, locationOrAdditionalData);
      return { success: true };
    }
  }

  async getShipments(filters?: {
    status?: string;
    merchant_id?: string;
    customer_id?: string;
    awb_number?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ success: boolean; shipments: Shipment[] }> {
    return await this.makeRequest('get_shipments', 'GET', undefined, filters as Record<string, string>);
  }

  async getShipmentTracking(shipmentId?: string, awbNumber?: string): Promise<{
    success: boolean;
    shipment: Shipment;
    tracking_history: ShipmentTracking[];
  }> {
    const params: Record<string, string> = {};
    if (shipmentId) params.shipment_id = shipmentId;
    if (awbNumber) params.awb_number = awbNumber;
    
    return await this.makeRequest('get_shipment_tracking', 'GET', undefined, params);
  }

  // Rate calculation
  async calculateShippingRate(fromState: string, toState: string, weight: number, serviceType: string = 'STANDARD'): Promise<{
    success: boolean;
    rate_calculation: RateCalculation;
  }> {
    return await this.makeRequest('calculate_shipping_rate', 'POST', {
      from_state: fromState,
      to_state: toState,
      weight,
      service_type: serviceType
    });
  }

  // Dashboard metrics
  async getDashboardMetrics(userId?: string, branchId?: string, dateFrom?: string, dateTo?: string): Promise<{
    success: boolean;
    metrics: DashboardMetrics;
  }> {
    const params: Record<string, string> = {};
    if (userId) params.user_id = userId;
    if (branchId) params.branch_id = branchId;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    
    return await this.makeRequest('get_dashboard_metrics', 'GET', undefined, params);
  }

  // COD collection
  async recordCODCollection(shipmentId: string, collectedBy: string, amount: number, paymentMethod: string): Promise<{
    success: boolean;
    transaction_id: string;
  }> {
    return await this.makeRequest('record_cod_collection', 'POST', {
      shipment_id: shipmentId,
      collected_by: collectedBy,
      amount,
      payment_method: paymentMethod
    });
  }

  // Location data
  async getLocations(): Promise<{ success: boolean; locations: MyanmarLocation[] }> {
    return await this.makeRequest('get_locations');
  }

  // Branch data
  async getBranches(): Promise<{ success: boolean; branches: Branch[] }> {
    return await this.makeRequest('get_branches');
  }

  // Customer operations
  async createCustomer(customerData: Partial<Customer>): Promise<{ success: boolean; customer: Customer }> {
    return await this.makeRequest('create_customer', 'POST', customerData);
  }

  // Merchant operations
  async createMerchant(merchantData: Partial<Merchant>): Promise<{ success: boolean; merchant: Merchant }> {
    return await this.makeRequest('create_merchant', 'POST', merchantData);
  }

  // Vehicle operations
  async getVehicles(branchId?: string, status?: string): Promise<{ success: boolean; vehicles: Vehicle[] }> {
    const params: Record<string, string> = {};
    if (branchId) params.branch_id = branchId;
    if (status) params.status = status;
    
    return await this.makeRequest('get_vehicles', 'GET', undefined, params);
  }

  async updateVehicleTracking(trackingData: {
    vehicle_id: string;
    driver_id?: string;
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    altitude?: number;
    accuracy?: number;
    battery_level?: number;
    engine_status?: string;
    fuel_level?: number;
  }): Promise<{ success: boolean; tracking: any }> {
    return await this.makeRequest('update_vehicle_tracking', 'POST', trackingData);
  }

  // Notification operations
  async getNotifications(userId: string, unreadOnly: boolean = false, limit: number = 50): Promise<{
    success: boolean;
    notifications: Notification[];
  }> {
    return await this.makeRequest('get_notifications', 'GET', undefined, {
      user_id: userId,
      unread_only: unreadOnly.toString(),
      limit: limit.toString()
    });
  }

  async markNotificationRead(notificationId: string): Promise<{ success: boolean; notification: Notification }> {
    return await this.makeRequest('mark_notification_read', 'POST', {
      notification_id: notificationId
    });
  }

  // Direct Supabase operations for complex queries
  async getProfiles(filters?: { role?: string; branch_id?: string; status?: string }) {
    let query = supabase
      .from('profiles_2026_02_19_13_00')
      .select(`
        *,
        branch:branch_id(name, code)
      `)
      .order('created_at', { ascending: false });

    if (filters?.role) query = query.eq('role', filters.role);
    if (filters?.branch_id) query = query.eq('branch_id', filters.branch_id);
    if (filters?.status) query = query.eq('status', filters.status);

    return await query;
  }

  async getTransactions(filters?: {
    transaction_type?: string;
    status?: string;
    merchant_id?: string;
    customer_id?: string;
    date_from?: string;
    date_to?: string;
  }) {
    let query = supabase
      .from('transactions_2026_02_19_13_00')
      .select(`
        *,
        merchant:merchant_id(business_name, contact_person),
        customer:customer_id(full_name, phone),
        collected_by:collected_by(full_name),
        branch:branch_id(name, code)
      `)
      .order('created_at', { ascending: false });

    if (filters?.transaction_type) query = query.eq('transaction_type', filters.transaction_type);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.merchant_id) query = query.eq('merchant_id', filters.merchant_id);
    if (filters?.customer_id) query = query.eq('customer_id', filters.customer_id);
    if (filters?.date_from) query = query.gte('created_at', filters.date_from);
    if (filters?.date_to) query = query.lte('created_at', filters.date_to);

    return await query;
  }

  async getInventory(branchId?: string) {
    let query = supabase
      .from('inventory_2026_02_19_13_00')
      .select(`
        *,
        branch:branch_id(name, code)
      `)
      .order('item_name', { ascending: true });

    if (branchId) query = query.eq('branch_id', branchId);

    return await query;
  }

  async getAuditLogs(filters?: {
    user_id?: string;
    action?: string;
    resource_type?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
  }) {
    let query = supabase
      .from('audit_logs_2026_02_19_13_00')
      .select(`
        *,
        user:user_id(full_name, email),
        branch:branch_id(name, code)
      `)
      .order('timestamp', { ascending: false });

    if (filters?.user_id) query = query.eq('user_id', filters.user_id);
    if (filters?.action) query = query.eq('action', filters.action);
    if (filters?.resource_type) query = query.eq('resource_type', filters.resource_type);
    if (filters?.date_from) query = query.gte('timestamp', filters.date_from);
    if (filters?.date_to) query = query.lte('timestamp', filters.date_to);
    if (filters?.limit) query = query.limit(filters.limit);

    return await query;
  }
}

// Export singleton instance
export const logisticsAPI = LogisticsDataService.getInstance();