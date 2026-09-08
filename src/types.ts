export interface DiscrepancyItem {
  id: string;
  plant: string;
  sloc: string;
  materialType: string;
  material: string;
  lotNo: string;
  unit: string;
  
  // Block 1: Basic Qty Comparison
  wmsStrategy?: string;
  wmsOrderNo?: string;
  wmsQty: number;
  erpStrategy?: string;
  erpOrderNo?: string;
  erpQty: number;
  diffQty: number;

  // Block 2: Stock Status (Optional detailed data)
  wmsQuality?: number;
  wmsUnrestricted?: number;
  wmsBlocked?: number;
  wmsTransit?: number;
  erpQuality?: number;
  erpUnrestricted?: number;
  erpBlocked?: number;
  erpTransit?: number;

  // Analysis result
  autoAnalysis?: {
    cause: 'TRANSIT_STOCK' | 'STATUS_MISMATCH' | 'SLOC_MISMATCH' | 'QTY_MISMATCH' | 'NOT_IN_WMS' | 'NOT_IN_ERP';
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    details?: string;
    relatedTransitIds?: string[];
  };

  // User Action state
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED';
  assignee?: string;
  comment?: string;
  updatedAt?: string;
}

export interface TransitStockItem {
  id: string;
  outPlant: string;
  outSloc: string;
  inPlant: string;
  inSloc: string;
  materialType: string;
  material: string;
  materialDesc: string;
  baseMaterial: string;
  lotNo: string;
  packageNo: string;
  unit: string;
  qty: number;
  status: string; // e.g. "출하완료", "이송중"
}

export interface StorageLocationItem {
  id: string;
  plant: string;
  materialType: string;
  material: string;
  lotNo: string;
  unit: string;
  wmsSloc: string;
  wmsQty: number;
  erpSloc: string;
  erpQty: number;
  diffQty: number;
}

export interface DailyInventoryReport {
  date: string; // YYYY-MM-DD
  discrepancies: DiscrepancyItem[];
  transitStock: TransitStockItem[];
  slocDiscrepancies: StorageLocationItem[];
  lastUpdated: string;
  note?: string;
}

export interface SavedReason {
  id: string;
  plant: string;
  sloc: string;
  material: string;
  lotNo: string;
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED';
  comment: string;
  assignee: string;
  savedAt: string;
}

