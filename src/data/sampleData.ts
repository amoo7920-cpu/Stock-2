import { DailyInventoryReport, DiscrepancyItem, TransitStockItem, StorageLocationItem } from '../types';

// Let's create the parsed sample data for 2026-09-08 based on the user's uploaded files
export const sampleTransitStock: TransitStockItem[] = [
  // BN740-G1 Lot D26I0508 (Total 4,700)
  { id: 'T1-1', outPlant: '3000', outSloc: '2400', inPlant: '3000', inSloc: '4400', materialType: 'FERT', material: 'BN740-G1', materialDesc: 'CRYSTALUX BN740 BEAD G/B 25', baseMaterial: 'BN740', lotNo: 'D26I0508', packageNo: 'D26I0508-01', unit: 'KG', qty: 1000, status: '이송중' },
  { id: 'T1-2', outPlant: '3000', outSloc: '2400', inPlant: '3000', inSloc: '4400', materialType: 'FERT', material: 'BN740-G1', materialDesc: 'CRYSTALUX BN740 BEAD G/B 25', baseMaterial: 'BN740', lotNo: 'D26I0508', packageNo: 'D26I0508-02', unit: 'KG', qty: 1000, status: '이송중' },
  { id: 'T1-3', outPlant: '3000', outSloc: '2400', inPlant: '3000', inSloc: '4400', materialType: 'FERT', material: 'BN740-G1', materialDesc: 'CRYSTALUX BN740 BEAD G/B 25', baseMaterial: 'BN740', lotNo: 'D26I0508', packageNo: 'D26I0508-03', unit: 'KG', qty: 1000, status: '이송중' },
  { id: 'T1-4', outPlant: '3000', outSloc: '2400', inPlant: '3000', inSloc: '4400', materialType: 'FERT', material: 'BN740-G1', materialDesc: 'CRYSTALUX BN740 BEAD G/B 25', baseMaterial: 'BN740', lotNo: 'D26I0508', packageNo: 'D26I0508-04', unit: 'KG', qty: 1000, status: '이송중' },
  { id: 'T1-5', outPlant: '3000', outSloc: '2400', inPlant: '3000', inSloc: '4400', materialType: 'FERT', material: 'BN740-G1', materialDesc: 'CRYSTALUX BN740 BEAD G/B 25', baseMaterial: 'BN740', lotNo: 'D26I0508', packageNo: 'D26I0508-05', unit: 'KG', qty: 700, status: '이송중' },

  // HI880-E1 Lot C26I0601 (Total 8,000)
  { id: 'T2-1', outPlant: '3000', outSloc: '2400', inPlant: '3000', inSloc: '4400', materialType: 'FERT', material: 'HI880-E1', materialDesc: 'CRYSTALUX HI880 NP E/B 25', baseMaterial: 'HI880', lotNo: 'C26I0601', packageNo: 'C26I0601-01', unit: 'KG', qty: 1000, status: '이송중' },
  { id: 'T2-2', outPlant: '3000', outSloc: '2400', inPlant: '3000', inSloc: '4400', materialType: 'FERT', material: 'HI880-E1', materialDesc: 'CRYSTALUX HI880 NP E/B 25', baseMaterial: 'HI880', lotNo: 'C26I0601', packageNo: 'C26I0601-02', unit: 'KG', qty: 1000, status: '이송중' },
  { id: 'T2-3', outPlant: '3000', outSloc: '2400', inPlant: '3000', inSloc: '4400', materialType: 'FERT', material: 'HI880-E1', materialDesc: 'CRYSTALUX HI880 NP E/B 25', baseMaterial: 'HI880', lotNo: 'C26I0601', packageNo: 'C26I0601-03', unit: 'KG', qty: 1000, status: '이송중' },
  { id: 'T2-4', outPlant: '3000', outSloc: '2400', inPlant: '3000', inSloc: '4400', materialType: 'FERT', material: 'HI880-E1', materialDesc: 'CRYSTALUX HI880 NP E/B 25', baseMaterial: 'HI880', lotNo: 'C26I0601', packageNo: 'C26I0601-04', unit: 'KG', qty: 1000, status: '이송중' },
  { id: 'T2-5', outPlant: '3000', outSloc: '2400', inPlant: '3000', inSloc: '4400', materialType: 'FERT', material: 'HI880-E1', materialDesc: 'CRYSTALUX HI880 NP E/B 25', baseMaterial: 'HI880', lotNo: 'C26I0601', packageNo: 'C26I0601-05', unit: 'KG', qty: 1000, status: '이송중' },
  { id: 'T2-6', outPlant: '3000', outSloc: '2400', inPlant: '3000', inSloc: '4400', materialType: 'FERT', material: 'HI880-E1', materialDesc: 'CRYSTALUX HI880 NP E/B 25', baseMaterial: 'HI880', lotNo: 'C26I0601', packageNo: 'C26I0601-06', unit: 'KG', qty: 1000, status: '이송중' },
  { id: 'T2-7', outPlant: '3000', outSloc: '2400', inPlant: '3000', inSloc: '4400', materialType: 'FERT', material: 'HI880-E1', materialDesc: 'CRYSTALUX HI880 NP E/B 25', baseMaterial: 'HI880', lotNo: 'C26I0601', packageNo: 'C26I0601-07', unit: 'KG', qty: 1000, status: '이송중' },
  { id: 'T2-8', outPlant: '3000', outSloc: '2400', inPlant: '3000', inSloc: '4400', materialType: 'FERT', material: 'HI880-E1', materialDesc: 'CRYSTALUX HI880 NP E/B 25', baseMaterial: 'HI880', lotNo: 'C26I0601', packageNo: 'C26I0601-08', unit: 'KG', qty: 1000, status: '이송중' },

  // HI880-E1 Lot C26I0603 (Total 8,000)
  { id: 'T3-1', outPlant: '3000', outSloc: '2400', inPlant: '3000', inSloc: '4400', materialType: 'FERT', material: 'HI880-E1', materialDesc: 'CRYSTALUX HI880 NP E/B 25', baseMaterial: 'HI880', lotNo: 'C26I0603', packageNo: 'C26I0603-01', unit: 'KG', qty: 1000, status: '이송중' },
  { id: 'T3-2', outPlant: '3000', outSloc: '2400', inPlant: '3000', inSloc: '4400', materialType: 'FERT', material: 'HI880-E1', materialDesc: 'CRYSTALUX HI880 NP E/B 25', baseMaterial: 'HI880', lotNo: 'C26I0603', packageNo: 'C26I0603-02', unit: 'KG', qty: 1000, status: '이송중' },
  { id: 'T3-3', outPlant: '3000', outSloc: '2400', inPlant: '3000', inSloc: '4400', materialType: 'FERT', material: 'HI880-E1', materialDesc: 'CRYSTALUX HI880 NP E/B 25', baseMaterial: 'HI880', lotNo: 'C26I0603', packageNo: 'C26I0603-03', unit: 'KG', qty: 1000, status: '이송중' },
  { id: 'T3-4', outPlant: '3000', outSloc: '2400', inPlant: '3000', inSloc: '4400', materialType: 'FERT', material: 'HI880-E1', materialDesc: 'CRYSTALUX HI880 NP E/B 25', baseMaterial: 'HI880', lotNo: 'C26I0603', packageNo: 'C26I0603-04', unit: 'KG', qty: 1000, status: '이송중' },

  // IH830B-G1 Lot D26I0505 (Total 1,000)
  { id: 'T4-1', outPlant: '3000', outSloc: '2400', inPlant: '3000', inSloc: '4400', materialType: 'FERT', material: 'IH830B-G1', materialDesc: 'CRYSTALUX IH830B BEAD G/B 25', baseMaterial: 'IH830', lotNo: 'D26I0505', packageNo: 'D26I0505-01', unit: 'KG', qty: 1000, status: '이송중' }
];

