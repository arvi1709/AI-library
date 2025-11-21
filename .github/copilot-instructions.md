# AI-Powered Interactive Knowledge Hub Instructions

This document provides instructions for AI coding agents to effectively contribute to the "Living Library 2.0" codebase.

## Project Overview

"Living Library 2.0" is a web application built with React and TypeScript, designed to be an interactive knowledge hub. It leverages Google's Gemini AI for content summarization, interaction, and a conversational AI assistant. Firebase is used for user authentication and backend services.

## Tech Stack

- **Frontend:** React 19, TypeScript, React Router, Tailwind CSS
- **AI:** Google Gemini API (`@google/genai`)
- **Backend:** Firebase Authentication
- **Development:** Babel Standalone (In-Browser), Vite (Optional)

## Key Architectural Concepts

- **Component-Based Architecture:** The application is built with reusable React components located in `src/components`.
- **Centralized State Management:** React Context is used for global state management. `AuthContext.tsx` manages user authentication and user-generated content, while `ThemeContext.tsx` handles theme switching.
- **Service-Oriented Modules:** External API interactions are handled in `src/services`. `firebase.ts` initializes Firebase, and `geminiService.ts` manages all client-side calls to the Gemini API.
- **Single Entry Point:** `index.html` is the main entry point, with `index.tsx` mounting the React application.

## Development Workflow

- **Installation:** Run `npm install` to install dependencies.
- **Running the Application:** Use `npm run dev` to start the Vite development server.
- **Building for Production:** Execute `npm run build` to create a production-ready build.

## Coding Conventions

- **Styling:** Use Tailwind CSS for styling.
- **Type Definitions:** Centralized TypeScript type definitions are in `src/types.ts`.
- **Static Data:** Application-wide constants are stored in `src/constants.tsx`.

## Important Files

- `src/App.tsx`: Main application component with routing logic.
- `src/services/geminiService.ts`: Handles all interactions with the Google Gemini API.
- `src/contexts/AuthContext.tsx`: Manages user authentication and session data.
- `src/constants.tsx`: Contains pre-populated data and application constants.

These instructions should help guide AI coding agents in making meaningful contributions to the project.
