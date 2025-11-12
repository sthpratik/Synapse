import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Comparator, ComparisonResult } from '../comparison/index.js';

interface ComparisonRow {
  row: number;
  url1: string;
  url2: string;
  result: ComparisonResult;
}

function generateCsvReport(results: ComparisonRow[], type: 'image' | 'text'): string {
  const baseHeaders = 'Row,URL1,URL2,Success,ResponseTime(ms),URL1_Status,URL2_Status,URL1_Size,URL2_Size';
  
  let specificHeaders = '';
  if (type === 'image') {
    specificHeaders = ',Width1,Height1,Width2,Height2,DiffPixels,Similarity%';
  } else {
    specificHeaders = ',TextMatch,Similarity%';
  }
  
  const errorHeaders = ',Error,ErrorDetails';
  const headers = baseHeaders + specificHeaders + errorHeaders + '\n';

  const rows = results.map(({ row, url1, url2, result }) => {
    const base = `${row},"${url1}","${url2}",${result.success},${result.responseTime},${result.url1Status},${result.url2Status},${result.url1Size || ''},${result.url2Size || ''}`;
    
    let specific = '';
    if (type === 'image') {
      specific = `,${result.width1 || ''},${result.height1 || ''},${result.width2 || ''},${result.height2 || ''},${result.diffPixels || ''},${result.similarity || ''}`;
    } else {
      specific = `,${result.textMatch || ''},${result.similarity || ''}`;
    }
    
    const error = `,"${result.error || ''}","${result.errorDetails || ''}"`;
    return base + specific + error;
  }).join('\n');

  return headers + rows;
}

export const compareCommand = new Command('compare')
  .description('Compare images or text content from CSV file')
  .requiredOption('-f, --file <path>', 'CSV file with URLs to compare')
  .option('-c1, --column1 <name>', 'First URL column name', 'url1')
  .option('-c2, --column2 <name>', 'Second URL column name', 'url2')
  .option('-t, --type <type>', 'Comparison type: image or text', 'image')
  .option('-o, --output <path>', 'Output directory', './output')
  .option('--timeout <ms>', 'Request timeout in milliseconds', '30000')
  .option('--threshold <value>', 'Image comparison threshold (0-1)', '0.1')
  .action(async (options) => {
    try {
      console.log('🔍 Starting comparison process...');
      
      // Validate inputs
      if (!['image', 'text'].includes(options.type)) {
        throw new Error('Type must be either "image" or "text"');
      }

      // Read CSV
      console.log('📄 Reading CSV file...');
      const csvContent = fs.readFileSync(options.file, 'utf-8');
      const records = parse(csvContent, { columns: true, skip_empty_lines: true });

      if (!records.length) {
        throw new Error('No data found in CSV file');
      }

      // Initialize comparator
      const comparator = new Comparator({
        type: options.type,
        timeout: parseInt(options.timeout),
        threshold: parseFloat(options.threshold)
      });

      const results: ComparisonRow[] = [];
      
      console.log(`🚀 Processing ${records.length} comparisons...`);
      
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const url1 = record[options.column1];
        const url2 = record[options.column2];

        if (!url1 || !url2) {
          console.log(`⚠️  Row ${i + 1}: Missing URLs, skipping`);
          continue;
        }

        process.stdout.write(`\r⏳ Comparing ${i + 1}/${records.length}...`);
        
        const result = await comparator.compare(url1, url2);
        results.push({
          row: i + 1,
          url1,
          url2,
          result
        });
      }

      console.log('\n📊 Generating report...');

      // Create output directory
      if (!fs.existsSync(options.output)) {
        fs.mkdirSync(options.output, { recursive: true });
      }

      // Generate report
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                       new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];
      const reportName = `${options.type}-comparison-${timestamp}.csv`;
      const outputPath = path.join(options.output, reportName);

      const csvReport = generateCsvReport(results, options.type);
      fs.writeFileSync(outputPath, csvReport);

      // Summary
      const successful = results.filter(r => r.result.success).length;
      const failed = results.length - successful;
      const avgResponseTime = results.reduce((sum, r) => sum + r.result.responseTime, 0) / results.length;
      
      if (options.type === 'image') {
        const avgSimilarity = results
          .filter(r => r.result.success && r.result.similarity !== undefined)
          .reduce((sum, r) => sum + (r.result.similarity || 0), 0) / successful;
        
        console.log(`\n✅ Comparison complete!`);
        console.log(`📁 Report saved: ${outputPath}`);
        console.log(`📈 Results:`);
        console.log(`   Total: ${results.length}`);
        console.log(`   Successful: ${successful}`);
        console.log(`   Failed: ${failed}`);
        console.log(`   Avg Response Time: ${Math.round(avgResponseTime)}ms`);
        console.log(`   Avg Similarity: ${Math.round(avgSimilarity * 100) / 100}%`);
      } else {
        const exactMatches = results.filter(r => r.result.textMatch).length;
        
        console.log(`\n✅ Comparison complete!`);
        console.log(`📁 Report saved: ${outputPath}`);
        console.log(`📈 Results:`);
        console.log(`   Total: ${results.length}`);
        console.log(`   Successful: ${successful}`);
        console.log(`   Failed: ${failed}`);
        console.log(`   Exact Matches: ${exactMatches}`);
        console.log(`   Avg Response Time: ${Math.round(avgResponseTime)}ms`);
      }

    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
