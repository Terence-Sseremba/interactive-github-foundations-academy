import { useState, useEffect } from 'react';
import { 
  Home, 
  Map, 
  BookOpen, 
  Layers, 
  Terminal as TerminalIcon, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  ChevronRight, 
  Play, 
  Check, 
  X, 
  RotateCcw, 
  Code, 
  AlertTriangle, 
  Sparkles, 
  BookMarked, 
  Folder,
  Send,
  HelpCircle,
  Lightbulb,
  FileCode
} from 'lucide-react';
// This describes what every commit object looks like.
// Think of it like a form template — every commit MUST have these fields filled in.
type Commit = {
  id: string;         // unique identifier for the commit, e.g. "a1b2c3d"
  message: string;    // the commit message, e.g. "Fixed login bug"
  branch: string;     // which branch this commit belongs to
  files: string[];    // list of filenames that were changed
  timestamp: string;  // when the commit was made
};

// Shape of each file in the Practice Lab. Declared explicitly so that
// labFiles keeps its proper type now that its initial value can come
// from localStorage (JSON.parse returns `any`, so TypeScript needs help).
type LabFile = {
  name: string;
  status: string;
  content: string;
  stage: string;
};

// Shape of each line printed in the lab terminal.
type TerminalLog = {
  type: string;
  text: string;
};

// Shape of one quiz answer option. When the user clicks an option, the WHOLE
// option object (not just a string) is stored in quizAnswers — this type
// makes that explicit so TypeScript stops flagging `.correct` access.
type QuizOption = {
  label: string;    // e.g. "A"
  text: string;     // the answer text shown on the button
  correct: boolean; // whether this option is the right answer
};

// The official GitHub "mark" logo, rendered as an inline SVG component.
// (Newer lucide-react versions removed brand icons, so the logo lives here
// instead.) It accepts a className just like a lucide icon, and uses
// fill="currentColor" so existing text-color classes keep styling it —
// meaning every <Github className="..." /> below works exactly as before.
const Github = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

