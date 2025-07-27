// Data definitions moved here for clarity and separation of concerns.
// In a real application these would be fetched from REST endpoints.

window.TASKS_ENDPOINT = [
  { id: 1, title: 'Buy groceries', status: 'todo', assigneeId: 1, labelIds: [1] },
  { id: 2, title: 'Fix login bug', status: 'in-progress', assigneeId: 2, labelIds: [2, 3] },
  { id: 3, title: 'Write meeting notes', status: 'done', assigneeId: 3, labelIds: [] },
];

window.ASSIGNEES_ENDPOINT = [
  { id: 1, name: 'Alice', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: 2, name: 'Bob', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: 3, name: 'Charlie', avatar: 'https://i.pravatar.cc/150?img=3' },
];

window.LABELS_ENDPOINT = [
  { id: 1, name: 'Personal', color: '#3b82f6' },
  { id: 2, name: 'Bug', color: '#ef4444' },
  { id: 3, name: 'Feature', color: '#10b981' },
];