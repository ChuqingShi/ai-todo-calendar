# AI Todo Calendar

> A user-friendly todo + calendar app with **drag-and-drop scheduling** and **smart automation**, built together with Claude Code.  
> *(Future updates will include AI-powered task recommendations and natural language input.)*



## 🎥 Demo Video  
Check out the app in action:

https://github.com/user-attachments/assets/b29d74e4-2863-404a-bc8d-1bb9b8db6032



## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Package manager, for example **npm**

### Installation and Run
1. Clone the repository:
```bash
git clone https://github.com/ChuqingShi/ai-todo-calendar.git && cd ai-todo-calendar
```

2. Install dependencies:
```bash
npm install
```

3. Build and start the app:
```bash
npm run build && npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser 🎉



## 🌱 My Journey to Building This App  

I used to buy **weekly planner books** all the time, and every single one left me **frustrated**. The pages always got overcrowded, todos spilled over, and I felt boxed in.  So I tried to design my own paper planner. It was better… but still not the best.  

That’s when I turned to **Vibe Coding**, and started creating the planner I actually needed:  

- 💡 `Quick Add` — capture ideas instantly, even without deadlines  
- 🖱️ `Drag & Drop` — no more cramped daily boxes; just move tasks where they fit  
- ⏳ `Unscheduled Staging Area` — a holding zone for important but flexible todos  
- 📆 `Day/Week/Month Views` — focus on today, see the week, plan the month  
- ✍️ `Inline Editing` — clean updates, no messy scratch-outs  
- 🔁 `One-Click Postpone` — shift unfinished tasks to tomorrow instantly  
- 🗑️ `Complete/Delete/Clear` — keep the focus on what’s truly unfinished  
- 💾 `Persistence` — auto-save to browser localStorage + scroll memory

Now, instead of wrestling with planners that don’t fit my workflow, I’ve built one that **adapts to me**.  



## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Drag & Drop**: @dnd-kit
- **Calendar**: FullCalendar
- **Date Utilities**: date-fns



## 📝 Roadmap for AI Features
Planned enhancements include:
- 🗣️ **Natural language todo creation** “I need to call mom two days later” -> adds "call mom" on specified date  
- 📊 **Habit-based scheduling suggestions** - Notices you often do shopping on Saturdays → suggests Saturday for "buy groceries"
- 🤖 **Smart Scheduling Assistant** - Sees you have many tasks on Monday → suggests spreading some to Tuesday
- ☁️ **Cloud sync for cross-device use**

