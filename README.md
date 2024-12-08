# Gemini CLI Chat

An interactive command-line interface for chatting with Google's Gemini AI.

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
gemini-chat
```

- Type your messages and press Enter to send them to Gemini
- Type `exit` to end the chat session
- Markdown in responses is automatically rendered in the terminal

## Features

- Interactive chat interface
- Real-time responses from Gemini AI
- Color-coded messages for better readability
- Markdown rendering in the terminal
- Simple command-line interface
- Typing indicator while waiting for responses
- Support for tables, code blocks, and other markdown elements

## Requirements

- Node.js v14 or higher
- Gemini API key
