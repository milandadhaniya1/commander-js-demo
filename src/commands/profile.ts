import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import boxen from 'boxen';
import Table from 'cli-table3';
import figlet from 'figlet';
import { ProfileOptions, ProfileData, Theme, Skill, Operation } from '../types/index';

// Mock database for profiles
const profiles: Map<string, ProfileData> = new Map();

export function createProfileCommand(): Command {
  const profileCmd = new Command('profile')
    .description('👤 Advanced profile management with multiple input types')
    .addHelpText('after', `

${chalk.cyan('Examples:')}
  ${chalk.gray('# Interactive profile creation')}
  profile create john --interactive

  ${chalk.gray('# Quick profile with all options')}
  profile create jane --role developer --theme dark --skills js,ts,react --operation validate,save

  ${chalk.gray('# View profile')}
  profile view john --format table

  ${chalk.gray('# Update with interactive selection')}
  profile update jane --interactive

${chalk.yellow('💡 This command demonstrates:')}
  • Required arguments (name)
  • Single-choice options (role, theme)
  • Multi-choice options (skills, operations)
  • Interactive prompts for complex inputs
  • Validation and error handling
`);

  // CREATE subcommand
  profileCmd
    .command('create')
    .description('Create a new user profile')
    .argument('[name]', 'Profile name (optional - will prompt if not provided)')
    .option('-r, --role <type>', 'User role (admin|developer|designer|user)', 'user')
    .option('-a, --age <number>', 'User age', '25')
    .option('-g, --gender <gender>', 'Gender (male|female|other|prefer-not-to-say)', 'prefer-not-to-say')
    .option('-e, --email <email>', 'User email')
    .option('-t, --theme <theme>', 'UI theme preference (default|dark|light|rainbow)', 'default')
    .option('-s, --skills <skills>', 'Comma-separated skills list')
    .option('-o, --operations <ops>', 'Comma-separated operations to perform')
    .option('-i, --interactive', 'Force interactive mode even with provided options')
    .option('-f, --format <format>', 'Output format (box|table|json)', 'box')
    .action(async (name: string | undefined, options: ProfileOptions) => {
      const spinner = ora('Creating profile...').start();
      
      try {
        // If no name provided, we'll ask for it in interactive mode
        let profileName = name;
        
        // Auto-enable interactive mode if no name or essential options provided
        const shouldUseInteractive = !name || options.interactive || 
          (!options.role && !options.email && !options.skills);

        let profileData: ProfileData = {
          name: profileName || 'temp',
          role: options.role as 'admin' | 'developer' | 'designer' | 'user' || 'user',
          age: parseInt(options.age || '25'),
          gender: options.gender as 'male' | 'female' | 'other' | 'prefer-not-to-say' || 'prefer-not-to-say',
          email: options.email || (profileName ? `${profileName.toLowerCase()}@example.com` : 'user@example.com'),
          theme: options.theme as Theme || 'default',
          skills: [],
          operations: [],
          createdAt: new Date(),
          isActive: true
        };

        spinner.stop();

        // Interactive mode - ask for all inputs
        if (shouldUseInteractive) {
          console.log(chalk.blue('\n🎯 Interactive Profile Creation'));
          console.log(chalk.gray('Let\'s gather all the information step by step...\n'));

          // Ask for name if not provided
          let nameAnswer: any = {};
          if (!profileName) {
            nameAnswer = await inquirer.prompt({
              type: 'input',
              name: 'name',
              message: 'Enter profile name:',
              validate: (input: string) => {
                return input.trim().length > 0 || 'Profile name is required';
              }
            });
            profileName = nameAnswer.name;
            profileData.name = profileName!;
            profileData.email = `${profileName!.toLowerCase()}@example.com`;
          }

          const emailAnswer = await inquirer.prompt({
            type: 'input',
            name: 'email',
            message: 'Enter email address:',
            default: profileData.email,
            validate: (input: string) => {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              return emailRegex.test(input) || 'Please enter a valid email address';
            }
          });

          const ageAnswer = await inquirer.prompt({
            type: 'number',
            name: 'age',
            message: 'Enter age:',
            default: profileData.age,
            validate: (input: number | undefined) => {
              if (input === undefined) return 'Age is required';
              return (input >= 16 && input <= 100) || 'Age must be between 16 and 100';
            }
          });

          const genderAnswer = await inquirer.prompt({
            type: 'list',
            name: 'gender',
            message: 'Select gender:',
            choices: [
              { name: '👨 Male', value: 'male' },
              { name: '👩 Female', value: 'female' },
              { name: '🌟 Other', value: 'other' },
              { name: '🔒 Prefer not to say', value: 'prefer-not-to-say' }
            ],
            default: profileData.gender
          });

          const roleAnswer = await inquirer.prompt({
            type: 'list',
            name: 'role',
            message: 'Select user role (single choice):',
            choices: [
              { name: '👑 Admin - Full system access', value: 'admin' },
              { name: '💻 Developer - Code and deploy', value: 'developer' },
              { name: '🎨 Designer - UI/UX focus', value: 'designer' },
              { name: '👤 User - Standard access', value: 'user' }
            ],
            default: profileData.role
          });

          const themeAnswer = await inquirer.prompt({
            type: 'list',
            name: 'theme',
            message: 'Choose UI theme preference (single choice):',
            choices: [
              { name: '🌟 Default - Standard colors', value: 'default' },
              { name: '🌙 Dark - Dark mode', value: 'dark' },
              { name: '☀️ Light - Light mode', value: 'light' },
              { name: '🌈 Rainbow - Colorful theme', value: 'rainbow' }
            ],
            default: profileData.theme
          });

          const skillsAnswer = await inquirer.prompt({
            type: 'checkbox',
            name: 'skills',
            message: 'Select skills (multiple choice):',
            choices: [
              { name: '🟨 JavaScript', value: 'javascript' },
              { name: '🔷 TypeScript', value: 'typescript' },
              { name: '⚛️ React', value: 'react' },
              { name: '💚 Node.js', value: 'nodejs' },
              { name: '🐍 Python', value: 'python' },
              { name: '☕ Java', value: 'java' },
              { name: '🎨 CSS/SCSS', value: 'css' },
              { name: '🗄️ SQL', value: 'sql' },
              { name: '🐳 Docker', value: 'docker' },
              { name: '☁️ AWS', value: 'aws' }
            ]
          });

          const operationsAnswer = await inquirer.prompt({
            type: 'checkbox',
            name: 'operations',
            message: 'Select operations to perform (multiple choice):',
            choices: [
              { name: '✅ Validate - Check profile data', value: 'validate' },
              { name: '💾 Save - Store to database', value: 'save' },
              { name: '📧 Email - Send welcome email', value: 'email' },
              { name: '🔐 Setup - Create access permissions', value: 'setup' },
              { name: '📊 Analytics - Track user creation', value: 'analytics' },
              { name: '🎉 Welcome - Show welcome message', value: 'welcome' }
            ],
            default: ['validate', 'save']
          });

          const answers = {
            ...nameAnswer,
            ...emailAnswer,
            ...ageAnswer,
            ...genderAnswer,
            ...roleAnswer,
            ...themeAnswer,
            ...skillsAnswer,
            ...operationsAnswer
          };

          // Update profile data with interactive answers
          profileData = { ...profileData, ...answers };
        } else {
          // Parse command line options
          if (options.skills) {
            profileData.skills = options.skills.split(',').map((s: string) => s.trim() as Skill);
          }
          if (options.operations) {
            profileData.operations = options.operations.split(',').map((o: string) => o.trim() as Operation);
          }
        }

        // Validate required data
        if (!profileData.skills.length) {
          profileData.skills = ['javascript']; // Default skill
        }
        if (!profileData.operations.length) {
          profileData.operations = ['validate', 'save']; // Default operations
        }

        // Show progress for each operation
        console.log(chalk.blue('\n🚀 Executing operations:'));
        
        for (const operation of profileData.operations) {
          const opSpinner = ora(`Performing ${operation}...`).start();
          
          // Simulate operation time
          await new Promise(resolve => setTimeout(resolve, 800));
          
          switch (operation) {
            case 'validate':
              opSpinner.succeed(`✅ Profile validated successfully`);
              break;
            case 'save':
              profiles.set(profileData.name.toLowerCase(), profileData);
              opSpinner.succeed(`💾 Profile saved to database`);
              break;
            case 'email':
              opSpinner.succeed(`📧 Welcome email sent to ${profileData.email}`);
              break;
            case 'setup':
              opSpinner.succeed(`🔐 Access permissions configured`);
              break;
            case 'analytics':
              opSpinner.succeed(`📊 User creation event tracked`);
              break;
            case 'welcome':
              opSpinner.succeed(`🎉 Welcome message prepared`);
              break;
            default:
              opSpinner.succeed(`✨ Operation ${operation} completed`);
          }
        }

        // Display created profile
        console.log(chalk.green('\n✨ Profile created successfully!\n'));
        
        if (options.format === 'table') {
          displayProfileTable(profileData);
        } else {
          displayProfileBox(profileData);
        }

        // Show welcome message if requested
        if (profileData.operations.includes('welcome')) {
          console.log('\n' + chalk.cyan(figlet.textSync('Welcome!', { 
            font: 'Small',
            horizontalLayout: 'default',
            verticalLayout: 'default'
          })));
          
          console.log(boxen(
            `🎉 Welcome ${chalk.bold(profileData.name)}!\n\n` +
            `Your ${chalk.blue(profileData.role)} profile is ready.\n` +
            `Skills: ${profileData.skills.map((s: Skill) => chalk.yellow(s)).join(', ')}\n` +
            `Theme: ${chalk.magenta(profileData.theme)}`,
            {
              padding: 1,
              margin: 1,
              borderStyle: 'double',
              borderColor: 'green'
            }
          ));
        }

      } catch (error) {
        spinner.fail('Failed to create profile');
        console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
      }
    });

  // VIEW subcommand
  profileCmd
    .command('view')
    .description('View an existing profile')
    .argument('<name>', 'Profile name to view')
    .option('-f, --format <format>', 'Display format (box, table, json)', 'box')
    .action(async (name: string, options: { format?: string }) => {
      const profile = profiles.get(name.toLowerCase());
      
      if (!profile) {
        console.log(chalk.red(`❌ Profile '${name}' not found`));
        
        const availableProfiles = Array.from(profiles.keys());
        if (availableProfiles.length > 0) {
          console.log(chalk.gray('\nAvailable profiles:'));
          availableProfiles.forEach(p => console.log(chalk.blue(`  • ${p}`)));
        }
        return;
      }

      console.log(chalk.green(`👤 Profile: ${profile.name}\n`));

      switch (options.format) {
        case 'table':
          displayProfileTable(profile);
          break;
        case 'json':
          console.log(JSON.stringify(profile, null, 2));
          break;
        default:
          displayProfileBox(profile);
      }
    });

  // LIST subcommand
  profileCmd
    .command('list')
    .description('List all profiles')
    .option('-f, --format <format>', 'Display format (table, simple)', 'table')
    .option('--role <role>', 'Filter by role')
    .option('--theme <theme>', 'Filter by theme')
    .action(async (options: { format?: string; role?: string; theme?: string }) => {
      let profileList = Array.from(profiles.values());

      // Apply filters
      if (options.role) {
        profileList = profileList.filter(p => p.role === options.role);
      }
      if (options.theme) {
        profileList = profileList.filter(p => p.theme === options.theme);
      }

      if (profileList.length === 0) {
        console.log(chalk.yellow('📭 No profiles found'));
        return;
      }

      console.log(chalk.blue(`👥 Found ${profileList.length} profile(s)\n`));

      if (options.format === 'simple') {
        profileList.forEach(profile => {
          console.log(`${chalk.cyan('•')} ${chalk.bold(profile.name)} (${profile.role}, ${profile.gender}, ${profile.age}y) - ${profile.skills.length} skills`);
        });
      } else {
        const table = new Table({
          head: ['Name', 'Role', 'Age', 'Gender', 'Theme', 'Skills', 'Status'],
          colWidths: [12, 10, 6, 10, 10, 20, 8]
        });

        profileList.forEach(profile => {
          table.push([
            chalk.bold(profile.name),
            getRoleEmoji(profile.role) + ' ' + profile.role,
            profile.age.toString(),
            getGenderEmoji(profile.gender) + ' ' + profile.gender,
            getThemeEmoji(profile.theme) + ' ' + profile.theme,
            profile.skills.slice(0, 2).join(', ') + (profile.skills.length > 2 ? '...' : ''),
            profile.isActive ? chalk.green('Active') : chalk.red('Inactive')
          ]);
        });

        console.log(table.toString());
      }
    });

  // UPDATE subcommand
  profileCmd
    .command('update')
    .description('Update an existing profile')
    .argument('<name>', 'Profile name to update')
    .option('-i, --interactive', 'Use interactive mode')
    .option('-r, --role <type>', 'New role')
    .option('-t, --theme <theme>', 'New theme')
    .option('-s, --skills <skills>', 'New skills (comma-separated)')
    .action(async (name: string, options: ProfileOptions) => {
      const profile = profiles.get(name.toLowerCase());
      
      if (!profile) {
        console.log(chalk.red(`❌ Profile '${name}' not found`));
        return;
      }

      if (options.interactive) {
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'role',
            message: 'Update role:',
            choices: ['admin', 'developer', 'designer', 'user'],
            default: profile.role
          },
          {
            type: 'list',
            name: 'theme',
            message: 'Update theme:',
            choices: ['default', 'dark', 'light', 'rainbow'],
            default: profile.theme
          },
          {
            type: 'checkbox',
            name: 'skills',
            message: 'Update skills:',
            choices: ['javascript', 'typescript', 'react', 'nodejs', 'python', 'java', 'css', 'sql', 'docker', 'aws'],
            default: profile.skills
          }
        ]);

        Object.assign(profile, answers);
      } else {
        if (options.role) profile.role = options.role as any;
        if (options.theme) profile.theme = options.theme as Theme;
        if (options.skills) profile.skills = options.skills.split(',').map((s: string) => s.trim() as Skill);
      }

      profiles.set(name.toLowerCase(), profile);
      console.log(chalk.green('✅ Profile updated successfully!'));
      displayProfileBox(profile);
    });

  // DELETE subcommand
  profileCmd
    .command('delete')
    .description('Delete a profile')
    .argument('<name>', 'Profile name to delete')
    .option('-f, --force', 'Skip confirmation')
    .action(async (name: string, options: { force?: boolean }) => {
      const profile = profiles.get(name.toLowerCase());
      
      if (!profile) {
        console.log(chalk.red(`❌ Profile '${name}' not found`));
        return;
      }

      if (!options.force) {
        const { confirm } = await inquirer.prompt([{
          type: 'confirm',
          name: 'confirm',
          message: `Are you sure you want to delete profile '${name}'?`,
          default: false
        }]);

        if (!confirm) {
          console.log(chalk.yellow('❌ Deletion cancelled'));
          return;
        }
      }

      profiles.delete(name.toLowerCase());
      console.log(chalk.green(`✅ Profile '${name}' deleted successfully`));
    });

  return profileCmd;
}

