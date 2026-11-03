const $ = id => document.getElementById(id);
let tasks = JSON.parse(localStorage.getItem('taskflow_tasks') || '[]');
$('today').textContent = new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});

function saveTasks(){
  localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  renderTasks();
}
function renderTasks(){
  const completed = tasks.filter(task => task.done).length;
  $('total').textContent = tasks.length;
  $('pending').textContent = tasks.length - completed;
  $('completed').textContent = completed;

  const query = $('search').value.toLowerCase();
  const status = $('filter').value;
  const category = $('categoryFilter').value;
  const visibleTasks = tasks.filter(task =>
    task.text.toLowerCase().includes(query) &&
    (status === 'all' || (status === 'completed' ? task.done : !task.done)) &&
    (category === 'all' || task.category === category)
  );

  $('list').innerHTML = '';
  if (!visibleTasks.length) {
    $('list').innerHTML = '<div class="empty">No tasks found. Add a task to get started ✨</div>';
    return;
  }

  visibleTasks.forEach(task => {
    const row = document.createElement('div');
    row.className = 'task' + (task.done ? ' done' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => { task.done = checkbox.checked; saveTasks(); });

    const main = document.createElement('div');
    main.className = 'taskmain';
    const name = document.createElement('div');
    name.className = 'taskname';
    name.textContent = task.text;
    const meta = document.createElement('div');
    meta.className = 'meta';
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = task.category;
    const priority = document.createElement('span');
    priority.className = 'priority';
    priority.textContent = task.priority + ' priority';
    meta.append(tag, priority);
    if (task.due) meta.append(' · Due ' + task.due);
    main.append(name, meta);

    const actions = document.createElement('div');
    actions.className = 'actions';
    const edit = document.createElement('button');
    edit.className = 'icon'; edit.textContent = 'Edit';
    edit.onclick = () => {
      const updated = prompt('Edit task:', task.text);
      if (updated && updated.trim()) { task.text = updated.trim(); saveTasks(); }
    };
    const remove = document.createElement('button');
    remove.className = 'icon'; remove.textContent = '✕';
    remove.onclick = () => {
      if (confirm('Delete this task?')) { tasks = tasks.filter(item => item.id !== task.id); saveTasks(); }
    };
    actions.append(edit, remove);
    row.append(checkbox, main, actions);
    $('list').append(row);
  });
}

$('taskForm').addEventListener('submit', event => {
  event.preventDefault();
  const text = $('taskInput').value.trim();
  if (!text) return;
  tasks.unshift({
    id: Date.now(), text, category: $('category').value,
    priority: $('priority').value, due: $('dueDate').value, done: false
  });
  $('taskInput').value = '';
  saveTasks();
});
['search','filter','categoryFilter'].forEach(id => $(id).addEventListener('input', renderTasks));
renderTasks();