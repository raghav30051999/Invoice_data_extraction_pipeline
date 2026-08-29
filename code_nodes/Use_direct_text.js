// Pass through clean text without OCR
const items = $input.all();
const results = [];

for (const item of items) {
  results.push({
    json: {
      fileName: item.json.fileName,
      filePath: item.json.filePath,
      text: item.json.text,
      processing_method: 'direct',
      original_data: item.json.original_data || {}
    }
  });
}

return results;