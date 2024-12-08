#!/usr/bin/env node

import { GoogleGenerativeAI } from '@google/generative-ai';
import readline from 'readline';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { Command } from 'commander';
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Configure marked to use terminal renderer
marked.setOptions({
    renderer: new TerminalRenderer({
        bulletMarker: '•',
        tab: 2,
        listitem: function(text) {
            return '  • ' + text + '\n';
        },
        strong: chalk.bold.cyan,
        em: chalk.italic.white,
        codespan: chalk.yellow,
        code: function(code, lang) {
            return '\n' + chalk.bgGray(chalk.yellow(code)) + '\n';
        },
        heading: function(text, level) {
            const prefix = '='.repeat(level);
            return '\n' + chalk.bold.cyan(`${prefix} ${text}`) + '\n';
        },
        paragraph: (text) => {
            return '\n' + text + '\n';
        },
        blockquote: (text) => {
            return chalk.gray('│ ') + chalk.italic(text.split('\n').join('\n│ ')) + '\n';
        },
        link: (href, title, text) => {
            return chalk.blue.underline(href);
        }
    })
});

// Load environment variables from multiple locations
function loadEnvFile() {
    // Try current directory first
    const currentDirEnv = path.join(process.cwd(), '.env');
    if (fs.existsSync(currentDirEnv)) {
        dotenv.config({ path: currentDirEnv });
        return;
    }

    // Try home directory next
    const homeDir = os.homedir();
    const homeDirEnv = path.join(homeDir, '.env');
    if (fs.existsSync(homeDirEnv)) {
        dotenv.config({ path: homeDirEnv });
        return;
    }

    // If no .env file found, check for environment variable
    if (!process.env.GEMINI_API_KEY) {
        console.error(chalk.red('Error: GEMINI_API_KEY not found in .env file or environment variables'));
        console.log(chalk.yellow('\nPlease create a .env file in your home directory (~/.env) with your Gemini API key:'));
        console.log(chalk.white('GEMINI_API_KEY=your-api-key-here'));
        process.exit(1);
    }
}

// Load environment variables
loadEnvFile();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Handle file writing command
function handleWriteCommand(input) {
    const match = input.match(/^\/write\s+([^\s]+)\s+(.+)$/s);
    if (!match) {
        console.log(chalk.red('Usage: /write filename content'));
        return false;
    }

    const [_, filename, content] = match;
    const filepath = path.join(process.cwd(), filename);

    try {
        fs.writeFileSync(filepath, content);
        console.log(chalk.green(`File "${filename}" has been created successfully!`));
        return true;
    } catch (error) {
        console.error(chalk.red(`Error writing file: ${error.message}`));
        return false;
    }
}

// Check if input is a file creation request
function isFileCreationRequest(input) {
    // Keywords that must be present for file creation
    const creationKeywords = [
        'create',
        'make',
        'write',
        'generate'
    ];

    // The word "file" must be present
    if (!input.toLowerCase().includes('file')) {
        return false;
    }

    // At least one creation keyword must be present
    if (!creationKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
        return false;
    }

    // Common greetings and conversation starters should not trigger file creation
    const conversationStarters = [
        'hi',
        'hello',
        'hey',
        'greetings',
        'good morning',
        'good afternoon',
        'good evening',
        'how are you',
        'what\'s up'
    ];

    if (conversationStarters.some(greeting => 
        input.toLowerCase().trim() === greeting ||
        input.toLowerCase().startsWith(greeting + ' ') ||
        input.toLowerCase().endsWith(' ' + greeting)
    )) {
        return false;
    }

    const patterns = [
        /(?:create|make|write|generate)\s+(?:a\s+)?(?:new\s+)?(\w+)\s+file/i,
    ];

    return patterns.some(pattern => pattern.test(input));
}

// Extract file type from request
function getFileTypeFromRequest(input) {
    const patterns = [
        /(?:create|make|write|generate)\s+(?:a\s+)?(?:new\s+)?(\w+)\s+file/i
    ];

    for (const pattern of patterns) {
        const match = input.match(pattern);
        if (match) {
            return match[1].toLowerCase();
        }
    }
    return null;
}

// Get appropriate file extension
function getFileExtension(fileType) {
    const extensions = {
        javascript: '.js',
        js: '.js',
        python: '.py',
        py: '.py',
        html: '.html',
        css: '.css',
        typescript: '.ts',
        ts: '.ts',
        json: '.json',
        markdown: '.md',
        md: '.md',
        text: '.txt',
        txt: '.txt'
    };

    return extensions[fileType] || '.txt';
}

// Handle commands
function handleCommands(input) {
    if (input.startsWith('/write')) {
        return handleWriteCommand(input);
    }
    if (input === '/help') {
        console.log(chalk.cyan('\nAvailable commands:'));
        console.log(chalk.yellow('/write filename content') + ' - Write content to a file in the current directory');
        console.log(chalk.yellow('/help') + ' - Show this help message');
        console.log(chalk.yellow('exit') + ' - Exit the chat');
        console.log('\nYou can also ask me to create files using natural language, for example:');
        console.log(chalk.yellow('"Create a JavaScript file that logs hello world"'));
        console.log(chalk.yellow('"Generate a Python file that calculates fibonacci numbers"'));
        console.log();
        return true;
    }
    return false;
}

