import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { SynapseConfig } from './types/config';
import { ConfigValidator } from './validators/configValidator';
import { K6Generator } from './generators/k6Generator';
import { ComparisonPostProcessor } from './comparison/postProcessor.js';

export interface RunOptions {
  outputDir: string;
  dryRun?: boolean;
  keepScript?: boolean;
  enableComparison?: boolean;
  comparisonOnly?: boolean;
}

export interface SimpleTestOptions {
  url: string;
  concurrent: number;
  requests: number;
  outputDir: string;
  dryRun?: boolean;
  keepScript?: boolean;
}

export class SynapseRunner {
  private validator: ConfigValidator;

  constructor() {
    this.validator = new ConfigValidator();
  }

  async run(configPath: string, options: RunOptions): Promise<void> {
    console.log(chalk.blue('📋 Loading configuration...'));
    const config = await this.loadConfig(configPath);
    
    console.log(chalk.blue('✅ Validating configuration...'));
    await this.validator.validate(config);
    
    const hasComparison = config.comparison?.enabled && options.enableComparison;
    
    if (options.comparisonOnly) {
      if (!config.comparison?.enabled) {
        console.error(chalk.red('❌ Comparison not enabled in config'));
        process.exit(1);
      }
      console.log(chalk.blue('🔍 Running comparison only...'));
      await this.runComparisonOnly(config, options.outputDir);
      return;
    }
    
    console.log(chalk.blue('🔧 Generating K6 script...'));
    const scriptPath = await this.generateK6Script(config, options.outputDir);
    
    if (options.dryRun) {
      console.log(chalk.yellow('🏃 Dry run mode - K6 script generated but not executed'));
      console.log(chalk.blue(`📄 Script location: ${scriptPath}`));
      if (hasComparison) {
        console.log(chalk.yellow('💡 Comparison would run after load test'));
      }
      return;
    }
    
    console.log(chalk.blue('🚀 Running K6 load test...'));
    await this.runK6Test(scriptPath, options.outputDir);
    
    // Handle comparison post-processing if enabled
    if (hasComparison) {
      console.log(chalk.blue('🔍 Processing comparison results...'));
      await this.processComparison(config, options.outputDir);
    }
    
    if (!options.keepScript) {
      fs.unlinkSync(scriptPath);
      console.log(chalk.gray('🗑️  Cleaned up generated script'));
    } else {
      console.log(chalk.blue(`📄 K6 script saved: ${scriptPath}`));
    }
    
    console.log(chalk.green('✅ Load test completed!'));
  }

  async generateScript(configPath: string, outputPath: string): Promise<void> {
    const config = await this.loadConfig(configPath);
    await this.validator.validate(config);
    
    const generator = new K6Generator(config);
    const script = await generator.generateK6Script();
    
    fs.writeFileSync(outputPath, script);
  }

  async runSimpleTest(options: SimpleTestOptions): Promise<void> {
    console.log(chalk.blue('📋 Creating simple test configuration...'));
    
    const config: SynapseConfig = {
      name: 'Simple Load Test',
      baseUrl: options.url,
      execution: {
        mode: 'construct',
        concurrent: options.concurrent,
        iterations: options.requests
      },
      request: {
        method: 'GET'
      }
    };

    console.log(chalk.blue('🔧 Generating K6 script...'));
    const scriptPath = await this.generateK6Script(config, options.outputDir);
    
    if (options.dryRun) {
      console.log(chalk.yellow('🏃 Dry run mode - K6 script generated but not executed'));
      console.log(chalk.blue(`📄 Script location: ${scriptPath}`));
      return;
    }
    
    console.log(chalk.blue('🚀 Running K6 load test...'));
    await this.runK6Test(scriptPath, options.outputDir);
    
    if (!options.keepScript) {
      fs.unlinkSync(scriptPath);
      console.log(chalk.gray('🗑️  Cleaned up generated script'));
    } else {
      console.log(chalk.blue(`📄 K6 script saved: ${scriptPath}`));
    }
    
    console.log(chalk.green('✅ Load test completed!'));
  }

  private async loadConfig(configPath: string): Promise<SynapseConfig> {
    const configContent = fs.readFileSync(configPath, 'utf8');
    return yaml.parse(configContent) as SynapseConfig;
  }

  private async generateK6Script(config: SynapseConfig, outputDir: string): Promise<string> {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const generator = new K6Generator(config);
    const script = await generator.generateK6Script();
    
    const scriptPath = path.join(outputDir, 'test.js');
    fs.writeFileSync(scriptPath, script);
    
    return scriptPath;
  }

  private async runK6Test(scriptPath: string, outputDir: string): Promise<void> {
    try {
      // Check if k6 is installed
      execSync('k6 version', { stdio: 'pipe' });
    } catch (error) {
      console.error(chalk.red('❌ K6 is not installed or not in PATH'));
      console.log(chalk.blue('💡 Install K6: https://k6.io/docs/getting-started/installation/'));
      throw new Error('K6 not found');
    }

    const outputFile = path.join(outputDir, 'results.json');
    const logFile = path.join(outputDir, 'k6.log');
    const command = `k6 run --out json=${outputFile} --console-output=${logFile} ${scriptPath}`;
    
    try {
      console.log(chalk.gray(`Running: ${command}`));
      execSync(command, { stdio: 'inherit' });
      console.log(chalk.green(`📊 Results saved to: ${outputFile}`));
      
      // Parse logs for comparison data
      if (fs.existsSync(logFile)) {
        await this.parseComparisonLogs(logFile, outputDir);
      }
    } catch (error) {
      // Even if K6 fails, try to parse any comparison data
      if (fs.existsSync(logFile)) {
        await this.parseComparisonLogs(logFile, outputDir);
      }
      throw new Error('K6 test execution failed');
    }
  }