export const sampleDiscrepancies: DiscrepancyItem[] = [
  // BN740-G1 Lot D26I0508 (ERP: 4,700, WMS: 0, Diff: -4,700) -> Due to Transit Stock
  {
    id: 'D-1',
    plant: '3000',
    sloc: '2400',
    materialType: 'FERT',
    material: 'BN740-G1',
    lotNo: 'D26I0508',
    unit: 'KG',
    wmsStrategy: 'MTS',
    wmsQty: 0,
    erpStrategy: 'MTS',
    erpQty: 4700,
    diffQty: -4700,
    wmsQuality: 0, wmsUnrestricted: 0, wmsBlocked: 0, wmsTransit: 0,
    erpQuality: 0, erpUnrestricted: 4700, erpBlocked: 0, erpTransit: 0,
    status: 'PENDING',
    comment: '이송 대기 중인 것으로 보임. 출하 완료 내역 확인 필요.'
  },
  // HI880-E1 Lot C26I0601 (ERP: 8,000, WMS: 0, Diff: -8,000) -> Due to Transit Stock
  {
    id: 'D-2',
    plant: '3000',
    sloc: '2400',
    materialType: 'FERT',
    material: 'HI880-E1',
    lotNo: 'C26I0601',
    unit: 'KG',
    wmsStrategy: 'MTS',
    wmsQty: 0,
    erpStrategy: 'MTS',
    erpQty: 8000,
    diffQty: -8000,
    wmsQuality: 0, wmsUnrestricted: 0, wmsBlocked: 0, wmsTransit: 0,
    erpQuality: 8000, erpUnrestricted: 0, erpBlocked: 0, erpTransit: 0,
    status: 'PENDING'
  },
  // HI880-E1 Lot C26I0603 (ERP: 8,000, WMS: 0, Diff: -8,000) -> Due to Transit Stock
  {
    id: 'D-3',
    plant: '3000',
    sloc: '2400',
    materialType: 'FERT',
    material: 'HI880-E1',
    lotNo: 'C26I0603',
    unit: 'KG',
    wmsStrategy: 'MTS',
    wmsQty: 0,
    erpStrategy: 'MTS',
    erpQty: 8000,
    diffQty: -8000,
    wmsQuality: 0, wmsUnrestricted: 0, wmsBlocked: 0, wmsTransit: 0,
    erpQuality: 8000, erpUnrestricted: 0, erpBlocked: 0, erpTransit: 0,
    status: 'PENDING'
  },
  // IH830B-G1 Lot D26I0505 (ERP: 1,000, WMS: 0, Diff: -1,000) -> Due to Transit Stock
  {
    id: 'D-4',
    plant: '3000',
    sloc: '2400',
    materialType: 'FERT',
    material: 'IH830B-G1',
    lotNo: 'D26I0505',
    unit: 'KG',
    wmsStrategy: 'MTO',
    wmsOrderNo: '2000002349',
    wmsQty: 0,
    erpStrategy: 'MTO',
    erpOrderNo: '2000002349',
    erpQty: 1000,
    diffQty: -1000,
    wmsQuality: 0, wmsUnrestricted: 0, wmsBlocked: 0, wmsTransit: 0,
    erpQuality: 0, erpUnrestricted: 1000, erpBlocked: 0, erpTransit: 0,
    status: 'PENDING'
  },
  // IH830HL-F5 Lot B26I0702 (ERP: 8,000, WMS: 0, Diff: -8,000) -> Blocked Stock in ERP, missing in WMS
  {
    id: 'D-5',
    plant: '3000',
    sloc: '2400',
    materialType: 'FERT',
    material: 'IH830HL-F5',
    lotNo: 'B26I0702',
    unit: 'KG',
    wmsStrategy: 'MTS',
    wmsQty: 0,
    erpStrategy: 'MTS',
    erpQty: 8000,
    diffQty: -8000,
    wmsQuality: 0, wmsUnrestricted: 0, wmsBlocked: 0, wmsTransit: 0,
    erpQuality: 8000, erpUnrestricted: 0, erpBlocked: 0, erpTransit: 0,
    status: 'PENDING'
  },
  // IH830HLB-F5 (ERP: 8,000 * 4 + 7,200, WMS: 0) -> Missing in WMS entirely
  {
    id: 'D-6',
    plant: '3000',
    sloc: '2400',
    materialType: 'FERT',
    material: 'IH830HLB-F5',
    lotNo: 'D26I0701',
    unit: 'KG',
    wmsStrategy: 'MTS',
    wmsQty: 0,
    erpStrategy: 'MTS',
    erpQty: 8000,
    diffQty: -8000,
    status: 'PENDING'
  },
  {
    id: 'D-7',
    plant: '3000',
    sloc: '2400',
    materialType: 'FERT',
    material: 'IH830HLB-F5',
    lotNo: 'D26I0702',
    unit: 'KG',
    wmsStrategy: 'MTS',
    wmsQty: 0,
    erpStrategy: 'MTS',
    erpQty: 8000,
    diffQty: -8000,
    status: 'PENDING'
  },
  {
    id: 'D-8',
    plant: '3000',
    sloc: '2400',
    materialType: 'FERT',
    material: 'IH830HLB-F5',
    lotNo: 'D26I0703',
    unit: 'KG',
    wmsStrategy: 'MTS',
    wmsQty: 0,
    erpStrategy: 'MTS',
    erpQty: 8000,
    diffQty: -8000,
    status: 'PENDING'
  },
  {
    id: 'D-9',
    plant: '3000',
    sloc: '2400',
    materialType: 'FERT',
    material: 'IH830HLB-F5',
    lotNo: 'D26I0704',
    unit: 'KG',
    wmsStrategy: 'MTS',
    wmsQty: 0,
    erpStrategy: 'MTS',
    erpQty: 8000,
    diffQty: -8000,
    status: 'PENDING'
  },
  {
    id: 'D-10',
    plant: '3000',
    sloc: '2400',
    materialType: 'FERT',
    material: 'IH830HLB-F5',
    lotNo: 'D26I0705',
    unit: 'KG',
    wmsStrategy: 'MTS',
    wmsQty: 0,
    erpStrategy: 'MTS',
    erpQty: 7200,
    diffQty: -7200,
    status: 'PENDING'
  },
  // VR1B-F1 Lot D26I0102 (WMS: 11,450, ERP: 14,590, Diff: -3,140) -> Stock Status discrepancy (Blocked vs Blocked)
  {
    id: 'D-11',
    plant: '3000',
    sloc: '2400',
    materialType: 'FERT',
    material: 'VR1B-F1',
    lotNo: 'D26I0102',
    unit: 'KG',
    wmsStrategy: 'MTS',
    wmsQty: 11450,
    erpStrategy: 'MTS',
    erpQty: 14590,
    diffQty: -3140,
    wmsQuality: 0, wmsUnrestricted: 0, wmsBlocked: 13210, wmsTransit: 0,
    erpQuality: 0, erpUnrestricted: 0, erpBlocked: 16350, erpTransit: 0,
    status: 'PENDING'
  },
  // AR700U-F1-T (WMS has stock, ERP has none!) -> Storage Location mismatch or missing ERP record
  {
    id: 'D-12',
    plant: '3000',
    sloc: '2900',
    materialType: 'FERT',
    material: 'AR700U-F1-T',
    lotNo: 'W25D2803',
    unit: 'KG',
    wmsStrategy: 'MTS',
    wmsQty: 500,
    erpStrategy: 'MTS',
    erpQty: 0,
    diffQty: 500,
    wmsQuality: 0, wmsUnrestricted: 500, wmsBlocked: 0, wmsTransit: 0,
    erpQuality: 0, erpUnrestricted: 0, erpBlocked: 0, erpTransit: 0,
    status: 'PENDING'
  },
  {
    id: 'D-13',
    plant: '3000',
    sloc: '2900',
    materialType: 'FERT',
    material: 'AR700U-F1-T',
    lotNo: 'W25E1902',
    unit: 'KG',
    wmsStrategy: 'MTS',
    wmsQty: 1150,
    erpStrategy: 'MTS',
    erpQty: 0,
    diffQty: 1150,
    status: 'PENDING'
  },
  {
    id: 'D-14',
    plant: '3000',
    sloc: '2900',
    materialType: 'FERT',
    material: 'AR700U-F1-T',
    lotNo: 'W25E2302',
    unit: 'KG',
    wmsStrategy: 'MTS',
    wmsQty: 200,
    erpStrategy: 'MTS',
    erpQty: 0,
    diffQty: 200,
    status: 'PENDING'
  },
  // IH830-9678-F4LW Lot W26A1401 (WMS: 750, ERP: 0) -> Missing ERP entry in SLoc 2900
  {
    id: 'D-15',
    plant: '3000',
    sloc: '2900',
    materialType: 'FERT',
    material: 'IH830-9678-F4LW',
    lotNo: 'W26A1401',
    unit: 'KG',
    wmsStrategy: 'MTS',
    wmsQty: 750,
    erpStrategy: 'MTS',
    erpQty: 0,
    diffQty: 750,
    status: 'PENDING'
  },
  // HI535-F5 Lot X26F3001 (WMS: 2,400, ERP: 3,200, Diff: -800) -> SLoc mismatch/quantity diff
  {
    id: 'D-16',
    plant: '3000',
    sloc: '3403',
    materialType: 'FERT',
    material: 'HI535-F5',
    lotNo: 'X26F3001',
    unit: 'KG',
    wmsStrategy: 'MTS',
    wmsQty: 2400,
    erpStrategy: 'MTS',
    erpQty: 3200,
    diffQty: -800,
    wmsQuality: 0, wmsUnrestricted: 2400, wmsBlocked: 0, wmsTransit: 0,
    erpQuality: 0, erpUnrestricted: 3200, erpBlocked: 0, erpTransit: 0,
    status: 'PENDING'
  },
  // HP202-E1 (ERP: 25, WMS: 0)
  {
    id: 'D-17',
    plant: '4000',
    sloc: '4400',
    materialType: 'FERT',
    material: 'HP202-E1',
    lotNo: '26E28AE4',
    unit: 'KG',
    wmsStrategy: 'MTS',
    wmsQty: 0,
    erpStrategy: 'MTS',
    erpQty: 25,
    diffQty: -25,
    status: 'PENDING'
  },
  // IF850E-E1L (ERP: 25, WMS: 0)
  {
    id: 'D-18',
    plant: '4000',
    sloc: '4400',
    materialType: 'FERT',
    material: 'IF850E-E1L',
    lotNo: '26F17AE1',
    unit: 'KG',
    wmsStrategy: 'MTS',
    wmsQty: 0,
    erpStrategy: 'MTS',
    erpQty: 25,
    diffQty: -25,
    status: 'PENDING'
  },
  // IH830-9678-A1L (WMS: 7,000 and 1,000, ERP: 0) -> WMS has MTO stock registered, ERP has 0 in this SLOC
  {
    id: 'D-19',
    plant: '4500',
    sloc: '3404',
    materialType: 'FERT',
    material: 'IH830-9678-A1L',
    lotNo: 'J26I0801',
    unit: 'KG',
    wmsStrategy: 'MTO',
    wmsOrderNo: '2000002431',
    wmsQty: 7000,
    erpStrategy: 'MTO',
    erpOrderNo: '2000002431',
    erpQty: 0,
    diffQty: 7000,
    status: 'PENDING'
  },
  {
    id: 'D-20',
    plant: '4500',
    sloc: '3404',
    materialType: 'FERT',
    material: 'IH830-9678-A1L',
    lotNo: 'J26I0801',
    unit: 'KG',
    wmsStrategy: 'MTO',
    wmsOrderNo: '2000002481',
    wmsQty: 1000,
    erpStrategy: 'MTO',
    erpOrderNo: '2000002481',
    erpQty: 0,
    diffQty: 1000,
    status: 'PENDING'
  },
  // IH830-9678-F4LW
  {
    id: 'D-21',
    plant: '4500',
    sloc: '3404',
    materialType: 'FERT',
    material: 'IH830-9678-F4LW',
    lotNo: 'J26I0304',
    unit: 'KG',
    wmsStrategy: 'MTS',
    wmsQty: 7500,
    erpStrategy: 'MTS',
    erpQty: 0,
    diffQty: 7500,
    status: 'PENDING'
  },
  {
    id: 'D-22',
    plant: '4500',
    sloc: '3404',
    materialType: 'FERT',
    material: 'IH830-9678-F4LW',
    lotNo: 'J26I0401',
    unit: 'KG',
    wmsStrategy: 'MTS',
    wmsQty: 7500,
    erpStrategy: 'MTS',
    erpQty: 0,
    diffQty: 7500,
    status: 'PENDING'
  }
];

