# Qualia AI Assistant for Tzironis

An AI-powered assistant application for Tzironis, a wholesale company in Greece. This application leverages the OpenAI Assistant API to provide advanced AI capabilities wrapped in a modern, user-friendly interface.

## Features

- **OpenAI Assistant Integration**: Connects to an existing OpenAI Assistant with specialized business capabilities
- **Voice Interaction**: Real-time voice input and output in both Greek and English
- **Multilingual Support**: Seamless switching between Greek and English interfaces
- **Business Capabilities**:
  - Lead generation based on industry and criteria
  - Invoice automation through Union.gr
  - Product information and queries
  - Internet search and information retrieval
- **Modern UI**: Clean, responsive design with dark/light mode support
- **Progressive Web App**: Can be installed on desktop and mobile devices

## Technologies

- **Frontend**: React, TypeScript, Next.js, Tailwind CSS
- **UI Framework**: Custom styling with Tailwind CSS
- **State Management**: React Hooks and Context
- **API**: Next.js API routes for OpenAI communication
- **Authentication**: Simple username/password authentication
- **Voice**: Web Speech API for speech recognition and synthesis

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- OpenAI API key
- OpenAI Assistant ID

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Qualiasolutions/Qualia-AI-Assistant.git
   cd Qualia-AI-Assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables by creating a `.env.local` file:
   ```
   # OpenAI API Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_ASSISTANT_ID=your_assistant_id_here

   # Authentication (in a production app, these would be stored securely)
   AUTH_USERNAME=user
   AUTH_PASSWORD=qualia
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=qualia_admin
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

## Recommended Deployment

The application is optimized for deployment on Vercel, but can be deployed on any platform that supports Next.js.

## License

This project is proprietary and owned by Qualia Solutions.

## Contact

For more information, contact Qualia Solutions.