// Helper functions
function displayProfileBox(profile: ProfileData) {
  const content = [
    `${chalk.bold('Name:')} ${profile.name}`,
    `${chalk.bold('Role:')} ${getRoleEmoji(profile.role)} ${profile.role}`,
    `${chalk.bold('Age:')} ${profile.age}`,
    `${chalk.bold('Gender:')} ${getGenderEmoji(profile.gender)} ${profile.gender}`,
    `${chalk.bold('Email:')} ${profile.email}`,
    `${chalk.bold('Theme:')} ${getThemeEmoji(profile.theme)} ${profile.theme}`,
    `${chalk.bold('Skills:')} ${profile.skills.map((s: Skill) => chalk.blue(s)).join(', ')}`,
    `${chalk.bold('Status:')} ${profile.isActive ? chalk.green('Active') : chalk.red('Inactive')}`,
    `${chalk.bold('Created:')} ${profile.createdAt.toLocaleDateString()}`
  ].join('\n');

  console.log(boxen(content, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
    title: '👤 Profile Details',
    titleAlignment: 'center'
  }));
}

function displayProfileTable(profile: ProfileData) {
  const table = new Table({
    head: ['Property', 'Value'],
    colWidths: [15, 50]
  });

  table.push(
    ['Name', chalk.bold(profile.name)],
    ['Role', getRoleEmoji(profile.role) + ' ' + profile.role],
    ['Age', profile.age.toString()],
    ['Gender', getGenderEmoji(profile.gender) + ' ' + profile.gender],
    ['Email', profile.email],
    ['Theme', getThemeEmoji(profile.theme) + ' ' + profile.theme],
    ['Skills', profile.skills.join(', ')],
    ['Status', profile.isActive ? chalk.green('Active') : chalk.red('Inactive')],
    ['Created', profile.createdAt.toLocaleDateString()]
  );

  console.log(table.toString());
}

function getRoleEmoji(role: string): string {
  const emojis = {
    admin: '👑',
    developer: '💻',
    designer: '🎨',
    user: '👤'
  };
  return emojis[role as keyof typeof emojis] || '👤';
}

function getThemeEmoji(theme: string): string {
  const emojis = {
    default: '🌟',
    dark: '🌙',
    light: '☀️',
    rainbow: '🌈'
  };
  return emojis[theme as keyof typeof emojis] || '🌟';
}

function getGenderEmoji(gender: string): string {
  const emojis = {
    male: '👨',
    female: '👩',
    other: '🌟',
    'prefer-not-to-say': '🔒'
  };
  return emojis[gender as keyof typeof emojis] || '🔒';
}
