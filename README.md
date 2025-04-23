# Rubber Duck AI

Quacky is an AI-powered rubber duck debugging assistant that helps you think through problems using Socratic questioning. Instead of just giving you answers, Quacky asks thoughtful questions to guide you toward your own solutions.

As opposed to the normal LLM flow of asking LLMs for a solution, Quacky does NOT give you solutions,
but instead helps you yourself to solve the problem.

## What is Rubber Duck Debugging?

Rubber duck debugging is a method of debugging code by explaining it line-by-line to an inanimate object, like a rubber duck. The process of explaining the problem often helps you find the solution on your own. 
Quacky takes this concept further by actively engaging with you through AI-powered conversation -
it's a rubber duck that talks back!

## Features

- **Interactive AI Conversation**: Talk to Quacky about your problems and receive Socratic-style questions to help you think more deeply
- **Multiple Modes**: Choose between Programming, General, and Custom modes to tailor Quacky's assistance to your needs
- **Screen Sharing**: Share your screen to show Quacky what you're working on
- **Webcam Support**: Enable your webcam for a more personal interaction
- **Voice Input/Output**: Speak to Quacky and hear responses for a natural conversation flow

## Modes

- **Programming Mode**: Optimized for coding problems and technical discussions
- **General Mode**: For everyday problem-solving and brainstorming
- **Quack Pro**: Just for laughs
- **Custom Mode**: Define your own prompt for specialized assistance

## Usage

```
$ npm install && npm start
```

Then input your Gemini API key when prompted.

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Navigate to the API keys section
4. Create a new API key
5. Copy and paste it into Quacky when prompted

### Using Quacky

1. Select a mode (Programming, General, or Custom)
2. Speak to Quacky about your problem or use the text input
3. Quacky will ask questions to help you think through your problem
4. You can share your screen or webcam to show Quacky what you're working on
5. Click the info button (bottom right) for more information about Quacky

## development

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
Project consists of:

- an Event-emitting websocket-client to ease communication between the websocket and the front-end
- communication layer for processing audio in and out

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
````