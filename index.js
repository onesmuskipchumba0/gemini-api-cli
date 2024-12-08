#!/usr/bin/env node

import { GoogleGenerativeAI } from '@google/generative-ai';
import readline from 'readline';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { Command } from 'commander';
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';

// Configure marked to use terminal renderer
marked.setOptions({
    renderer: new TerminalRenderer({
        emoji: true,
        tableOptions: {
            chars: {
                'top': '─',
                'top-mid': '┬',
                'top-left': '┌',
                'top-right': '┐',
                'bottom': '─',
                'bottom-mid': '┴',
                'bottom-left': '└',
                'bottom-right': '┘',
                'left': '│',
                'left-mid': '├',
                'mid': '─',
                'mid-mid': '┼',
                'right': '│',
                'right-mid': '┤',
                'middle': '│'
            }
        }
    })
});

// Load environment variables
dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function runChat() {
    try {
        // Initialize the chat model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const chat = model.startChat();

        console.log(chalk.blue('Welcome to Gemini CLI Chat!'));
        console.log(chalk.yellow('Type your messages and press Enter. Type "exit" to quit.\n'));

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

            try {
                // Show typing indicator
                process.stdout.write(chalk.cyan('Gemini is thinking...'));

                // Get response from Gemini
                const result = await chat.sendMessage(input);
                const response = await result.response;
                
                // Clear the typing indicator
                process.stdout.clearLine(0);
                process.stdout.cursorTo(0);

                // Display the response with markdown rendering
                console.log(chalk.magenta('\nGemini > '));
                console.log(marked(response.text()));
                console.log(); // Empty line for better readability
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

// Set up CLI commands
const program = new Command();

program
    .version('1.0.0')
    .description('Interactive CLI for chatting with Gemini AI')
    .action(runChat);

program.parse(process.argv);