  private async parseComparisonLogs(logFile: string, outputDir: string): Promise<void> {
    try {
      const logContent = fs.readFileSync(logFile, 'utf-8');
      const comparisonResults = [];
      
      // Parse each line for comparison data
      const lines = logContent.split('\n');
      for (const line of lines) {
        if (line.includes('"type":"comparison"')) {
          try {
            const jsonStart = line.indexOf('{"type":"comparison"');
            if (jsonStart !== -1) {
              const jsonStr = line.substring(jsonStart);
              const data = JSON.parse(jsonStr);
              comparisonResults.push(data);
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }

      if (comparisonResults.length > 0) {
        // Generate basic CSV (K6 data)
        const csvHeaders = 'Iteration,URL1,URL2,ResponseTime(ms),URL1_Status,URL2_Status,URL1_Size,URL2_Size,SizeMatch,Similarity%,Timestamp\n';
        const csvRows = comparisonResults.map(r => 
          `${r.iteration},"${r.url1}","${r.url2}",${r.responseTime},${r.url1Status},${r.url2Status},${r.url1Size},${r.url2Size},${r.sizeMatch},${r.similarity},${r.timestamp}`
        ).join('\n');
        const csvContent = csvHeaders + csvRows;

        // Save files
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        fs.writeFileSync(path.join(outputDir, 'comparison-results.json'), JSON.stringify(comparisonResults, null, 2));
        fs.writeFileSync(path.join(outputDir, `basic-comparison-${timestamp}.csv`), csvContent);
        
        console.log(chalk.green(`📊 Basic comparison results: ${comparisonResults.length} entries`));
        console.log(chalk.blue(`📁 Basic CSV: basic-comparison-${timestamp}.csv`));
      }
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not parse comparison logs'));
    }
  }

  async checkK6Installation(): Promise<boolean> {
    try {
      execSync('k6 version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  private async processComparison(config: SynapseConfig, outputDir: string): Promise<void> {
    const resultsPath = path.join(outputDir, 'comparison-results.json');
    
    if (!fs.existsSync(resultsPath)) {
      console.log(chalk.yellow('⚠️  No comparison results found, skipping detailed analysis'));
      console.log(chalk.blue('💡 Make sure K6 generated comparison data during the test'));
      return;
    }

    if (config.comparison!.type === 'image') {
      console.log(chalk.blue('🖼️  Running detailed image comparison with pixelmatch...'));
      
      try {
        const processor = new ComparisonPostProcessor(
          config.comparison!.type,
          config.comparison!.threshold
        );
        
        await processor.processResults(resultsPath, outputDir);
      } catch (error) {
        console.log(chalk.yellow('⚠️  Detailed image comparison failed:'), error instanceof Error ? error.message : String(error));
        console.log(chalk.blue('💡 Basic size comparison results are still available in CSV'));
      }
    } else {
      console.log(chalk.blue('📝 Text comparison completed during K6 execution'));
    }
  }

  private async runComparisonOnly(config: SynapseConfig, outputDir: string): Promise<void> {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(chalk.blue('🔧 Generating URLs for comparison...'));
    
    // Generate URLs using the same logic as K6 script
    const generator = new K6Generator(config);
    const urls = await this.generateUrlsForComparison(config);
    
    console.log(chalk.blue(`📊 Generated ${urls.length} URL pairs for comparison`));
    
    // Run comparison directly
    const { Comparator } = await import('./comparison/index.js');
    const comparator = new Comparator({
      type: config.comparison!.type,
      threshold: config.comparison!.threshold,
      timeout: config.comparison!.timeout
    });

    const results = [];
    for (let i = 0; i < urls.length; i++) {
      const { url1, url2 } = urls[i];
      process.stdout.write(`\r⏳ Comparing ${i + 1}/${urls.length}...`);
      
      const result = await comparator.compare(url1, url2);
      results.push({
        row: i + 1,
        url1,
        url2,
        result
      });
    }

    console.log('\n📊 Generating comparison report...');
    
    // Generate report using the same logic as standalone compare
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                     new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];
    const reportName = `${config.comparison!.type}-comparison-${timestamp}.csv`;
    const outputPath = path.join(outputDir, reportName);

    const csvReport = this.generateComparisonCsv(results, config.comparison!.type);
    fs.writeFileSync(outputPath, csvReport);

    console.log(chalk.green(`✅ Comparison complete! Report: ${outputPath}`));
  }

  private async generateUrlsForComparison(config: SynapseConfig): Promise<Array<{url1: string, url2: string}>> {
    const { ParameterGenerator } = await import('./generators/parameterGenerator.js');
    const { UrlConstructor } = await import('./generators/urlConstructor.js');
    
    const paramGenerator = new ParameterGenerator();
    const urlConstructor = new UrlConstructor(config);
    
    const iterations = config.execution.iterations || 10;
    const urls = [];
    
    for (let i = 0; i < iterations; i++) {
      const parameters = config.parameters ? 
        await Promise.all(config.parameters.map(async param => {
          const value = await paramGenerator.generateParameter(param);
          return { name: param.name, value };
        })) : [];
      
      const url1 = urlConstructor.constructUrl(parameters);
      const url2 = url1.replace(config.baseUrl, config.comparison!.baseUrl2);
      
      urls.push({ url1, url2 });
    }
    
    return urls;
  }

  private generateComparisonCsv(results: any[], type: 'image' | 'text'): string {
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
}
