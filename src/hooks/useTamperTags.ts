import { useState, useCallback, useMemo } from 'react';
import {
  TamperTag,
  TAG_STATUS,
  TagStatus,
  User
} from '@/lib/index';

interface TagBatchReconciliation {
  issued: number;
  used: number;
  voided: number;
  remaining: number;
  mismatch: boolean;
}

export const useTamperTags = () => {
  const [tags, setTags] = useState<TamperTag[]>([]);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);

  const issueBatch = useCallback((riderId: string, fromId: number, toId: number) => {
    const batchId = `BATCH-${Date.now()}`;
    const newTags: TamperTag[] = [];
    
    for (let i = fromId; i <= toId; i++) {
      const tagId = `TT-${i.toString().padStart(6, '0')}`;
      newTags.push({
        id: tagId,
        status: TAG_STATUS.ISSUED_TO_RIDER,
        batchId: batchId,
        issuedTo: riderId,
        issueDate: new Date().toISOString(),
      });
    }

    setTags(prev => [...prev, ...newTags]);
    setActiveBatchId(batchId);
    return batchId;
  }, []);

  const useTag = useCallback((tagId: string) => {
    setTags(prev => 
      prev.map(tag => 
        tag.id === tagId 
          ? { ...tag, status: TAG_STATUS.USED } 
          : tag
      )
    );
  }, []);

  const voidTag = useCallback((tagId: string, reason: string, photo?: string) => {
    setTags(prev => 
      prev.map(tag => 
        tag.id === tagId 
          ? { ...tag, status: TAG_STATUS.VOID, voidReason: reason, voidPhoto: photo } 
          : tag
      )
    );
  }, []);

  const markLost = useCallback((tagRange: string[]) => {
    setTags(prev => 
      prev.map(tag => 
        tagRange.includes(tag.id) 
          ? { ...tag, status: TAG_STATUS.LOST_SUSPECT } 
          : tag
      )
    );
  }, []);

  const getRiderTags = useCallback((riderId: string) => {
    return tags.filter(tag => tag.issuedTo === riderId);
  }, [tags]);

  const getReconciliation = useCallback((riderId: string, physicalCount: number): TagBatchReconciliation => {
    const riderTags = tags.filter(tag => tag.issuedTo === riderId);
    const issued = riderTags.length;
    const used = riderTags.filter(t => t.status === TAG_STATUS.USED).length;
    const voided = riderTags.filter(t => t.status === TAG_STATUS.VOID).length;
    const remaining = issued - used - voided;
    
    return {
      issued,
      used,
      voided,
      remaining,
      mismatch: remaining !== physicalCount
    };
  }, [tags]);

  const validateTagForPickup = useCallback((tagId: string, rider: User | null) => {
    const tag = tags.find(t => t.id === tagId);
    if (!tag) return { valid: false, error: 'Tag not found in system' };
    if (tag.status !== TAG_STATUS.ISSUED_TO_RIDER) return { valid: false, error: `Tag is ${tag.status}` };
    if (rider && tag.issuedTo !== rider.id) return { valid: false, error: 'Tag issued to a different rider' };
    return { valid: true };
  }, [tags]);

  const activeBatchTags = useMemo(() => {
    if (!activeBatchId) return [];
    return tags.filter(t => t.batchId === activeBatchId);
  }, [tags, activeBatchId]);

  return {
    tags,
    activeBatchId,
    activeBatchTags,
    issueBatch,
    useTag,
    voidTag,
    markLost,
    getRiderTags,
    getReconciliation,
    validateTagForPickup,
    setActiveBatchId
  };
};