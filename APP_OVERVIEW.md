# Write Timeline v1 - Application Overview

## Introduction
**Write Timeline v1** is a mobile-first, AI-assisted writing application built with React Native and Expo. It allows users to create writing projects, edit rich text, and collaborate with an AI assistant that can read and modify the document content in real-time.

## Key Features
- **Project Management:** Create, rename, and manage multiple writing projects.
- **Rich Text Editor:** Fully featured mobile rich text editor powered by `@10play/tentap-editor`.
- **AI Co-writer:**
  - Context-aware chat interface.
  - **Tools:** The AI can `readProjectContent` to understand context and `updateProjectContent` to rewrite or append text directly to the editor.
  - Multi-thread support: Multiple chat sessions per project.
- **Offline First:** All data is persisted locally using `AsyncStorage` and `@legendapp/state`.

## Tech Stack
- **Framework:** [Expo](https://expo.dev) (React Native)
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction)
- **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS)
- **State Management:** [@legendapp/state](https://legendapp.com/open-source/state/)
- **Editor:** [@10play/tentap-editor](https://10play.github.io/10tap-editor/)
- **AI SDK:** [Vercel AI SDK](https://sdk.vercel.ai/docs)
- **Backend/API:** Expo API Routes (`app/api/chat+api.ts`)

## Architecture

### Data Model (`lib/state/store.ts`)
The application uses a centralized reactive store.
- **Projects:** Stored as a dictionary keyed by UUID.
  - `content`: HTML string of the document.
  - `notes`: Side notes for the project.
  - `threads`: Collection of chat histories with the AI.
- **Persistence:** Automatically synced to `AsyncStorage`.

### AI Integration (`app/api/chat+api.ts`)
- **Endpoint:** `/api/chat`
- **Model:** Configured to use `openai/gpt-5.2-chat` (Note: This appears to be a placeholder or specific proxy configuration).
- **Tools:**
  - `readProjectContent`: Fetches current editor content.
  - `updateProjectContent`: Modifies editor content.

### Editor Synchronization
The app handles two-way synchronization between the `TentapEditor` (WebView) and the global store:
1. **User Input:** Updates state with `source: 'editor'`.
2. **AI/External Input:** Updates state with `source: 'external'`, triggering a re-render in the WebView only when necessary.

## File Structure Highlights
- `app/`: Expo Router pages.
  - `(tabs)/`: Main navigation (Home, Settings).
  - `project/[id].tsx`: Main project view combining Editor and Chat.
  - `api/chat+api.ts`: Backend logic for AI stream.
- `components/ui/`: Reusable UI components (Dialogs, Inputs, etc.).
- `lib/state/`: State management logic.

## Setup & usage
1. `npm install`
2. `npx expo start`
3. Ensure `.env` is configured with necessary API keys (e.g., OPENAI_API_KEY) if running the AI features.
