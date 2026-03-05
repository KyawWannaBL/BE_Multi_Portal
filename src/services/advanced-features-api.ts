import { supabase } from '@/integrations/supabase/client';

// Advanced Features API Service
class AdvancedFeaturesService {
  private baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/advanced_features_api_2026_02_19_15_00`;

  private async makeRequest(action: string, data: any = {}) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${this.baseUrl}?action=${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ action, ...data }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Advanced Features API Error (${action}):`, error);
      throw error;
    }
  }

  // QR Code Operations
  async generateQRCode(qrType: string, referenceId: string, referenceType: string, data: any = {}) {
    return this.makeRequest('generate_qr_code', {
      qr_type: qrType,
      reference_id: referenceId,
      reference_type: referenceType,
      data,
    });
  }

  async scanQRCode(qrCode: string, scannedBy?: string, metadata: any = {}) {
    return this.makeRequest('scan_qr_code', {
      qr_code: qrCode,
      scanned_by: scannedBy,
      scan_metadata: metadata,
    });
  }

  async getQRCodes(filters: any = {}) {
    return this.makeRequest('get_qr_codes', filters);
  }

  // GPS Tracking Operations
  async recordGPSLocation(locationData: {
    device_id: string;
    latitude: number;
    longitude: number;
    vehicle_id?: string;
    rider_id?: string;
    shipment_id?: string;
    altitude?: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
    battery_level?: number;
    metadata?: any;
  }) {
    return this.makeRequest('record_gps_location', locationData);
  }

  async getGPSTracking(filters: any = {}) {
    return this.makeRequest('get_gps_tracking', filters);
  }

  async getLiveLocations() {
    return this.makeRequest('get_live_locations');
  }

  // Electronic Signature Operations
  async saveSignature(signatureData: {
    signature_data: string;
    signature_type: string;
    reference_id: string;
    reference_type: string;
    signer_name: string;
    signer_id_number?: string;
    signer_phone?: string;
    signed_by?: string;
    metadata?: any;
  }) {
    return this.makeRequest('save_signature', signatureData);
  }

  async getSignatures(filters: any = {}) {
    return this.makeRequest('get_signatures', filters);
  }

  async verifySignature(signatureId: string, verificationStatus: string, verifiedBy?: string) {
    return this.makeRequest('verify_signature', {
      signature_id: signatureId,
      verification_status: verificationStatus,
      verified_by: verifiedBy,
    });
  }

  // Route Optimization Operations
  async optimizeRoute(routeData: {
    route_name: string;
    vehicle_id: string;
    rider_id?: string;
    start_location: any;
    waypoints?: any[];
    end_location?: any;
  }) {
    return this.makeRequest('optimize_route', routeData);
  }

  async getRoutes(filters: any = {}) {
    return this.makeRequest('get_routes', filters);
  }

  async updateRouteStatus(routeId: string, status: string, actualDuration?: number) {
    return this.makeRequest('update_route_status', {
      route_id: routeId,
      status,
      actual_duration: actualDuration,
    });
  }

  // Real-time Events
  async getRealtimeEvents(filters: any = {}) {
    return this.makeRequest('get_realtime_events', filters);
  }

  async createEvent(eventData: {
    event_type: string;
    event_category: string;
    reference_id?: string;
    reference_type?: string;
    user_id?: string;
    device_id?: string;
    event_data: any;
    severity?: string;
  }) {
    return this.makeRequest('create_event', eventData);
  }

  // Geofencing
  async checkGeofence(latitude: number, longitude: number, deviceId?: string) {
    return this.makeRequest('check_geofence', {
      latitude,
      longitude,
      device_id: deviceId,
    });
  }

  async getGeofences(filters: any = {}) {
    return this.makeRequest('get_geofences', filters);
  }

  // Additional methods for comprehensive feature support
  async processScan(scanData: any) {
    return this.makeRequest('process_scan', scanData);
  }

  async updateQRStatus(qrId: string, status: string) {
    return this.makeRequest('update_qr_status', { qr_id: qrId, status });
  }

  async getScanHistory(filters: any = {}) {
    return this.makeRequest('get_scan_history', filters);
  }

  async getGPSDevices(filters: any = {}) {
    return this.makeRequest('get_gps_devices', filters);
  }

  async updateGPSLocation(deviceId: string, location: any) {
    return this.makeRequest('update_gps_location', { device_id: deviceId, ...location });
  }

  async createGeofence(geofenceData: any) {
    return this.makeRequest('create_geofence', geofenceData);
  }

  async getGeofenceAlerts(filters: any = {}) {
    return this.makeRequest('get_geofence_alerts', filters);
  }

  async acknowledgeAlert(alertId: string, userId: string) {
    return this.makeRequest('acknowledge_alert', { alert_id: alertId, user_id: userId });
  }



  async getSignatureTemplates(filters: any = {}) {
    return this.makeRequest('get_signature_templates', filters);
  }

  async getOptimizedRoutes(filters: any = {}) {
    return this.makeRequest('get_optimized_routes', filters);
  }

  async createRoute(routeData: any) {
    return this.makeRequest('create_route', routeData);
  }

  async startRoute(routeId: string) {
    return this.makeRequest('start_route', { route_id: routeId });
  }

  async completeRoute(routeId: string) {
    return this.makeRequest('complete_route', { route_id: routeId });
  }

  async getVehicleProfiles(filters: any = {}) {
    return this.makeRequest('get_vehicle_profiles', filters);
  }
}

