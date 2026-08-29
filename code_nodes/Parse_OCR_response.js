const items = $input.all();
const now = new Date();

// 1. Get config
const config = $('Set Configuration').item?.json || {};
const storage = config.storage || 'per_day';
const outputFolder = config.output_folder || '/files/output';

const dateStr = now.toISOString().split('T')[0];
const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');

const fileName = storage === 'per_day' 
  ? `extracted_data_${dateStr}.csv`
  : `extracted_data_${dateStr}_${timeStr}.csv`;
  
const outputPath = `${outputFolder}/${fileName}`;

// 2. Check if file exists (Requires "Check If File Exists" node before this)
let fileExists = false;
try {
  const checkNode = $('Check If File Exists');
  if (checkNode && checkNode.first().json) {
    fileExists = true;
  }
} catch (e) {
  fileExists = false; 
}

// 3. Define headers
const schemaHeaders = [
  "extraction_timestamp",
  "receipt_number",
  "receipt_date",
  "lessee_id",
  "lessee_name",
  "asset_name",
  "asset_code",
  "shop_number",
  "paid_from",
  "paid_till",
  "rent_amount",
  "penalty_amount",
  "cgst_amount",
  "sgst_amount",
  "st_amount",
  "grand_total",
  "amount_received",
  "payment_type"
];

const allRecords = [];

// 4. Extract and flatten data from aggregated structure
for (const item of items) {
  let dataArray = [];
  
  // Handle the aggregated structure (e.g., { "data": [{ "output": {...} }, ...] })
  if (Array.isArray(item.json.data)) {
    dataArray = item.json.data;
  } else if (Array.isArray(item.json.output)) {
    dataArray = item.json.output;
  } else if (Array.isArray(item.json)) {
    dataArray = item.json;
  } else {
    dataArray = [item.json];
  }

  for (const record of dataArray) {
    // Unwrap the 'output' object if it exists
    const data = record.output || record;
    
    if (data && (data.receipt_number || data.lessee_name)) {
      const cleanRecord = {
        extraction_timestamp: now.toISOString(),
        receipt_number: data.receipt_number || '',
        receipt_date: data.receipt_date || '',
        lessee_id: data.lessee_id || '',
        lessee_name: data.lessee_name || '',
        asset_name: data.asset_name || '',
        asset_code: data.asset_code || '',
        shop_number: data.shop_number || '',
        paid_from: data.paid_from || '',
        paid_till: data.paid_till || '',
        rent_amount: data.rent_amount ?? '',
        penalty_amount: data.penalty_amount ?? '',
        cgst_amount: data.cgst_amount ?? '',
        sgst_amount: data.sgst_amount ?? '',
        st_amount: data.st_amount ?? '',
        grand_total: data.grand_total ?? '',
        amount_received: data.amount_received ?? '',
        payment_type: data.payment_type || ''
      };
      
      // Excel human-readability fix (preserves leading zeros)
      if (cleanRecord.shop_number) cleanRecord.shop_number = `\t${cleanRecord.shop_number}`;
      if (cleanRecord.asset_code) cleanRecord.asset_code = `\t${cleanRecord.asset_code}`;
      if (cleanRecord.lessee_id) cleanRecord.lessee_id = `\t${cleanRecord.lessee_id}`;
      if (cleanRecord.receipt_number) cleanRecord.receipt_number = `\t${cleanRecord.receipt_number}`;
      
      allRecords.push(cleanRecord);
    }
  }
}

// 5. Build CSV string
let csvContent = '';

// Add headers ONLY if creating a new file
if (!fileExists && allRecords.length > 0) {
  csvContent += schemaHeaders.join(',') + '\n';
}

// Add data rows vertically
for (const record of allRecords) {
  const row = schemaHeaders.map(header => {
    let value = record[header] ?? '';
    if (typeof value === 'object') value = JSON.stringify(value);
    if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  });
  csvContent += row.join(',') + '\n';
}

// 6. Add UTF-8 BOM and return as binary
const BOM = '\uFEFF';
const csvWithBOM = BOM + csvContent;

return [{
  json: {
    filePath: outputPath,
    fileName: fileName,
    recordCount: allRecords.length
  },
  binary: {
    data: {
      data: Buffer.from(csvWithBOM, 'utf-8').toString('base64'),
      fileName: fileName,
      mimeType: 'text/csv'
    }
  }
}];