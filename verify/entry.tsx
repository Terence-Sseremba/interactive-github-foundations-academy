import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import App from '../src/App';

type Result = { name: string; ok: boolean; detail: string };

const results: Result[] = [];
function check(name: string, ok: boolean, detail = '') {
  results.push({ name, ok, detail });
}

const text = () => document.body.textContent ?? '';

function buttons(): HTMLElement[] {
  return Array.from(document.querySelectorAll('button'));
}

function findByText(label: string): HTMLElement | undefined {
  return buttons().find(b => (b.textContent ?? '').includes(label));
}

function click(el: HTMLElement | undefined, what: string) {
  if (!el) throw new Error(`Could not find control: ${what}`);
  act(() => {
    el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  });
}

export function run(): Result[] {
  const container = document.createElement('div');
  container.id = 'root';
  document.body.appendChild(container);

  let root: Root;
  act(() => {
    root = createRoot(container);
    root.render(<App />);
  });

  // --- Boot -------------------------------------------------------
  check('App mounts without throwing', text().length > 0);
  check('Dashboard is the landing tab', text().includes('Welcome to Terence'));
  check('Header shows starting XP', text().includes('150 XP'));
  check('Rank derives from XP', text().includes('Junior Committer'));

  // --- Navigation across all seven tabs ---------------------------
  const tabs: [string, string][] = [
    ['Interactive Roadmap', 'Your Path to GitHub Certification'],
    ['Current Lesson', 'What Is Version Control'],
    ['Interactive 4-Stage Map', 'Visual Git Lifecycle Diagram'],
    ['Practice terminal', 'Git Simulation Practice Lab'],
    ['Certification Quizzes', 'Scenario-Based Certification Quizzes'],
    ['Review & Progress', 'Your Progress Report'],
    ['Academy Dashboard', 'Welcome to Terence']
  ];
  for (const [tab, expected] of tabs) {
    click(findByText(tab), `nav tab "${tab}"`);
    check(`Tab renders: ${tab}`, text().includes(expected), `expected "${expected}"`);
  }

  // --- 4-stage diagram: clicking a stage swaps the inspector ------
  click(findByText('Interactive 4-Stage Map'), 'nav to diagram');
  check('Diagram defaults to Working Directory inspector',
    text().includes('Stage Inspector: Working Directory'));
  const remoteCard = Array.from(document.querySelectorAll('div'))
    .find(d => (d.textContent ?? '').startsWith('Stage 04'));
  click(remoteCard as HTMLElement, 'Stage 04 card');
  check('Diagram stage selection updates inspector',
    text().includes('Stage Inspector: GitHub Cloud Remote'));

  // --- Practice lab: the full add -> commit -> push flow ----------
  click(findByText('Practice terminal'), 'nav to lab');
  check('Lab starts with untracked files', text().includes('UNTRACKED'));

  click(findByText('git status'), 'git status');
  check('git status prints branch', text().includes('On branch main'));
  check('Last-command badge appears', text().includes('last: git status'));

  click(findByText('git add .'), 'git add .');
  check('git add stages files', text().includes('STAGED'));

  click(findByText('git commit -m'), 'git commit');
  check('git commit moves files to committed', text().includes('COMMITTED'));
  check('git commit awards XP', text().includes('180 XP'), text().match(/\d+ XP/)?.[0] ?? '');

  click(findByText('git push'), 'git push');
  check('git push moves files to pushed', text().includes('PUSHED'));
  check('git push awards XP', text().includes('230 XP'), text().match(/\d+ XP/)?.[0] ?? '');
  check('Remote branch count updates', /Remote Branches:\s*1/.test(text().replace(/\s+/g, ' ')));

  // Typed input path (not just the quick-command buttons)
  const input = document.querySelector('input[type="text"]') as HTMLInputElement;
  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value')!.set!;
  act(() => {
    setter.call(input, 'git branch feature/gpa-calculator');
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
  });
  act(() => {
    input.closest('form')!.dispatchEvent(
      new window.Event('submit', { bubbles: true, cancelable: true }));
  });
  check('Typed command creates a branch', text().includes('Branch created: feature/gpa-calculator'));

  // Unknown command is handled, not crashed on
  act(() => {
    setter.call(input, 'notgit whoops');
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
  });
  act(() => {
    input.closest('form')!.dispatchEvent(
      new window.Event('submit', { bubbles: true, cancelable: true }));
  });
  check('Non-git command produces an error line', text().includes('Did you forget'));

  click(findByText('Reset Workspace'), 'reset');
  check('Reset restores untracked state', text().includes('Workspace successfully reset'));

  // --- Quizzes: selection persistence + scoring -------------------
  click(findByText('Certification Quizzes'), 'nav to quizzes');
  check('Quiz score starts at zero', /Score:\s*0\s*\/\s*3/.test(text().replace(/\s+/g, ' ')));

  const optionC = buttons().find(b =>
    (b.textContent ?? '').includes('Stash or temporarily commit unfinished JWT work'));
  click(optionC, 'quiz 1 option C');
  // The regression this guards: selection used to be lost on re-render.
  check('Quiz selection persists after re-render',
    (optionC?.className ?? '').includes('border-indigo-500'),
    optionC?.className ?? '');

  const lockBtn = findByText('Lock Answer and Verify Explanation');
  click(lockBtn, 'submit quiz 1');
  check('Correct answer marked passed', text().includes('PASSED (+50 XP)'));
  check('Explanation revealed', text().includes('Technical Explanation'));
  check('Score increments', /Score:\s*1\s*\/\s*3/.test(text().replace(/\s+/g, ' ')));

  // --- Roadmap reacts to lesson completion -----------------------
  click(findByText('Current Lesson'), 'nav to lesson');
  click(findByText('Mark Done & Launch Diagram Map'), 'mark lesson 1 done');
  check('Marking done routes to the diagram', text().includes('Visual Git Lifecycle Diagram'));
  click(findByText('Academy Dashboard'), 'nav to dashboard');
  check('Course progression recalculates', text().includes('9% Completed'),
    text().match(/\d+% Completed/)?.[0] ?? '');

  click(findByText('Interactive Roadmap'), 'nav to roadmap');
  check('Milestone progress recalculates', /Milestone Progress:\s*50%/.test(text().replace(/\s+/g, ' ')));

  // --- Unauthored lesson shows a real screen, not a blank one -----
  const studyButtons = buttons().filter(b => (b.textContent ?? '').includes('Study Milestone'));
  click(studyButtons[2], 'Study Milestone 3');
  check('Unauthored lesson renders a populated screen',
    text().includes('Unit in production') && text().includes('Creating Isolated Feature Streams'));
  click(findByText('Open Lesson 1'), 'back to lesson 1');
  check('Recovery path returns to authored lesson',
    text().includes('What Is Version Control'));

  return results;
}