export const sampleSlocDiscrepancies: StorageLocationItem[] = [
  // Block 3 Warehouse/Sloc comparisons
  { id: 'S-1', plant: '3000', materialType: 'FERT', material: 'AR700U-F1-T', lotNo: 'W25D2803', unit: 'KG', wmsSloc: '2900', wmsQty: 500, erpSloc: '', erpQty: 0, diffQty: 500 },
  { id: 'S-2', plant: '3000', materialType: 'FERT', material: 'AR700U-F1-T', lotNo: 'W25E1902', unit: 'KG', wmsSloc: '2900', wmsQty: 1150, erpSloc: '', erpQty: 0, diffQty: 1150 },
  { id: 'S-3', plant: '3000', materialType: 'FERT', material: 'AR700U-F1-T', lotNo: 'W25E2302', unit: 'KG', wmsSloc: '2900', wmsQty: 200, erpSloc: '', erpQty: 0, diffQty: 200 },
  { id: 'S-4', plant: '3000', materialType: 'FERT', material: 'BN740-G1', lotNo: 'D26I0508', unit: 'KG', wmsSloc: '', wmsQty: 0, erpSloc: '2400', erpQty: 4700, diffQty: -4700 },
  { id: 'S-5', plant: '3000', materialType: 'FERT', material: 'HI535-F5', lotNo: 'X26F3001', unit: 'KG', wmsSloc: '3403', wmsQty: 2400, erpSloc: '3403', erpQty: 3200, diffQty: -800 },
  { id: 'S-6', plant: '3000', materialType: 'FERT', material: 'HI880-E1', lotNo: 'C26I0601', unit: 'KG', wmsSloc: '', wmsQty: 0, erpSloc: '2400', erpQty: 8000, diffQty: -8000 },
  { id: 'S-7', plant: '3000', materialType: 'FERT', material: 'HI880-E1', lotNo: 'C26I0603', unit: 'KG', wmsSloc: '', wmsQty: 0, erpSloc: '2400', erpQty: 8000, diffQty: -8000 },
  { id: 'S-8', plant: '3000', materialType: 'FERT', material: 'IH830-9678-F4LW', lotNo: 'W26A1401', unit: 'KG', wmsSloc: '2900', wmsQty: 750, erpSloc: '', erpQty: 0, diffQty: 750 },
  { id: 'S-9', plant: '3000', materialType: 'FERT', material: 'IH830B-G1', lotNo: 'D26I0505', unit: 'KG', wmsSloc: '', wmsQty: 0, erpSloc: '2400', erpQty: 1000, diffQty: -1000 },
  { id: 'S-10', plant: '3000', materialType: 'FERT', material: 'IH830HL-F5', lotNo: 'B26I0702', unit: 'KG', wmsSloc: '', wmsQty: 0, erpSloc: '2400', erpQty: 8000, diffQty: -8000 },
  { id: 'S-11', plant: '3000', materialType: 'FERT', material: 'IH830HLB-F5', lotNo: 'D26I0701', unit: 'KG', wmsSloc: '', wmsQty: 0, erpSloc: '2400', erpQty: 8000, diffQty: -8000 },
  { id: 'S-12', plant: '3000', materialType: 'FERT', material: 'VR1B-F1', lotNo: 'D26I0102', unit: 'KG', wmsSloc: '2400', wmsQty: 11450, erpSloc: '2400', erpQty: 14590, diffQty: -3140 }
];

