import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import Table from 'cli-table3';
import boxen from 'boxen';

const TASKS_FILE = path.resolve('./tasks.json');

// Helper functions
async function loadTasks() {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveTasks(tasks) {
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUSES = ['pending', 'in-progress', 'completed', 'cancelled'];

function getPriorityIcon(priority) {
  const icons = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    urgent: '🔴'
  };
  return icons[priority] || '⚪';
}

function getStatusIcon(status) {
  const icons = {
    pending: '⏳',
    'in-progress': '🔄',
    completed: '✅',
    cancelled: '❌'
  };
  return icons[status] || '❓';
}

export function taskCommands(program) {
  const taskCmd = program
    .command('task')
    .alias('tasks')
    .description('📋 Task management system')
    .addHelpText('after', `

Examples:
  $ demo-cli task add "Complete project documentation"
  $ demo-cli task add "Fix bug" --priority high --due "2024-01-15"
  $ demo-cli task list --status pending
  $ demo-cli task list --priority high --format table
  $ demo-cli task complete task123
  $ demo-cli task update task123 --priority urgent
  $ demo-cli task search --text "documentation"
`);

  // Add task command
  taskCmd
    .command('add <title>')
    .description('➕ Add a new task')
    .option('-d, --description <desc>', 'task description')
    .option('-p, --priority <priority>', 'task priority (low, medium, high, urgent)', 'medium')
    .option('--due <date>', 'due date (YYYY-MM-DD)')
    .option('-t, --tags <tags>', 'comma-separated tags')
    .option('-i, --interactive', 'interactive mode')
    .action(async (title, options) => {
      try {
        let taskData = {
          title,
          description: options.description || '',
          priority: options.priority,
          due: options.due,
          tags: options.tags ? options.tags.split(',').map(t => t.trim()) : []
        };
        
        // Interactive mode
        if (options.interactive) {
          console.log(chalk.cyan('🎯 Interactive Task Creation\n'));
          
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'title',
              message: 'Task title:',
              default: title,
              validate: (input) => input.trim().length > 0 || 'Title is required'
            },
            {
              type: 'input',
              name: 'description',
              message: 'Task description:',
              default: taskData.description
            },
            {
              type: 'list',
              name: 'priority',
              message: 'Task priority:',
              choices: PRIORITIES.map(p => ({
                name: `${getPriorityIcon(p)} ${p.charAt(0).toUpperCase() + p.slice(1)}`,
                value: p
              })),
              default: taskData.priority
            },
            {
              type: 'input',
              name: 'due',
              message: 'Due date (YYYY-MM-DD, optional):',
              default: taskData.due,
              validate: (input) => {
                if (!input) return true;
                const date = new Date(input);
                return !isNaN(date.getTime()) || 'Please enter a valid date';
              }
            },
            {
              type: 'input',
              name: 'tags',
              message: 'Tags (comma-separated, optional):',
              default: taskData.tags.join(', ')
            }
          ]);
          
          taskData = {
            ...taskData,
            ...answers,
            tags: answers.tags ? answers.tags.split(',').map(t => t.trim()).filter(Boolean) : []
          };
        }
        
        // Validate priority
        if (!PRIORITIES.includes(taskData.priority)) {
          console.error(chalk.red(`❌ Invalid priority. Must be one of: ${PRIORITIES.join(', ')}`));
          return;
        }
        
        // Validate due date
        if (taskData.due) {
          const dueDate = new Date(taskData.due);
          if (isNaN(dueDate.getTime())) {
            console.error(chalk.red('❌ Invalid due date format. Use YYYY-MM-DD'));
            return;
          }
          taskData.due = dueDate.toISOString().split('T')[0]; // Normalize to YYYY-MM-DD
        }
        
        const spinner = ora('Adding task...').start();
        
        const tasks = await loadTasks();
        
        const newTask = {
          id: generateId(),
          ...taskData,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        await saveTasks(tasks);
        
        spinner.succeed(chalk.green('✅ Task added successfully!'));
        
        console.log(boxen(
          `${getPriorityIcon(newTask.priority)} ${chalk.bold(newTask.title)}\n` +
          `${chalk.bold('ID:')} ${newTask.id}\n` +
          `${chalk.bold('Priority:')} ${newTask.priority}\n` +
          `${chalk.bold('Status:')} ${newTask.status}\n` +
          (newTask.description ? `${chalk.bold('Description:')} ${newTask.description}\n` : '') +
          (newTask.due ? `${chalk.bold('Due:')} ${newTask.due}\n` : '') +
          (newTask.tags.length > 0 ? `${chalk.bold('Tags:')} ${newTask.tags.join(', ')}\n` : '') +
          `${chalk.bold('Created:')} ${new Date(newTask.createdAt).toLocaleString()}`,
          {
            padding: 1,
            borderColor: 'green'
          }
        ));
        
      } catch (error) {
        console.error(chalk.red(`❌ Error adding task: ${error.message}`));
      }
    });

  // List tasks command
  taskCmd
    .command('list')
    .description('📋 List tasks')
    .option('-s, --status <status>', 'filter by status (pending, in-progress, completed, cancelled)')
    .option('-p, --priority <priority>', 'filter by priority (low, medium, high, urgent)')
    .option('-t, --tag <tag>', 'filter by tag')
    .option('-f, --format <format>', 'output format (table, json, simple)', 'simple')
    .option('--sort <field>', 'sort by field (title, priority, due, created)', 'created')
    .option('--reverse', 'reverse sort order')
    .option('--limit <number>', 'limit number of results', parseInt)
    .action(async (options) => {
      const spinner = ora('Loading tasks...').start();
      
      try {
        let tasks = await loadTasks();
        
        if (tasks.length === 0) {
          spinner.warn(chalk.yellow('No tasks found. Add some tasks first!'));
          return;
        }
        
        // Apply filters
        if (options.status) {
          tasks = tasks.filter(task => task.status === options.status);
        }
        
        if (options.priority) {
          tasks = tasks.filter(task => task.priority === options.priority);
        }
        
        if (options.tag) {
          tasks = tasks.filter(task => task.tags.includes(options.tag));
        }
        
        // Sort tasks
        tasks.sort((a, b) => {
          let fieldA = a[options.sort];
          let fieldB = b[options.sort];
          
          // Handle priority sorting
          if (options.sort === 'priority') {
            fieldA = PRIORITIES.indexOf(fieldA);
            fieldB = PRIORITIES.indexOf(fieldB);
          }
          
          // Handle date sorting
          if (options.sort === 'created' || options.sort === 'due') {
            fieldA = new Date(fieldA || 0);
            fieldB = new Date(fieldB || 0);
          }
          
          if (fieldA < fieldB) return options.reverse ? 1 : -1;
          if (fieldA > fieldB) return options.reverse ? -1 : 1;
          return 0;
        });
        
        // Limit results
        if (options.limit) {
          tasks = tasks.slice(0, options.limit);
        }
        
        spinner.succeed(chalk.green(`✅ Found ${tasks.length} tasks`));
        
        // Display based on format
        if (options.format === 'json') {
          console.log(JSON.stringify(tasks, null, 2));
          return;
        }
        
        if (options.format === 'table') {
          const table = new Table({
            head: ['ID', 'Title', 'Status', 'Priority', 'Due', 'Tags'].map(h => chalk.cyan(h)),
            style: { border: ['gray'] },
            colWidths: [10, 30, 12, 10, 12, 20]
          });
          
          tasks.forEach(task => {
            table.push([
              task.id,
              task.title.length > 27 ? task.title.substring(0, 24) + '...' : task.title,
              `${getStatusIcon(task.status)} ${task.status}`,
              `${getPriorityIcon(task.priority)} ${task.priority}`,
              task.due || 'N/A',
              task.tags.length > 0 ? task.tags.slice(0, 2).join(', ') + (task.tags.length > 2 ? '...' : '') : 'None'
            ]);
          });
          
          console.log(table.toString());
        } else {
          // Simple format
          console.log(chalk.bold.cyan('\n📋 Tasks List:\n'));
          
          tasks.forEach((task, index) => {
            const statusIcon = getStatusIcon(task.status);
            const priorityIcon = getPriorityIcon(task.priority);
            
            console.log(`${index + 1}. ${statusIcon} ${chalk.white.bold(task.title)} ${chalk.gray(`(${task.id})`)}`);
            console.log(`   ${priorityIcon} ${chalk.yellow(task.priority)} priority | Status: ${chalk.blue(task.status)}`);
            
            if (task.description) {
              console.log(`   📝 ${task.description}`);
            }
            
            if (task.due) {
              const dueDate = new Date(task.due);
              const isOverdue = dueDate < new Date() && task.status !== 'completed';
              const dueDateStr = isOverdue ? chalk.red(task.due) : chalk.green(task.due);
              console.log(`   📅 Due: ${dueDateStr}`);
            }
            
            if (task.tags.length > 0) {
              console.log(`   🏷️  ${task.tags.map(tag => chalk.cyan(`#${tag}`)).join(' ')}`);
            }
            
            console.log();
          });
        }
        
      } catch (error) {
        spinner.fail(chalk.red(`❌ Error loading tasks: ${error.message}`));
      }
    });

  // Complete task command
  taskCmd
    .command('complete <taskId>')
    .description('✅ Mark task as completed')
    .action(async (taskId) => {
      try {
        const tasks = await loadTasks();
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) {
          console.error(chalk.red(`❌ Task with ID ${taskId} not found!`));
          return;
        }
        
        const task = tasks[taskIndex];
        
        if (task.status === 'completed') {
          console.log(chalk.yellow(`Task "${task.title}" is already completed!`));
          return;
        }
        
        const spinner = ora('Completing task...').start();
        
        tasks[taskIndex] = {
          ...task,
          status: 'completed',
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await saveTasks(tasks);
        
        spinner.succeed(chalk.green(`✅ Task "${task.title}" marked as completed!`));
        
      } catch (error) {
        console.error(chalk.red(`❌ Error completing task: ${error.message}`));
      }
    });

  // Update task command
  taskCmd
    .command('update <taskId>')
    .description('✏️ Update task information')
    .option('-t, --title <title>', 'update title')
    .option('-d, --description <desc>', 'update description')
    .option('-p, --priority <priority>', 'update priority')
    .option('-s, --status <status>', 'update status')
    .option('--due <date>', 'update due date')
    .option('--tags <tags>', 'update tags (comma-separated)')
    .option('-i, --interactive', 'interactive mode')
    .action(async (taskId, options) => {
      try {
        const tasks = await loadTasks();
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) {
          console.error(chalk.red(`❌ Task with ID ${taskId} not found!`));
          return;
        }
        
        const task = tasks[taskIndex];
        let updates: any = {};
        
        if (options.interactive) {
          console.log(chalk.cyan(`🎯 Updating task: ${task.title}\n`));
          
          const answers = await inquirer.prompt([
            {
              type: 'input',
              name: 'title',
              message: 'Update title:',
              default: task.title
            },
            {
              type: 'input',
              name: 'description',
              message: 'Update description:',
              default: task.description
            },
            {
              type: 'list',
              name: 'priority',
              message: 'Update priority:',
              choices: PRIORITIES.map(p => ({
                name: `${getPriorityIcon(p)} ${p.charAt(0).toUpperCase() + p.slice(1)}`,
                value: p
              })),
              default: task.priority
            },
            {
              type: 'list',
              name: 'status',
              message: 'Update status:',
              choices: STATUSES.map(s => ({
                name: `${getStatusIcon(s)} ${s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}`,
                value: s
              })),
              default: task.status
            },
            {
              type: 'input',
              name: 'due',
              message: 'Update due date (YYYY-MM-DD):',
              default: task.due
            },
            {
              type: 'input',
              name: 'tags',
              message: 'Update tags (comma-separated):',
              default: task.tags.join(', ')
            }
          ]);
          
          updates = {
            ...answers,
            tags: answers.tags ? answers.tags.split(',').map(t => t.trim()).filter(Boolean) : []
          };
        } else {
          // Use provided options
          if (options.title) updates.title = options.title;
          if (options.description !== undefined) updates.description = options.description;
          if (options.priority) updates.priority = options.priority;
          if (options.status) updates.status = options.status;
          if (options.due !== undefined) updates.due = options.due;
          if (options.tags !== undefined) {
            updates.tags = options.tags ? options.tags.split(',').map(t => t.trim()) : [];
          }
        }
        
        // Validate updates
        if (updates.priority && !PRIORITIES.includes(updates.priority)) {
          console.error(chalk.red(`❌ Invalid priority. Must be one of: ${PRIORITIES.join(', ')}`));
          return;
        }
        
        if (updates.status && !STATUSES.includes(updates.status)) {
          console.error(chalk.red(`❌ Invalid status. Must be one of: ${STATUSES.join(', ')}`));
          return;
        }
        
        if (updates.due) {
          const dueDate = new Date(updates.due);
          if (isNaN(dueDate.getTime())) {
            console.error(chalk.red('❌ Invalid due date format. Use YYYY-MM-DD'));
            return;
          }
          updates.due = dueDate.toISOString().split('T')[0];
        }
        
        const spinner = ora('Updating task...').start();
        
        // Apply updates
        tasks[taskIndex] = {
          ...task,
          ...updates,
          updatedAt: new Date().toISOString(),
          ...(updates.status === 'completed' && !task.completedAt ? { completedAt: new Date().toISOString() } : {})
        };
        
        await saveTasks(tasks);
        
        spinner.succeed(chalk.green('✅ Task updated successfully!'));
        
        const updatedTask = tasks[taskIndex];
        console.log(boxen(
          `${getPriorityIcon(updatedTask.priority)} ${chalk.bold(updatedTask.title)}\n` +
          `${chalk.bold('Status:')} ${getStatusIcon(updatedTask.status)} ${updatedTask.status}\n` +
          `${chalk.bold('Priority:')} ${updatedTask.priority}\n` +
          `${chalk.bold('Updated:')} ${new Date(updatedTask.updatedAt).toLocaleString()}`,
          {
            padding: 1,
            borderColor: 'blue'
          }
        ));
        
      } catch (error) {
        console.error(chalk.red(`❌ Error updating task: ${error.message}`));
      }
    });

  // Delete task command
  taskCmd
    .command('delete <taskId>')
    .description('🗑️ Delete a task')
    .option('-f, --force', 'force delete without confirmation')
    .action(async (taskId, options) => {
      try {
        const tasks = await loadTasks();
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) {
          console.error(chalk.red(`❌ Task with ID ${taskId} not found!`));
          return;
        }
        
        const task = tasks[taskIndex];
        
        if (!options.force) {
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Are you sure you want to delete task "${task.title}"?`,
              default: false
            }
          ]);
          
          if (!confirm) {
            console.log(chalk.yellow('Operation cancelled.'));
            return;
          }
        }
        
        const spinner = ora('Deleting task...').start();
        
        tasks.splice(taskIndex, 1);
        await saveTasks(tasks);
        
        spinner.succeed(chalk.green(`✅ Task "${task.title}" deleted successfully!`));
        
      } catch (error) {
        console.error(chalk.red(`❌ Error deleting task: ${error.message}`));
      }
    });

  // Search tasks command
  taskCmd
    .command('search')
    .description('🔍 Search tasks')
    .option('-t, --text <text>', 'search in title and description')
    .option('--tag <tag>', 'search by tag')
    .option('-i, --case-insensitive', 'case insensitive search')
    .action(async (options) => {
      if (!options.text && !options.tag) {
        console.error(chalk.red('❌ Please provide search criteria (--text or --tag)'));
        return;
      }
      
      const spinner = ora('Searching tasks...').start();
      
      try {
        const tasks = await loadTasks();
        
        if (tasks.length === 0) {
          spinner.warn(chalk.yellow('No tasks found in database!'));
          return;
        }
        
        let results = tasks;
        
        if (options.text) {
          const searchText = options.caseInsensitive ? options.text.toLowerCase() : options.text;
          results = results.filter(task => {
            const title = options.caseInsensitive ? task.title.toLowerCase() : task.title;
            const description = options.caseInsensitive ? (task.description || '').toLowerCase() : task.description || '';
            return title.includes(searchText) || description.includes(searchText);
          });
        }
        
        if (options.tag) {
          results = results.filter(task => task.tags.includes(options.tag));
        }
        
        spinner.succeed(chalk.green(`✅ Found ${results.length} matching tasks`));
        
        if (results.length === 0) {
          console.log(chalk.yellow('No tasks match your search criteria.'));
          return;
        }
        
        console.log(chalk.bold.cyan('\n🔍 Search Results:\n'));
        results.forEach((task, index) => {
          console.log(`${index + 1}. ${getStatusIcon(task.status)} ${chalk.white.bold(task.title)} ${chalk.gray(`(${task.id})`)}`);
          console.log(`   ${getPriorityIcon(task.priority)} ${task.priority} | ${task.status}`);
          if (task.description) {
            console.log(`   📝 ${task.description}`);
          }
          console.log();
        });
        
      } catch (error) {
        spinner.fail(chalk.red(`❌ Error searching tasks: ${error.message}`));
      }
    });

  // Clear completed tasks
  taskCmd
    .command('clear-completed')
    .description('🧹 Clear all completed tasks')
    .option('-f, --force', 'force clear without confirmation')
    .action(async (options) => {
      try {
        const tasks = await loadTasks();
        const completedTasks = tasks.filter(task => task.status === 'completed');
        
        if (completedTasks.length === 0) {
          console.log(chalk.yellow('No completed tasks to clear.'));
          return;
        }
        
        if (!options.force) {
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Are you sure you want to delete ${completedTasks.length} completed tasks?`,
              default: false
            }
          ]);
          
          if (!confirm) {
            console.log(chalk.yellow('Operation cancelled.'));
            return;
          }
        }
        
        const spinner = ora('Clearing completed tasks...').start();
        
        const remainingTasks = tasks.filter(task => task.status !== 'completed');
        await saveTasks(remainingTasks);
        
        spinner.succeed(chalk.green(`✅ Cleared ${completedTasks.length} completed tasks!`));
        
      } catch (error) {
        console.error(chalk.red(`❌ Error clearing completed tasks: ${error.message}`));
      }
    });
}
