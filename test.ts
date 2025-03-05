code-mentor/
│── public/                      # Static assets
├── app/
│   ├── (auth)/               # Authentication pages (login, signup)
│   ├── (root)/  
│   │   ├── chat/[chat_id]/page.tsx            # Chat history (CRUD)
│   │   ├── layout.tsx               # AI assistant responses
│   │   ├── page.tsx         # Feedback submission
├── components/               # Reusable UI components
│   ├── layout/               # Sidebar, Navbar, etc.
│   ├── chat/                 # Chat UI components
│   ├── feedback/             # Feedback UI
├── hooks/                    # Custom hooks (e.g., useSidebarToggle)
├── lib/                      # API calls & utilities
│   ├── actions/              # api calls and actions
│   ├── appwrite.ts
├── context/                  # App context (Auth, Theme)
├── styles/                   # Global & component styles
│── .env.local                     # API keys & environment variables
│── next.config.js                 # Next.js configuration
│── tailwind.config.js             # Tailwind CSS config
│── README.md                      # Project documentation
