# Living Library 2.0: An AI-Powered Interactive Knowledge Hub

![Living Library 2.0](https://picsum.photos/seed/project-banner/1200/630)

Welcome to the official repository for Living Library 2.0, a modern, AI-powered web application designed for exploring, summarizing, and discussing a rich library of resources. This platform leverages the power of Google's Gemini AI to create an interactive and insightful experience, allowing users to consume, contribute, and engage with knowledge in a dynamic new way.

The application is built with a modern frontend stack and is designed to run directly in the browser, making it easy to set up and explore.

---

## ✨ Core Features

This application is packed with features designed for a comprehensive and engaging user experience:

-   **📚 Rich Library & Advanced Search:**
    -   Explore a diverse, pre-populated collection of articles and community-submitted stories.
    -   Find exactly what you're looking for with a powerful search that queries titles, descriptions, authors, and tags.
    -   Refine results with intuitive category and tag filters for a tailored browsing experience.

-   **🧠 AI-Powered Content Interaction:**
    -   **Instant Summaries:** Don't have time to read a full article? The Gemini API generates concise, easy-to-read summaries for any resource in the library, available directly on the resource page.
    -   **Smart Content Processing:** When users upload their own stories (documents or audio files), the Gemini API automatically:
        -   Extracts text from documents (`.pdf`, `.doc`, `.txt`).
        -   Transcribes audio files (`.mp3`, `.wav`, etc.) into text.
        -   Generates a coherent summary of the content.
        -   Suggests relevant tags to categorize the story, which the user can then edit.

-   **💬 Conversational AI Assistant:**
    -   Engage in a natural conversation with a smart AI assistant powered by a Gemini chat model.
    -   Ask questions about resources, explore complex topics, or get help with general knowledge queries, all within a responsive, history-aware chat interface.

-   **👤 User Authentication & Personalization:**
    -   Securely sign up and log in using Firebase Authentication.
    -   Manage your user profile, including editing your display name.
    -   A dedicated profile page provides a centralized view of all your contributions, bookmarks, and activity.

-   **✍️ Community Contributions & Publishing Workflow:**
    -   Authenticated users can share their voice by uploading their own stories.
    -   A two-step submission process guides the user from uploading a file to reviewing and editing the AI-processed content.
    -   Stories are initially saved as `pending_review`, allowing users to make final edits before publishing them to the public library.

-   **💖 Rich Community Engagement:**
    -   **Liking:** Show appreciation for resources you enjoy.
    -   **Commenting:** Join the discussion by posting comments on articles.
    -   **Bookmarking:** Save interesting resources to a personal list on your profile for easy access later.
    -   **Empathy Meter:** A unique feature allowing users to rate how a story made them feel on a 5-point scale, contributing to a community empathy score.
    -   **Content Reporting:** Flag inappropriate content for review to help maintain a safe community space.

-   **🎨 Modern & Accessible UI/UX:**
    -   **Responsive Design:** Enjoy a seamless and intuitive experience on any device, from desktop to mobile.
    -   **Theming:** Switch between Light, Dark, and System-based themes for your viewing comfort, with preferences saved locally.
    -   **Accessibility:** ARIA attributes and semantic HTML are used to ensure the application is accessible to all users.

---

## 💻 Technology Stack

-   **Frontend:**
    -   **Framework:** React 19 (with Hooks)
    -   **Language:** TypeScript
    -   **Routing:** React Router (`react-router-dom`)
    -   **Styling:** Tailwind CSS (for utility-first styling)

-   **Artificial Intelligence:**
    -   **API:** Google Gemini API (`@google/genai`)
    -   **Model:** `gemini-2.5-flash` for summarization, content extraction, transcription, and chat.

-   **Backend & Services:**
    -   **Authentication:** Firebase Authentication

-   **Development & Build:**
    -   **Transpilation (In-Browser):** Babel Standalone
    -   **Module Loading (In-Browser):** Import Maps
    -   **(Optional) Development Server:** Vite

---

## 📂 Project Architecture

The codebase is organized into logical directories to maintain clarity, separation of concerns, and scalability.

```
/
├── public/               # Static assets
├── README.md             # This file
├── index.html            # The single HTML entry point with import maps and Babel setup
├── package.json          # Project dependencies and scripts
└── src/
    ├── components/       # Reusable React components (Navbar, ResourceCard, LoadingSpinner, etc.)
    ├── contexts/         # React Context for global state management
    │   ├── AuthContext.tsx # Manages user state, auth, and all user-generated content (in-memory)
    │   └── ThemeContext.tsx# Manages light/dark/system theme
    ├── pages/            # Top-level page components for each route (HomePage, LibraryPage, etc.)
    ├── services/         # Modules for interfacing with external APIs
    │   ├── firebase.ts   # Firebase initialization and configuration
    │   └── geminiService.ts# All client-side calls to the Google Gemini API
    ├── types.ts          # Centralized TypeScript type definitions and interfaces
    ├── constants.tsx     # Static data for the application (e.g., pre-populated resources)
    ├── App.tsx           # Main application component with routing logic
    └── index.tsx         # Entry point of the React application, mounts App to the DOM
```

---

## 🚀 Getting Started

This project is configured to run directly in the browser without a build step, making it exceptionally easy to get started.

### Prerequisites

-   A modern web browser (Chrome, Firefox, Edge, etc.).
-   A code editor (e.g., Visual Studio Code).
-   A simple local web server. The `http-server` npm package is a great, simple choice.

### ⚠️ Crucial Configuration

Before running the application, you **must** configure Firebase and the Gemini API key.

**1. Configure Firebase:**

The application uses Firebase for user authentication. The provided configuration is a placeholder and will not work.

-   Navigate to `src/services/firebase.ts`.
-   Replace the placeholder `firebaseConfig` object with the configuration from your own Firebase project.
-   **How to get your config:**
    1.  Go to the [Firebase Console](https://console.firebase.google.com/).
    2.  Select your project (or create a new one).
    3.  Go to **Project settings** (gear icon) > **General** tab.
    4.  Scroll to the "Your apps" section and select your web app.
    5.  In the "SDK setup and configuration" section, choose "Config" and copy the object.
-   The app includes a prominent warning screen that will guide you if this configuration is missing.

**2. Configure Google Gemini API Key:**

All AI features are powered by the Google Gemini API.

-   Obtain an API key from [**Google AI Studio**](https://aistudio.google.com/app/apikey).
-   The application is designed to read this key from an environment variable: `process.env.API_KEY`.
-   **Important:** To run the application, you must make this key available to the browser. For local testing, you can temporarily add the following script tag to the `<head>` of `index.html`:
    ```html
    <script>
      // FOR LOCAL DEVELOPMENT ONLY - DO NOT COMMIT THIS
      window.process = {
        env: {
          API_KEY: 'YOUR_GEMINI_API_KEY_HERE'
        }
      };
    </script>
    ```
-   **⚠️ Do not hardcode your API key or commit it to version control.** For a production deployment, this key should be managed securely, ideally by moving API calls to a backend server.

### Running the Application

1.  **Serve the project folder:**
    -   Open your terminal in the project's root directory.
    -   If you have Node.js installed, you can easily start a server: `npx http-server`
    -   This will provide a local URL (e.g., `http://localhost:8080`).

2.  **Open in browser:**
    -   Navigate to the local URL in your web browser. The application should load and run.

---

## 🔧 In-Depth Functional Walkthrough

### AI Integration (`services/geminiService.ts`)

This service is the bridge to the Google Gemini API, handling all AI-related logic.

-   **`processFileContent(file)`:** This is the core function for user-contributed stories.
    1.  It takes a `File` object (document or audio).
    2.  It converts the file to a base64 string for transmission.
    3.  It constructs a detailed multi-part prompt, sending the file data and a text prompt to the `gemini-2.5-flash` model.
    4.  The prompt instructs the AI to perform a sequence of tasks: extract the full text (or transcribe audio), generate a summary, and create a list of relevant tags.
    5.  It leverages Gemini's JSON mode (`responseMimeType: 'application/json'`) to ensure a structured, reliable response, which is then parsed and returned.

-   **`getChatResponse(history, message)`:** This function powers the AI Assistant.
    1.  It uses the `ai.chats.create` method to initialize a stateful conversation.
    2.  It passes the entire previous conversation `history` to provide context to the model, allowing for follow-up questions.
    3.  It sends the new user `message` and returns the AI's text response.

### State Management (`contexts/AuthContext.tsx`)

This is the central nervous system for user data and application state.

-   It wraps the Firebase Authentication `onAuthStateChanged` listener to reactively manage the `currentUser` state.
-   **Important Limitation:** This project does **not** use a persistent database like Firestore. Consequently, `AuthContext` manages all user-generated content (stories, comments, likes, bookmarks, ratings) in React's in-memory state.
    -   **This means all user-generated data is ephemeral and will be completely reset when the page is refreshed or the user logs out.**
-   It provides memoized functions (`addStory`, `addComment`, `toggleLike`, etc.) that components throughout the app can use to modify this global, albeit temporary, state.

### Theming (`contexts/ThemeContext.tsx`)

-   Manages the visual theme (light, dark, or system).
-   It applies the correct CSS class (`dark`) to the `<html>` element to trigger Tailwind CSS's dark mode variants.
-   It persists the user's theme preference to `localStorage` for a consistent experience across sessions.
-   When set to 'system', it listens for changes in the operating system's theme preference and updates the UI automatically.

### AIAssistantPage.tsx

This page contains the AI-powered chat assistant.

-   **`findRelevantStories(userMessage: string)`**: This function is responsible for searching the library for stories that are relevant to the user's message. It performs a case-insensitive search on the story's title, category, tags, and short description. It returns an array of matching stories.

-   **`scrollToBottom()`**: This is a utility function that ensures the chat window automatically scrolls to the latest message, providing a smooth user experience.

-   **`handleSendMessage(e: React.FormEvent)`**: This function is triggered when the user sends a message. It orchestrates the entire process of getting an AI response. It does the following:
    1.  Adds the user's message to the chat history.
    2.  Calls `findRelevantStories` to find relevant stories.
    3.  If relevant stories are found, it enhances the user's message with context from the stories.
    4.  Sends the (potentially enhanced) message to the Gemini API via the `getChatResponse` function.
    5.  Adds the AI's response to the chat history.
    6.  If relevant stories were found, it formats them as links and includes them in the AI's response.

### AddStoryPage.tsx

This page allows users to add new stories to the library.

-   **`handleFileChange(e: React.ChangeEvent<HTMLInputElement>)`**: This function is triggered when the user selects a file to upload. It performs the following actions:
    1.  Validates the file type, ensuring it's a PDF, DOC, TXT, or audio file.
    2.  If the file is valid, it calls the `processFileContent` function from the `geminiService`.
    3.  This service extracts the text content, generates a summary, and suggests tags and categories.
    4.  The extracted data is then used to populate the story details form.

-   **`handleSubmit(e: React.FormEvent, status: 'published' | 'pending_review')`**: This function is called when the user submits the story form. It does the following:
    1.  Validates that all required fields are filled.
    2.  Calls the `addStory` function from the `AuthContext`, passing in the story data.
    3.  The story is saved with a status of either `published` or `pending_review`.
    4.  Redirects the user to their profile page upon successful submission.

### AuthPage.tsx

This page handles both user login and signup.

-   **`handleLogin(e: React.FormEvent)`**: This function is called when the user submits the login form. It calls the `login` function from the `AuthContext` with the user's email and password.

-   **`handleSignup(e: React.FormEvent)`**: This function is called when the user submits the signup form. It calls the `signup` function from the `AuthContext` with the user's name, email, password, and profile image.

-   **`resetForm()`**: This utility function clears all the form fields.

-   **`switchMode(newMode: AuthMode)`**: This function switches the component between the 'login' and 'signup' modes.

-   **`handleImageChange(e: React.ChangeEvent<HTMLInputElement>)`**: This function is triggered when the user selects a profile image. It sets the selected image file to the component's state and displays a preview.

### EditStoryPage.tsx

This page allows users to edit their own stories.

-   **`handleSave(publish: boolean)`**: This function is called when the user saves their changes. It calls the `updateStory` function from the `AuthContext`, passing in the updated story data. The `publish` argument determines whether the story's status should be changed to `published`.

-   **`handleDelete()`**: This function is called when the user deletes their story. It calls the `deleteStory` function from the `AuthContext`.

### HomePage.tsx

This is the main landing page of the application.

-   **`handleCloseModal()`**: This function closes the welcome modal that is displayed to new users.

-   **`allResources`**: This is a memoized value that combines the pre-populated resources with the user-submitted stories. This is done for performance, to avoid re-calculating the list on every render.

-   **`mostViewedAuthors`**: This is a memoized value that calculates the most viewed authors. It does this by:
    1.  Counting the number of likes for each author's stories.
    2.  Sorting the authors by the total number of likes.
    3.  Returning the top authors.

-   **`handleAuthorClick(authorName: string)`**: This function is called when a user clicks on an author's name. It navigates the user to the library page, with the author's name pre-filled in the search bar.

### LibraryPage.tsx

This page displays the library of all available resources.

-   **`allResources`**: This is a memoized value that combines the pre-populated resources with the user-submitted stories.

-   **`categories`**: This is a memoized value that generates a unique list of all categories from the available resources.

-   **`allTags`**: This is a memoized value that generates a unique list of all tags from the available resources.

-   **`handleTagClick(tag: string)`**: This function is called when a user clicks on a tag. It adds or removes the tag from the list of selected tags, which is then used to filter the resources.

-   **`filteredResources`**: This is a memoized value that filters the resources based on the user's search query, selected category, and selected tags. It performs a case-insensitive search on the resource's title, author, and description.

### ProfilePage.tsx

This page displays the user's profile and their activity.

-   **`bookmarkedResources`**: This is a memoized value that filters the list of all resources to only include those that the user has bookmarked.

-   **`userStories`**: This is a memoized value that filters the list of all stories to only include those that were authored by the current user.

-   **`userComments`**: This is a memoized value that filters the list of all comments to only include those that were made by the current user.

-   **`userReports`**: This is a memoized value that filters the list of all reports to only include those that were made by the current user.

-   **`handleImageChange(e: React.ChangeEvent<HTMLInputElement>)`**: This function is triggered when the user selects a new profile image. It sets the selected image file to the component's state and displays a preview.

-   **`handleSave()`**: This function is called when the user saves their profile changes. It calls the `updateUserProfile` function from the `AuthContext`, passing in the updated name and profile image.

-   **`handleDeleteAccount()`**: This function is called when the user deletes their account. It calls the `deleteAccount` function from the `AuthContext`.

-   **`getStatusBadge(status: 'processing' | 'pending_review' | 'published' | undefined)`**: This function returns a color-coded badge based on the story's status.

-   **`handleDeleteStory(storyId: string, storyTitle: string)`**: This function is called when the user deletes one of their stories. It calls the `deleteStory` function from the `AuthContext`.

### ResourcePage.tsx

This page displays a single resource, with its content, comments, and other interactions.

-   **`handlePostComment(e: React.FormEvent)`**: This function is called when the user posts a comment. It calls the `addComment` function from the `AuthContext`.

-   **`handleDeleteComment(commentId: string)`**: This function is called when the user deletes a comment. It calls the `deleteComment` function from the `AuthContext`.

-   **`isReported`**: This is a memoized value that checks if the current user has already reported the resource.

-   **`handleReport()`**: This function is called when the user reports a resource. It calls the `reportContent` function from the `AuthContext`.

-   **`handleDeleteStory()`**: This function is called when the author of a story deletes it. It calls the `deleteStory` function from the `AuthContext`.
