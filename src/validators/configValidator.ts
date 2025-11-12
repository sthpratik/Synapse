import * as Joi from 'joi';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { SynapseConfig } from '../types/config';

export class ConfigValidator {
  private schema: Joi.ObjectSchema;

  constructor() {
    this.schema = this.createSchema();
  }

  async validate(config: SynapseConfig): Promise<void> {
    const { error } = this.schema.validate(config);
    if (error) {
      throw new Error(`Configuration validation failed: ${error.message}`);
    }

    // Additional custom validations
    await this.validateCustomRules(config);
  }

  async validateFile(configPath: string): Promise<boolean> {
    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      const config = yaml.parse(configContent) as SynapseConfig;
      await this.validate(config);
      return true;
    } catch (error) {
      console.error('Validation error:', error instanceof Error ? error.message : error);
      return false;
    }
  }

  private createSchema(): Joi.ObjectSchema {
    const parameterSchema = Joi.object({
      name: Joi.string().required(),
      type: Joi.string().valid('integer', 'string', 'array', 'csv', 'url', 'static').required(),
      // Integer specific
      min: Joi.number().when('type', { is: 'integer', then: Joi.optional() }),
      max: Joi.number().when('type', { is: 'integer', then: Joi.optional() }),
      length: Joi.number().positive().optional(),
      // String specific
      charset: Joi.string().valid('alphanumeric', 'alpha', 'numeric', 'custom').when('type', { is: 'string', then: Joi.optional() }),
      customChars: Joi.string().when('charset', { is: 'custom', then: Joi.required(), otherwise: Joi.optional() }),
      // Array specific
      values: Joi.array().items(Joi.alternatives().try(Joi.string(), Joi.number())).when('type', { is: 'array', then: Joi.required() }),
      // CSV/URL specific
      file: Joi.string().when('type', { is: Joi.valid('csv', 'url'), then: Joi.required() }),
      column: Joi.string().when('type', { is: Joi.valid('csv', 'url'), then: Joi.required() }),
      encoding: Joi.string().valid('base64').when('type', { is: 'url', then: Joi.optional() }),
      // Static specific
      value: Joi.alternatives().try(Joi.string(), Joi.number()).when('type', { is: 'static', then: Joi.required() }),
      // Common
      unique: Joi.boolean().optional()
    });

    return Joi.object({
      name: Joi.string().required(),
      description: Joi.string().optional(),
      baseUrl: Joi.string().uri().required(),
      execution: Joi.object({
        mode: Joi.string().valid('construct', 'batch').required(),
        concurrent: Joi.number().positive().optional(),
        iterations: Joi.number().positive().optional(),
        duration: Joi.string().optional()
      }).required(),
      k6Options: Joi.object().optional(),
      parameters: Joi.array().items(parameterSchema).optional(),
      batch: Joi.object({
        file: Joi.string().required(),
        column: Joi.string().required()
      }).when('execution.mode', { is: 'batch', then: Joi.required() }),
      request: Joi.object({
        method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS').optional(),
        headers: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
        body: Joi.string().optional()
      }).optional(),
      output: Joi.object({
        format: Joi.string().valid('json', 'influxdb', 'cloud').optional(),
        file: Joi.string().optional()
      }).optional(),
      comparison: Joi.object({
        enabled: Joi.boolean().required(),
        type: Joi.string().valid('image', 'text').optional().default('image'),
        baseUrl2: Joi.string().uri().when('enabled', { is: true, then: Joi.required() }),
        threshold: Joi.number().min(0).max(1).optional().default(0.1),
        timeout: Joi.number().positive().optional().default(30000),
        reportFormat: Joi.string().valid('csv', 'json').optional().default('csv')
      }).optional()
    });
  }

  private async validateCustomRules(config: SynapseConfig): Promise<void> {
    // Validate execution mode consistency
    if (config.execution.mode === 'construct' && !config.parameters) {
      throw new Error('Construct mode requires parameters to be defined');
    }

    if (config.execution.mode === 'batch' && !config.batch) {
      throw new Error('Batch mode requires batch configuration');
    }

    // Validate file existence for CSV and URL parameters
    if (config.parameters) {
      for (const param of config.parameters) {
        if ((param.type === 'csv' || param.type === 'url') && param.file) {
          if (!fs.existsSync(param.file)) {
            throw new Error(`File not found for parameter '${param.name}': ${param.file}`);
          }
        }

        if (param.type === 'array' && (!param.values || param.values.length === 0)) {
          throw new Error(`Array parameter '${param.name}' must have at least one value`);
        }

        if (param.type === 'integer' && param.min !== undefined && param.max !== undefined && param.min > param.max) {
          throw new Error(`Invalid range for parameter '${param.name}': min (${param.min}) > max (${param.max})`);
        }

        if (param.type === 'static' && param.value === undefined) {
          throw new Error(`Static parameter '${param.name}' must have value defined`);
        }
      }
    }

    // Validate batch file existence
    if (config.batch?.file && !fs.existsSync(config.batch.file)) {
      throw new Error(`Batch file not found: ${config.batch.file}`);
    }

    // Validate execution settings
    if (!config.execution.iterations && !config.execution.duration) {
      throw new Error('Either iterations or duration must be specified');
    }

    // Validate comparison configuration
    if (config.comparison?.enabled) {
      if (!config.comparison.baseUrl2) {
        throw new Error('Comparison mode requires baseUrl2 to be specified');
      }
      
      if (config.comparison.threshold !== undefined && (config.comparison.threshold < 0 || config.comparison.threshold > 1)) {
        throw new Error('Comparison threshold must be between 0 and 1');
      }
    }
  }
}