async function runChat() {
    try {
        // Initialize the chat model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: "When I ask you to create a file, please respond with ONLY the code that should go in that file, without any explanation or markdown formatting. For example, if I say 'create a javascript file that logs hello world', just respond with 'console.log(\"Hello, world!\");' and nothing else. For all other questions, please format your responses using markdown with proper headings, lists, code blocks, and emphasis where appropriate."
                },
                {
                    role: "model",
                    parts: "I understand. I will provide clean code for file creation requests and properly formatted markdown responses for all other questions."
                }
            ]
        });

        console.log(chalk.blue('Welcome to Gemini CLI Chat!'));
        console.log(chalk.yellow('Type your messages and press Enter. Type "/help" for available commands or "exit" to quit.\n'));

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: chalk.green('You > ')
        });

        rl.prompt();

        rl.on('line', async (input) => {
            if (input.toLowerCase() === 'exit') {
                console.log(chalk.blue('\nGoodbye!'));
                rl.close();
                return;
            }

            // Check if input is a command
            if (handleCommands(input)) {
                rl.prompt();
                return;
            }

            try {
                // Check if this is a file creation request
                if (isFileCreationRequest(input)) {
                    const fileType = getFileTypeFromRequest(input);
                    if (fileType) {
                        // Show typing indicator
                        process.stdout.write(chalk.cyan('Generating file content...'));

                        // Get the code from Gemini
                        const result = await chat.sendMessage(input);
                        const code = await result.response.text();

                        // Clear the typing indicator
                        process.stdout.clearLine(0);
                        process.stdout.cursorTo(0);

                        // Generate filename
                        const extension = getFileExtension(fileType);
                        const filename = `${fileType}_${Date.now()}${extension}`;
                        const filepath = path.join(process.cwd(), filename);

                        // Write the file
                        fs.writeFileSync(filepath, code);
                        console.log(chalk.green(`\nFile created successfully: ${filename}`));
                        console.log(chalk.yellow('Content:'));
                        console.log(chalk.white(code));
                        console.log();
                    }
                } else {
                    // Regular chat interaction
                    process.stdout.write(chalk.cyan('Gemini is thinking...'));

                    // Get response from Gemini
                    const result = await chat.sendMessage(input);
                    const response = await result.response;
                    
                    // Clear the typing indicator
                    process.stdout.clearLine(0);
                    process.stdout.cursorTo(0);

                    // Display the response with markdown rendering
                    console.log(chalk.magenta('\nGemini > '));
                    const formattedResponse = response.text()
                        .replace(/^```/gm, '\n```')  // Add newline before code blocks
                        .replace(/```$/gm, '```\n')  // Add newline after code blocks
                        .replace(/\*\*/g, '__')      // Convert bold syntax
                        .replace(/\*/g, '_');        // Convert italic syntax
                    console.log(marked(formattedResponse));
                    console.log(); // Empty line for better readability

                }
            } catch (error) {
                console.error(chalk.red('\nError:', error.message));
            }

            rl.prompt();
        });

        rl.on('close', () => {
            process.exit(0);
        });

    } catch (error) {
        console.error(chalk.red('Error initializing chat:', error.message));
        process.exit(1);
    }
}

// Display ASCII art banner and info
function displayBanner() {
    console.log(chalk.cyan(`
    ╔════════════════════════════════════════════════════════════╗
    ║                                                            ║
    ║     ██████╗ ███████╗███╗   ███╗██╗███╗   ██╗██╗          ║
    ║    ██╔════╝ ██╔════╝████╗ ████║██║████╗  ██║██║          ║
    ║    ██║  ███╗█████╗  ██╔████╔██║██║██╔██╗ ██║██║          ║
    ║    ██║   ██║██╔══╝  ██║╚██╔╝██║██║██║╚██╗██║██║          ║
    ║    ╚██████╔╝███████╗██║ ╚═╝ ██║██║██║ ╚████║██║          ║
    ║     ╚═════╝ ╚══════╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝          ║
    ║                                                            ║
    ║                    CLI Assistant                           ║
    ║                                                            ║
    ╚════════════════════════════════════════════════════════════╝
    `));
    
    console.log(chalk.yellow('Created by: ') + chalk.green('Onesmus Bett'));
    console.log(chalk.yellow('GitHub: ') + chalk.blue('https://github.com/onesmuskipchumba0'));
    console.log(chalk.yellow('Email: ') + chalk.blue('onesmuskipchumba5@gmail.com'));
    console.log('\n' + chalk.cyan('Welcome to Gemini CLI Assistant! How can I help you today?') + '\n');
}

// Set up CLI commands
const program = new Command();

program
    .version('1.0.0')
    .description('Gemini AI CLI Assistant');

// Display banner before starting the chat
displayBanner();

program.action(runChat);

program.parse(process.argv);
