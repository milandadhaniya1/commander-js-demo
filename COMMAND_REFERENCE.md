# Commander.js Demo - Complete Command Reference

## 📖 Table of Contents

1. [File Operations](#file-operations)
2. [Profile Management](#profile-management)
3. [User Management](#user-management)
4. [System Information](#system-information)
5. [Task Management](#task-management)
6. [Configuration](#configuration)
7. [General Commands](#general-commands)

---

## 📁 File Operations

### Overview
The file commands demonstrate basic file system operations with validation, templates, and beautiful UI.

### Commands

#### `file create <filename> [options]`
Create a new file with optional content and templates.

**Usage:**
```bash
# Basic file creation
pnpm cli file create test.txt

# With content
pnpm cli file create greeting.txt --content "Hello World!"

# Using templates
pnpm cli file create config.json --template json
pnpm cli file create script.js --template js
pnpm cli file create README.md --template md
pnpm cli file create index.html --template html

# Force overwrite existing files
pnpm cli file create existing.txt --content "New content" --force
```

**Options:**
- `-c, --content <text>` - File content
- `-t, --template <type>` - Template type (json, js, md, html, text)
- `-f, --force` - Overwrite existing files

**Templates Available:**
- `json` - JSON configuration template
- `js` - JavaScript file with basic structure
- `md` - Markdown template with headers
- `html` - HTML5 boilerplate
- `text` - Plain text (default)

---

#### `file read <filename> [options]`
Read and display file contents with formatting options.

**Usage:**
```bash
# Basic file reading
pnpm cli file read package.json

# Show file statistics
pnpm cli file read large-file.txt --stats

# Read specific number of lines
pnpm cli file read log.txt --lines 10

# Read with encoding
pnpm cli file read data.txt --encoding utf8
```

**Options:**
- `-s, --stats` - Show file statistics
- `-l, --lines <number>` - Limit number of lines to display
- `-e, --encoding <type>` - File encoding (default: utf8)

---

#### `file list [directory] [options]`
List files and directories with various display options.

**Usage:**
```bash
# List current directory
pnpm cli file list

# List specific directory
pnpm cli file list ./src

# Detailed listing with file info
pnpm cli file list --detailed

# Filter by extension
pnpm cli file list --ext .ts

# Show hidden files
pnpm cli file list --all

# Sort by different criteria
pnpm cli file list --sort size
pnpm cli file list --sort date
pnpm cli file list --sort name
```

**Options:**
- `-d, --detailed` - Show detailed file information
- `-a, --all` - Include hidden files
- `-e, --ext <extension>` - Filter by file extension
- `-s, --sort <criteria>` - Sort by: name, size, date, type

---

#### `file delete <filename> [options]`
Delete files with confirmation and backup options.

**Usage:**
```bash
# Delete with confirmation
pnpm cli file delete old-file.txt

# Force delete without confirmation
pnpm cli file delete temp.txt --force

# Create backup before deletion
pnpm cli file delete important.txt --backup
```

**Options:**
- `-f, --force` - Skip confirmation prompt
- `-b, --backup` - Create backup before deletion

---

#### `file copy <source> <destination> [options]`
Copy files with various options and validations.

**Usage:**
```bash
# Basic copy
pnpm cli file copy source.txt backup.txt

# Overwrite existing destination
pnpm cli file copy data.json data-backup.json --force

# Preserve file attributes
pnpm cli file copy important.txt backup/ --preserve
```

**Options:**
- `-f, --force` - Overwrite destination if exists
- `-p, --preserve` - Preserve file timestamps and permissions

---

## 👤 Profile Management

### Overview
Advanced profile management demonstrating multiple input types, interactive prompts, and data validation.

### Key Features
- **Multiple Input Methods**: Command-line arguments or interactive prompts
- **Data Types**: Required arguments, single-choice options, multi-choice selections
- **Validation**: Email validation, age ranges, required fields
- **Output Formats**: Box, table, or JSON display

### Commands

#### `profile create [name] [options]`
Create a new user profile with comprehensive information.

**Usage:**
```bash
# Interactive mode (no arguments)
pnpm cli profile create

# Interactive mode with name
pnpm cli profile create john

# Complete profile with all options
pnpm cli profile create sarah --role developer --age 28 --gender female --theme dark --skills javascript,typescript,react --operations validate,save,welcome

# Force interactive mode even with options
pnpm cli profile create mike --interactive
```

**Options:**
- `-r, --role <type>` - User role: admin, developer, designer, user
- `-a, --age <number>` - User age (16-100)
- `-g, --gender <gender>` - Gender: male, female, other, prefer-not-to-say
- `-e, --email <email>` - Email address (validated)
- `-t, --theme <theme>` - UI theme: default, dark, light, rainbow
- `-s, --skills <skills>` - Comma-separated skills list
- `-o, --operations <ops>` - Operations: validate, save, email, setup, analytics, welcome
- `-i, --interactive` - Force interactive mode
- `-f, --format <format>` - Output format: box, table, json

**Available Skills:**
- `javascript` - JavaScript programming
- `typescript` - TypeScript programming
- `react` - React framework
- `nodejs` - Node.js runtime
- `python` - Python programming
- `java` - Java programming
- `css` - CSS/SCSS styling
- `sql` - SQL databases
- `docker` - Container technology
- `aws` - Amazon Web Services

**Operations:**
- `validate` - Validate profile data
- `save` - Save to database
- `email` - Send welcome email
- `setup` - Configure permissions
- `analytics` - Track creation event
- `welcome` - Show welcome message

---

#### `profile view <name> [options]`
View an existing profile in different formats.

**Usage:**
```bash
# Default box format
pnpm cli profile view john

# Table format
pnpm cli profile view sarah --format table

# JSON format
pnpm cli profile view mike --format json
```

**Options:**
- `-f, --format <format>` - Display format: box, table, json

---

#### `profile list [options]`
List all profiles with filtering and formatting options.

**Usage:**
```bash
# List all profiles
pnpm cli profile list

# Simple format
pnpm cli profile list --format simple

# Filter by role
pnpm cli profile list --role developer

# Filter by theme
pnpm cli profile list --theme dark
```

**Options:**
- `-f, --format <format>` - Display format: table, simple
- `--role <role>` - Filter by user role
- `--theme <theme>` - Filter by theme preference

---

#### `profile update <name> [options]`
Update an existing profile.

**Usage:**
```bash
# Interactive update
pnpm cli profile update john --interactive

# Update specific fields
pnpm cli profile update sarah --role admin --theme light

# Update skills
pnpm cli profile update mike --skills python,docker,aws
```

**Options:**
- `-i, --interactive` - Use interactive mode
- `-r, --role <type>` - New role
- `-t, --theme <theme>` - New theme
- `-s, --skills <skills>` - New skills list

---

#### `profile delete <name> [options]`
Delete a profile with confirmation.

**Usage:**
```bash
# Delete with confirmation
pnpm cli profile delete john

# Force delete without confirmation
pnpm cli profile delete temp-user --force
```

**Options:**
- `-f, --force` - Skip confirmation prompt

---

## 👥 User Management

### Overview
CRUD operations for user management with search, validation, and different display formats.

### Commands

#### `user add [name] [email] [options]`
Add a new user to the system.

**Usage:**
```bash
# Interactive mode
pnpm cli user add

# With parameters
pnpm cli user add "John Doe" john@example.com

# With additional options
pnpm cli user add "Jane Smith" jane@example.com --role admin --age 30
```

**Options:**
- `-r, --role <type>` - User role (admin, user, moderator)
- `-a, --age <number>` - User age
- `-p, --phone <number>` - Phone number

---

#### `user list [options]`
List all users with various display options.

**Usage:**
```bash
# Basic listing
pnpm cli user list

# Table format
pnpm cli user list --format table

# JSON format
pnpm cli user list --format json

# Filter by role
pnpm cli user list --role admin

# Sort by different fields
pnpm cli user list --sort name
pnpm cli user list --sort email
pnpm cli user list --sort age
```

**Options:**
- `-f, --format <format>` - Display format: table, json, simple
- `-r, --role <role>` - Filter by role
- `-s, --sort <field>` - Sort by: name, email, age, created

---

#### `user search [options]`
Search users by various criteria.

**Usage:**
```bash
# Interactive search
pnpm cli user search

# Search by name
pnpm cli user search --name "John"

# Search by email domain
pnpm cli user search --email "@example.com"

# Search by role
pnpm cli user search --role admin
```

**Options:**
- `-n, --name <name>` - Search by name
- `-e, --email <email>` - Search by email
- `-r, --role <role>` - Search by role

---

## 💻 System Information

### Overview
System monitoring and information commands with real-time updates and health checks.

### Commands

#### `system info [options]`
Display system information and statistics.

**Usage:**
```bash
# Basic system info
pnpm cli system info

# Detailed information
pnpm cli system info --detailed

# JSON format for scripting
pnpm cli system info --format json

# Specific information types
pnpm cli system info --cpu
pnpm cli system info --memory
pnpm cli system info --disk
```

**Options:**
- `-d, --detailed` - Show detailed information
- `-f, --format <format>` - Output format: table, json
- `--cpu` - Show only CPU information
- `--memory` - Show only memory information
- `--disk` - Show only disk information

---

#### `system health [options]`
Perform system health check.

**Usage:**
```bash
# Basic health check
pnpm cli system health

# Detailed health report
pnpm cli system health --detailed

# Check specific components
pnpm cli system health --check memory,disk,cpu
```

**Options:**
- `-d, --detailed` - Detailed health report
- `-c, --check <components>` - Check specific components

---

#### `system monitor [options]`
Monitor system resources in real-time.

**Usage:**
```bash
# Start monitoring
pnpm cli system monitor

# Monitor with custom interval
pnpm cli system monitor --interval 2000

# Limited monitoring session
pnpm cli system monitor --count 10

# Monitor specific resources
pnpm cli system monitor --cpu --memory
```

**Options:**
- `-i, --interval <ms>` - Update interval in milliseconds
- `-c, --count <number>` - Number of updates before stopping
- `--cpu` - Monitor CPU only
- `--memory` - Monitor memory only

---

## 📋 Task Management

### Overview
Task management system with priorities, due dates, and status tracking.

### Commands

#### `task add <title> [options]`
Add a new task to the task list.

**Usage:**
```bash
# Basic task
pnpm cli task add "Complete project documentation"

# Task with priority and due date
pnpm cli task add "Review code" --priority high --due "2024-12-31"

# Task with description
pnpm cli task add "Setup CI/CD" --description "Configure GitHub Actions workflow"
```

**Options:**
- `-p, --priority <level>` - Priority: low, medium, high, urgent
- `-d, --due <date>` - Due date (YYYY-MM-DD format)
- `-t, --description <text>` - Task description
- `-a, --assignee <name>` - Assign to user

---

#### `task list [options]`
List tasks with filtering and sorting options.

**Usage:**
```bash
# List all tasks
pnpm cli task list

# Filter by status
pnpm cli task list --status pending
pnpm cli task list --status completed

# Filter by priority
pnpm cli task list --priority high

# Sort by due date
pnpm cli task list --sort due

# Different display formats
pnpm cli task list --format table
pnpm cli task list --format json
```

**Options:**
- `-s, --status <status>` - Filter by: pending, completed, in-progress
- `-p, --priority <priority>` - Filter by priority level
- `-f, --format <format>` - Display format: table, json, simple
- `--sort <field>` - Sort by: created, due, priority, title

---

#### `task complete <id> [options]`
Mark a task as completed.

**Usage:**
```bash
# Complete a task
pnpm cli task complete 1

# Complete with notes
pnpm cli task complete 2 --notes "Finished ahead of schedule"
```

**Options:**
- `-n, --notes <text>` - Completion notes

---

#### `task update <id> [options]`
Update an existing task.

**Usage:**
```bash
# Update task title
pnpm cli task update 1 --title "New task title"

# Update priority and due date
pnpm cli task update 2 --priority urgent --due "2024-12-25"

# Interactive update
pnpm cli task update 3 --interactive
```

**Options:**
- `-t, --title <title>` - New task title
- `-p, --priority <level>` - New priority
- `-d, --due <date>` - New due date
- `-i, --interactive` - Interactive update mode

---

## ⚙️ Configuration

### Overview
Configuration management with JSON/YAML support, import/export, and validation.

### Commands

#### `config get [key] [options]`
Get configuration values.

**Usage:**
```bash
# Get all configuration
pnpm cli config get

# Get specific key
pnpm cli config get theme

# Get with JSON output
pnpm cli config get --format json

# Get nested keys
pnpm cli config get database.host
```

**Options:**
- `-f, --format <format>` - Output format: table, json, simple
- `-a, --all` - Show all configuration including defaults

---

#### `config set <key> <value> [options]`
Set configuration values.

**Usage:**
```bash
# Set simple value
pnpm cli config set theme dark

# Set nested value
pnpm cli config set database.host localhost

# Set with validation
pnpm cli config set port 3000 --validate

# Force set (skip validation)
pnpm cli config set debug true --force
```

**Options:**
- `-v, --validate` - Validate value before setting
- `-f, --force` - Skip validation
- `-t, --type <type>` - Value type: string, number, boolean, json

---

#### `config list [options]`
List all configuration with filtering.

**Usage:**
```bash
# List all configuration
pnpm cli config list

# List with different formats
pnpm cli config list --format json
pnpm cli config list --format yaml

# Show only modified values
pnpm cli config list --modified

# Filter by key pattern
pnpm cli config list --filter "database.*"
```

**Options:**
- `-f, --format <format>` - Output format: table, json, yaml
- `-m, --modified` - Show only non-default values
- `--filter <pattern>` - Filter keys by pattern

---

#### `config reset [key] [options]`
Reset configuration to defaults.

**Usage:**
```bash
# Reset all configuration
pnpm cli config reset

# Reset specific key
pnpm cli config reset theme

# Reset with confirmation
pnpm cli config reset --confirm

# Force reset without prompts
pnpm cli config reset --force
```

**Options:**
- `-c, --confirm` - Ask for confirmation
- `-f, --force` - Skip all confirmations

---

#### `config export [file] [options]`
Export configuration to file.

**Usage:**
```bash
# Export to default file
pnpm cli config export

# Export to specific file
pnpm cli config export my-config.json

# Export in different formats
pnpm cli config export config.yaml --format yaml
pnpm cli config export config.env --format env

# Export only modified values
pnmp config:export --modified
```

**Options:**
- `-f, --format <format>` - Export format: json, yaml, env
- `-m, --modified` - Export only non-default values
- `-p, --pretty` - Pretty-print JSON output

---

#### `config import <file> [options]`
Import configuration from file.

**Usage:**
```bash
# Import from file
pnpm cli config import config.json

# Import with merge
pnpm cli config import new-config.json --merge

# Import with validation
pnpm cli config import config.yaml --validate

# Dry run (preview changes)
pnpm cli config import config.json --dry-run
```

**Options:**
- `-m, --merge` - Merge with existing configuration
- `-v, --validate` - Validate before importing
- `-d, --dry-run` - Preview changes without applying
- `-f, --force` - Force import (skip confirmations)

---

## 🚀 General Commands

### Overview
Utility commands for help, examples, and system integration.

### Commands

#### `examples`
Show comprehensive usage examples for all commands.

**Usage:**
```bash
pnpm examples
```

Shows examples for:
- File operations with different options
- Profile creation methods
- User management workflows  
- System monitoring commands
- Task management scenarios
- Configuration management

---

#### `list-commands`
List all available pnpm commands for easy discovery.

**Usage:**
```bash
pnpm commands
```

Displays categorized list of all available commands with descriptions.

---

#### `help`
Get help for any command or the entire CLI.

**Usage:**
```bash
# General help
pnpm cli --help

# Command-specific help
pnpm cli file --help
pnmp cli profile create --help
pnpm cli user add --help
```

---

## 🎯 Command Patterns

### Common Option Patterns

**Output Formats:**
- `--format table` - Tabular display
- `--format json` - JSON output for scripting
- `--format simple` - Minimal text output

**Interactive Mode:**
- `--interactive` - Force interactive prompts
- Most commands auto-detect when to use interactive mode

**Force Operations:**
- `--force` - Skip confirmations and overwrite files
- `--no-backup` - Skip creating backups

**Filtering and Sorting:**
- `--filter <pattern>` - Filter results by pattern
- `--sort <field>` - Sort by different fields
- `--limit <number>` - Limit number of results

---

## 🔧 Tips and Best Practices

### 1. Tab Completion
Use `pnpm [TAB]` to see all available commands.

### 2. Command Discovery
Run `pnpm commands` to see all available operations.

### 3. Interactive Mode
When in doubt, run commands without options to trigger interactive mode.

### 4. Help System
Every command supports `--help` for detailed usage information.

### 5. Output Formats
Use `--format json` for scripting and automation.

### 6. Validation
Commands include built-in validation for emails, dates, file paths, etc.

### 7. Error Handling
All commands provide clear error messages and suggestions.

---

*This documentation covers the complete TypeScript implementation of the Commander.js demo with all available commands and options.*
