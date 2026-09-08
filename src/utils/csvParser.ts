import { DiscrepancyItem, TransitStockItem, StorageLocationItem } from '../types';

/**
 * Helper to clean and parse numbers from Excel/CSV (e.g. "4,700.000" -> 4700)
 */
function parseCleanNumber(val: any): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/["'\s,]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Helper to split CSV lines, handling quoted values
 */
function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Robustly parses CSV content for any of the 4 blocks based on headers
 */
export function parseCSVData(rawText: string): {
  discrepancies: DiscrepancyItem[];
  transitStock: TransitStockItem[];
  slocDiscrepancies: StorageLocationItem[];
} {
  const lines = rawText.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  
  const discrepancies: DiscrepancyItem[] = [];
  const transitStock: TransitStockItem[] = [];
  const slocDiscrepancies: StorageLocationItem[] = [];

  if (lines.length === 0) {
    return { discrepancies, transitStock, slocDiscrepancies };
  }

  // We will scan the CSV to determine what headers exist
  // We can also parse a multi-block file (often people copy-paste multiple tables divided by headers or blank lines)
  let currentBlockType: 'QTY' | 'STATUS' | 'SLOC' | 'TRANSIT' | null = null;
  let headers: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cells = splitCSVLine(line);

    // Identify block based on header markers
    const joinedLine = line.toLowerCase();
    
    if (joinedLine.includes('wms_구분') || joinedLine.includes('wms 수량') || (joinedLine.includes('wms_') && joinedLine.includes('erp_') && joinedLine.includes('차이 수량'))) {
      currentBlockType = 'QTY';
      headers = cells.map(h => h.replace(/["']/g, '').trim());
      continue;
    } else if (joinedLine.includes('w_검사') || joinedLine.includes('w_가용') || joinedLine.includes('w_보류') || joinedLine.includes('e_가용')) {
      currentBlockType = 'STATUS';
      headers = cells.map(h => h.replace(/["']/g, '').trim());
      continue;
    } else if (joinedLine.includes('wms_창고') || joinedLine.includes('erp_창고') || (joinedLine.includes('sloc') && joinedLine.includes('wms_â') && joinedLine.includes('erp_â'))) {
      currentBlockType = 'SLOC';
      headers = cells.map(h => h.replace(/["']/g, '').trim());
      continue;
    } else if (joinedLine.includes('plant(송하)') || joinedLine.includes('s. loc.(송하)') || joinedLine.includes('박스일련번호') || joinedLine.includes('lot no') && joinedLine.includes('desc')) {
      currentBlockType = 'TRANSIT';
      headers = cells.map(h => h.replace(/["']/g, '').trim());
      continue;
    }

    // Skip helper text rows
    if (cells.length < 3 || cells[0].startsWith('※') || cells[0] === 'No' || cells[0] === '번호') {
      continue;
    }

    // Parse values based on block
    if (currentBlockType === 'QTY' && headers.length > 0) {
      // Create discrepancy item
      const item: Partial<DiscrepancyItem> = {
        id: `uploaded-qty-${i}`,
        status: 'PENDING',
        wmsQty: 0,
        erpQty: 0,
        diffQty: 0
      };

      // Map cells to index
      cells.forEach((val, idx) => {
        const header = headers[idx];
        if (!header) return;
        const hLower = header.toLowerCase();

        if (hLower.includes('plant') || hLower === '공장') item.plant = val;
        else if (hLower.includes('sloc') || hLower === '저장위치') item.sloc = val;
        else if (hLower.includes('materialtype') || hLower.includes('자재유형')) item.materialType = val;
        else if (hLower.includes('material') || hLower === '자재코드') item.material = val;
        else if (hLower.includes('lot_no') || hLower.includes('lot 번호')) item.lotNo = val;
        else if (hLower.includes('unit') || hLower === '단위') item.unit = val;
        else if (hLower.includes('wms_구분')) item.wmsStrategy = val;
        else if (hLower.includes('wms_수주번호')) item.wmsOrderNo = val;
        else if (hLower.includes('wms 수량') || hLower === 'wms수량') item.wmsQty = parseCleanNumber(val);
        else if (hLower.includes('erp_구분')) item.erpStrategy = val;
        else if (hLower.includes('erp_수주번호')) item.erpOrderNo = val;
        else if (hLower.includes('erp 수량') || hLower === 'erp수량') item.erpQty = parseCleanNumber(val);
        else if (hLower.includes('차이 수량') || hLower === '차이수량') item.diffQty = parseCleanNumber(val);
      });

      if (item.material && item.lotNo) {
        if (!item.unit) item.unit = 'KG';
        if (!item.plant) item.plant = '3000';
        if (!item.sloc) item.sloc = '2400';
        item.diffQty = (item.wmsQty || 0) - (item.erpQty || 0);
        discrepancies.push(item as DiscrepancyItem);
      }
    } 
    else if (currentBlockType === 'STATUS' && headers.length > 0) {
      // Status discrepancy
      const item: Partial<DiscrepancyItem> = {
        id: `uploaded-status-${i}`,
        status: 'PENDING'
      };

      cells.forEach((val, idx) => {
        const header = headers[idx];
        if (!header) return;
        const hLower = header.toLowerCase();

        if (hLower.includes('plant')) item.plant = val;
        else if (hLower.includes('sloc')) item.sloc = val;
        else if (hLower.includes('material')) item.material = val;
        else if (hLower.includes('lot_no') || hLower.includes('lot')) item.lotNo = val;
        else if (hLower.includes('unit')) item.unit = val;
        // WMS Stock status
        else if (hLower === 'w_검사' || hLower.includes('w_quality')) item.wmsQuality = parseCleanNumber(val);
        else if (hLower === 'w_가용' || hLower.includes('w_unrestricted')) item.wmsUnrestricted = parseCleanNumber(val);
        else if (hLower === 'w_보류' || hLower.includes('w_blocked')) item.wmsBlocked = parseCleanNumber(val);
        else if (hLower === 'w_이송' || hLower.includes('w_transit')) item.wmsTransit = parseCleanNumber(val);
        // ERP Stock status
        else if (hLower === 'e_검사' || hLower.includes('e_quality')) item.erpQuality = parseCleanNumber(val);
        else if (hLower === 'e_가용' || hLower.includes('e_unrestricted')) item.erpUnrestricted = parseCleanNumber(val);
        else if (hLower === 'e_보류' || hLower.includes('e_blocked')) item.erpBlocked = parseCleanNumber(val);
        else if (hLower === 'e_이송' || hLower.includes('e_transit')) item.erpTransit = parseCleanNumber(val);
      });

      if (item.material && item.lotNo) {
        if (!item.unit) item.unit = 'KG';
        if (!item.plant) item.plant = '3000';
        if (!item.sloc) item.sloc = '2400';
        
        // Unify with QTY if matching item exists, otherwise add new
        const match = discrepancies.find(d => d.material === item.material && d.lotNo === item.lotNo && d.sloc === item.sloc);
        if (match) {
          match.wmsQuality = item.wmsQuality;
          match.wmsUnrestricted = item.wmsUnrestricted;
          match.wmsBlocked = item.wmsBlocked;
          match.wmsTransit = item.wmsTransit;
          match.erpQuality = item.erpQuality;
          match.erpUnrestricted = item.erpUnrestricted;
          match.erpBlocked = item.erpBlocked;
          match.erpTransit = item.erpTransit;
        } else {
          item.wmsQty = (item.wmsUnrestricted || 0) + (item.wmsBlocked || 0) + (item.wmsQuality || 0);
          item.erpQty = (item.erpUnrestricted || 0) + (item.erpBlocked || 0) + (item.erpQuality || 0);
          item.diffQty = item.wmsQty - item.erpQty;
          discrepancies.push(item as DiscrepancyItem);
        }
      }
    } 
    else if (currentBlockType === 'SLOC' && headers.length > 0) {
      // Storage location differences
      const item: Partial<StorageLocationItem> = {
        id: `uploaded-sloc-${i}`
      };

      cells.forEach((val, idx) => {
        const header = headers[idx];
        if (!header) return;
        const hLower = header.toLowerCase();

        if (hLower.includes('plant')) item.plant = val;
        else if (hLower.includes('material')) item.material = val;
        else if (hLower.includes('lot_no') || hLower.includes('lot')) item.lotNo = val;
        else if (hLower.includes('unit')) item.unit = val;
        else if (hLower.includes('wms_창고') || hLower.includes('wms_sloc')) item.wmsSloc = val;
        else if (hLower.includes('wms 수량') || hLower === 'wms수량') item.wmsQty = parseCleanNumber(val);
        else if (hLower.includes('erp_창고') || hLower.includes('erp_sloc')) item.erpSloc = val;
        else if (hLower.includes('erp 수량') || hLower === 'erp수량') item.erpQty = parseCleanNumber(val);
      });

      if (item.material && item.lotNo) {
        if (!item.unit) item.unit = 'KG';
        if (!item.plant) item.plant = '3000';
        item.diffQty = (item.wmsQty || 0) - (item.erpQty || 0);
        slocDiscrepancies.push(item as StorageLocationItem);
      }
    } 
    else if (currentBlockType === 'TRANSIT' && headers.length > 0) {
      // Transit stock items
      const item: Partial<TransitStockItem> = {
        id: `uploaded-transit-${i}`,
        status: '이송중'
      };

      cells.forEach((val, idx) => {
        const header = headers[idx];
        if (!header) return;
        const hLower = header.toLowerCase();

        if (hLower.includes('plant(송하)') || hLower.includes('out_plant')) item.outPlant = val;
        else if (hLower.includes('s. loc.(송하)') || hLower.includes('out_sloc')) item.outSloc = val;
        else if (hLower.includes('plant(수하)') || hLower.includes('in_plant')) item.inPlant = val;
        else if (hLower.includes('s. loc.(수하)') || hLower.includes('in_sloc')) item.inSloc = val;
        else if (hLower.includes('자재코드') || hLower === 'material') item.material = val;
        else if (hLower.includes('자재명') || hLower.includes('desc')) item.materialDesc = val;
        else if (hLower.includes('lot no') || hLower.includes('lot_no') || hLower === 'lot') item.lotNo = val;
        else if (hLower.includes('상자번호') || hLower.includes('박스') || hLower.includes('package') || hLower.includes('ȣ')) item.packageNo = val;
        else if (hLower.includes('수량') || hLower === 'qty') item.qty = parseCleanNumber(val);
        else if (hLower.includes('단위') || hLower === 'unit') item.unit = val;
      });

      if (item.material && item.lotNo && item.qty) {
        if (!item.unit) item.unit = 'KG';
        if (!item.outPlant) item.outPlant = '3000';
        if (!item.inPlant) item.inPlant = '3000';
        if (!item.outSloc) item.outSloc = '2400';
        if (!item.inSloc) item.inSloc = '4400';
        if (!item.packageNo) item.packageNo = `PKG-${item.lotNo}-${i}`;
        transitStock.push(item as TransitStockItem);
      }
    }
  }

  // If we parsed Status discrepancies but couldn't map them to Qty rows, we can create corresponding Qty rows
  return { discrepancies, transitStock, slocDiscrepancies };
}
