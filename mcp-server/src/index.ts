#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { execSync } from 'child_process';
import { z } from 'zod';

// Tool schemas
const RunLoadTestSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  concurrent: z.number().int().min(1).max(1000),
  requests: z.number().int().min(1).max(100000),
  output: z.string().optional(),
  dryRun: z.boolean().optional(),
  keepScript: z.boolean().optional(),
});

const CreateConfigSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  concurrent: z.number().int().min(1).max(1000).optional(),
  iterations: z.number().int().min(1).max(100000).optional(),
  parameters: z.array(z.object({
    name: z.string(),
    type: z.enum(['integer', 'string', 'array', 'csv']),
    min: z.number().optional(),
    max: z.number().optional(),
    values: z.array(z.union([z.string(), z.number()])).optional(),
    file: z.string().optional(),
    column: z.string().optional(),
  })).optional(),
});

class SynapseMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'synapse-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'run_load_test',
          description: 'Run a simple load test against a URL with specified concurrent users and total requests',
          inputSchema: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                format: 'uri',
                description: 'Target URL to test',
              },
              concurrent: {
                type: 'number',
                minimum: 1,
                maximum: 1000,
                description: 'Number of concurrent users',
              },
              requests: {
                type: 'number',
                minimum: 1,
                maximum: 100000,
                description: 'Total number of requests to make',
              },
              output: {
                type: 'string',
                description: 'Output directory for results (optional)',
              },
              dryRun: {
                type: 'boolean',
                description: 'Generate script without running (optional)',
              },
              keepScript: {
                type: 'boolean',
                description: 'Keep generated K6 script (optional)',
              },
            },
            required: ['url', 'concurrent', 'requests'],
          },
        },
        {
          name: 'create_config',
          description: 'Create a Synapse configuration file for advanced load testing',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Test name',
              },
              url: {
                type: 'string',
                format: 'uri',
                description: 'Base URL for testing',
              },
              concurrent: {
                type: 'number',
                minimum: 1,
                maximum: 1000,
                description: 'Number of concurrent users (optional)',
              },
              iterations: {
                type: 'number',
                minimum: 1,
                maximum: 100000,
                description: 'Total iterations (optional)',
              },
              parameters: {
                type: 'array',
                description: 'Dynamic parameters for URL construction (optional)',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    type: { type: 'string', enum: ['integer', 'string', 'array', 'csv'] },
                    min: { type: 'number' },
                    max: { type: 'number' },
                    values: { type: 'array' },
                    file: { type: 'string' },
                    column: { type: 'string' },
                  },
                  required: ['name', 'type'],
                },
              },
            },
            required: ['name', 'url'],
          },
        },
        {
          name: 'run_config_test',
          description: 'Run load test from a configuration file',
          inputSchema: {
            type: 'object',
            properties: {
              config: {
                type: 'string',
                description: 'Path to configuration file (default: synapse.yml)',
              },
              output: {
                type: 'string',
                description: 'Output directory (optional)',
              },
              dryRun: {
                type: 'boolean',
                description: 'Generate script without running (optional)',
              },
            },
          },
        },
        {
          name: 'validate_config',
          description: 'Validate a Synapse configuration file',
          inputSchema: {
            type: 'object',
            properties: {
              config: {
                type: 'string',
                description: 'Path to configuration file to validate',
              },
            },
            required: ['config'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'run_load_test':
            return await this.runLoadTest(args);
          case 'create_config':
            return await this.createConfig(args);
          case 'run_config_test':
            return await this.runConfigTest(args);
          case 'validate_config':
            return await this.validateConfig(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  private async runLoadTest(args: any) {
    const params = RunLoadTestSchema.parse(args);
    
    let command = `synapse test --url "${params.url}" --concurrent ${params.concurrent} --requests ${params.requests}`;
    
    if (params.output) command += ` --output "${params.output}"`;
    if (params.dryRun) command += ' --dry-run';
    if (params.keepScript) command += ' --keep-script';

    try {
      const output = execSync(command, { encoding: 'utf8', timeout: 300000 });
      return {
        content: [
          {
            type: 'text',
            text: `Load test completed successfully!\n\nCommand: ${command}\n\nOutput:\n${output}`,
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Load test failed: ${error.message}\nCommand: ${command}`);
    }
  }

  private async createConfig(args: any) {
    const params = CreateConfigSchema.parse(args);
    
    const config = {
      name: params.name,
      baseUrl: params.url,
      execution: {
        mode: 'construct',
        concurrent: params.concurrent || 10,
        iterations: params.iterations || 100,
      },
      parameters: params.parameters || [],
      request: {
        method: 'GET',
      },
    };

    const yamlContent = this.objectToYaml(config);
    
    try {
      const fs = require('fs');
      fs.writeFileSync('synapse.yml', yamlContent);
      
      return {
        content: [
          {
            type: 'text',
            text: `Configuration file created successfully!\n\nFile: synapse.yml\n\nContent:\n${yamlContent}`,
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to create config file: ${error.message}`);
    }
  }

  private async runConfigTest(args: any) {
    let command = 'synapse run';
    
    if (args.config) command += ` --config "${args.config}"`;
    if (args.output) command += ` --output "${args.output}"`;
    if (args.dryRun) command += ' --dry-run';

    try {
      const output = execSync(command, { encoding: 'utf8', timeout: 300000 });
      return {
        content: [
          {
            type: 'text',
            text: `Configuration-based load test completed!\n\nCommand: ${command}\n\nOutput:\n${output}`,
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Config test failed: ${error.message}\nCommand: ${command}`);
    }
  }

  private async validateConfig(args: any) {
    const command = `synapse validate --config "${args.config}"`;

    try {
      const output = execSync(command, { encoding: 'utf8' });
      return {
        content: [
          {
            type: 'text',
            text: `Configuration validation successful!\n\nCommand: ${command}\n\nOutput:\n${output}`,
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Validation failed: ${error.message}\nCommand: ${command}`);
    }
  }

  private objectToYaml(obj: any, indent = 0): string {
    const spaces = '  '.repeat(indent);
    let yaml = '';

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;
      
      if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        for (const item of value) {
          if (typeof item === 'object') {
            yaml += `${spaces}  -\n${this.objectToYaml(item, indent + 2)}`;
          } else {
            yaml += `${spaces}  - ${item}\n`;
          }
        }
      } else if (typeof value === 'object') {
        yaml += `${spaces}${key}:\n${this.objectToYaml(value, indent + 1)}`;
      } else {
        yaml += `${spaces}${key}: ${typeof value === 'string' ? `"${value}"` : value}\n`;
      }
    }

    return yaml;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Synapse MCP server running on stdio');
  }
}

const server = new SynapseMCPServer();
server.run().catch(console.error);
