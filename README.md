# Gemini CLI Chat

An interactive command-line interface for chatting with Google's Gemini AI.

![Screenshot 2024-12-08 102713](https://github.com/user-attachments/assets/e098ac61-2b6e-4698-846a-b8fd8eccbc10)

## Installation

### Local Installation
1. Clone this repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file in the root directory and add your Gemini API key:
```
GEMINI_API_KEY=your-api-key-here
```

### Global Installation
To install the CLI globally and use it from anywhere:

```bash
npm install -g .
```

## Usage

### If installed locally:
```bash
npm start
```

### If installed globally:
```bash
chat
```

### Available Commands
- Type your messages and press Enter to send them to Gemini
- Type `exit` to end the chat session
- Type `/help` to see available commands
- Type `/write filename content` to create a file in the current directory
- Ask Gemini to create files using natural language

### File Creation Examples
You can ask Gemini to create files using natural language. Here are some examples:

```bash
# Create a JavaScript file
"Create a JavaScript file that logs hello world"
"Make a JavaScript file that calculates fibonacci numbers"

# Create a Python file
"Generate a Python file that sorts a list"
"Create a Python file with a simple web server"

# Create other types of files
"Create an HTML file with a basic webpage"
"Generate a CSS file for a navigation menu"
```

The files will be created in your current directory with appropriate extensions and generated content.

Supported file types:
- JavaScript (.js)
- Python (.py)
- HTML (.html)
- CSS (.css)
- TypeScript (.ts)
- JSON (.json)
- Markdown (.md)
- Text (.txt)

## Features

- Interactive chat interface
- Real-time responses from Gemini AI
- Color-coded messages for better readability
- Markdown rendering in the terminal
- Natural language file creation
- File writing capability in current directory
- Simple command-line interface
- Typing indicator while waiting for responses
- Support for tables, code blocks, and other markdown elements

## Requirements

- Node.js v14 or higher
- Gemini API key
