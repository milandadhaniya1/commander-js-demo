import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import Table from 'cli-table3';
import boxen from 'boxen';

const CONFIG_FILE = path.resolve('./config.json');

// Default configuration
const DEFAULT_CONFIG = {
  theme: 'default',
  colorOutput: true,
  dateFormat: 'locale',
  defaultPriority: 'medium',
  autoSave: true,
  maxItems: 100,
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  language: 'en',
  debug: false
};

// Helper functions
async function loadConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf8');
    const config = JSON.parse(data);
    return { ...DEFAULT_CONFIG, ...config };
  } catch (error) {
    return DEFAULT_CONFIG;
  }
}

async function saveConfig(config) {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function validateConfigValue(key, value) {
  const validators = {
    theme: (val) => ['default', 'dark', 'light', 'rainbow'].includes(val),
    colorOutput: (val) => typeof val === 'boolean',
    dateFormat: (val) => ['locale', 'iso', 'us', 'eu'].includes(val),
    defaultPriority: (val) => ['low', 'medium', 'high', 'urgent'].includes(val),
    autoSave: (val) => typeof val === 'boolean',
    maxItems: (val) => Number.isInteger(val) && val > 0 && val <= 1000,
    apiUrl: (val) => typeof val === 'string' && val.length > 0,
    timeout: (val) => Number.isInteger(val) && val > 0,
    language: (val) => ['en', 'es', 'fr', 'de', 'it'].includes(val),
    debug: (val) => typeof val === 'boolean'
  };
  
  const validator = validators[key];
  if (!validator) {
    return { valid: false, message: `Unknown configuration key: ${key}` };
  }
  
  // Try to convert value if it's a string
  let convertedValue = value;
  if (typeof value === 'string') {
    if (value === 'true') convertedValue = true;
    else if (value === 'false') convertedValue = false;
    else if (!isNaN(Number(value)) && !isNaN(parseFloat(value))) convertedValue = parseInt(value);
  }
  
  if (validator(convertedValue)) {
    return { valid: true, value: convertedValue };
  }
  
  const suggestions = {
    theme: 'Must be one of: default, dark, light, rainbow',
    colorOutput: 'Must be true or false',
    dateFormat: 'Must be one of: locale, iso, us, eu',
    defaultPriority: 'Must be one of: low, medium, high, urgent',
    autoSave: 'Must be true or false',
    maxItems: 'Must be a number between 1 and 1000',
    apiUrl: 'Must be a valid URL string',
    timeout: 'Must be a positive number',
    language: 'Must be one of: en, es, fr, de, it',
    debug: 'Must be true or false'
  };
  
  return { valid: false, message: suggestions[key] || 'Invalid value' };
}

export function configCommands(program) {
  const configCmd = program
    .command('config')
    .alias('cfg')
    .description('⚙️ Configuration management')
    .addHelpText('after', `

Examples:
  $ demo-cli config get theme
  $ demo-cli config get --all
  $ demo-cli config set theme dark
  $ demo-cli config set colorOutput false
  $ demo-cli config list --format table
  $ demo-cli config reset
  $ demo-cli config export config-backup.json
  $ demo-cli config import config-backup.json

Available Configuration Keys:
  theme          - UI theme (default, dark, light, rainbow)
  colorOutput    - Enable colored output (true/false)
  dateFormat     - Date format (locale, iso, us, eu)
  defaultPriority- Default task priority (low, medium, high, urgent)
  autoSave       - Auto-save changes (true/false)
  maxItems       - Maximum items to display (1-1000)
  apiUrl         - API endpoint URL
  timeout        - Request timeout in milliseconds
  language       - Interface language (en, es, fr, de, it)
  debug          - Debug mode (true/false)
`);

  // Get configuration value
  configCmd
    .command('get [key]')
    .description('📖 Get configuration value')
    .option('-a, --all', 'get all configuration values')
    .option('-f, --format <format>', 'output format (json, table, simple)', 'simple')
    .action(async (key, options) => {
      const spinner = ora('Loading configuration...').start();
      
      try {
        const config = await loadConfig();
        
        spinner.succeed(chalk.green('✅ Configuration loaded!'));
        
        if (options.all || !key) {
          // Show all configuration
          if (options.format === 'json') {
            console.log(JSON.stringify(config, null, 2));
            return;
          }
          
          console.log(chalk.bold.cyan('\n⚙️ Current Configuration:\n'));
          
          if (options.format === 'table') {
            const table = new Table({
              head: ['Key', 'Value', 'Type'].map(h => chalk.cyan(h)),
              style: { border: ['gray'] },
              colWidths: [20, 30, 15]
            });
            
            Object.entries(config).forEach(([k, v]) => {
              table.push([
                k,
                typeof v === 'object' ? JSON.stringify(v) : String(v),
                typeof v
              ]);
            });
            
            console.log(table.toString());
          } else {
            Object.entries(config).forEach(([k, v]) => {
              const valueStr = typeof v === 'object' ? JSON.stringify(v) : String(v);
              console.log(`${chalk.yellow(k.padEnd(18))} : ${chalk.white(valueStr)} ${chalk.gray(`(${typeof v})`)}`);
            });
          }
        } else {
          // Show specific key
          if (!(key in config)) {
            console.error(chalk.red(`❌ Configuration key "${key}" not found!`));
            console.log(chalk.yellow('Available keys:'), Object.keys(config).join(', '));
            return;
          }
          
          const value = config[key];
          
          if (options.format === 'json') {
            console.log(JSON.stringify({ [key]: value }, null, 2));
          } else {
            console.log(boxen(
              `${chalk.bold('Key:')} ${key}\n` +
              `${chalk.bold('Value:')} ${typeof value === 'object' ? JSON.stringify(value) : String(value)}\n` +
              `${chalk.bold('Type:')} ${typeof value}`,
              {
                padding: 1,
                borderColor: 'blue'
              }
            ));
          }
        }
        
      } catch (error) {
        spinner.fail(chalk.red(`❌ Error loading configuration: ${error.message}`));
      }
    });

  // Set configuration value
  configCmd
    .command('set <key> <value>')
    .description('✏️ Set configuration value')
    .option('-f, --force', 'force set without validation')
    .action(async (key, value, options) => {
      try {
        const config = await loadConfig();
        
        // Validate key and value
        if (!options.force) {
          const validation = validateConfigValue(key, value);
          if (!validation.valid) {
            console.error(chalk.red(`❌ ${validation.message}`));
            return;
          }
          value = validation.value;
        }
        
        const oldValue = config[key];
        const spinner = ora('Updating configuration...').start();
        
        config[key] = value;
        await saveConfig(config);
        
        spinner.succeed(chalk.green('✅ Configuration updated successfully!'));
        
        console.log(boxen(
          `${chalk.bold('Key:')} ${key}\n` +
          `${chalk.bold('Old Value:')} ${oldValue !== undefined ? String(oldValue) : 'undefined'}\n` +
          `${chalk.bold('New Value:')} ${String(value)}\n` +
          `${chalk.bold('Type:')} ${typeof value}`,
          {
            padding: 1,
            borderColor: 'green'
          }
        ));
        
      } catch (error) {
        console.error(chalk.red(`❌ Error setting configuration: ${error.message}`));
      }
    });

  // List configuration with descriptions
  configCmd
    .command('list')
    .description('📋 List all configuration options with descriptions')
    .option('-f, --format <format>', 'output format (table, simple)', 'simple')
    .action(async (options) => {
      const spinner = ora('Loading configuration...').start();
      
      try {
        const config = await loadConfig();
        
        spinner.succeed(chalk.green('✅ Configuration loaded!'));
        
        const descriptions = {
          theme: 'Visual theme for the CLI interface',
          colorOutput: 'Enable or disable colored terminal output',
          dateFormat: 'Default date format for displaying dates',
          defaultPriority: 'Default priority level for new tasks',
          autoSave: 'Automatically save changes without confirmation',
          maxItems: 'Maximum number of items to display in lists',
          apiUrl: 'Base URL for API requests',
          timeout: 'Network request timeout in milliseconds',
          language: 'Interface language code',
          debug: 'Enable debug mode for troubleshooting'
        };
        
        console.log(chalk.bold.cyan('\n⚙️ Configuration Settings:\n'));
        
        if (options.format === 'table') {
          const table = new Table({
            head: ['Key', 'Value', 'Description'].map(h => chalk.cyan(h)),
            style: { border: ['gray'] },
            colWidths: [18, 20, 40]
          });
          
          Object.entries(config).forEach(([key, value]) => {
            table.push([
              key,
              String(value),
              descriptions[key] || 'No description available'
            ]);
          });
          
          console.log(table.toString());
        } else {
          Object.entries(config).forEach(([key, value]) => {
            console.log(`${chalk.yellow(key)}`);
            console.log(`  ${chalk.white('Value:')} ${chalk.green(String(value))}`);
            console.log(`  ${chalk.white('Description:')} ${chalk.gray(descriptions[key] || 'No description available')}`);
            console.log();
          });
        }
        
      } catch (error) {
        spinner.fail(chalk.red(`❌ Error loading configuration: ${error.message}`));
      }
    });

  // Reset configuration to defaults
  configCmd
    .command('reset')
    .description('🔄 Reset configuration to defaults')
    .option('-f, --force', 'force reset without confirmation')
    .option('-k, --key <key>', 'reset specific key only')
    .action(async (options) => {
      try {
        const config = await loadConfig();
        
        if (options.key) {
          // Reset specific key
          if (!(options.key in DEFAULT_CONFIG)) {
            console.error(chalk.red(`❌ Unknown configuration key: ${options.key}`));
            return;
          }
          
          if (!options.force) {
            const { confirm } = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'confirm',
                message: `Reset "${options.key}" to default value?`,
                default: false
              }
            ]);
            
            if (!confirm) {
              console.log(chalk.yellow('Operation cancelled.'));
              return;
            }
          }
          
          const oldValue = config[options.key];
          config[options.key] = DEFAULT_CONFIG[options.key];
          
          const spinner = ora('Resetting configuration key...').start();
          await saveConfig(config);
          spinner.succeed(chalk.green(`✅ Configuration key "${options.key}" reset!`));
          
          console.log(boxen(
            `${chalk.bold('Key:')} ${options.key}\n` +
            `${chalk.bold('Old Value:')} ${String(oldValue)}\n` +
            `${chalk.bold('New Value:')} ${String(DEFAULT_CONFIG[options.key])}`,
            {
              padding: 1,
              borderColor: 'yellow'
            }
          ));
          
        } else {
          // Reset all configuration
          if (!options.force) {
            const { confirm } = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'confirm',
                message: 'Reset ALL configuration to defaults? This cannot be undone.',
                default: false
              }
            ]);
            
            if (!confirm) {
              console.log(chalk.yellow('Operation cancelled.'));
              return;
            }
          }
          
          const spinner = ora('Resetting configuration...').start();
          await saveConfig(DEFAULT_CONFIG);
          spinner.succeed(chalk.green('✅ Configuration reset to defaults!'));
        }
        
      } catch (error) {
        console.error(chalk.red(`❌ Error resetting configuration: ${error.message}`));
      }
    });

  // Export configuration
  configCmd
    .command('export [filename]')
    .description('📤 Export configuration to file')
    .action(async (filename = 'config-export.json') => {
      const spinner = ora('Exporting configuration...').start();
      
      try {
        const config = await loadConfig();
        const exportPath = path.resolve(filename);
        
        await fs.writeFile(exportPath, JSON.stringify(config, null, 2));
        
        spinner.succeed(chalk.green('✅ Configuration exported successfully!'));
        
        console.log(boxen(
          `${chalk.bold('Export File:')} ${filename}\n` +
          `${chalk.bold('Full Path:')} ${exportPath}\n` +
          `${chalk.bold('Keys Exported:')} ${Object.keys(config).length}`,
          {
            padding: 1,
            borderColor: 'green'
          }
        ));
        
      } catch (error) {
        spinner.fail(chalk.red(`❌ Error exporting configuration: ${error.message}`));
      }
    });

  // Import configuration
  configCmd
    .command('import <filename>')
    .description('📥 Import configuration from file')
    .option('-m, --merge', 'merge with existing configuration')
    .option('-f, --force', 'force import without confirmation')
    .action(async (filename, options) => {
      try {
        const importPath = path.resolve(filename);
        
        // Check if file exists
        try {
          await fs.access(importPath);
        } catch (error) {
          console.error(chalk.red(`❌ File not found: ${filename}`));
          return;
        }
        
        const spinner = ora('Reading import file...').start();
        
        const importData = await fs.readFile(importPath, 'utf8');
        const importConfig = JSON.parse(importData);
        
        spinner.text = 'Validating configuration...';
        
        // Validate import data
        const validationErrors = [];
        Object.entries(importConfig).forEach(([key, value]) => {
          const validation = validateConfigValue(key, value);
          if (!validation.valid) {
            validationErrors.push(`${key}: ${validation.message}`);
          }
        });
        
        if (validationErrors.length > 0 && !options.force) {
          spinner.fail(chalk.red('❌ Validation errors found:'));
          validationErrors.forEach(error => console.log(chalk.red(`  • ${error}`)));
          console.log(chalk.yellow('\nUse --force to ignore validation errors.'));
          return;
        }
        
        let finalConfig = importConfig;
        
        if (options.merge) {
          const currentConfig = await loadConfig();
          finalConfig = { ...currentConfig, ...importConfig };
        }
        
        if (!options.force) {
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Import configuration from "${filename}"? This will ${options.merge ? 'merge with' : 'replace'} current settings.`,
              default: false
            }
          ]);
          
          if (!confirm) {
            spinner.stop();
            console.log(chalk.yellow('Operation cancelled.'));
            return;
          }
        }
        
        spinner.text = 'Importing configuration...';
        await saveConfig(finalConfig);
        
        spinner.succeed(chalk.green('✅ Configuration imported successfully!'));
        
        console.log(boxen(
          `${chalk.bold('Import File:')} ${filename}\n` +
          `${chalk.bold('Mode:')} ${options.merge ? 'Merge' : 'Replace'}\n` +
          `${chalk.bold('Keys Imported:')} ${Object.keys(importConfig).length}\n` +
          `${chalk.bold('Total Keys:')} ${Object.keys(finalConfig).length}`,
          {
            padding: 1,
            borderColor: 'blue'
          }
        ));
        
      } catch (error) {
        console.error(chalk.red(`❌ Error importing configuration: ${error.message}`));
      }
    });

  // Interactive configuration setup
  configCmd
    .command('setup')
    .description('🎯 Interactive configuration setup')
    .action(async () => {
      console.log(chalk.cyan('🎯 Interactive Configuration Setup\n'));
      
      try {
        const currentConfig = await loadConfig();
        
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'theme',
            message: 'Choose UI theme:',
            choices: [
              { name: '🌈 Rainbow', value: 'rainbow' },
              { name: '🌙 Dark', value: 'dark' },
              { name: '☀️ Light', value: 'light' },
              { name: '📄 Default', value: 'default' }
            ],
            default: currentConfig.theme
          },
          {
            type: 'confirm',
            name: 'colorOutput',
            message: 'Enable colored output?',
            default: currentConfig.colorOutput
          },
          {
            type: 'list',
            name: 'dateFormat',
            message: 'Choose date format:',
            choices: [
              { name: 'Local format (recommended)', value: 'locale' },
              { name: 'ISO format (2024-01-15)', value: 'iso' },
              { name: 'US format (01/15/2024)', value: 'us' },
              { name: 'European format (15/01/2024)', value: 'eu' }
            ],
            default: currentConfig.dateFormat
          },
          {
            type: 'list',
            name: 'defaultPriority',
            message: 'Default task priority:',
            choices: [
              { name: '🟢 Low', value: 'low' },
              { name: '🟡 Medium', value: 'medium' },
              { name: '🟠 High', value: 'high' },
              { name: '🔴 Urgent', value: 'urgent' }
            ],
            default: currentConfig.defaultPriority
          },
          {
            type: 'number',
            name: 'maxItems',
            message: 'Maximum items to display in lists:',
            default: currentConfig.maxItems,
            validate: (input) => (input > 0 && input <= 1000) || 'Must be between 1 and 1000'
          },
          {
            type: 'confirm',
            name: 'autoSave',
            message: 'Enable auto-save?',
            default: currentConfig.autoSave
          },
          {
            type: 'confirm',
            name: 'debug',
            message: 'Enable debug mode?',
            default: currentConfig.debug
          }
        ]);
        
        const spinner = ora('Saving configuration...').start();
        
        const newConfig = { ...currentConfig, ...answers };
        await saveConfig(newConfig);
        
        spinner.succeed(chalk.green('✅ Configuration saved successfully!'));
        
        console.log(chalk.bold.cyan('\n🎉 Configuration Complete!\n'));
        
        const table = new Table({
          head: ['Setting', 'Value'].map(h => chalk.cyan(h)),
          style: { border: ['gray'] }
        });
        
        Object.entries(answers).forEach(([key, value]) => {
          table.push([key, String(value)]);
        });
        
        console.log(table.toString());
        
      } catch (error) {
        console.error(chalk.red(`❌ Error in configuration setup: ${error.message}`));
      }
    });
}
