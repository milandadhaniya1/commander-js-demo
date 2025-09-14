# Commander.js Comprehensive Demo

🚀 **A complete demonstration of Commander.js features with beautiful UI components**

This project showcases all aspects of Commander.js through practical, real-world examples with modern CLI aesthetics using chalk, ora, inquirer, and other popular packages.

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Features Overview](#features-overview)
- [Command Reference](#command-reference)
- [Teaching Notes](#teaching-notes)
- [Advanced Features](#advanced-features)
- [Best Practices](#best-practices)

## 🚀 Installation

```bash
# Clone or create the project
cd commander-js-demo

# Install dependencies with pnpm
pnpm install

# Test the CLI
pnpm cli --help
```

## ⚡ Quick Start

```bash
# Show all available commands
pnpm cli --help

# View command examples and documentation
pnpm cli examples

# Try some commands with the unified CLI
pnpm cli file create test.txt --content "Hello World"
pnpm cli profile create john --role developer --skills js,ts,react
pnpm cli task add "Learn Commander.js" --priority high
pnpm cli user add "John Doe" john@example.com --role admin
pnpm cli system info --detailed
pnpm cli config setup

# All commands are now under 'pnpm cli <command>'
# Use --help with any command for detailed usage
pnpm cli user --help
pnpm cli task --help
pnpm cli profile --help
```

## 🚀 Unified CLI Interface

All commands are now organized under a single **`pnpm cli`** interface for better usability:

```bash
# File operations
pnpm cli file create myfile.txt
pnpm cli file read myfile.txt  
pnpm cli file list

# Profile management (Advanced demo feature)
pnpm cli profile create john --role developer
pnpm cli profile list
pnpm cli profile view john

# Task management
pnpm cli task add "Complete demo" --priority high
pnpm cli task list --status pending
pnpm cli task complete task123

# User management
pnpm cli user add "John Doe" john@example.com --role admin
pnpm cli user list --format table
pnpm cli user search --name "John"

# System monitoring
pnpm cli system info --detailed
pnpm cli system health
pnpm cli system monitor  # Real-time monitoring

# Configuration management
pnpm cli config setup
pnpm cli config get theme
pnpm cli config set theme dark

# Development scripts
pnpm start      # Start CLI directly  
pnpm dev        # Watch mode
pnpm build      # TypeScript compilation
pnpm type-check # Type checking only
pnpm help       # Show help
pnpm examples   # Show examples
```

## 🌟 Features Overview

### ✅ Core Commander.js Features Demonstrated

- **Command Structure**: Main command with subcommands
- **Options & Arguments**: Short/long options, required/optional arguments
- **Help System**: Auto-generated help with custom examples
- **Version Management**: Version display and handling
- **Global Options**: Debug mode, config path, color control
- **Command Aliases**: Short aliases for frequently used commands
- **Error Handling**: Graceful error handling and user feedback
- **Hooks**: Pre-action hooks for logging and debugging
- **Custom Help**: Enhanced help with examples and descriptions

### 🎨 UI/UX Enhancements

- **Colors**: Chalk for beautiful colored output
- **Spinners**: Ora for loading indicators
- **Interactive Prompts**: Inquirer for user input
- **ASCII Art**: Figlet for impressive headers
- **Gradients**: Gradient-string for rainbow effects
- **Tables**: CLI-table3 for structured data display
- **Boxes**: Boxen for highlighted information
- **Progress**: Visual feedback for all operations

## 📚 Command Reference

### 📁 File Operations (`file`)

Comprehensive file management with validation and templates.

```bash
# Create files with templates (stored in demo-files/ directory)
pnpm cli file create config.json --template json
pnpm cli file create script.js --template js
pnpm cli file create README.md --template md
pnpm cli file create myfile.txt --content "Hello World"

# Read files 
pnpm cli file read myfile.txt --stats
pnpm cli file read config.json

# List files in demo-files directory
pnpm cli file list --ext .js --detailed
pnpm cli file list

# Delete operations
pnpm cli file delete temp.txt --force
pnpm cli file delete unwanted.txt
```

**Teaching Points:**
- Required vs optional arguments
- Option validation and defaults
- File system operations with async/await
- Error handling for file operations
- Interactive vs non-interactive modes

### 👥 User Management (`user`)

Full CRUD operations with validation and interactive prompts.

```bash
# Add users (multiple ways)
pnpm cli user add "Jane Smith" jane@example.com --role admin
pnpm cli user add --interactive

# List users with formatting
pnpm cli user list
pnpm cli user list --format table
pnpm cli user list --format json --role admin

# Search and filter
pnpm cli user search --name "John"
pnpm cli user search --email "@gmail.com" --case-insensitive

# Update user information
pnpm cli user update user123 --role moderator
pnpm cli user update user456 --interactive

# Delete operations
pnpm cli user delete user789
pnpm cli user clear --force
```

**Teaching Points:**
- JSON file storage and manipulation
- Data validation (email format, required fields)
- CRUD operations with confirmation prompts
- Formatted output (table, JSON, simple)
- Search and filtering functionality
- Interactive prompts with inquirer

### 📋 Task Management (`task`)

Advanced task management with priorities, due dates, and status tracking.

```bash
# Create tasks
pnpm cli task add "Complete presentation" --priority high --due 2024-01-15
pnpm cli task add "Review code" --tags "development,review" --interactive

# List and filter tasks
pnpm cli task list
pnpm cli task list --status pending --format table
pnpm cli task list --priority urgent --sort due

# Task operations
pnpm cli task complete task123
pnpm cli task update task456 --status in-progress
pnpm cli task search --text "presentation"

# Bulk operations
pnpm cli task clear --force
```

**Teaching Points:**
- Complex data structures with nested properties
- Enumerated values (priority, status)
- Date validation and formatting
- Icons and visual indicators
- Status workflows and transitions
- Bulk operations with confirmation

### � Profile Management (`profile`)

Advanced profile creation with multiple input types - perfect for demonstrating Commander.js capabilities.

```bash
# Create profiles with arguments and options
pnpm cli profile create john --role developer --age 30 --skills js,ts,react
pnpm cli profile create jane --role designer --interactive

# Different input patterns
pnpm cli profile create mike --gender male --theme rainbow --operations validate,save
pnpm cli profile create sarah --interactive

# View and manage profiles
pnpm cli profile list --format table
pnpm cli profile view john
pnpm cli profile update john --role senior-developer
pnpm cli profile delete temp-profile
```

**Teaching Points:**
- **Required Arguments**: Name as mandatory parameter
- **Single-Choice Options**: Role, gender, theme selection
- **Multi-Choice Options**: Skills and operations arrays
- **Interactive Mode**: Automatic fallback when options missing
- **Input Validation**: Age ranges, enum validation
- **Beautiful UI**: Boxen frames, colored output, ASCII art
- **Type Safety**: Full TypeScript implementation

### �💻 System Information (`system`)

System monitoring and information display with beautiful formatting.

```bash
# Basic system info
pnpm cli system info
pnpm sys --detailed --format table

# System monitoring
pnpm cli system monitor --interval 2 --count 10
pnpm cli system health

# Different output formats
pnpm cli system info --format json
pnpm cli system info --no-color
```

**Teaching Points:**
- System API integration (os, fs, child_process)
- Real-time monitoring with intervals
- Cross-platform compatibility
- Data formatting and units conversion
- Background processes and signal handling
- Health checks and status indicators

### ⚙️ Configuration (`config`)

Comprehensive configuration management with validation and import/export.

```bash
# Basic configuration
pnpm cli config get theme
pnpm cli config get --all --format table
pnpm cli config set theme dark
pnpm cli config list

# Advanced operations
pnpm cli config setup  # Interactive setup
pnpm cli config reset --key theme
pnpm cli config export my-config.json
pnpm cli config import my-config.json --merge

# Validation and help
pnpm cli config set maxItems 150
pnpm cli config set invalidKey value  # Shows validation error
```

**Teaching Points:**
- Configuration file management
- Data validation with custom validators
- Import/export functionality
- Interactive configuration setup
- Default values and reset functionality
- Merge vs replace operations

## 🎓 Teaching Notes

### Commander.js Core Concepts

#### 1. **Program Structure**
```typescript
const program = new Command();

program
  .name('my-cli')
  .description('CLI description')
  .version('1.0.0');
```

#### 2. **Commands and Subcommands**
```typescript
// Main command
const userCmd = program.command('user');

// Subcommand
userCmd
  .command('add <name>')
  .description('Add a user')
  .action((name) => {
    // Command logic
  });
```

#### 3. **Options**
```typescript
// Various option types
.option('-f, --force', 'force operation')           // Boolean
.option('-c, --count <number>', 'item count', parseInt)  // With parser
.option('-t, --type <type>', 'type', 'default')     // With default
.option('--no-color', 'disable colors')             // Negatable
```

#### 4. **Arguments**
```typescript
.command('create <name> [description]')  // Required and optional
.command('copy <source> <dest>')         // Multiple required
.command('list [items...]')               // Variadic
```

#### 5. **Help System**
```typescript
.addHelpText('before', 'Custom help header')
.addHelpText('after', 'Examples and additional info')
.helpOption('-h, --help', 'show help')
```

#### 6. **Error Handling**
```typescript
program.exitOverride();  // For testing
program.configureOutput({
  writeErr: (str) => process.stdout.write(`[ERR] ${str}`)
});
```

### Advanced Features Demonstrated

#### 1. **Hooks and Middleware**
```typescript
program.hook('preAction', (thisCommand, actionCommand) => {
  if (program.opts().debug) {
    console.log('Debug info...');
  }
});
```

#### 2. **Custom Help**
```typescript
program.addHelpText('after', () => {
  return `
Examples:
  $ my-cli command --option value
  $ my-cli other-command
`;
});
```

#### 3. **Action Handlers**
```typescript
.action(async (arg1, arg2, options, command) => {
  // arg1, arg2: command arguments
  // options: parsed options object
  // command: the command object itself
});
```

#### 4. **Validation**
```typescript
.option('-p, --port <number>', 'port number', (value) => {
  const parsed = parseInt(value);
  if (isNaN(parsed) || parsed < 1 || parsed > 65535) {
    throw new InvalidArgumentError('Port must be 1-65535');
  }
  return parsed;
});
```

## 🔧 Advanced Features

### 1. **Global Options**
- `--debug`: Enable debug mode with detailed logging
- `--config <path>`: Specify custom config file location
- `--no-color`: Disable colored output for CI/CD environments

### 2. **Interactive Mode**
Many commands support `--interactive` flag for guided input:
```bash
pnpm cli user add --interactive
pnpm cli task add --interactive
pnpm cli config setup
```

### 3. **Output Formats**
Multiple output formats supported:
- `--format simple`: Human-readable format (default)
- `--format table`: Structured table output
- `--format json`: Machine-readable JSON

### 4. **Data Persistence**
- Users stored in `users.json`
- Tasks stored in `tasks.json`
- Configuration in `config.json`
- Automatic file creation and validation

### 5. **Error Recovery**
- Graceful error handling with helpful messages
- Validation errors with suggestions
- Confirmation prompts for destructive operations
- Backup and restore capabilities

## 🏆 Best Practices Implemented

### 1. **Command Design**
- ✅ Clear, descriptive command names
- ✅ Consistent option naming conventions
- ✅ Logical command grouping
- ✅ Helpful error messages
- ✅ Progress indicators for long operations

### 2. **User Experience**
- ✅ Beautiful, colorful output
- ✅ Interactive prompts when needed
- ✅ Comprehensive help system
- ✅ Examples and usage guidance
- ✅ Confirmation for destructive operations

### 3. **Code Organization**
- ✅ Modular command structure
- ✅ Separation of concerns
- ✅ Reusable utility functions
- ✅ Consistent error handling
- ✅ Type validation and conversion

### 4. **Production Readiness**
- ✅ Comprehensive error handling
- ✅ Input validation and sanitization
- ✅ Configuration management
- ✅ Cross-platform compatibility
- ✅ Performance considerations

## 🎯 Demo Scenarios for Teaching

### Scenario 1: Basic CLI Creation
Start with a simple command and gradually add features:
1. Create basic program structure
2. Add first command with arguments
3. Add options and validation
4. Implement help system

### Scenario 2: File Operations
Demonstrate practical file handling:
1. File creation with templates
2. Reading with options (lines, stats)
3. Directory listing with filters
4. Error handling for missing files

### Scenario 3: Data Management
Show CRUD operations:
1. JSON file storage
2. Validation and error handling
3. Search and filtering
4. Formatted output options

### Scenario 4: System Integration
Connect with system APIs:
1. OS information gathering
2. Real-time monitoring
3. Cross-platform considerations
4. Background processes

### Scenario 5: Configuration
Advanced configuration handling:
1. Default values and validation
2. Interactive setup
3. Import/export functionality
4. Environment-specific configs

## 🚀 Running the Demo

```bash
# Development mode (with watch)
pnpm dev

# Run CLI directly
pnpm cli --help
pnpm start

# Build TypeScript
pnpm build

# Type checking
pnpm type-check
```

## 📁 Project Structure

```
commander-js-demo/
├── src/
│   ├── index.ts              # Main CLI entry point
│   ├── commands/             # Command modules
│   │   ├── files.ts         # File operations
│   │   ├── profile.ts       # Profile management ⭐
│   │   ├── users.ts         # User CRUD
│   │   ├── tasks.ts         # Task management  
│   │   ├── system.ts        # System monitoring
│   │   └── config.ts        # Configuration
│   └── types/
│       └── index.ts         # TypeScript definitions
├── demo-files/              # 📁 Created files go here
├── dist/                    # Compiled JavaScript
├── docs/                    # Training materials
└── package.json            # 40+ pnpm scripts

# Files created by CLI commands are stored in demo-files/ directory
# This keeps the project root clean and organized
```

## 📦 Dependencies Explained

- **commander**: The core CLI framework
- **chalk**: Terminal colors and styling
- **ora**: Elegant terminal spinners
- **inquirer**: Interactive command line prompts
- **figlet**: ASCII art text generation
- **boxen**: Beautiful boxes in terminal
- **gradient-string**: Gradient colored strings
- **cli-table3**: Pretty unicode tables

## 📝 License

MIT License - Feel free to use this demo for educational purposes.

## 🎯 Perfect for Training

This demo is specifically designed for:

- **Office presentations** on Commander.js
- **Hands-on workshops** with real examples  
- **Code reviews** showing best practices
- **TypeScript integration** demonstration
- **Modern CLI development** patterns

### Key Training Features

- ✅ **40+ pnpm shortcuts** for easy command execution
- ✅ **Beautiful UI** with colors, spinners, and boxes
- ✅ **Multiple input patterns** (args, options, interactive)  
- ✅ **TypeScript implementation** with full type safety
- ✅ **Real-world examples** that developers can relate to
- ✅ **Clean project structure** following best practices
- ✅ **Comprehensive documentation** for self-learning

---

**Author**: Milan Dadhaniya  
**Purpose**: Commander.js comprehensive demonstration for team training  
**Version**: TypeScript Edition  
**Last Updated**: September 2025

> Ready to impress your colleagues with this professional CLI demo! 🚀
