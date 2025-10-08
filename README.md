# AI Todo Calendar

> A user-friendly todo + calendar app with **drag-and-drop scheduling** and **smart automation**, built together with Claude Code.
>
> *Future updates will include AI-powered task recommendations and natural language input.*



## 🎬 Demo
**[Try it LIVE!](https://ai-todo-calendar-lk01ljxyo-chuqings-projects.vercel.app/todos)** or **[Watch it in ACTION!](https://github.com/user-attachments/assets/b29d74e4-2863-404a-bc8d-1bb9b8db6032)**



## 🚀 Getting Started

### Try It Online
Visit the [live demo](https://ai-todo-calendar-lk01ljxyo-chuqings-projects.vercel.app/todos). No installation needed!

### Run Locally

#### Prerequisites
- Node.js 18.18+
- Package manager, like **npm**

#### Install and Run
1. Clone the repository:
```bash
git clone https://github.com/ChuqingShi/ai-todo-calendar.git && cd ai-todo-calendar
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Build for Production

```bash
npm run build && npm start
```



## 🌱 My Journey Building This App  

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



## 🛠️ Tech Stack

- **Framework**: Next.js 15 (using the App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Drag & Drop**: @dnd-kit
- **Calendar**: FullCalendar
- **Date Utilities**: date-fns
- **Deployment**: Vercel



## 📝 Roadmap for Future

### Core Features
- ☁️ **Cross-Device Support & Cloud Sync**  
  Enable tasks to sync seamlessly across browsers and devices.

### AI Features
- 🗣️ **Natural language todo creation**  
  Example: “I need to call mom two days later” → adds "call mom" on the specified date  

- 📊 **Habit-based scheduling suggestions**  
  Notices you often shop on Saturdays → suggests Saturday for "buy groceries"  

- 🤖 **Smart Scheduling Assistant**  
  Detects overloaded days (e.g., Friday) → suggests spreading tasks across the week  

