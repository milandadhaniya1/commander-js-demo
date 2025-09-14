import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import boxen from 'boxen';
import type { Command } from 'commander';
import type { FileOptions } from '../types/index';

export function fileCommands(program: Command): void {
  const fileCmd = program
    .command('file')
    .description('📁 File operations management')
    .addHelpText('after', `

Examples:
  $ pnpm cli file create myfile.txt
  $ pnpm cli file create config.json --content '{"key": "value"}'
  $ pnpm cli file read myfile.txt --lines 10
  $ pnpm cli file list --ext .js --detailed
  $ pnpm cli file delete temp.txt --force

Note: All files are created/managed in the 'demo-files' directory.
`);

  // Create file command
  fileCmd
    .command('create <filename>')
    .description('📝 Create a new file')
    .option('-c, --content <content>', 'file content')
    .option('-t, --template <type>', 'use template (json, js, md, html)', 'text')
    .option('-f, --force', 'overwrite if exists')
    .action(async (filename: string, options: FileOptions) => {
      const spinner = ora('Creating file...').start();
      
      try {
        // Create demo-files directory if it doesn't exist
        const demoDir = path.resolve('demo-files');
        await fs.mkdir(demoDir, { recursive: true });
        
        // Check if file exists
        const filePath = path.resolve(demoDir, filename);
        const exists = await fs.access(filePath).then(() => true).catch(() => false);
        
        if (exists && !options.force) {
          spinner.fail(chalk.red(`File ${filename} already exists!`));
          
          const { overwrite } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'overwrite',
              message: 'Do you want to overwrite it?',
              default: false
            }
          ]);
          
          if (!overwrite) {
            console.log(chalk.yellow('Operation cancelled.'));
            return;
          }
        }
        
        // Generate content based on template
        let content = options.content || '';
        
        if (!content) {
          const templates: Record<string, string> = {
            json: '{\n  "name": "example",\n  "version": "1.0.0"\n}',
            js: '// JavaScript file\nconsole.log("Hello, World!");',
            md: '# Markdown File\n\nThis is a sample markdown file.\n\n## Features\n\n- Feature 1\n- Feature 2',
            html: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Example</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>',
            text: 'This is a sample text file.\nCreated with Commander.js demo!'
          };
          
          const templateKey = options.template || 'text';
          content = templates[templateKey as keyof typeof templates] ?? templates.text;
        }
        
        await fs.writeFile(filePath, content, 'utf8');
        
        spinner.succeed(chalk.green(`✅ File created successfully!`));
        
        console.log(boxen(
          `${chalk.bold('File:')} ${filename}\n` +
          `${chalk.bold('Path:')} ${filePath}\n` +
          `${chalk.bold('Size:')} ${content.length} bytes\n` +
          `${chalk.bold('Template:')} ${options.template || 'text'}`,
          {
            padding: 1,
            borderColor: 'green'
          }
        ));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        spinner.fail(chalk.red(`❌ Error creating file: ${errorMessage}`));
      }
    });

  // Read file command
  fileCmd
    .command('read <filename>')
    .description('👁️  Read file contents')
    .option('-l, --lines <number>', 'number of lines to read', parseInt)
    .option('-n, --no-format', 'disable syntax highlighting')
    .option('-s, --stats', 'show file statistics')
    .action(async (filename: string, options: FileOptions) => {
      const spinner = ora('Reading file...').start();
      
      try {
        const demoDir = path.resolve('demo-files');
        const filePath = path.resolve(demoDir, filename);
        const content = await fs.readFile(filePath, 'utf8');
        const stats = await fs.stat(filePath);
        
        spinner.succeed(chalk.green('✅ File read successfully!'));
        
        if (options.stats) {
          console.log(boxen(
            `${chalk.bold('File Statistics')}\n` +
            `${chalk.bold('Size:')} ${stats.size} bytes\n` +
            `${chalk.bold('Created:')} ${stats.birthtime.toLocaleString()}\n` +
            `${chalk.bold('Modified:')} ${stats.mtime.toLocaleString()}\n` +
            `${chalk.bold('Lines:')} ${content.split('\n').length}`,
            {
              padding: 1,
              borderColor: 'blue'
            }
          ));
          console.log();
        }
        
        console.log(chalk.bold.cyan(`📄 Contents of ${filename}:`));
        console.log(chalk.gray('─'.repeat(50)));
        
        let displayContent = content;
        if (options.lines) {
          displayContent = content.split('\n').slice(0, options.lines).join('\n');
          if (content.split('\n').length > options.lines) {
            displayContent += '\n' + chalk.gray('... (truncated)');
          }
        }
        
        console.log(displayContent);
        console.log(chalk.gray('─'.repeat(50)));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        spinner.fail(chalk.red(`❌ Error reading file: ${errorMessage}`));
      }
    });

  // List files command
  fileCmd
    .command('list [directory]')
    .description('📋 List files in directory')
    .option('-e, --ext <extension>', 'filter by extension')
    .option('-d, --detailed', 'show detailed information')
    .option('-h, --hidden', 'include hidden files')
    .action(async (directory: string = '.', options: FileOptions) => {
      const spinner = ora('Scanning directory...').start();
      
      try {
        const demoDir = path.resolve('demo-files');
        const dirPath = directory === '.' ? demoDir : path.resolve(demoDir, directory);
        const files = await fs.readdir(dirPath);
        
        let filteredFiles = files;
        
        // Filter hidden files
        if (!options.hidden) {
          filteredFiles = filteredFiles.filter(file => !file.startsWith('.'));
        }
        
        // Filter by extension
        if (options.ext) {
          const ext = options.ext.startsWith('.') ? options.ext : `.${options.ext}`;
          filteredFiles = filteredFiles.filter(file => path.extname(file) === ext);
        }
        
        spinner.succeed(chalk.green(`✅ Found ${filteredFiles.length} files`));
        
        if (filteredFiles.length === 0) {
          console.log(chalk.yellow('No files found matching criteria.'));
          return;
        }
        
        console.log(chalk.bold.cyan(`\n📁 Files in ${directory}:\n`));
        
        for (const file of filteredFiles) {
          const filePath = path.join(dirPath, file);
          const stats = await fs.stat(filePath);
          
          if (options.detailed) {
            const size = stats.isDirectory() ? 'DIR' : `${stats.size}B`;
            const type = stats.isDirectory() ? '📁' : '📄';
            const modified = stats.mtime.toLocaleDateString();
            
            console.log(`${type} ${chalk.white(file.padEnd(30))} ${chalk.gray(size.padEnd(10))} ${chalk.gray(modified)}`);
          } else {
            const icon = stats.isDirectory() ? '📁' : '📄';
            console.log(`${icon} ${file}`);
          }
        }
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        spinner.fail(chalk.red(`❌ Error listing files: ${errorMessage}`));
      }
    });

  // Delete file command
  fileCmd
    .command('delete <filename>')
    .description('🗑️  Delete a file')
    .option('-f, --force', 'force delete without confirmation')
    .option('-r, --recursive', 'delete directories recursively')
    .action(async (filename: string, options: FileOptions) => {
      try {
        const demoDir = path.resolve('demo-files');
        const filePath = path.resolve(demoDir, filename);
        const stats = await fs.stat(filePath);
        
        // Confirmation for non-force delete
        if (!options.force) {
          const fileType = stats.isDirectory() ? 'directory' : 'file';
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Are you sure you want to delete the ${fileType} "${filename}"?`,
              default: false
            }
          ]);
          
          if (!confirm) {
            console.log(chalk.yellow('Operation cancelled.'));
            return;
          }
        }
        
        const spinner = ora(`Deleting ${filename}...`).start();
        
        if (stats.isDirectory()) {
          if (options.recursive) {
            await fs.rm(filePath, { recursive: true, force: true });
          } else {
            await fs.rmdir(filePath);
          }
        } else {
          await fs.unlink(filePath);
        }
        
        spinner.succeed(chalk.green(`✅ Successfully deleted ${filename}`));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(chalk.red(`❌ Error deleting file: ${errorMessage}`));
      }
    });

  // Copy file command
  fileCmd
    .command('copy <source> <destination>')
    .description('📋 Copy a file')
    .option('-f, --force', 'overwrite destination if exists')
    .action(async (source: string, destination: string, options: FileOptions) => {
      const spinner = ora('Copying file...').start();
      
      try {
        const sourcePath = path.resolve(source);
        const destPath = path.resolve(destination);
        
        // Check if destination exists
        const destExists = await fs.access(destPath).then(() => true).catch(() => false);
        
        if (destExists && !options.force) {
          spinner.stop();
          const { overwrite } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'overwrite',
              message: `Destination "${destination}" already exists. Overwrite?`,
              default: false
            }
          ]);
          
          if (!overwrite) {
            console.log(chalk.yellow('Operation cancelled.'));
            return;
          }
          spinner.start();
        }
        
        await fs.copyFile(sourcePath, destPath);
        
        spinner.succeed(chalk.green(`✅ File copied successfully!`));
        
        console.log(boxen(
          `${chalk.bold('Source:')} ${source}\n` +
          `${chalk.bold('Destination:')} ${destination}`,
          {
            padding: 1,
            borderColor: 'green'
          }
        ));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        spinner.fail(chalk.red(`❌ Error copying file: ${errorMessage}`));
      }
    });
}
