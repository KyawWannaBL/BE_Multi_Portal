import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function useEnterpriseShipments() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShipments = async () => {
    setLoading(true);
    // Fetching from the standard 'orders' or 'shipments' table
    const { data, error } = await supabase
      .from('orders') 
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (data) setShipments(data);
    else if (error) console.error("Error fetching shipments:", error.message);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  return { shipments, loading, refetch: fetchShipments };
}
