# Demo Files Directory

This directory contains files created by the Commander.js demo CLI tool.

## Purpose

- **Keeps project root clean**: All demo files are contained in this directory
- **Easy cleanup**: Delete this entire directory to remove all demo files
- **Organized testing**: All CLI file operations happen here

## Usage

When you run file operations with the CLI:

```bash
# Creates file in demo-files/
pnpm cli file create myfile.txt

# Reads file from demo-files/
pnpm cli file read myfile.txt

# Lists files in demo-files/
pnpm cli file list

# Deletes file from demo-files/
pnpm cli file delete myfile.txt
```

## Cleanup

To remove all demo files:

```bash
rm -rf demo-files
```

The directory will be automatically recreated when you create files with the CLI.
