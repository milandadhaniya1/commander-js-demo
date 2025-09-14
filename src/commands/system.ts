import os from 'os';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import boxen from 'boxen';
import gradient from 'gradient-string';

// Helper functions
function formatBytes(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  let result = '';
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m `;
  result += `${secs}s`;
  
  return result;
}

function getMemoryUsage() {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  const usagePercent = ((used / total) * 100).toFixed(1);
  
  return {
    total: formatBytes(total),
    free: formatBytes(free),
    used: formatBytes(used),
    usagePercent: `${usagePercent}%`
  };
}

function getCPUInfo() {
  const cpus = os.cpus();
  const model = cpus[0].model;
  const cores = cpus.length;
  const speed = cpus[0].speed;
  
  return {
    model: model.replace(/\s+/g, ' ').trim(),
    cores,
    speed: `${speed} MHz`
  };
}

async function getDiskUsage() {
  try {
    if (process.platform === 'win32') {
      // Windows
      const output = execSync('wmic logicaldisk get size,freespace,caption', { encoding: 'utf8' });
      const lines = output.split('\n').filter(line => line.trim() && !line.includes('Caption'));
      
      return lines.map(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 3) {
          const caption = parts[0];
          const free = parseInt(parts[1]);
          const size = parseInt(parts[2]);
          const used = size - free;
          const usagePercent = ((used / size) * 100).toFixed(1);
          
          return {
            mount: caption,
            total: formatBytes(size),
            used: formatBytes(used),
            free: formatBytes(free),
            usagePercent: `${usagePercent}%`
          };
        }
      }).filter(Boolean);
    } else {
      // Unix-like systems
      const output = execSync('df -h /', { encoding: 'utf8' });
      const lines = output.split('\n').slice(1).filter(line => line.trim());
      
      return lines.map(line => {
        const parts = line.split(/\s+/);
        if (parts.length >= 6) {
          return {
            mount: parts[5],
            total: parts[1],
            used: parts[2],
            free: parts[3],
            usagePercent: parts[4]
          };
        }
      }).filter(Boolean);
    }
  } catch (error) {
    return [{ mount: 'N/A', total: 'N/A', used: 'N/A', free: 'N/A', usagePercent: 'N/A' }];
  }
}

async function getNodeInfo() {
  try {
    const packagePath = path.resolve('./package.json');
    let projectInfo = { name: 'N/A', version: 'N/A' };
    
    try {
      const packageData = await fs.readFile(packagePath, 'utf8');
      const pkg = JSON.parse(packageData);
      projectInfo = {
        name: pkg.name || 'N/A',
        version: pkg.version || 'N/A'
      };
    } catch (error) {
      // Package.json not found or invalid
    }
    
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      projectName: projectInfo.name,
      projectVersion: projectInfo.version,
      pid: process.pid,
      cwd: process.cwd()
    };
  } catch (error) {
    return {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      projectName: 'N/A',
      projectVersion: 'N/A',
      pid: process.pid,
      cwd: process.cwd()
    };
  }
}

import type { Command } from 'commander';

export function systemCommands(program: Command): void {
  const systemCmd = program
    .command('system')
    .alias('sys')
    .description('💻 System information and monitoring')
    .addHelpText('after', `

Examples:
  $ pnpm cli system info
  $ pnpm cli system info --detailed
  $ pnpm cli sys info --format json
  $ pnpm cli system monitor --interval 5
  $ pnpm cli system health
`);

  // System info command
  systemCmd
    .command('info')
    .description('ℹ️  Display system information')
    .option('-d, --detailed', 'show detailed information')
    .option('-f, --format <format>', 'output format (table, json, simple)', 'simple')
    .option('--no-color', 'disable colored output')
    .action(async (options) => {
      const spinner = ora('Gathering system information...').start();
      
      try {
        // Gather system information
        const hostname = os.hostname();
        const platform = os.platform();
        const release = os.release();
        const uptime = os.uptime();
        const loadavg = os.loadavg();
        const memory = getMemoryUsage();
        const cpu = getCPUInfo();
        const nodeInfo = await getNodeInfo();
        
        let diskInfo = [];
        if (options.detailed) {
          diskInfo = await getDiskUsage();
        }
        
        spinner.succeed(chalk.green('✅ System information gathered!'));
        
        const systemData = {
          hostname,
          platform,
          release,
          uptime: formatUptime(uptime),
          loadAverage: loadavg.map(avg => avg.toFixed(2)).join(', '),
          memory,
          cpu,
          node: nodeInfo,
          ...(options.detailed && { disk: diskInfo })
        };
        
        // Display based on format
        if (options.format === 'json') {
          console.log(JSON.stringify(systemData, null, 2));
          return;
        }
        
        // Display header
        const title = gradient.rainbow('System Information');
        console.log(`\n${title}\n`);
        
        if (options.format === 'table') {
          const table = new Table({
            head: ['Property', 'Value'].map(h => chalk.cyan(h)),
            style: { border: ['gray'] },
            colWidths: [25, 50]
          });
          
          table.push(
            ['Hostname', hostname],
            ['Platform', `${platform} ${release}`],
            ['Uptime', systemData.uptime],
            ['Load Average', systemData.loadAverage],
            ['CPU Model', cpu.model],
            ['CPU Cores', cpu.cores.toString()],
            ['CPU Speed', cpu.speed],
            ['Memory Total', memory.total],
            ['Memory Used', `${memory.used} (${memory.usagePercent})`],
            ['Memory Free', memory.free],
            ['Node Version', nodeInfo.nodeVersion],
            ['Process ID', nodeInfo.pid.toString()],
            ['Working Directory', nodeInfo.cwd]
          );
          
          if (options.detailed && diskInfo.length > 0) {
            diskInfo.forEach((disk, index) => {
              table.push([`Disk ${index + 1} (${disk.mount})`, `${disk.used}/${disk.total} (${disk.usagePercent})`]);
            });
          }
          
          console.log(table.toString());
          
        } else {
          // Simple format with boxes
          console.log(boxen(
            `🖥️  ${chalk.bold('Host:')} ${hostname}\n` +
            `🏗️  ${chalk.bold('Platform:')} ${platform} ${release}\n` +
            `⏱️  ${chalk.bold('Uptime:')} ${systemData.uptime}\n` +
            `📊 ${chalk.bold('Load:')} ${systemData.loadAverage}`,
            {
              padding: 1,
              borderColor: 'blue',
              title: 'System',
              titleAlignment: 'center'
            }
          ));
          
          console.log(boxen(
            `🧠 ${chalk.bold('Model:')} ${cpu.model}\n` +
            `🔢 ${chalk.bold('Cores:')} ${cpu.cores}\n` +
            `⚡ ${chalk.bold('Speed:')} ${cpu.speed}`,
            {
              padding: 1,
              borderColor: 'yellow',
              title: 'CPU',
              titleAlignment: 'center'
            }
          ));
          
          console.log(boxen(
            `📈 ${chalk.bold('Total:')} ${memory.total}\n` +
            `🔴 ${chalk.bold('Used:')} ${memory.used} (${memory.usagePercent})\n` +
            `🟢 ${chalk.bold('Free:')} ${memory.free}`,
            {
              padding: 1,
              borderColor: 'green',
              title: 'Memory',
              titleAlignment: 'center'
            }
          ));
          
          console.log(boxen(
            `🚀 ${chalk.bold('Version:')} ${nodeInfo.nodeVersion}\n` +
            `🏗️  ${chalk.bold('Platform:')} ${nodeInfo.platform}/${nodeInfo.arch}\n` +
            `🆔 ${chalk.bold('PID:')} ${nodeInfo.pid}\n` +
            `📁 ${chalk.bold('Project:')} ${nodeInfo.projectName}@${nodeInfo.projectVersion}`,
            {
              padding: 1,
              borderColor: 'magenta',
              title: 'Node.js',
              titleAlignment: 'center'
            }
          ));
          
          if (options.detailed && diskInfo.length > 0) {
            diskInfo.forEach((disk, index) => {
              console.log(boxen(
                `💾 ${chalk.bold('Mount:')} ${disk.mount}\n` +
                `📊 ${chalk.bold('Total:')} ${disk.total}\n` +
                `🔴 ${chalk.bold('Used:')} ${disk.used} (${disk.usagePercent})\n` +
                `🟢 ${chalk.bold('Free:')} ${disk.free}`,
                {
                  padding: 1,
                  borderColor: 'cyan',
                  title: `Disk ${index + 1}`,
                  titleAlignment: 'center'
                }
              ));
            });
          }
        }
        
      } catch (error) {
        spinner.fail(chalk.red(`❌ Error gathering system info: ${error.message}`));
      }
    });

  // System health command
  systemCmd
    .command('health')
    .description('🏥 Check system health')
    .action(async () => {
      const spinner = ora('Checking system health...').start();
      
      try {
        const memory = getMemoryUsage();
        const uptime = os.uptime();
        const loadavg = os.loadavg();
        const cpu = getCPUInfo();
        
        spinner.succeed(chalk.green('✅ Health check completed!'));
        
        console.log(gradient.rainbow('\n🏥 System Health Report\n'));
        
        // Memory health
        const memUsage = parseFloat(memory.usagePercent.replace('%', ''));
        const memStatus = memUsage > 90 ? '🔴 Critical' : memUsage > 70 ? '🟡 Warning' : '🟢 Good';
        
        // CPU load health (approximation)
        const avgLoad = loadavg[0];
        const loadStatus = avgLoad > cpu.cores * 0.8 ? '🔴 High' : avgLoad > cpu.cores * 0.5 ? '🟡 Medium' : '🟢 Low';
        
        // Uptime status
        const uptimeHours = uptime / 3600;
        const uptimeStatus = uptimeHours > 720 ? '🟡 Long' : '🟢 Normal'; // 30 days
        
        const healthTable = new Table({
          head: ['Component', 'Status', 'Value', 'Details'].map(h => chalk.cyan(h)),
          style: { border: ['gray'] }
        });
        
        healthTable.push(
          ['Memory Usage', memStatus, memory.usagePercent, `${memory.used} / ${memory.total}`],
          ['CPU Load', loadStatus, avgLoad.toFixed(2), `1min average (${cpu.cores} cores)`],
          ['System Uptime', uptimeStatus, formatUptime(uptime), 'Current session'],
          ['Node.js Process', '🟢 Running', process.pid, `PID: ${process.pid}`]
        );
        
        console.log(healthTable.toString());
        
        // Overall health summary
        const issues = [memUsage > 90, avgLoad > cpu.cores * 0.8].filter(Boolean).length;
        const overallStatus = issues === 0 ? '🟢 Healthy' : issues === 1 ? '🟡 Minor Issues' : '🔴 Needs Attention';
        
        console.log(boxen(
          `${chalk.bold('Overall System Status:')} ${overallStatus}\n` +
          `${chalk.bold('Timestamp:')} ${new Date().toLocaleString()}`,
          {
            padding: 1,
            borderColor: issues === 0 ? 'green' : issues === 1 ? 'yellow' : 'red',
            title: 'Health Summary',
            titleAlignment: 'center'
          }
        ));
        
      } catch (error) {
        spinner.fail(chalk.red(`❌ Error checking system health: ${error.message}`));
      }
    });

  // System monitor command
  systemCmd
    .command('monitor')
    .description('📊 Monitor system resources')
    .option('-i, --interval <seconds>', 'monitoring interval in seconds', parseFloat, 2)
    .option('-c, --count <number>', 'number of samples to collect', parseInt)
    .action(async (options) => {
      console.log(chalk.cyan('📊 Starting system monitor...\n'));
      console.log(chalk.gray(`Interval: ${options.interval}s`));
      if (options.count) {
        console.log(chalk.gray(`Samples: ${options.count}`));
      }
      console.log(chalk.gray('Press Ctrl+C to stop\n'));
      
      let sampleCount = 0;
      
      const monitor = setInterval(async () => {
        try {
          const memory = getMemoryUsage();
          const loadavg = os.loadavg();
          const timestamp = new Date().toLocaleTimeString();
          
          console.log(`${chalk.gray(timestamp)} | ` +
            `${chalk.blue('Memory:')} ${memory.usagePercent} | ` +
            `${chalk.yellow('Load:')} ${loadavg[0].toFixed(2)} | ` +
            `${chalk.green('Free:')} ${memory.free}`);
          
          sampleCount++;
          
          if (options.count && sampleCount >= options.count) {
            clearInterval(monitor);
            console.log(chalk.green(`\n✅ Monitoring completed (${sampleCount} samples)`));
          }
          
        } catch (error) {
          console.error(chalk.red(`❌ Monitor error: ${error.message}`));
          clearInterval(monitor);
        }
      }, options.interval * 1000);
      
      // Handle Ctrl+C
      process.on('SIGINT', () => {
        clearInterval(monitor);
        console.log(chalk.yellow(`\n⏹️  Monitoring stopped (${sampleCount} samples collected)`));
        process.exit(0);
      });
    });
}