export default function App() {
  // Navigation & State
  // currentTab is NOT persisted — it's just which screen is open, not progress.
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    const saved = localStorage.getItem('gh-academy-completedLessons');
    // New users start with NO completed lessons (0% progress). The old default
    // pre-completed a fake 'welcome-tour' item, which showed 9% on first launch.
    return saved ? JSON.parse(saved) : [];
  });
  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem('gh-academy-xp');
    return saved ? JSON.parse(saved) : 150;
  });
  const [activeLesson, setActiveLesson] = useState<string>(() => {
    const saved = localStorage.getItem('gh-academy-activeLesson');
    return saved ? JSON.parse(saved) : 'lesson-1';
  });
  const [selectedStage, setSelectedStage] = useState<string>(() => {
    const saved = localStorage.getItem('gh-academy-selectedStage');
    return saved ? JSON.parse(saved) : 'working';
  });

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<string, QuizOption>>(() => {
    const saved = localStorage.getItem('gh-academy-quizAnswers');
    return saved ? JSON.parse(saved) : {};
  });
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('gh-academy-quizSubmitted');
    return saved ? JSON.parse(saved) : {};
  });
  const [quizScore, setQuizScore] = useState<number>(() => {
    const saved = localStorage.getItem('gh-academy-quizScore');
    return saved ? JSON.parse(saved) : 0;
  });

  // Practice Lab File & Git State
  const [labFiles, setLabFiles] = useState<LabFile[]>(() => {
    const saved = localStorage.getItem('gh-academy-labFiles');
    return saved ? JSON.parse(saved) : [
      { name: 'LoginService.cs', status: 'untracked', content: 'using System.Security.Cryptography;\n\npublic class LoginService {\n    // TODO: Secure hashing algorithms needed\n}', stage: 'working' },
      { name: 'ReportCardGenerator.cs', status: 'untracked', content: 'using System;\n\npublic class ReportCard {\n    public double CalculateGPA(int[] grades) {\n        // Need accurate formula\n    }\n}', stage: 'working' }
    ];
  });
  const [currentBranch, setCurrentBranch] = useState<string>(() => {
    const saved = localStorage.getItem('gh-academy-currentBranch');
    return saved ? JSON.parse(saved) : 'main';
  });
  const [branches, setBranches] = useState<string[]>(() => {
    const saved = localStorage.getItem('gh-academy-branches');
    return saved ? JSON.parse(saved) : ['main', 'feature/login-jwt'];
  });
  const [localCommits, setLocalCommits] = useState<Commit[]>(() => {
    const saved = localStorage.getItem('gh-academy-localCommits');
    return saved ? JSON.parse(saved) : [];
  });
  const [remoteCommits, setRemoteCommits] = useState<Commit[]>(() => {
    const saved = localStorage.getItem('gh-academy-remoteCommits');
    return saved ? JSON.parse(saved) : [];
  });
  // Note: nothing in the lab currently changes the remote branch list,
  // so only the value is destructured (no setter) to keep TypeScript happy.
  const [remoteBranches] = useState<string[]>(() => {
    const saved = localStorage.getItem('gh-academy-remoteBranches');
    return saved ? JSON.parse(saved) : ['main'];
  });
  // terminalInput is NOT persisted — it's whatever is half-typed in the box.
  const [terminalInput, setTerminalInput] = useState('');
  // terminalLogs IS persisted so the terminal history matches the restored
  // lab state (files, branches, commits) after a refresh.
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>(() => {
    const saved = localStorage.getItem('gh-academy-terminalLogs');
    return saved ? JSON.parse(saved) : [
      { type: 'system', text: 'Welcome to Terence\'s Interactive Git Lab!' },
      { type: 'info', text: 'Type standard git commands or click the Quick Commands buttons to interact.' },
      { type: 'success', text: 'Files initialized: LoginService.cs (untracked), ReportCardGenerator.cs (untracked)' }
    ];
  });
  // lastCommandStatus is NOT persisted — it's transient feedback for the last command.
  // The value itself is never displayed anywhere, only set — so the first
  // destructuring slot is left empty to avoid an "unused variable" warning.
  const [, setLastCommandStatus] = useState('');

  // ─────────────────────────────────────────────────────────────────────
  // Persistence effects: each effect below watches ONE piece of progress
  // state and writes it to localStorage every time it changes. Combined
  // with the lazy useState initializers above (which READ from
  // localStorage on startup), this means progress survives page refreshes
  // and browser restarts — fully offline, no backend needed.
  // ─────────────────────────────────────────────────────────────────────

  // Saves the list of finished lesson IDs so completed lessons stay ticked.
  useEffect(() => {
    localStorage.setItem('gh-academy-completedLessons', JSON.stringify(completedLessons));
  }, [completedLessons]);

  // Saves earned XP so the points total isn't reset on refresh.
  useEffect(() => {
    localStorage.setItem('gh-academy-xp', JSON.stringify(xp));
  }, [xp]);

  // Saves which lesson is currently open so the user resumes where they left off.
  useEffect(() => {
    localStorage.setItem('gh-academy-activeLesson', JSON.stringify(activeLesson));
  }, [activeLesson]);

  // Saves the selected Git stage (working / staging / repo) in the concepts view.
  useEffect(() => {
    localStorage.setItem('gh-academy-selectedStage', JSON.stringify(selectedStage));
  }, [selectedStage]);

  // Saves the user's chosen quiz answers so selections aren't lost mid-quiz.
  useEffect(() => {
    localStorage.setItem('gh-academy-quizAnswers', JSON.stringify(quizAnswers));
  }, [quizAnswers]);

  // Saves which quizzes have been submitted so results stay visible after refresh.
  useEffect(() => {
    localStorage.setItem('gh-academy-quizSubmitted', JSON.stringify(quizSubmitted));
  }, [quizSubmitted]);

  // Saves the quiz score so it matches the persisted submitted answers.
  useEffect(() => {
    localStorage.setItem('gh-academy-quizScore', JSON.stringify(quizScore));
  }, [quizScore]);

  // Saves the Practice Lab files (name, status, content, stage) so edits
  // and staging progress in the lab survive a refresh.
  useEffect(() => {
    localStorage.setItem('gh-academy-labFiles', JSON.stringify(labFiles));
  }, [labFiles]);

  // Saves which branch is checked out in the simulated repo.
  useEffect(() => {
    localStorage.setItem('gh-academy-currentBranch', JSON.stringify(currentBranch));
  }, [currentBranch]);

  // Saves the list of local branches the user has created.
  useEffect(() => {
    localStorage.setItem('gh-academy-branches', JSON.stringify(branches));
  }, [branches]);

  // Saves local commit history so "git log" style progress isn't wiped.
  useEffect(() => {
    localStorage.setItem('gh-academy-localCommits', JSON.stringify(localCommits));
  }, [localCommits]);

  // Saves pushed (remote) commits so the simulated GitHub side stays in sync.
  useEffect(() => {
    localStorage.setItem('gh-academy-remoteCommits', JSON.stringify(remoteCommits));
  }, [remoteCommits]);

  // Saves remote branch names so pushed branches still exist after refresh.
  useEffect(() => {
    localStorage.setItem('gh-academy-remoteBranches', JSON.stringify(remoteBranches));
  }, [remoteBranches]);

  // Saves the terminal output history so it matches the restored lab state.
  useEffect(() => {
    localStorage.setItem('gh-academy-terminalLogs', JSON.stringify(terminalLogs));
  }, [terminalLogs]);

  // Course Milestones Configuration
  const milestones = [
    {
      id: 1,
      title: "VCS & Git Fundamentals",
      description: "Why distributed version control is vital and how Git operates under the hood.",
      badge: "Local Pioneer",
      lessons: [
        { id: "lesson-1", title: "Why Version Control? (Why before How)", duration: "10 mins" },
        { id: "lesson-2", title: "Git Architecture & Key Concepts", duration: "12 mins" }
      ],
      progress: 50,
      color: "from-blue-500 to-indigo-600"
    },
    {
      id: 2,
      title: "The Core Local Workflow",
      description: "Mastering the journey of code from untracked files to frozen state commits.",
      badge: "Commits Architect",
      lessons: [
        { id: "lesson-3", title: "Tracking Changes: Status and Staging", duration: "15 mins" },
        { id: "lesson-4", title: "Writing Professional Commits & Time-Travel", duration: "15 mins" }
      ],
      progress: 0,
      color: "from-indigo-500 to-purple-600"
    },
    {
      id: 3,
      title: "Branching, Merging & Safety Nets",
      description: "Handling multi-feature streams in standard C# system lifecycles.",
      badge: "Branching General",
      lessons: [
        { id: "lesson-5", title: "Creating Isolated Feature Streams", duration: "20 mins" },
        { id: "lesson-6", title: "Merging Paths & Conflict Resolutions", duration: "25 mins" }
      ],
      progress: 0,
      color: "from-purple-500 to-pink-600"
    },
    {
      id: 4,
      title: "Remote Collaboration (GitHub)",
      description: "Pushing local codes to secure remote servers, pulling updates, and team orchestration.",
      badge: "Remote Collaborator",
      lessons: [
        { id: "lesson-7", title: "Connecting Remotes & Pushing C# Code", duration: "15 mins" },
        { id: "lesson-8", title: "Fetching vs. Pulling (Avoid Sync Disasters)", duration: "18 mins" }
      ],
      progress: 0,
      color: "from-pink-500 to-rose-600"
    },
    {
      id: 5,
      title: "The GitHub Flow & Pull Requests",
      description: "Pull Requests, secure branch protections, code reviews, and issue tracking.",
      badge: "GitHub Guard",
      lessons: [
        { id: "lesson-9", title: "Pull Requests: Code Review Mechanics", duration: "20 mins" },
        { id: "lesson-10", title: "Issues, Forks, and Releases", duration: "15 mins" }
      ],
      progress: 0,
      color: "from-rose-500 to-orange-600"
    },
    {
      id: 6,
      title: "GitHub Foundations Exam Mastery",
      description: "Complete certification-ready prep, scenarios, and real simulated practices.",
      badge: "Certified Specialist",
      lessons: [
        { id: "lesson-11", title: "GitHub Foundations Prep Simulation", duration: "30 mins" }
      ],
      progress: 0,
      color: "from-amber-500 to-yellow-600"
    }
  ];

  // Quiz Questions Data
  const quizzes = [
    {
      id: "q1",
      scenario: "Security Vulnerability Hotfix",
      question: "Your C# Login Security System currently has a severe SQL injection vulnerability in production. You need to quickly isolate your work on a new experimental JWT authentication module and create a pristine branch named 'hotfix/login-sql' based directly on production code to patch it immediately. Which path is correct?",
      options: [
        { label: "A", text: "Commit your half-finished JWT work directly to main, then start writing the hotfix.", correct: false },
        { label: "B", text: "Create and switch to 'hotfix/login-sql'. Git naturally protects and moves uncommitted files properly without safety checks.", correct: false },
        { label: "C", text: "Stash or temporarily commit unfinished JWT work, switch to the production-matching branch, create the hotfix branch, make the fix, commit, and merge.", correct: true }
      ],
      explanation: "Excellent decision! In standard secure systems, you never want unfinished experimental work (like JWT testing) to bleed into an urgent production hotfix. Stashing ('git stash') or creating a WIP commit temporarily saves your changes, allowing you to branch off a clean, production-equivalent state."
    },
    {
      id: "q2",
      scenario: "School Report Card Conflict",
      question: "You and Teacher Susan are editing 'ReportCardGenerator.cs'. Susan pushed her completed calculation algorithm directly to GitHub. You wrote a completely different calculation method locally and try to run 'git push origin main'. What happens next, and how do you resolve it safely?",
      options: [
        { label: "A", text: "Git rejects your push. You must run 'git pull' to fetch, auto-merge or manually resolve conflicts, test, and push again.", correct: true },
        { label: "B", text: "Git overrides Susan's code on the remote automatically since your commit has a newer local timestamp.", correct: false },
        { label: "C", text: "You must use 'git push --force' to override Susan's work and force your grades algorithm.", correct: false }
      ],
      explanation: "Absolutely! Git is designed to prevent remote overwrites (non-fast-forward updates). You are forced to retrieve the remote work first via a pull, merge/resolve conflicts locally, verify the code builds without breaking the school grading metrics, and then push safely."
    },
    {
      id: "q3",
      scenario: "The Staging Filter",
      question: "You modified 'LoginService.cs' (critical password encryption algorithm) and 'temp_dev_notes.txt' (plain text credentials file). You want to only send the secure C# module to the Staging area. What command sequence protects the text credentials from being tracked?",
      options: [
        { label: "A", text: "Run 'git add .' to staging, then delete the temp file manually on your computer.", correct: false },
        { label: "B", text: "Run 'git add LoginService.cs' specifically. Also, add 'temp_dev_notes.txt' to a .gitignore file.", correct: true },
        { label: "C", text: "Run 'git commit -a' immediately to bypass staging directly.", correct: false }
      ],
      explanation: "Spot on! Targeted staging with 'git add File.cs' lets you control exactly what enters the index (Staging Area). Adding sensitive temp files to '.gitignore' ensures they are never scanned by git status or accidentally committed to production repositories."
    }
  ];

  // Helper: Run Git command in mock terminal
  const executeGitCommand = (rawCommand: string) => {
    const cmd = rawCommand.trim();
    if (!cmd) return;

    setTerminalLogs(prev => [...prev, { type: 'input', text: `$ ${cmd}` }]);

    const parts = cmd.split(' ');
    const base = parts[0];
    const action = parts[1];

    if (base !== 'git') {
      setTerminalLogs(prev => [...prev, { type: 'error', text: `Command not found: "${base}". Did you forget "git"?` }]);
      setTerminalInput('');
      return;
    }

    switch (action) {
      case 'status': {
        const untracked = labFiles.filter(f => f.status === 'untracked').map(f => f.name);
        const staged = labFiles.filter(f => f.status === 'staged').map(f => f.name);
        
        const statusOutput: string[] = [];
        statusOutput.push(`On branch ${currentBranch}`);
        statusOutput.push(`Your branch is up to date with 'origin/${currentBranch}'.\n`);
        
        if (staged.length > 0) {
          statusOutput.push("Changes to be committed:");
          statusOutput.push("  (use \"git restore --staged <file>...\" to unstage)");
          staged.forEach(f => statusOutput.push(`\tstaged:   ${f}`));
          statusOutput.push("");
        }
        if (untracked.length > 0) {
          statusOutput.push("Untracked files:");
          statusOutput.push("  (use \"git add <file>...\" to include in what will be committed)");
          untracked.forEach(f => statusOutput.push(`\t${f}`));
          statusOutput.push("");
        }
        if (staged.length === 0 && untracked.length === 0) {
          statusOutput.push("nothing to commit, working tree clean");
        }

        setTerminalLogs(prev => [
          ...prev, 
          { type: 'info', text: statusOutput.join('\n') }
        ]);
        setLastCommandStatus('status');
        break;
      }

      case 'add': {
        const targetFile = parts[2];
        if (!targetFile) {
          setTerminalLogs(prev => [...prev, { type: 'error', text: 'Error: Nothing specified, nothing added. Maybe you meant "git add LoginService.cs" or "git add ."?' }]);
          break;
        }

        if (targetFile === '.' || targetFile === '*') {
          setLabFiles(prev => prev.map(f => f.stage === 'working' ? { ...f, status: 'staged', stage: 'staging' } : f));
          setTerminalLogs(prev => [...prev, { type: 'success', text: 'Staged all changes. Files moved to Staging Area.' }]);
        } else {
          const fileExists = labFiles.some(f => f.name === targetFile);
          if (fileExists) {
            setLabFiles(prev => prev.map(f => f.name === targetFile ? { ...f, status: 'staged', stage: 'staging' } : f));
            setTerminalLogs(prev => [...prev, { type: 'success', text: `Staged ${targetFile}. Ready for secure commit.` }]);
          } else {
            setTerminalLogs(prev => [...prev, { type: 'error', text: `File "${targetFile}" not found in current directory.` }]);
          }
        }
        setLastCommandStatus('add');
        break;
      }

      case 'commit': {
        const mIndex = parts.indexOf('-m');
        let message = '';
        if (mIndex !== -1 && parts[mIndex + 1]) {
          message = parts.slice(mIndex + 1).join(' ').replace(/"/g, '');
        }

        if (!message) {
          setTerminalLogs(prev => [...prev, { type: 'error', text: 'Aborting commit due to empty commit message. Use: git commit -m "Your descriptive message"' }]);
          break;
        }

        const stagedFiles = labFiles.filter(f => f.status === 'staged');
        if (stagedFiles.length === 0) {
          setTerminalLogs(prev => [...prev, { type: 'info', text: 'On branch main\nnothing to commit, working tree clean' }]);
          break;
        }

        const newCommit = {
          id: Math.random().toString(36).substr(2, 7),
          message,
          branch: currentBranch,
          files: stagedFiles.map(f => f.name),
          timestamp: new Date().toLocaleTimeString()
        };

        setLocalCommits(prev => [...prev, newCommit]);
        setLabFiles(prev => prev.map(f => f.status === 'staged' ? { ...f, status: 'committed', stage: 'local' } : f));
        setTerminalLogs(prev => [
          ...prev, 
          { type: 'success', text: `[${currentBranch} ${newCommit.id}] ${message}\n ${stagedFiles.length} file(s) changed.` }
        ]);
        setXp(p => p + 30);
        setLastCommandStatus('commit');
        break;
      }

      case 'push': {
        // (The remote name from the command, e.g. 'origin', isn't needed —
        // this simulation only has one remote.)
        const remoteBranchName = parts[3] || currentBranch;

        const unpushedCommits = localCommits.filter(c => !remoteCommits.some(rc => rc.id === c.id));
        if (unpushedCommits.length === 0) {
          setTerminalLogs(prev => [...prev, { type: 'info', text: 'Everything up-to-date. No new commits to push.' }]);
          break;
        }

        // Simulating the secure handshake
        setTerminalLogs(prev => [
          ...prev,
          { type: 'info', text: `Enumerating objects: ${unpushedCommits.length * 3}, done.` },
          { type: 'info', text: `Counting objects: 100% (${unpushedCommits.length * 3}/${unpushedCommits.length * 3}), done.` },
          { type: 'info', text: `Delta compression using up to 8 threads.` },
          { type: 'info', text: `Compressing objects: 100% done.` },
          { type: 'info', text: `Writing objects: 100% done.` },
          { type: 'success', text: `Successfully pushed local commits to remote! Live code secure on GitHub: origin/${remoteBranchName}` }
        ]);

        setRemoteCommits(prev => [...prev, ...unpushedCommits]);
        setLabFiles(prev => prev.map(f => f.status === 'committed' ? { ...f, status: 'pushed', stage: 'remote' } : f));
        setXp(p => p + 50);
        // Check if Milestone 1 gets marked done as progress incentive
        if (!completedLessons.includes('lesson-1')) {
          setCompletedLessons(p => [...p, 'lesson-1']);
        }
        setLastCommandStatus('push');
        break;
      }

      case 'pull': {
        // Checks if remote has commits we do not have
        const missingLocalCommits = remoteCommits.filter(rc => !localCommits.some(lc => lc.id === rc.id));
        if (missingLocalCommits.length === 0) {
          setTerminalLogs(prev => [...prev, { type: 'info', text: 'Already up to date. Local codebase matches Remote.' }]);
        } else {
          setLocalCommits(prev => [...prev, ...missingLocalCommits]);
          setTerminalLogs(prev => [
            ...prev,
            { type: 'success', text: `Updating local repository with ${missingLocalCommits.length} commit(s) from Remote.` }
          ]);
        }
        setLastCommandStatus('pull');
        break;
      }

      case 'fetch':
        setTerminalLogs(prev => [
          ...prev,
          { type: 'info', text: 'Fetching origin...' },
          { type: 'success', text: 'From github.com/terence-academy/security-system\n * branch            main     -> FETCH_HEAD' }
        ]);
        setLastCommandStatus('fetch');
        break;

      case 'branch': {
        const newBranchName = parts[2];
        if (!newBranchName) {
          setTerminalLogs(prev => [
            ...prev,
            { type: 'info', text: branches.map(b => (b === currentBranch ? `* ${b}` : `  ${b}`)).join('\n') }
          ]);
        } else {
          if (branches.includes(newBranchName)) {
            setTerminalLogs(prev => [...prev, { type: 'error', text: `Fatal: A branch named '${newBranchName}' already exists.` }]);
          } else {
            setBranches(prev => [...prev, newBranchName]);
            setTerminalLogs(prev => [...prev, { type: 'success', text: `Branch created: ${newBranchName}` }]);
          }
        }
        setLastCommandStatus('branch');
        break;
      }

      case 'switch': {
        const targetBranch = parts[2];
        if (!targetBranch) {
          setTerminalLogs(prev => [...prev, { type: 'error', text: 'Fatal: Please specify a branch. e.g. git switch feature/login-jwt' }]);
        } else {
          if (branches.includes(targetBranch)) {
            setCurrentBranch(targetBranch);
            setTerminalLogs(prev => [...prev, { type: 'success', text: `Switched to branch '${targetBranch}'` }]);
          } else {
            setTerminalLogs(prev => [...prev, { type: 'error', text: `Fatal: Branch '${targetBranch}' not found.` }]);
          }
        }
        setLastCommandStatus('switch');
        break;
      }

      case 'merge': {
        const branchToMerge = parts[2];
        if (!branchToMerge) {
          setTerminalLogs(prev => [...prev, { type: 'error', text: 'Fatal: Please specify which branch to merge into current.' }]);
        } else {
          if (branchToMerge === currentBranch) {
            setTerminalLogs(prev => [...prev, { type: 'info', text: 'Already up-to-date.' }]);
          } else if (!branches.includes(branchToMerge)) {
            setTerminalLogs(prev => [...prev, { type: 'error', text: `Fatal: Branch '${branchToMerge}' does not exist.` }]);
          } else {
            setTerminalLogs(prev => [
              ...prev,
              { type: 'success', text: `Updating ${currentBranch}...\nFast-forward merge of '${branchToMerge}' completed.\n 2 files changed, 14 insertions(+)` }
            ]);
          }
        }
        setLastCommandStatus('merge');
        break;
      }

      default:
        setTerminalLogs(prev => [...prev, { type: 'error', text: `Git command "${action}" is simulated, but not supported in this training lab context yet. Use basic commands like status, add, commit, or push.` }]);
    }

    setTerminalInput('');
  };

  const resetLab = () => {
    setLabFiles([
      { name: 'LoginService.cs', status: 'untracked', content: 'using System.Security.Cryptography;\n\npublic class LoginService {\n    // TODO: Secure hashing algorithms needed\n}', stage: 'working' },
      { name: 'ReportCardGenerator.cs', status: 'untracked', content: 'using System;\n\npublic class ReportCard {\n    public double CalculateGPA(int[] grades) {\n        // Need accurate formula\n    }\n}', stage: 'working' }
    ]);
    setLocalCommits([]);
    setRemoteCommits([]);
    setCurrentBranch('main');
    setTerminalLogs([
      { type: 'system', text: 'Workspace successfully reset!' },
      { type: 'success', text: 'Uncommitted C# files created in the Working Directory.' }
    ]);
  };

  const handleQuizAnswer = (quizId: string, selectedOption: QuizOption) => {
    setQuizAnswers(prev => ({ ...prev, [quizId]: selectedOption }));
  };

  // isCorrect may be undefined because the caller uses optional chaining
  // (userAnswer?.correct); undefined is simply treated as "not correct".
  const submitQuiz = (quizId: string, isCorrect: boolean | undefined) => {
    setQuizSubmitted(prev => ({ ...prev, [quizId]: true }));
    if (isCorrect) {
      setXp(p => p + 50);
      setQuizScore(p => p + 1);
    }
  };

  // Simulated calculation of course progress percent
  const totalItems = 11; // 11 lessons total
  const progressPercent = Math.min(100, Math.round((completedLessons.length / totalItems) * 100));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Premium Gradient Top Ribbon */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-2 w-full" />

      {/* Main Header / Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-4 py-3 md:px-8 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/10">
            <Github className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-slate-400 bg-clip-text text-transparent">
              Terence's GitHub Foundations Academy
            </h1>
            <p className="text-xs text-indigo-400 font-medium tracking-wide uppercase">Interactive Learning Hub</p>
          </div>
        </div>

        {/* User Stats Banner */}
        <div className="flex items-center space-x-4 bg-slate-800/80 rounded-2xl p-2 pl-3 border border-slate-700/50">
          <div className="flex items-center space-x-2">
            <div className="bg-amber-500/20 text-amber-400 p-1.5 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-right">
              <span className="block text-xs text-slate-400 uppercase tracking-widest font-bold">XP Score</span>
              <span className="block text-sm font-black text-amber-400">{xp} XP</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-slate-700" />
          <div className="flex items-center space-x-2 pr-2">
            <div className="bg-indigo-500/20 text-indigo-400 p-1.5 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xs text-slate-400 uppercase tracking-widest font-bold">Rank Level</span>
              <span className="block text-sm font-black text-indigo-400">Junior Committer</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto px-4 py-6 md:px-8 gap-6">
        
        {/* Responsive Sidebar Navigation */}
        <nav className="lg:w-64 w-full flex lg:flex-col flex-row flex-wrap gap-2 lg:border-r lg:border-slate-800 lg:pr-6 h-fit shrink-0">
          <button 
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-200 text-sm font-semibold w-full md:w-auto lg:w-full ${
              currentTab === 'dashboard' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Home className="w-5 h-5 shrink-0" />
            <span>Academy Dashboard</span>
          </button>

          <button 
            onClick={() => setCurrentTab('roadmap')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-200 text-sm font-semibold w-full md:w-auto lg:w-full ${
              currentTab === 'roadmap' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Map className="w-5 h-5 shrink-0" />
            <span>Interactive Roadmap</span>
          </button>

          <button 
            onClick={() => {
              setCurrentTab('lessons');
              setActiveLesson('lesson-1');
            }}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-200 text-sm font-semibold w-full md:w-auto lg:w-full ${
              currentTab === 'lessons' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-5 h-5 shrink-0" />
            <span>Current Lesson</span>
            <span className="ml-auto bg-slate-800 text-indigo-300 text-xs px-2 py-0.5 rounded-full border border-indigo-500/20">Active</span>
          </button>

          <button 
            onClick={() => setCurrentTab('diagram')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-200 text-sm font-semibold w-full md:w-auto lg:w-full ${
              currentTab === 'diagram' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-5 h-5 shrink-0" />
            <span>Interactive 4-Stage Map</span>
          </button>

          <button 
            onClick={() => setCurrentTab('lab')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-200 text-sm font-semibold w-full md:w-auto lg:w-full ${
              currentTab === 'lab' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TerminalIcon className="w-5 h-5 shrink-0" />
            <span>Practice terminal</span>
            <span className="ml-auto animate-pulse w-2 h-2 rounded-full bg-emerald-400" />
          </button>

          <button 
            onClick={() => setCurrentTab('quizzes')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-200 text-sm font-semibold w-full md:w-auto lg:w-full ${
              currentTab === 'quizzes' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-5 h-5 shrink-0" />
            <span>Certification Quizzes</span>
          </button>

          <button 
            onClick={() => setCurrentTab('progress')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-200 text-sm font-semibold w-full md:w-auto lg:w-full ${
              currentTab === 'progress' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-5 h-5 shrink-0" />
            <span>Review & Progress</span>
          </button>

          {/* Quick Info Box in Sidebar */}
          <div className="hidden lg:block mt-8 p-4 bg-slate-800/40 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-2">
            <span className="font-semibold text-slate-300 block">Exam Focus:</span>
            <p>GitHub Foundations expects perfect retention of the 4 local states, pull flow, branching, and repository security best practices.</p>
          </div>
        </nav>

        {/* Main Workspace Stage */}
        <main className="flex-1 min-w-0">
          
          {/* ==================================== */}
          {/* TAB 1: DASHBOARD                     */}
          {/* ==================================== */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Welcome Jumbotron Banner */}
              <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-6 md:p-8 border border-indigo-500/20 shadow-xl shadow-indigo-950/50">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-12 -translate-y-12">
                  <Github className="w-96 h-96" />
                </div>
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>GitHub Foundations Certification Prep</span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-black text-white leading-tight">
                    Welcome to Terence’s GitHub Foundations Academy
                  </h2>
                  <p className="mt-3 text-slate-300 text-sm md:text-base leading-relaxed">
                    Bridge the gap between theoretical commands and live production engineering. Complete simulations representing actual C# Secure Login systems and School Report Card infrastructures.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button 
                      onClick={() => {
                        setCurrentTab('lessons');
                        setActiveLesson('lesson-1');
                      }}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition flex items-center space-x-2 shadow-lg shadow-indigo-600/20 active:translate-y-0.5 text-sm"
                    >
                      <span>Launch Active Lesson</span>
                      <Play className="w-4 h-4 fill-white text-white" />
                    </button>
                    <button 
                      onClick={() => setCurrentTab('roadmap')}
                      className="px-5 py-3 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-bold rounded-xl transition border border-slate-700 hover:border-slate-600 text-sm"
                    >
                      View Roadmap
                    </button>
                  </div>
                </div>
              </div>

              {/* Stat Cards Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Course Progression</span>
                    <span className="block text-2xl font-black mt-1 text-white">{progressPercent}% Completed</span>
                    <div className="w-40 bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                </div>

                <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Current Milestone</span>
                    <span className="block text-lg font-black mt-1 text-slate-100">Milestone 1 of 6</span>
                    <span className="text-xs text-indigo-400 mt-2 block font-medium">Core VCS Foundations</span>
                  </div>
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                    <Map className="w-8 h-8" />
                  </div>
                </div>

                <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Homework Task</span>
                    <span className="block text-sm font-semibold mt-1 text-amber-400 truncate max-w-[200px]">Push secure C# Code</span>
                    <span className="text-xs text-slate-300 mt-2 block italic">Simulate in the command lab</span>
                  </div>
                  <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
                    <BookMarked className="w-8 h-8" />
                  </div>
                </div>
              </div>

              {/* Quick Launch Panel & Sandbox Shortcut */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Active Focus Card */}
                <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-lg text-xs font-bold">Current Lesson</span>
                      <span className="text-slate-400 text-xs">Milestone 1</span>
                    </div>
                    <h3 className="text-xl font-black mt-4 text-white">What Is Version Control and Why Does Git Exist?</h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                      We study the extreme real-world danger of manual backups, accidental code overwrites on live C# login microservices, and structural code sync failure within school systems.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setCurrentTab('lessons');
                      setActiveLesson('lesson-1');
                    }}
                    className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-bold rounded-xl transition border border-slate-700 hover:border-slate-650 flex items-center justify-center space-x-2 text-sm"
                  >
                    <span>Read Lesson Explanation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Git Sandbox Panel */}
                <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-xs font-bold">Interactive Lab</span>
                      <span className="text-slate-400 text-xs">Hands-on practice</span>
                    </div>
                    <h3 className="text-xl font-black mt-4 text-white">The Live Git Playground</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Don't just read about staging and tracking. Code security modules like <code className="text-amber-400 bg-slate-800 px-1 py-0.5 rounded text-[11px]">LoginService.cs</code>. Practice moving them from the Working Area to the Cloud using actual terminal commands.
                    </p>
                  </div>
                  <button 
                    onClick={() => setCurrentTab('lab')}
                    className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition flex items-center justify-center space-x-2 text-sm shadow-lg shadow-emerald-600/10"
                  >
                    <span>Open Interactive Lab</span>
                    <TerminalIcon className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ==================================== */}
          {/* TAB 2: INTERACTIVE ROADMAP           */}
          {/* ==================================== */}
          {currentTab === 'roadmap' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center max-w-xl mx-auto mb-8">
                <h2 className="text-3xl font-black text-white">Your Path to GitHub Certification</h2>
                <p className="text-slate-400 text-sm mt-2">
                  Follow this strategic 6-milestone learning system mapping out major aspects of Git fundamentals, GitHub administration, and workflow systems.
                </p>
              </div>

              {/* Milestones Flow Layout */}
              <div className="relative border-l-2 border-slate-800 ml-4 md:ml-8 space-y-10 py-4">
                {milestones.map((m) => {
                  const isCompleted = m.progress === 100;
                  const isActive = m.id === 1; // Mark Milestone 1 as active first
                  
                  return (
                    <div key={m.id} className="relative pl-8 md:pl-12 group">
                      
                      {/* Interactive Visual Node */}
                      <div className={`absolute -left-[17px] top-1.5 w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-emerald-500 border-emerald-950 text-white shadow-lg shadow-emerald-500/30' 
                          : isActive 
                            ? 'bg-indigo-600 border-indigo-950 text-white animate-pulse' 
                            : 'bg-slate-800 border-slate-950 text-slate-400'
                      }`}>
                        {isCompleted ? <Check className="w-3.5 h-3.5 font-bold" /> : <span className="text-xs font-bold">{m.id}</span>}
                      </div>

                      {/* Milestone Card */}
                      <div className="bg-slate-800/40 rounded-3xl p-6 border border-slate-800 hover:border-slate-700 transition duration-300 group-hover:bg-slate-850">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div>
                            <span className="text-xs text-indigo-400 uppercase tracking-widest font-extrabold">Milestone {m.id}</span>
                            <h3 className="text-xl font-extrabold text-white mt-1 group-hover:text-indigo-200 transition">
                              {m.title}
                            </h3>
                          </div>
                          <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full border border-slate-700 font-bold">
                            {m.badge}
                          </span>
                        </div>

                        <p className="text-slate-400 text-sm mt-3 leading-relaxed max-w-2xl">
                          {m.description}
                        </p>

                        {/* Lessons included preview */}
                        <div className="mt-4 pt-4 border-t border-slate-800/60">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Syllabus Highlights:</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {m.lessons.map(lesson => (
                              <div key={lesson.id} className="flex items-center space-x-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                                <BookMarked className="w-4 h-4 text-slate-500 shrink-0" />
                                <span className="text-xs font-medium text-slate-300">{lesson.title}</span>
                                <span className="ml-auto text-[10px] text-slate-500 shrink-0 bg-slate-850 px-1.5 py-0.5 rounded">{lesson.duration}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bottom action bar */}
                        <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-slate-400">Milestone Progress:</span>
                            <span className="text-xs font-bold text-slate-200">{m.progress}%</span>
                          </div>
                          <button 
                            onClick={() => {
                              setCurrentTab('lessons');
                              setActiveLesson(m.lessons[0].id);
                            }}
                            className="text-xs font-extrabold text-indigo-400 hover:text-white hover:underline flex items-center space-x-1"
                          >
                            <span>Study Milestone</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================================== */}
          {/* TAB 3: LESSONS (Why before How)      */}
          {/* ==================================== */}
          {currentTab === 'lessons' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Lesson Directory Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-800/40 rounded-2xl border border-slate-800">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm font-bold text-slate-200">Current Unit:</span>
                  <span className="text-xs font-semibold bg-slate-800 px-3 py-1 rounded-full text-slate-300 border border-slate-700">Milestone 1, Lesson 1</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Progress Score:</span>
                  <span className="text-xs font-black text-indigo-400">{completedLessons.includes('lesson-1') ? 'COMPLETED (50 XP awarded)' : 'STILL IN PROGRESS'}</span>
                </div>
              </div>

              {/* LESSON PANEL */}
              <div className="bg-slate-800/30 rounded-3xl border border-slate-800 overflow-hidden">
                
                {/* Visual Cover Banner */}
                <div className="relative bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-8 border-b border-slate-800">
                  <div className="absolute right-4 top-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold">
                    Interactive Theory Section
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white">
                    What Is Version Control and Why Does Git Exist?
                  </h2>
                  <p className="text-slate-300 text-sm mt-2 max-w-2xl leading-relaxed">
                    Avoid developer disasters. Study how real-world code synchronization fails without structured tracking, and why Linus Torvalds engineered Git as a Distributed VCS.
                  </p>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                  
                  {/* Phase 1: THE ACCIDENT SCENARIO */}
                  <div className="bg-red-500/5 rounded-2xl p-5 border border-red-500/20 space-y-4">
                    <div className="flex items-center space-x-3 text-red-400 font-extrabold text-sm uppercase tracking-wider">
                      <AlertTriangle className="w-5 h-5" />
                      <span>THE DISASTER: No Version Control</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <span className="block text-xs font-bold text-slate-400 uppercase">Scenario A: C# Login Security System</span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Developer Terence works on a secure hash algorithm (<code className="text-red-300 bg-red-950/40 px-1 py-0.5 rounded">LoginService.cs</code>). Meanwhile, developer Linda is fixing a connection error in database configuration. She doesn't have Terence's latest file and accidentally replaces the main directory.
                        </p>
                        <div className="bg-red-950/40 p-3 rounded-lg border border-red-900/40 font-mono text-xs text-red-300">
                          CRITICAL ERROR: 'LoginService.cs' not found. Login attempts failing in production! Cryptography changes permanently overwritten.
                        </div>
                      </div>

                      <div className="space-y-3">
                        <span className="block text-xs font-bold text-slate-400 uppercase">Scenario B: School Report Card System</span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Teacher Terence copies <code className="text-slate-200">ReportCardGenerator_V2_TERENCE_EDIT.cs</code> to the shared server. Another teacher overrides it with <code className="text-slate-200">ReportCardGenerator_V2_FINAL_S_REVIEWS.cs</code>. System math is corrupted and student grade logic is entirely lost.
                        </p>
                        <div className="bg-red-950/40 p-3 rounded-lg border border-red-900/40 font-mono text-xs text-red-300">
                          GPA Calculation failure: 'CalculateGPA' parameter signatures mismatch. Overwritten file contains older broken logic.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phase 2: THE WHY (Business & Engineering Reasons) */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-black text-slate-100 flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-indigo-400" />
                      <span>The WHY before The HOW</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-750 space-y-2">
                        <span className="text-xs font-bold text-indigo-400 block uppercase">1. Perfect Ledger Historical Logging</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Git records modifications like a secure ledger. It tracking who changed what lines of code, when they did it, and the engineering justification behind it. Overwriting is historically documented and instantly reversible.
                        </p>
                      </div>

                      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-750 space-y-2">
                        <span className="text-xs font-bold text-indigo-400 block uppercase">2. Parallel Branch Streams</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Instead of keeping active production on the line, developers create branches. They build and refine new C# login hashing components in complete isolation without disrupting public users.
                        </p>
                      </div>

                      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-750 space-y-2">
                        <span className="text-xs font-bold text-indigo-400 block uppercase">3. Distributed Safety Mesh</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Every dev has a complete history on their computer, not just a central server. If centralized networks fail, the absolute state of Terence's login components remains intact on individual developer machines.
                        </p>
                      </div>

                    </div>
                  </div>

                  {/* Phase 3: THE HOW (The 4 Stages of Git) */}
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h3 className="text-lg font-black text-slate-100 flex items-center space-x-2">
                      <Code className="w-5 h-5 text-emerald-400" />
                      <span>The HOW: Conceptual Foundations</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      To safely commit your code to GitHub, you will track files through a rigorous transition structure. Click each tab below to discover how files move through these critical stages:
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                      <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Step 1</span>
                        <span className="block font-bold text-sm text-slate-200 mt-1">Working Directory</span>
                        <span className="text-[11px] text-slate-400 block mt-1">Your untracked local edits (e.g. rough C# logic in editor)</span>
                      </div>
                      <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 text-center">
                        <span className="text-[10px] uppercase font-bold text-indigo-400">Step 2</span>
                        <span className="block font-bold text-sm text-indigo-300 mt-1">Staging Index</span>
                        <span className="text-[11px] text-indigo-400 block mt-1">Readying files for safety locking (<code className="text-indigo-400 bg-slate-900 px-1 py-0.5 rounded text-[9px]">git add</code>)</span>
                      </div>
                      <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 text-center">
                        <span className="text-[10px] uppercase font-bold text-purple-400">Step 3</span>
                        <span className="block font-bold text-sm text-purple-300 mt-1">Local Repository</span>
                        <span className="text-[11px] text-purple-400 block mt-1">Committed snapshots on your local system (<code className="text-purple-400 bg-slate-900 px-1 py-0.5 rounded text-[9px]">git commit</code>)</span>
                      </div>
                      <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 text-center">
                        <span className="text-[10px] uppercase font-bold text-emerald-400">Step 4</span>
                        <span className="block font-bold text-sm text-emerald-300 mt-1">GitHub Remote</span>
                        <span className="text-[11px] text-emerald-400 block mt-1">Safe master copies in cloud (<code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded text-[9px]">git push</code>)</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Lesson Navigation Buttons */}
                  <div className="pt-6 border-t border-slate-800 flex justify-between items-center flex-wrap gap-4">
                    <button 
                      onClick={() => setCurrentTab('dashboard')}
                      className="text-xs font-bold text-slate-400 hover:text-white"
                    >
                      Return to Dashboard
                    </button>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          if (!completedLessons.includes('lesson-1')) {
                            setCompletedLessons(p => [...p, 'lesson-1']);
                            setXp(p => p + 50);
                          }
                          setCurrentTab('diagram');
                        }}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center space-x-2 shadow-lg shadow-indigo-600/15"
                      >
                        <span>Mark Done & Launch Diagram Map</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* ==================================== */}
          {/* TAB 4: INTERACTIVE 4-STAGE DIAGRAM   */}
          {/* ==================================== */}
          {currentTab === 'diagram' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center max-w-xl mx-auto">
                <h2 className="text-2xl font-black text-white">Visual Git Lifecycle Diagram</h2>
                <p className="text-slate-400 text-xs mt-1">
                  Understanding how local code reaches safe Cloud-backed distribution networks. Click each repository state card to view active files and critical operations.
                </p>
              </div>

              {/* Graphical Visual Diagram Chain */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 pt-4 relative">
                
                {/* Stage 1 Card: Working Directory */}
                <div 
                  onClick={() => setSelectedStage('working')}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative ${
                    selectedStage === 'working' 
                      ? 'bg-slate-800 border-indigo-500 shadow-xl ring-2 ring-indigo-500/20 translate-y-[-4px]' 
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Stage 01</span>
                    <span className="text-xs text-slate-500 font-mono">Uncommitted</span>
                  </div>
                  <h3 className="text-base font-black text-white">Working Directory</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Raw workspace where you live-code C# security models and School calculations.
                  </p>
                  
                  {/* File status mockup representation */}
                  <div className="mt-4 p-2.5 bg-slate-900/60 rounded-xl space-y-1.5 font-mono text-[11px]">
                    <span className="text-[9px] text-slate-500 block">Workspace State:</span>
                    <div className="flex items-center space-x-2 text-rose-400">
                      <FileCode className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">LoginService.cs</span>
                    </div>
                    <div className="flex items-center space-x-2 text-rose-400">
                      <FileCode className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">ReportCardGenerator.cs</span>
                    </div>
                  </div>
                  {selectedStage === 'working' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-500 rotate-45 rounded-sm" />}
                </div>

                {/* Stage 2 Card: Staging Area */}
                <div 
                  onClick={() => setSelectedStage('staging')}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative ${
                    selectedStage === 'staging' 
                      ? 'bg-slate-800 border-indigo-500 shadow-xl ring-2 ring-indigo-500/20 translate-y-[-4px]' 
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] uppercase font-bold text-indigo-400">Stage 02</span>
                    <span className="text-xs text-indigo-400 font-mono font-bold">Staged</span>
                  </div>
                  <h3 className="text-base font-black text-white">Staging Area (Index)</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    The prep sandbox zone. Curates only the clean changes selected to build the snapshot.
                  </p>
                  
                  <div className="mt-4 p-2.5 bg-slate-900/60 rounded-xl space-y-1.5 font-mono text-[11px]">
                    <span className="text-[9px] text-indigo-400 block">Staged Index Queue:</span>
                    <div className="text-slate-500 italic text-[10px]">Ready for git commit...</div>
                  </div>
                  {selectedStage === 'staging' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-500 rotate-45 rounded-sm" />}
                </div>

                {/* Stage 3 Card: Local Repository */}
                <div 
                  onClick={() => setSelectedStage('local')}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative ${
                    selectedStage === 'local' 
                      ? 'bg-slate-800 border-indigo-500 shadow-xl ring-2 ring-indigo-500/20 translate-y-[-4px]' 
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] uppercase font-bold text-purple-400">Stage 03</span>
                    <span className="text-xs text-purple-400 font-mono">Committed</span>
                  </div>
                  <h3 className="text-base font-black text-white">Local Repo</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Your local database storing safe, historic snapshots locally inside hidden <code className="text-slate-200 bg-slate-900 px-1 rounded">.git</code>.
                  </p>
                  
                  <div className="mt-4 p-2.5 bg-slate-900/60 rounded-xl space-y-1.5 font-mono text-[11px]">
                    <span className="text-[9px] text-purple-400 block">Commit History ledger:</span>
                    <div className="text-slate-500 italic text-[10px]">No unpushed commits...</div>
                  </div>
                  {selectedStage === 'local' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-500 rotate-45 rounded-sm" />}
                </div>

                {/* Stage 4 Card: GitHub Remote */}
                <div 
                  onClick={() => setSelectedStage('remote')}
                  className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative ${
                    selectedStage === 'remote' 
                      ? 'bg-slate-800 border-indigo-500 shadow-xl ring-2 ring-indigo-500/20 translate-y-[-4px]' 
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 font-extrabold">Stage 04</span>
                    <span className="text-xs text-emerald-400 font-mono">Production Cloud</span>
                  </div>
                  <h3 className="text-base font-black text-white">GitHub Remote</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Central secure repository in cloud. Coordinates master versions across global developers.
                  </p>
                  
                  <div className="mt-4 p-2.5 bg-slate-900/60 rounded-xl space-y-1.5 font-mono text-[11px]">
                    <span className="text-[9px] text-emerald-400 block">Remote Production:</span>
                    <div className="text-slate-500 italic text-[10px]">origin/main branch protected...</div>
                  </div>
                  {selectedStage === 'remote' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-indigo-500 rotate-45 rounded-sm" />}
                </div>

              </div>

              {/* Dynamic stage inspector detail box */}
              <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700/80 mt-6 animate-fadeIn">
                {selectedStage === 'working' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-indigo-400 font-black">
                      <Folder className="w-5 h-5" />
                      <span>Stage Inspector: Working Directory (Uncommitted changes)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      This stage lives exclusively on your computer file system. This is where you write and save new code updates inside IDEs (like Visual Studio). At this point, **Git does not track modifications** unless explicitly instructed! It is highly vulnerable. If your hard drive crashes now, these changes are gone forever.
                    </p>
                    <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-400 space-y-2 border border-slate-800">
                      <div className="text-slate-500">// Action Command to move files to Staging Area:</div>
                      <div><span className="text-indigo-400">git add</span> LoginService.cs <span className="text-slate-500"># stages specific security file</span></div>
                      <div><span className="text-indigo-400">git add</span> . <span className="text-slate-500"># stages all modified files in the working directory</span></div>
                    </div>
                  </div>
                )}

                {selectedStage === 'staging' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-indigo-400 font-black">
                      <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                      <span>Stage Inspector: Staging Index (Pre-commit Snapshot)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      The Staging Area acts as a drafting area. It allows you to selectively build a clean, unified commit package. For example, if you adjusted database configuration but also modified complex C# cryptographic algorithms in <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded text-[10px]">LoginService.cs</code>, you can choose to only stage and commit the cryptographies.
                    </p>
                    <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-400 space-y-2 border border-slate-800">
                      <div className="text-slate-500">// Action Command to lock stage into a local commit:</div>
                      <div><span className="text-purple-400">git commit</span> -m <span className="text-amber-300">"Add password cryptographic salt verification"</span></div>
                      <div className="text-slate-500">// Action Command to pull file back out to unstaged:</div>
                      <div><span className="text-rose-400">git restore</span> --staged LoginService.cs</div>
                    </div>
                  </div>
                )}

                {selectedStage === 'local' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-purple-400 font-black">
                      <Award className="w-5 h-5" />
                      <span>Stage Inspector: Local Repository (.git Database)</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Now your changes are frozen into secure snapshots stored safely in your computer's local `.git` ledger. You can travel back in time, check historical diff logs, and test in safety branches. Your codebase history is completely secure on your machine, but it is not yet shared with or visible to other collaborators in your school system!
                    </p>
                    <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-400 space-y-2 border border-slate-800">
                      <div className="text-slate-500">// Action Command to upload local repository history to GitHub Cloud:</div>
                      <div><span className="text-emerald-400">git push</span> origin main</div>
                    </div>
                  </div>
                )}

                {selectedStage === 'remote' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-emerald-400 font-black">
                      <Github className="w-5 h-5" />
                      <span>Stage Inspector: GitHub Cloud Remote Repository</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      The peak of the journey. Once pushed, your commits reside safely on GitHub's globally accessible cloud-servers. Here, team members can collaborate on code reviews, launch Automated pipelines, file issues, and coordinate builds.
                    </p>
                    <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-400 space-y-2 border border-slate-800">
                      <div className="text-slate-500">// Action Command to retrieve others' changes from the Remote Repository:</div>
                      <div><span className="text-sky-400">git pull</span> origin main <span className="text-slate-500"># fetches and merges changes in one command</span></div>
                      <div><span className="text-sky-400">git fetch</span> origin <span className="text-slate-500"># inspect changes safely without merging into active files</span></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action shortcuts */}
              <div className="flex justify-between items-center bg-slate-800/20 p-4 rounded-2xl border border-slate-800 mt-4 flex-wrap gap-4">
                <span className="text-xs text-slate-400">Mastered the conceptual map? Test commands dynamically inside the Sandbox:</span>
                <button 
                  onClick={() => setCurrentTab('lab')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs transition flex items-center space-x-2 shadow-lg shadow-emerald-600/10"
                >
                  <span>Go to Command Practice Lab</span>
                  <TerminalIcon className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* ==================================== */}
          {/* TAB 5: PRACTICE LAB TERMINAL         */}
          {/* ==================================== */}
          {currentTab === 'lab' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center space-x-2">
                    <TerminalIcon className="w-6 h-6 text-emerald-400" />
                    <span>Git Simulation Practice Lab</span>
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Operate on a C# secure authentication model workspace inside a real-time reactive shell command engine.
                  </p>
                </div>
                <button 
                  onClick={resetLab}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-755 transition text-xs font-bold flex items-center space-x-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Workspace</span>
                </button>
              </div>

              {/* Split Workspace and Interactive Terminal */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Panel: Real-time File & Git State Visualizer (5 columns) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-850 rounded-3xl p-5 border border-slate-800 space-y-4">
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-3">
                      Directory File Inspector
                    </h3>
                    
                    {/* Active files list */}
                    <div className="space-y-3">
                      {labFiles.map((file, idx) => (
                        <div key={idx} className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <FileCode className="w-4 h-4 text-amber-400" />
                              <span className="font-mono text-xs font-bold text-slate-100">{file.name}</span>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              file.status === 'untracked' 
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                                : file.status === 'staged'
                                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                  : file.status === 'committed'
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {file.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 italic">
                            Current Stage: <span className="font-bold text-slate-300 uppercase">{file.stage} stage</span>
                          </p>
                          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-850 font-mono text-[10px] text-slate-400 leading-normal whitespace-pre-line">
                            {file.content}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Git Status Visual Block */}
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                      <span className="font-extrabold text-slate-300 block">Workspace State Summary</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                        <div>Branch: <span className="text-indigo-400 font-bold">{currentBranch}</span></div>
                        <div>Local Commits: <span className="text-purple-400 font-bold">{localCommits.length}</span></div>
                        <div>Remote Pushed: <span className="text-emerald-400 font-bold">{remoteCommits.length}</span></div>
                        <div>Available Branches: <span className="text-slate-300 font-bold">{branches.length}</span></div>
                      </div>
                      
                      {/* Interactive Visual Timeline of Commits */}
                      {localCommits.length > 0 && (
                        <div className="pt-3 border-t border-slate-800/80 mt-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Local Commit Log:</span>
                          <div className="space-y-2">
                            {localCommits.map((c, i) => (
                              <div key={i} className="flex items-center space-x-2 bg-slate-950/40 p-2 rounded-lg border border-purple-500/20">
                                <span className="text-[10px] font-mono font-bold text-purple-400">{c.id}</span>
                                <span className="text-xs text-slate-300 truncate flex-1">{c.message}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Right Panel: Simulated Interactive Shell Console (7 columns) */}
                <div className="lg:col-span-7 flex flex-col space-y-4">
                  
                  {/* Visual command help tray */}
                  <div className="bg-slate-800/40 p-4 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-indigo-400 block uppercase tracking-wider">Quick Commands Guide (Click to Run):</span>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => executeGitCommand('git status')}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-lg border border-slate-700 transition"
                      >
                        git status
                      </button>
                      <button 
                        onClick={() => executeGitCommand('git add LoginService.cs')}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-lg border border-slate-700 transition"
                      >
                        git add LoginService.cs
                      </button>
                      <button 
                        onClick={() => executeGitCommand('git add .')}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-lg border border-slate-700 transition"
                      >
                        git add .
                      </button>
                      <button 
                        onClick={() => executeGitCommand('git commit -m "Implement secure salt encryption"')}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-lg border border-slate-700 transition"
                      >
                        git commit -m "..."
                      </button>
                      <button 
                        onClick={() => executeGitCommand('git push origin main')}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-lg border border-slate-700 transition text-emerald-400"
                      >
                        git push
                      </button>
                      <button 
                        onClick={() => executeGitCommand('git fetch origin')}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-lg border border-slate-700 transition"
                      >
                        git fetch
                      </button>
                      <button 
                        onClick={() => executeGitCommand('git pull origin main')}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-lg border border-slate-700 transition"
                      >
                        git pull
                      </button>
                      <button 
                        onClick={() => executeGitCommand('git branch feature/gpa-calculator')}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-lg border border-slate-700 transition"
                      >
                        git branch ...
                      </button>
                    </div>
                  </div>

                  {/* Terminal Box */}
                  <div className="flex-1 bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden flex flex-col min-h-[350px]">
                    
                    {/* Shell Title Bar */}
                    <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500" />
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-xs text-slate-400 font-mono pl-2">bash - terence@academy: ~/security-system</span>
                      </div>
                      <span className="text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">LIVE SHELL</span>
                    </div>

                    {/* Scrollable Output Terminal Console */}
                    <div className="flex-1 p-4 font-mono text-xs space-y-3 overflow-y-auto max-h-[400px]">
                      {terminalLogs.map((log, idx) => (
                        <div key={idx} className="whitespace-pre-line leading-relaxed">
                          {log.type === 'input' && (
                            <span className="text-white font-bold">{log.text}</span>
                          )}
                          {log.type === 'error' && (
                            <span className="text-rose-400 font-semibold">{log.text}</span>
                          )}
                          {log.type === 'success' && (
                            <span className="text-emerald-400">{log.text}</span>
                          )}
                          {log.type === 'info' && (
                            <span className="text-slate-300">{log.text}</span>
                          )}
                          {log.type === 'system' && (
                            <span className="text-indigo-400 italic">{log.text}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Interactive Input Block */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        executeGitCommand(terminalInput);
                      }}
                      className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2"
                    >
                      <span className="text-emerald-400 font-mono font-bold text-sm">$</span>
                      <input 
                        type="text" 
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        placeholder="Type standard git commands (e.g. git status, git add .)"
                        className="flex-1 bg-transparent border-0 outline-none text-white font-mono text-xs focus:ring-0 placeholder-slate-650"
                      />
                      <button 
                        type="submit"
                        className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>

                  </div>

                  {/* Guided Assignment Instructions */}
                  <div className="bg-indigo-500/5 p-4 rounded-3xl border border-indigo-500/10 space-y-2">
                    <div className="flex items-center space-x-2 text-indigo-400">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-black uppercase tracking-wider">
                        Homework Assignment: The Staging {"->"} Commit {"->"} Push Flow
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      1. Check the untracked files with <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded text-[10px]">git status</code>.<br />
                      2. Prepare them for safety locking with <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded text-[10px]">git add .</code>.<br />
                      3. Create a clean snap-locked version with <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded text-[10px]">git commit -m "Your Commit Message"</code>.<br />
                      4. Secure them to GitHub with <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded text-[10px]">git push</code>! Watch your files change state on the visual workspace list.
                    </p>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ==================================== */}
          {/* TAB 6: SCENARIO-BASED QUIZZES        */}
          {/* ==================================== */}
          {currentTab === 'quizzes' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="text-center max-w-xl mx-auto">
                <h2 className="text-2xl font-black text-white">Scenario-Based Certification Quizzes</h2>
                <p className="text-slate-400 text-xs mt-1">
                  GitHub Foundations exam questions expect you to solve conflicts and protect codebases. Test your logic below.
                </p>
              </div>

              {/* Questions Stream */}
              <div className="space-y-6">
                {quizzes.map((q) => {
                  const userAnswer = quizAnswers[q.id];
                  const isSubmitted = quizSubmitted[q.id];
                  
                  return (
                    <div key={q.id} className="bg-slate-800/40 rounded-3xl p-6 border border-slate-800 space-y-4">
                      
                      {/* Topic Title Badge */}
                      <div className="flex justify-between items-center">
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold">
                          Scenario Focus: {q.scenario}
                        </span>
                        {isSubmitted && (
                          <span className={`text-xs font-extrabold flex items-center space-x-1 ${
                            userAnswer.correct ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {userAnswer.correct ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            <span>{userAnswer.correct ? 'PASSED (+50 XP)' : 'INCORRECT'}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-extrabold text-white leading-relaxed">
                        {q.question}
                      </h3>

                      {/* Options List */}
                      <div className="space-y-2.5 pt-2">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = userAnswer === opt;
                          return (
                            <button
                              key={oIdx}
                              disabled={isSubmitted}
                              onClick={() => handleQuizAnswer(q.id, opt)}
                              className={`w-full text-left p-4 rounded-2xl border text-xs leading-relaxed flex items-start space-x-3 transition ${
                                isSubmitted 
                                  ? opt.correct 
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300' 
                                    : isSelected 
                                      ? 'bg-rose-500/10 border-rose-500 text-rose-300' 
                                      : 'bg-slate-800/20 border-slate-850 text-slate-500'
                                  : isSelected
                                    ? 'bg-indigo-500/15 border-indigo-500 text-indigo-200'
                                    : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <span className="font-black shrink-0 bg-slate-900 text-indigo-400 w-5 h-5 rounded-md flex items-center justify-center border border-indigo-500/10">
                                {opt.label}
                              </span>
                              <span>{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Action Check button */}
                      {!isSubmitted ? (
                        <button
                          disabled={!userAnswer}
                          onClick={() => submitQuiz(q.id, userAnswer?.correct)}
                          className={`w-full py-3 rounded-xl font-bold transition text-xs flex items-center justify-center space-x-2 ${
                            userAnswer 
                              ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 cursor-pointer' 
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-850'
                          }`}
                        >
                          <span>Lock Answer and Verify Explanation</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <div className="bg-slate-900/60 p-4.5 rounded-2xl border border-slate-800 space-y-2 text-xs leading-relaxed text-slate-300">
                          <span className="font-extrabold text-indigo-400 block uppercase">Technical Explanation:</span>
                          <p>{q.explanation}</p>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ==================================== */}
          {/* TAB 7: PROGRESS & REVIEW             */}
          {/* ==================================== */}
          {currentTab === 'progress' && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="bg-slate-800/30 rounded-3xl p-6 md:p-8 border border-slate-800 space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-white">Your Progress Report & Review Matrix</h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Custom diagnostic engine analyzing active learning trends, homework tasks, and recommended modules.
                  </p>
                </div>

                {/* Grid analytics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/85">
                  
                  {/* Performance Strengths */}
                  <div className="bg-slate-850 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <span className="text-xs font-bold text-emerald-400 block uppercase tracking-wider">Verified Strengths:</span>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-sm text-slate-200 block">Version Control Principles</span>
                          <span className="text-xs text-slate-400">Excellent theoretical grasp of manual file backup overwrite dangers.</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-sm text-slate-200 block">Distributed Git Paradigms</span>
                          <span className="text-xs text-slate-400">Understands decentralized repository redundancy mechanisms.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weakness Warnings */}
                  <div className="bg-slate-850 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <span className="text-xs font-bold text-amber-400 block uppercase tracking-wider">Focus Improvements Needed:</span>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-sm text-slate-200 block">Fast-Forward & Merge Conflicts</span>
                          <span className="text-xs text-slate-400">Needs to practice merging Susan's School Report Card changes.</span>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-sm text-slate-200 block">Local Staging index filtering</span>
                          <span className="text-xs text-slate-400">Needs practice separating C# production files from temporary raw text lists.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Recommended Next Lesson Block */}
                <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-6 rounded-3xl border border-indigo-500/20 flex flex-wrap justify-between items-center gap-6 mt-4">
                  <div className="max-w-xl">
                    <span className="text-xs text-indigo-400 uppercase tracking-widest font-extrabold">Next Recommended Lesson:</span>
                    <h3 className="text-xl font-extrabold text-white mt-1">Lesson 2: Git Architecture & Key Concepts</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Deep dive into how Git builds trees, blobs, commit hashes, and how the physical storage differs from centralized legacy systems.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setCurrentTab('lessons');
                      setActiveLesson('lesson-1'); // Currently lesson 1 has content
                    }}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center space-x-2"
                  >
                    <span>Begin Unit 2</span>
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                </div>

              </div>

            </div>
          )}

        </main>

      </div>

      {/* Footer copyright */}
      <footer className="mt-auto py-6 border-t border-slate-800 bg-slate-950 text-slate-500 text-center text-xs">
        <p>© {new Date().getFullYear()} Terence's GitHub Foundations Academy. All Rights Reserved.</p>
        <p className="mt-1 text-[11px] text-slate-600">Prepare securely. Program responsibly. Master collaboration workflows.</p>
      </footer>

    </div>
  );
}