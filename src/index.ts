#!/usr/bin/env tsx

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import boxen from 'boxen';
import { createRequire } from 'module';
import { fileCommands } from './commands/files';
import { createProfileCommand } from './commands/profile';
import { userCommands } from './commands/users';
import { taskCommands } from './commands/tasks';
import { systemCommands } from './commands/system';
import { configCommands } from './commands/config';
import type { CommandOptions } from './types/index';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const program = new Command();

// ASCII Art Welcome Message
function showWelcome(): void {
  console.clear();
  const title = figlet.textSync('Commander.js', {
    font: 'Big',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });
  
  console.log(gradient.rainbow(title));
  console.log();
  console.log(boxen(
    chalk.white.bold('🚀 Comprehensive CLI Demo (TypeScript)\n') +
    chalk.gray('Showcasing all Commander.js features\n') +
    chalk.cyan('Author: Milan Dadhaniya'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'cyan'
    }
  ));
  console.log();
}

// Main program configuration
program
  .name('demo-cli')
  .description('🎯 Comprehensive Commander.js Demo CLI (TypeScript)')
  .version(pkg.version, '-v, --version', 'display version number')
  .option('-d, --debug', 'enable debug mode')
  .option('-c, --config <path>', 'specify config file path')
  .option('--no-color', 'disable colored output')
  .helpOption('-h, --help', 'display help for command')
  .addHelpText('before', () => {
    showWelcome();
    return '';
  });

// Global middleware for debug mode
program.hook('preAction', (_thisCommand, actionCommand) => {
  const options = program.opts() as CommandOptions;
  
  if (options.debug) {
    console.log(chalk.yellow('🐛 Debug Mode Enabled'));
    console.log(chalk.gray(`Command: ${actionCommand.name()}`));
    console.log(chalk.gray(`Args: ${JSON.stringify(actionCommand.args)}`));
    console.log(chalk.gray(`Options: ${JSON.stringify(actionCommand.opts())}`));
    console.log();
  }
});

// Register command modules
fileCommands(program);
program.addCommand(createProfileCommand());
userCommands(program);
systemCommands(program);
taskCommands(program);
configCommands(program);

// Custom help command with examples
program
  .command('examples')
  .description('📖 Show usage examples')
  .action(() => {
    console.log(chalk.bold.cyan('\n🌟 Commander.js Demo Examples (TypeScript):\n'));
    
    const examples = [
      { cmd: 'pnpm cli file create test.txt', desc: 'Create a new file' },
      { cmd: 'pnpm cli file read test.txt', desc: 'Read file contents' },
      { cmd: 'pnpm cli profile create john --interactive', desc: 'Create profile interactively' },
      { cmd: 'pnpm cli profile create jane --role developer --skills js,ts,react', desc: 'Create profile with options' },
      { cmd: 'pnpm cli profile list --format table', desc: 'List all profiles' },
      { cmd: 'pnpm cli user add "John Doe" john@example.com', desc: 'Add a new user' },
      { cmd: 'pnpm cli system info --detailed', desc: 'Show detailed system info' },
      { cmd: 'pnpm cli task add "Complete demo"', desc: 'Add a new task' },
      { cmd: 'pnpm cli config set theme dark', desc: 'Set configuration value' },
      { cmd: 'pnpm cli --debug profile view john', desc: 'Run with debug mode' },
      { cmd: 'pnpm commands', desc: 'List all available pnpm commands' }
    ];
    
    examples.forEach(({ cmd, desc }) => {
      console.log(`  ${chalk.green('$')} ${chalk.white(cmd)}`);
      console.log(`    ${chalk.gray(desc)}\n`);
    });

    console.log(chalk.bold.yellow('💡 Pro Tips:'));
    console.log(chalk.gray('  • Use tab completion: pnpm <TAB>'));
    console.log(chalk.gray('  • All CLI commands available as pnpm scripts'));
    console.log(chalk.gray('  • Run "pnpm commands" to see all available commands'));
    console.log();
  });

// List all available commands (for pnpm integration)
program
  .command('list-commands')
  .description('📋 List all available commands (internal)')
  .action(() => {
    const commands = program.commands
      .filter(cmd => cmd.name() !== 'list-commands')
      .map(cmd => ({
        name: cmd.name(),
        description: cmd.description(),
        aliases: cmd.aliases()
      }));

    console.log(chalk.bold.cyan('\n🎯 Available Commands:\n'));
    
    commands.forEach(({ name, description, aliases }) => {
      const aliasText = aliases.length > 0 ? chalk.gray(` (${aliases.join(', ')})`) : '';
      console.log(`  ${chalk.green(name)}${aliasText}`);
      console.log(`    ${chalk.gray(description)}`);
      console.log();
    });
  });

// Handle unknown commands
program
  .command('*', { noHelp: true })
  .action((cmd: string) => {
    console.log(chalk.red(`\n❌ Unknown command: ${cmd}`));
    console.log(chalk.yellow('💡 Try --help to see available commands'));
    console.log(chalk.yellow('💡 Or run "pnpm commands" to see all pnpm shortcuts\n'));
    process.exit(1);
  });

// Error handling
process.on('uncaughtException', (error: Error) => {
  console.error(chalk.red('\n💥 Uncaught Exception:'), error.message);
  const options = program.opts() as CommandOptions;
  if (options.debug) {
    console.error(error.stack);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error(chalk.red('\n💥 Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  const options = program.opts() as CommandOptions;
  if (options.debug) {
    console.error(reason.stack);
  }
  process.exit(1);
});

// Parse arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.help();
}
