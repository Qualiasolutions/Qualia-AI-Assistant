# Qualia AI Assistant for Tzironis

An AI-powered assistant application for Tzironis, a wholesale company in Greece. This application leverages the Mistral AI API to provide advanced AI capabilities wrapped in a modern, user-friendly interface.

## Features

- **Mistral AI Integration**: Connects to the powerful Mistral AI models for enhanced performance and cost efficiency
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
- **API**: Next.js API routes for Mistral AI communication
- **Authentication**: Simple username/password authentication
- **Voice**: Web Speech API for speech recognition and synthesis

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Mistral AI API key (sign up at https://console.mistral.ai/)

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
   # Mistral AI Configuration
   MISTRAL_API_KEY=your_mistral_api_key_here
   MISTRAL_MODEL=mistral-large-latest  # Or another model like mistral-small, mistral-medium

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

## Why Mistral AI?

Mistral AI offers several advantages over other AI providers:

- **Performance**: Mistral models deliver comparable quality to competitors at a fraction of the cost
- **Data Privacy**: Enhanced data privacy controls and EU-based operations
- **Cost Efficiency**: Significantly lower pricing model compared to OpenAI
- **Open-Weights Models**: Options for fine-tuning and customization
- **Low Latency**: Faster response times improve the chat experience

## Recommended Deployment

The application is optimized for deployment on Vercel, but can be deployed on any platform that supports Next.js.

## License

This project is proprietary and owned by Qualia Solutions.

## Contact

For more information, contact Qualia Solutions.
