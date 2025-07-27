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

// TaskItem is a presentational component responsible for rendering a
// single task. Separating this logic improves readability and makes it
// easier to reason about the responsibilities of each piece of the UI.
// Reusable Avatar component encapsulates rendering of an avatar image.
function Avatar(props) {
  const { src, alt } = props;
  return React.createElement('img', { className: 'avatar', src, alt });
}

// Reusable LabelBadge component encapsulates label rendering so any
// component can display a coloured label simply by passing a label
// object containing `name` and `color`. This improves reusability.
function LabelBadge(props) {
  const { label } = props;
  return React.createElement(
    'span',
    {
      className: 'label',
      style: { backgroundColor: label.color },
    },
    label.name
  );
}

// StatusSelect is a reusable dropdown for selecting a status. It accepts
// `value` and `onChange` props so that parent components can control
// the selected state. This component centralises the status options
// making it easier to update statuses in one place.
function StatusSelect(props) {
  const { value, onChange } = props;
  return React.createElement(
    'select',
    {
      value,
      onChange: (e) => onChange(e.target.value),
    },
    React.createElement('option', { value: 'todo' }, 'To Do'),
    React.createElement('option', { value: 'in-progress' }, 'In Progress'),
    React.createElement('option', { value: 'done' }, 'Done')
  );
}

function TaskItem(props) {
  const { task, assignee, labels, onStatusChange } = props;
  return React.createElement(
    'div',
    { className: 'task-item' },
    // Avatar component displays the user's avatar or a placeholder.
    React.createElement(Avatar, {
      src: assignee?.avatar || 'https://via.placeholder.com/40',
      alt: assignee ? assignee.name : 'Assignee',
    }),
    // Task content (title and labels)
    React.createElement(
      'div',
      { className: 'task-content' },
      React.createElement('p', { className: 'task-title' }, task.title),
      React.createElement(
        'div',
        { className: 'task-labels' },
        labels.map((label) =>
          React.createElement(LabelBadge, {
            key: label.id,
            label,
          })
        )
      )
    ),
    // Reusable StatusSelect component
    React.createElement(StatusSelect, {
      value: task.status,
      onChange: (value) => onStatusChange(task.id, value),
    })
  );
}

/*
 * useTasksData is a custom hook that encapsulates data loading and state
 * management for tasks, assignees and labels. By moving this logic
 * out of the rendering layer, we make the TaskList component easier
 * to test and extend. This pattern is commonly used by senior
 * developers to separate concerns.
 */
function useTasksData() {
  const [tasks, setTasks] = React.useState([]);
  const [assignees, setAssignees] = React.useState([]);
  const [labels, setLabels] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      const [ts, as, ls] = await Promise.all([fetchTasks(), fetchAssignees(), fetchLabels()]);
      if (!cancelled) {
        setTasks(ts);
        setAssignees(as);
        setLabels(ls);
        setLoading(false);
      }
    }
    load();
    // Cleanup in case component unmounts during load
    return () => {
      cancelled = true;
    };
  }, []);

  // Status update callback memoised with useCallback. This prevents
  // unnecessary re-renders in deeply nested component trees.
  const updateStatus = React.useCallback((taskId, newStatus) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
  }, []);

  const getAssignee = React.useCallback((id) => assignees.find((a) => a.id === id), [assignees]);
  const getLabels = React.useCallback((ids) => labels.filter((l) => ids.includes(l.id)), [labels]);

  return { tasks, assignees, labels, loading, updateStatus, getAssignee, getLabels };
}

// Context for sharing tasks data throughout the component tree. This
// allows deeply nested components to access data without prop-drilling.
const TasksContext = React.createContext(null);

// TaskList component renders the list of tasks by consuming the
// TasksContext. It expects a provider up the tree (App) to supply
// the tasks data and update function. This separation improves
// composability and testability.
function TaskList() {
  const context = React.useContext(TasksContext);
  if (!context) {
    return React.createElement('p', null, 'No tasks context available');
  }
  const { tasks, loading, updateStatus, getAssignee, getLabels } = context;
  if (loading) {
    return React.createElement('p', null, 'Loading tasks...');
  }
  return React.createElement(
    'div',
    { className: 'task-list' },
    tasks.map((task) =>
      React.createElement(TaskItem, {
        key: task.id,
        task,
        assignee: getAssignee(task.assigneeId),
        labels: getLabels(task.labelIds),
        onStatusChange: updateStatus,
      })
    )
  );
}

// Root App component acts as a wrapper. Additional pages or features could be
// composed here in the future.
function App() {
  // Acquire tasks data via custom hook. This hook handles data
  // loading and returns memoised callbacks for updating tasks.
  const tasksData = useTasksData();
  // Provide the tasks context to descendants. Wrapping the list in
  // TasksContext.Provider prevents prop drilling and enables
  // consumption of tasks data from any level of the tree.
  return React.createElement(
    TasksContext.Provider,
    { value: tasksData },
    React.createElement(TaskList, null)
  );
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