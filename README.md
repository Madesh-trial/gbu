````markdown
# Treasure Quest - Treasure Hunt Game

A interactive treasure hunt game with admin controls for managing questions and hint passwords.

## Project info

**URL**: https://lovable.dev/projects/c038fad2-7154-48f9-9492-de9379be5c06

## Features

### Player Features
- **Interactive Treasure Hunt**: Answer 5 riddles to unlock treasure chests
- **Hint System**: View hints by entering a password (password is managed by admin)
- **Leaderboard**: Compete with other players and track completion times
- **Audio Controls**: Toggle background music on/off
- **Session Persistence**: Your game progress is saved locally

### Admin Features
- **Admin Panel**: Secure password-protected admin interface
- **Question Management**: Create, edit, and delete questions with answers and hints
- **Password Management**: Update admin password and the global hint unlock password
- **Real-time Sync**: Changes are immediately reflected in the game

## Quick Start

### Prerequisites
- Node.js >= 18 (or use nvm)
- npm, pnpm, or bun package manager

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm install

# Step 4: Set up environment variables
# Create a .env file in the project root with your Supabase credentials:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Step 5: Start the development server
npm run dev
```

The app will start at `http://localhost:5173`

## Usage

### For Players
1. **Start the Game**: Enter your name or play anonymously
2. **Answer Questions**: Solve each riddle to unlock the next chest
3. **Unlock Hints**: After 2 incorrect attempts, click the lightbulb icon and enter the hint password to view the hint
4. **Complete the Quest**: Finish all 5 riddles and see your time on the leaderboard
5. **View Leaderboard**: Check your ranking against other players

### For Admins
1. **Access Admin Panel**: Click the settings icon (⚙️) on the start screen
2. **Login**: Enter the admin password (default: `admin123`)
3. **Manage Questions**:
   - Click "Add New Question" to create a new question
   - Click "Edit" to modify an existing question
   - Click "Delete" to remove a question
4. **Manage Passwords**:
   - Click "Manage Passwords" button
   - Update the admin password and/or the hint unlock password
   - Changes take effect immediately
5. **Logout**: Click "Logout" to exit the admin panel

## Default Credentials

**Admin Password**: `admin123`
**Hint Password**: `hint123`

⚠️ **Important**: Change these passwords in the admin panel immediately after first login for security!

## Database Schema

### Questions Table
- `id`: UUID (Primary Key)
- `question_number`: INTEGER (UNIQUE)
- `question_text`: TEXT
- `answer`: TEXT (stored in lowercase)
- `hint`: TEXT
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

### Admin Config Table
- `id`: UUID (Primary Key)
- `admin_password_hash`: TEXT
- `hint_password_hash`: TEXT
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

### Treasure Unlocks Table (Leaderboard)
- `id`: UUID (Primary Key)
- `display_name`: TEXT
- `user_id`: UUID (optional)
- `level`: INTEGER
- `attempts`: INTEGER
- `time_taken`: INTEGER (seconds)
- `timestamp`: TIMESTAMPTZ

## Technologies

This project uses:
- **Vite**: Fast build tool and dev server
- **React**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Supabase**: Backend and real-time database
- **shadcn-ui**: Beautiful UI components
- **Tailwind CSS**: Styling
- **GSAP**: Animations
- **Framer Motion**: Advanced animations
- **React Router**: Navigation
- **React Hook Form**: Form handling
- **Sonner**: Toast notifications

## Development

### Build for Production
```sh
npm run build
```

### Preview Production Build
```sh
npm run preview
```

### Run Linter
```sh
npm run lint
```

## Supabase Setup

### Create Tables
1. Go to your Supabase project dashboard
2. Open the SQL editor
3. Run the migrations in `supabase/migrations/` in order

Or use the Supabase CLI:
```sh
supabase db push
```

### Set Up Row-Level Security (RLS)
All tables have RLS enabled with policies configured to:
- Allow public read access to questions and leaderboard
- Prevent direct client-side modifications (admins use the app interface)

## Deployment

### Deploy to Vercel
```sh
# Login to Vercel
vercel login

# Deploy
vercel
```

### Deploy via Lovable
Simply open [Lovable](https://lovable.dev/projects/c038fad2-7154-48f9-9492-de9379be5c06) and click on Share → Publish.

### Connect Custom Domain
Navigate to Project > Settings > Domains and click "Connect Domain".

Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain)

## Security Notes

⚠️ **Important**:
1. The default admin and hint passwords are for demo purposes only
2. **Change passwords immediately** in the admin panel before deploying to production
3. The hint password is transmitted in plain text during gameplay (this is intentional for the user hint unlock feature)
4. The admin password should use proper bcrypt/Argon2 hashing for production
5. Consider implementing rate limiting on the admin endpoint
6. Enable HTTPS for all deployments
7. Never commit `.env` with real credentials to version control

## Troubleshooting

### Questions not loading
- Check your Supabase connection string in `.env`
- Verify that the `questions` table exists and has data
- Check browser console for errors

### Hints not working
- Verify the hint password is correct (default: `hint123`)
- Check that the `admin_config` table has a row with the password hash
- Ensure you've made 2 incorrect attempts before trying to unlock the hint

### Admin panel not opening
- Clear browser cache and local storage
- Verify the admin password is correct (default: `admin123`)
- Check that you're accessing `/admin` route

## Support

For issues or questions:
1. Check the [Supabase documentation](https://supabase.com/docs)
2. Visit the [shadcn-ui documentation](https://ui.shadcn.com)
3. Check [Vite documentation](https://vitejs.dev)

## License

This project is open source and available under the MIT License.

## How can I edit this code?

### Use Lovable
Simply visit the [Lovable Project](https://lovable.dev/projects/c038fad2-7154-48f9-9492-de9379be5c06) and start prompting. Changes will be committed automatically.

### Use your preferred IDE
Clone the repo and push changes. Pushed changes will be reflected in Lovable.

### Edit directly in GitHub
- Navigate to the desired file
- Click the "Edit" button (pencil icon)
- Make changes and commit

### Use GitHub Codespaces
- Click on the "Code" button (green button)
- Select the "Codespaces" tab
- Click "New codespace" to launch

````
