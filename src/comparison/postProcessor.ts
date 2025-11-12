import fs from 'fs';
import path from 'path';
import { Comparator, ComparisonResult } from './index.js';

interface K6ComparisonResult {
  iteration: number;
  url1: string;
  url2: string;
  responseTime: number;
  url1Status: number;
  url2Status: number;
  url1Size: number;
  url2Size: number;
  timestamp: string;
  textMatch?: boolean;
  sizeMatch?: boolean;
  similarity?: number;
}

interface DetailedComparisonResult extends K6ComparisonResult {
  detailedComparison?: ComparisonResult;
}

export class ComparisonPostProcessor {
  private comparator: Comparator;

  constructor(type: 'image' | 'text', threshold?: number) {
    this.comparator = new Comparator({ type, threshold });
  }

  async processResults(resultsPath: string, outputDir: string): Promise<void> {
    console.log('🔍 Processing comparison results...');
    
    // Read K6 results
    const rawResults = JSON.parse(fs.readFileSync(resultsPath, 'utf-8')) as K6ComparisonResult[];
    
    const detailedResults: DetailedComparisonResult[] = [];
    
    for (let i = 0; i < rawResults.length; i++) {
      const result = rawResults[i];
      process.stdout.write(`\r⏳ Processing ${i + 1}/${rawResults.length}...`);
      
      // Perform detailed comparison
      if (result.url1Status === 200 && result.url2Status === 200) {
        try {
          const detailedComparison = await this.comparator.compare(result.url1, result.url2);
          detailedResults.push({
            ...result,
            detailedComparison
          });
        } catch (error) {
          detailedResults.push({
            ...result,
            detailedComparison: {
              success: false,
              responseTime: 0,
              url1Status: result.url1Status,
              url2Status: result.url2Status,
              error: 'Post-processing failed',
              errorDetails: error instanceof Error ? error.message : String(error)
            }
          });
        }
      } else {
        detailedResults.push(result);
      }
    }

    console.log('\n📊 Generating detailed report...');
    
    // Generate CSV report
    const csvReport = this.generateDetailedCsvReport(detailedResults);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                     new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];
    const csvPath = path.join(outputDir, `detailed-comparison-${timestamp}.csv`);
    fs.writeFileSync(csvPath, csvReport);

    // Generate JSON report
    const jsonPath = path.join(outputDir, `detailed-comparison-${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(detailedResults, null, 2));

    // Generate summary
    this.generateSummary(detailedResults, outputDir, timestamp);

    console.log(`✅ Detailed analysis complete!`);
    console.log(`📁 CSV Report: ${csvPath}`);
    console.log(`📁 JSON Report: ${jsonPath}`);
  }

  private generateDetailedCsvReport(results: DetailedComparisonResult[]): string {
    const headers = [
      'Iteration', 'URL1', 'URL2', 'LoadTest_ResponseTime(ms)', 'URL1_Status', 'URL2_Status',
      'URL1_Size', 'URL2_Size', 'LoadTest_SizeMatch', 'LoadTest_Similarity%', 
      'Pixelmatch_Success', 'Pixelmatch_ResponseTime(ms)', 'Image_Width1', 'Image_Height1', 
      'Image_Width2', 'Image_Height2', 'Pixelmatch_DiffPixels', 'Pixelmatch_Similarity%', 
      'TextMatch', 'Error', 'ErrorDetails', 'Timestamp'
    ].join(',') + '\n';

    const rows = results.map(r => {
      const d = r.detailedComparison;
      return [
        r.iteration,
        `"${r.url1}"`,
        `"${r.url2}"`,
        r.responseTime,
        r.url1Status,
        r.url2Status,
        r.url1Size,
        r.url2Size,
        r.sizeMatch || '',
        r.similarity || '',
        d?.success || '',
        d?.responseTime || '',
        d?.width1 || '',
        d?.height1 || '',
        d?.width2 || '',
        d?.height2 || '',
        d?.diffPixels || '',
        d?.similarity || '',
        d?.textMatch || '',
        `"${d?.error || ''}"`,
        `"${d?.errorDetails || ''}"`,
        r.timestamp
      ].join(',');
    }).join('\n');

    return headers + rows;
  }

  private generateSummary(results: DetailedComparisonResult[], outputDir: string, timestamp: string): void {
    const total = results.length;
    const successful = results.filter(r => r.detailedComparison?.success).length;
    const failed = total - successful;
    
    const avgK6ResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / total;
    const avgDetailedResponseTime = results
      .filter(r => r.detailedComparison?.responseTime)
      .reduce((sum, r) => sum + (r.detailedComparison?.responseTime || 0), 0) / successful;
    
    const avgSimilarity = results
      .filter(r => r.detailedComparison?.success && r.detailedComparison.similarity !== undefined)
      .reduce((sum, r) => sum + (r.detailedComparison?.similarity || 0), 0) / successful;

    const summary = {
      timestamp: new Date().toISOString(),
      totals: {
        total,
        successful,
        failed,
        successRate: Math.round((successful / total) * 10000) / 100
      },
      performance: {
        avgK6ResponseTime: Math.round(avgK6ResponseTime),
        avgDetailedResponseTime: Math.round(avgDetailedResponseTime),
        avgSimilarity: Math.round(avgSimilarity * 100) / 100
      },
      errors: results
        .filter(r => r.detailedComparison?.error)
        .reduce((acc, r) => {
          const error = r.detailedComparison?.error || 'Unknown';
          acc[error] = (acc[error] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
    };

    const summaryPath = path.join(outputDir, `comparison-summary-${timestamp}.json`);
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    console.log(`📈 Summary:`);
    console.log(`   Total: ${total}`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Success Rate: ${summary.totals.successRate}%`);
    console.log(`   Avg K6 Response Time: ${summary.performance.avgK6ResponseTime}ms`);
    console.log(`   Avg Detailed Response Time: ${summary.performance.avgDetailedResponseTime}ms`);
    console.log(`   Avg Similarity: ${summary.performance.avgSimilarity}%`);
  }
}