// Export singleton instance
export const advancedFeaturesAPI = new AdvancedFeaturesService();

// Type definitions for advanced features
export interface QRCodeData {
  id: string;
  qr_code: string;
  qr_type: 'SHIPMENT' | 'PARCEL' | 'VEHICLE' | 'RIDER' | 'WAREHOUSE';
  reference_id: string;
  reference_type: string;
  data: any;
  status: 'ACTIVE' | 'SCANNED' | 'EXPIRED' | 'INVALID';
  generated_by?: string;
  scanned_by?: string;
  scanned_at?: string;
  scan_count: number;
  created_at: string;
}

export interface GPSLocation {
  id: string;
  device_id: string;
  vehicle_id?: string;
  rider_id?: string;
  shipment_id?: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  battery_level?: number;
  signal_strength?: number;
  address?: string;
  recorded_at: string;
}

export interface ElectronicSignature {
  id: string;
  signature_data: string;
  signature_type: 'PICKUP' | 'DELIVERY' | 'RECEIPT' | 'AUTHORIZATION';
  reference_id: string;
  reference_type: string;
  signer_name: string;
  signer_id_number?: string;
  signer_phone?: string;
  signed_by?: string;
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verified_by?: string;
  verified_at?: string;
  created_at: string;
}

export interface RouteOptimization {
  id: string;
  route_name: string;
  vehicle_id?: string;
  rider_id?: string;
  start_location: any;
  end_location?: any;
  waypoints: any[];
  optimized_sequence: any[];
  total_distance?: number;
  estimated_duration?: number;
  actual_duration?: number;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

export interface RealtimeEvent {
  id: string;
  event_type: string;
  event_category: 'GPS' | 'QR_SCAN' | 'SIGNATURE' | 'ROUTE' | 'ALERT' | 'SYSTEM';
  reference_id?: string;
  reference_type?: string;
  user_id?: string;
  device_id?: string;
  event_data: any;
  severity: 'LOW' | 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL';
  is_processed: boolean;
  created_at: string;
}

export interface Geofence {
  id: string;
  name: string;
  description?: string;
  fence_type: 'CIRCULAR' | 'POLYGON' | 'RECTANGLE';
  coordinates: any;
  radius?: number;
  branch_id?: string;
  is_active: boolean;
  alert_on_enter: boolean;
  alert_on_exit: boolean;
  created_at: string;
}