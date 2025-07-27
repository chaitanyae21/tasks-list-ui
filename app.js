/*
 * Main application entry point. This file contains the React components
 * responsible for rendering the tasks list. The code is intentionally
 * separated from the HTML markup to improve readability and maintainability.
 */

// Async wrappers around global endpoints mimic REST requests. In a real
// system these would call `fetch('/tasks')`, etc.
function fetchTasks() {
  return new Promise((resolve) => setTimeout(() => resolve(window.TASKS_ENDPOINT.slice()), 100));
}
function fetchAssignees() {
  return new Promise((resolve) => setTimeout(() => resolve(window.ASSIGNEES_ENDPOINT.slice()), 100));
}
function fetchLabels() {
  return new Promise((resolve) => setTimeout(() => resolve(window.LABELS_ENDPOINT.slice()), 100));
}

// TaskList component displays a list of tasks with assignee avatars, labels,
// and a status dropdown. This component is intentionally written without
// JSX to avoid the need for a build step.
function TaskList() {
  const [tasks, setTasks] = React.useState([]);
  const [assignees, setAssignees] = React.useState([]);
  const [labels, setLabels] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // Load data on mount
  React.useEffect(() => {
    async function load() {
      const [ts, as, ls] = await Promise.all([fetchTasks(), fetchAssignees(), fetchLabels()]);
      setTasks(ts);
      setAssignees(as);
      setLabels(ls);
      setLoading(false);
    }
    load();
  }, []);

  // Update a task's status immutably
  function updateStatus(taskId, newStatus) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
  }

  // Helper lookups
  const getAssignee = (id) => assignees.find((a) => a.id === id);
  const getLabels = (ids) => labels.filter((l) => ids.includes(l.id));

  if (loading) {
    return React.createElement('p', null, 'Loading tasks...');
  }

  return React.createElement(
    'div',
    { className: 'task-list' },
    tasks.map((task) => {
      const assignee = getAssignee(task.assigneeId);
      const taskLabels = getLabels(task.labelIds);
      return React.createElement(
        'div',
        { key: task.id, className: 'task-item' },
        React.createElement('img', {
          className: 'avatar',
          src: assignee?.avatar || 'https://via.placeholder.com/40',
          alt: assignee ? assignee.name : 'Assignee',
        }),
        React.createElement(
          'div',
          { className: 'task-content' },
          React.createElement('p', { className: 'task-title' }, task.title),
          React.createElement(
            'div',
            { className: 'task-labels' },
            taskLabels.map((label) =>
              React.createElement(
                'span',
                {
                  key: label.id,
                  className: 'label',
                  style: { backgroundColor: label.color },
                },
                label.name
              )
            )
          )
        ),
        React.createElement(
          'select',
          {
            value: task.status,
            onChange: (e) => updateStatus(task.id, e.target.value),
          },
          React.createElement('option', { value: 'todo' }, 'To Do'),
          React.createElement('option', { value: 'in-progress' }, 'In Progress'),
          React.createElement('option', { value: 'done' }, 'Done')
        )
      );
    })
  );
}

// Root App component acts as a wrapper. Additional pages or features could be
// composed here in the future.
function App() {
  return React.createElement(TaskList, null);
}

// Mount the app once React and ReactDOM have loaded. This helper waits
// until both globals are available, then renders the application into
// the root container.
(function mountWhenReady() {
  if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(App, null));
  } else {
    setTimeout(mountWhenReady, 50);
  }
})();