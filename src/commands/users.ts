import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import Table from 'cli-table3';
import boxen from 'boxen';
import type { Command } from 'commander';
import type { User, UserOptions } from '../types/index';

const USERS_FILE = path.resolve('./users.json');

// Helper functions
async function loadUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data) as User[];
  } catch (error) {
    return [];
  }
}

async function saveUsers(users: User[]): Promise<void> {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function userCommands(program: Command): void {
  const userCmd = program
    .command('user')
    .description('👥 User management operations')
    .addHelpText('after', `

Examples:
  $ pnpm cli user add "John Doe" john@example.com
  $ pnpm cli user add --interactive
  $ pnpm cli user list --format table
  $ pnpm cli user search --name "John"
  $ pnpm cli user update user123 --email newemail@example.com
  $ pnpm cli user delete user123 --force
`);

  // Add user command
  userCmd
    .command('add [name] [email]')
    .description('➕ Add a new user')
    .option('-i, --interactive', 'interactive mode')
    .option('-r, --role <role>', 'user role', 'user')
    .option('--age <age>', 'user age', parseInt)
    .option('--phone <phone>', 'phone number')
    .action(async (name: string | undefined, email: string | undefined, options: UserOptions) => {
      try {
        let userData: Partial<User> = { 
          name, 
          email, 
          role: (options.role as User['role']) || 'user'
        };
        
        // Interactive mode or missing required fields
        if (options.interactive || !name || !email) {
          console.log(chalk.cyan('🎯 Interactive User Creation\n'));
          
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'name',
              message: 'Enter user name:',
              default: name,
              validate: (input: string) => input.trim().length > 0 || 'Name is required'
            },
            {
              type: 'input',
              name: 'email',
              message: 'Enter email address:',
              default: email,
              validate: (input: string) => validateEmail(input) || 'Please enter a valid email'
            },
            {
              type: 'list',
              name: 'role',
              message: 'Select user role:',
              choices: ['admin', 'user', 'moderator', 'guest'],
              default: options.role
            },
            {
              type: 'number',
              name: 'age',
              message: 'Enter age (optional):',
              default: options.age
            },
            {
              type: 'input',
              name: 'phone',
              message: 'Enter phone number (optional):',
              default: options.phone
            }
          ]);
          
          userData = { ...userData, ...answers };
        }
        
        // Validate required fields
        if (!userData.name || !userData.email) {
          console.error(chalk.red('❌ Name and email are required!'));
          return;
        }
        
        if (!validateEmail(userData.email)) {
          console.error(chalk.red('❌ Please provide a valid email address!'));
          return;
        }
        
        const spinner = ora('Adding user...').start();
        
        const users = await loadUsers();
        
        // Check for duplicate email
        const existingUser = users.find(u => u.email === userData.email);
        if (existingUser) {
          spinner.fail(chalk.red('❌ User with this email already exists!'));
          return;
        }
        
        const newUser: User = {
          id: generateId(),
          name: userData.name,
          email: userData.email,
          role: userData.role as User['role'] || 'user',
          age: userData.age,
          phone: userData.phone,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        users.push(newUser);
        await saveUsers(users);
        
        spinner.succeed(chalk.green('✅ User added successfully!'));
        
        console.log(boxen(
          `${chalk.bold('ID:')} ${newUser.id}\n` +
          `${chalk.bold('Name:')} ${newUser.name}\n` +
          `${chalk.bold('Email:')} ${newUser.email}\n` +
          `${chalk.bold('Role:')} ${newUser.role}\n` +
          `${chalk.bold('Created:')} ${new Date(newUser.createdAt).toLocaleString()}`,
          {
            padding: 1,
            borderColor: 'green'
          }
        ));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(chalk.red(`❌ Error adding user: ${errorMessage}`));
      }
    });

  // List users command
  userCmd
    .command('list')
    .description('📋 List all users')
    .option('-f, --format <format>', 'output format (table, json, simple)', 'simple')
    .option('-r, --role <role>', 'filter by role')
    .option('-s, --sort <field>', 'sort by field (name, email, role, createdAt)', 'name')
    .option('--limit <number>', 'limit number of results', parseInt)
    .action(async (options: UserOptions) => {
      const spinner = ora('Loading users...').start();
      
      try {
        let users = await loadUsers();
        
        if (users.length === 0) {
          spinner.warn(chalk.yellow('No users found. Add some users first!'));
          return;
        }
        
        // Filter by role
        if (options.role) {
          users = users.filter(user => user.role === options.role);
        }
        
        // Sort users
        const sortField = options.sort as keyof User || 'name';
        users.sort((a, b) => {
          const fieldA = String(a[sortField] || '').toLowerCase();
          const fieldB = String(b[sortField] || '').toLowerCase();
          return fieldA.localeCompare(fieldB);
        });
        
        // Limit results
        if (options.limit) {
          users = users.slice(0, options.limit);
        }
        
        spinner.succeed(chalk.green(`✅ Found ${users.length} users`));
        
        // Display based on format
        if (options.format === 'json') {
          console.log(JSON.stringify(users, null, 2));
        } else if (options.format === 'table') {
          const table = new Table({
            head: ['ID', 'Name', 'Email', 'Role', 'Created'].map(h => chalk.cyan(h)),
            style: { border: ['gray'] }
          });
          
          users.forEach(user => {
            table.push([
              user.id,
              user.name,
              user.email,
              chalk.yellow(user.role),
              new Date(user.createdAt).toLocaleDateString()
            ]);
          });
          
          console.log(table.toString());
        } else {
          console.log(chalk.bold.cyan('\n👥 Users List:\n'));
          users.forEach((user, index) => {
            console.log(`${index + 1}. ${chalk.white.bold(user.name)} ${chalk.gray(`(${user.id})`)}`);
            console.log(`   📧 ${user.email}`);
            console.log(`   👤 ${chalk.yellow(user.role)}`);
            console.log(`   📅 ${new Date(user.createdAt).toLocaleString()}`);
            console.log();
          });
        }
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        spinner.fail(chalk.red(`❌ Error loading users: ${errorMessage}`));
      }
    });

  // Search users command
  userCmd
    .command('search')
    .description('🔍 Search users')
    .option('-n, --name <name>', 'search by name')
    .option('-e, --email <email>', 'search by email')
    .option('-r, --role <role>', 'search by role')
    .option('-i, --case-insensitive', 'case insensitive search')
    .action(async (options: UserOptions) => {
      const spinner = ora('Searching users...').start();
      
      try {
        const users = await loadUsers();
        
        if (users.length === 0) {
          spinner.warn(chalk.yellow('No users found in database!'));
          return;
        }
        
        let results = users;
        
        // Apply filters
        if (options.name) {
          const searchName = options.caseInsensitive ? options.name.toLowerCase() : options.name;
          results = results.filter(user => {
            const userName = options.caseInsensitive ? user.name.toLowerCase() : user.name;
            return userName.includes(searchName);
          });
        }
        
        if (options.email) {
          const searchEmail = options.caseInsensitive ? options.email.toLowerCase() : options.email;
          results = results.filter(user => {
            const userEmail = options.caseInsensitive ? user.email.toLowerCase() : user.email;
            return userEmail.includes(searchEmail);
          });
        }
        
        if (options.role) {
          results = results.filter(user => user.role === options.role);
        }
        
        spinner.succeed(chalk.green(`✅ Found ${results.length} matching users`));
        
        if (results.length === 0) {
          console.log(chalk.yellow('No users match your search criteria.'));
          return;
        }
        
        console.log(chalk.bold.cyan('\n🔍 Search Results:\n'));
        results.forEach((user, index) => {
          console.log(`${index + 1}. ${chalk.white.bold(user.name)} ${chalk.gray(`(${user.id})`)}`);
          console.log(`   📧 ${user.email}`);
          console.log(`   👤 ${chalk.yellow(user.role)}`);
          console.log();
        });
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        spinner.fail(chalk.red(`❌ Error searching users: ${errorMessage}`));
      }
    });

  // Update user command (simplified for brevity)
  userCmd
    .command('update <userId>')
    .description('✏️ Update user information')
    .option('-n, --name <name>', 'update name')
    .option('-e, --email <email>', 'update email')
    .option('-r, --role <role>', 'update role')
    .option('--phone <phone>', 'update phone')
    .option('--age <age>', 'update age', parseInt)
    .action(async (userId: string, options: UserOptions) => {
      try {
        const users = await loadUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
          console.error(chalk.red(`❌ User with ID ${userId} not found!`));
          return;
        }

        const spinner = ora('Updating user...').start();
        const user = users[userIndex];
        
        // Apply updates
        const updates: Partial<User> = {};
        if (options.name) updates.name = options.name;
        if (options.email) updates.email = options.email;
        if (options.role) updates.role = options.role as User['role'];
        if (options.phone !== undefined) updates.phone = options.phone;
        if (options.age !== undefined) updates.age = options.age;
        
        users[userIndex] = {
          ...user,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        await saveUsers(users);
        spinner.succeed(chalk.green('✅ User updated successfully!'));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(chalk.red(`❌ Error updating user: ${errorMessage}`));
      }
    });

  // Delete user command
  userCmd
    .command('delete <userId>')
    .description('🗑️ Delete a user')
    .option('-f, --force', 'force delete without confirmation')
    .action(async (userId: string, options: UserOptions) => {
      try {
        const users = await loadUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
          console.error(chalk.red(`❌ User with ID ${userId} not found!`));
          return;
        }
        
        const user = users[userIndex];
        
        if (!options.force) {
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Are you sure you want to delete user "${user.name}" (${user.email})?`,
              default: false
            }
          ]);
          
          if (!confirm) {
            console.log(chalk.yellow('Operation cancelled.'));
            return;
          }
        }
        
        const spinner = ora('Deleting user...').start();
        
        users.splice(userIndex, 1);
        await saveUsers(users);
        
        spinner.succeed(chalk.green(`✅ User "${user.name}" deleted successfully!`));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(chalk.red(`❌ Error deleting user: ${errorMessage}`));
      }
    });

  // Clear all users command
  userCmd
    .command('clear')
    .description('🧹 Clear all users')
    .option('-f, --force', 'force clear without confirmation')
    .action(async (options: UserOptions) => {
      try {
        const users = await loadUsers();
        
        if (users.length === 0) {
          console.log(chalk.yellow('No users to clear.'));
          return;
        }
        
        if (!options.force) {
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Are you sure you want to delete all ${users.length} users?`,
              default: false
            }
          ]);
          
          if (!confirm) {
            console.log(chalk.yellow('Operation cancelled.'));
            return;
          }
        }
        
        const spinner = ora('Clearing all users...').start();
        
        await saveUsers([]);
        
        spinner.succeed(chalk.green(`✅ All ${users.length} users cleared!`));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(chalk.red(`❌ Error clearing users: ${errorMessage}`));
      }
    });
}
