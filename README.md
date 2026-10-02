# EduPilot AI — Personalized Adaptive Learning Platform

**Learn at your pace. Know your next step.**

EduPilot AI is a personalized learning platform designed to help learners understand what they know, identify learning gaps, and follow a structured path toward improving their understanding.

Instead of giving every learner the same learning path, EduPilot combines diagnostic assessment, adaptive learning logic, AI-assisted tutoring, practice activities, and progress tracking to support a more personalized learning experience.

## Key Features

- **Diagnostic Assessment:** Evaluates a learner’s current understanding.
- **Gap Identification:** Highlights topics that need additional attention.
- **Personalized Roadmap:** Organizes learning topics into a structured path.
- **AI-Powered Tutor:** Provides explanations, examples, and question support using the Gemini API.
- **Structured Lessons:** Presents concepts in an organized learning sequence.
- **Practice and Review:** Reinforces learning through activities, hints, and review recommendations.
- **Progress Tracking:** Helps learners understand their progress and identify next steps.
- **Authentication:** Uses Supabase for learner sign-in.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Web application framework |
| React | User interface |
| TypeScript | Type-safe application development |
| Supabase | Authentication and learner data storage |
| Gemini API | AI-assisted tutoring and learning support |
| Adaptive Learning Logic | Topic sequencing and personalized recommendations |

## Getting Started

Follow these instructions to run EduPilot locally.

### Prerequisites

Make sure you have the following installed:

- Node.js (LTS recommended)
- npm
- Git
- A Supabase project
- A Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/ankurchopde/edupilot.git
cd edupilot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a file named `.env.local` in the project root.

Add the environment variables required by the application:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gemini API
GEMINI_API_KEY=your_gemini_api_key
```

**Important:** Confirm the exact variable names against the project's source code before running the app. If the application uses different names, update `.env.local` accordingly.

Keep API keys private. Do not commit `.env.local` or expose secret keys in client-side code.

### 4. Configure Supabase

1. Create or open your Supabase project.
2. Configure the authentication providers you want to use, such as Google sign-in.
3. Set the correct site URL and allowed redirect URLs for local development and deployment.
4. If using Supabase to store learner progress, ensure the required learner-state table and Row Level Security policies are configured.

### 5. Run the development server

```bash
npm run dev
```

Open the application at:

[http://localhost:3000](http://localhost:3000)

The development server will reload as you make changes to the source code.

## Production Build

To create a production build:

```bash
npm run build
```

To run the production build locally:

```bash
npm start
```

## Project Structure

The project uses the Next.js application structure. Key areas include:

```text
edupilot/
├── app/                  # Application pages and API routes
├── lib/                  # Shared utilities and Supabase client
├── public/               # Static assets
├── .env.local            # Local environment variables (not committed)
├── package.json          # Dependencies and scripts
└── README.md             # Project documentation
```

Additional folders may be present depending on the current implementation.

## Learning Workflow

EduPilot follows a continuous learning cycle:

1. The learner completes a diagnostic assessment.
2. The platform identifies strengths and learning gaps.
3. A structured learning roadmap guides the learner.
4. The learner studies lessons and asks the AI tutor questions.
5. Practice and review activities reinforce understanding.
6. Progress information helps guide the learner’s next steps.

## Project Team

**Team:** Ankur.1252100020

**Contact:**
- ankur.1252100020@vit.edu
- muleyradhikaa@gmail.com

## Project Status

EduPilot AI is a hackathon project. Features and integrations may continue to evolve as development progresses.

---

**EduPilot AI — Learn at your pace. Know your next step.**
