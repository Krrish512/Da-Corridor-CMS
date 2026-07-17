/**
 * Converts an array of objects into a CSV string.
 * @param {Array<Object>} data - The data to convert
 * @param {Array<string>} headers - The headers corresponding to object keys
 * @returns {string} - CSV formatted string
 */
const convertToCSV = (data, headers) => {
  if (!data || !data.length) {
    return headers.join(',') + '\n';
  }

  const csvRows = [];
  
  // Add headers row
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) {
        val = '';
      }
      
      // Stringify date objects
      if (val instanceof Date) {
        val = val.toISOString();
      }

      // Convert to string and escape double quotes
      let stringVal = String(val);
      if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n') || stringVal.includes('\r')) {
        stringVal = `"${stringVal.replace(/"/g, '""')}"`;
      }
      
      return stringVal;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
};

module.exports = {
  convertToCSV,
};