export const initialDailyReports: DailyInventoryReport[] = [
  // Let's seed 4 days of reports to show a beautiful historical trend!
  {
    date: '2026-09-05',
    discrepancies: sampleDiscrepancies.slice(0, 8).map(item => ({
      ...item,
      id: `D-${item.id}-05`,
      status: 'RESOLVED',
      comment: '9월 5일 일일 조치 완료. 전산 조정 및 이송 입고 확인됨.'
    })),
    transitStock: sampleTransitStock,
    slocDiscrepancies: sampleSlocDiscrepancies,
    lastUpdated: '2026-09-05T18:00:00Z',
    note: '9/5 마감 재고 차이 분석 완료. 이송중 재고 중 3건 입고 완료 처리됨.'
  },
  {
    date: '2026-09-06',
    discrepancies: sampleDiscrepancies.slice(4, 15).map(item => ({
      ...item,
      id: `D-${item.id}-06`,
      status: item.id === 'D-11' ? 'RESOLVED' : 'INVESTIGATING',
      comment: item.id === 'D-11' ? '보류 재고 사유 확인되어 전산 승인 완료.' : '이송 전산 지연 상태 파악 중.'
    })),
    transitStock: sampleTransitStock,
    slocDiscrepancies: sampleSlocDiscrepancies,
    lastUpdated: '2026-09-06T18:00:00Z',
    note: '일요일 당직 재고 대사. 일부 가용 품목 차이 발생하여 월요일 오전 추적 예정.'
  },
  {
    date: '2026-09-07',
    discrepancies: sampleDiscrepancies.slice(2, 18).map(item => ({
      ...item,
      id: `D-${item.id}-07`,
      status: 'PENDING'
    })),
    transitStock: sampleTransitStock,
    slocDiscrepancies: sampleSlocDiscrepancies,
    lastUpdated: '2026-09-07T18:00:00Z',
    note: '9/7 재고 차이 대사 완료. 2400 저장위치에 이송중인 재고가 많음.'
  },
  {
    date: '2026-09-08', // The actual day of the sample CSV
    discrepancies: sampleDiscrepancies,
    transitStock: sampleTransitStock,
    slocDiscrepancies: sampleSlocDiscrepancies,
    lastUpdated: '2026-09-08T09:30:00Z',
    note: 'WMS vs ERP 재고 분석 대상 데이터 일차 로드. 이송중 재고 매핑 및 차이 원인 규명 진행 중.'
  }
];
