
const STORAGE_KEY = 'tasksData';

const todo = document.querySelector('#todo');
const progress = document.querySelector('#progress');
const done = document.querySelector('#done');
const columns = [todo, progress, done];
let dragElement = null;
let tasksData = {};

function loadTasksData() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (error) {
        return {};
    }
}

function updateTaskCounts() {
    columns.forEach(column => {
        const count = column.querySelector('.right');
        if (count) {
            count.textContent = column.querySelectorAll('.task').length;
        }
    });
}

function saveTasksData() {
    tasksData = {};

    columns.forEach(column => {
        tasksData[column.id] = Array.from(column.querySelectorAll('.task')).map(task => ({
            title: task.querySelector('h2')?.textContent || '',
            description: task.querySelector('p')?.textContent || ''
        }));
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksData));
    updateTaskCounts();
}

function attachTaskEvents(task) {
    task.addEventListener('dragstart', e => {
        dragElement = task;
        if (e.dataTransfer) {
            e.dataTransfer.setData('text/plain', '');
            e.dataTransfer.effectAllowed = 'move';
        }
    });

    task.addEventListener('dragend', () => {
        dragElement = null;
    });
}

function createTaskElement(taskData) {
    const div = document.createElement('div');
    div.classList.add('task');
    div.setAttribute('draggable', 'true');

    const title = document.createElement('h2');
    title.textContent = taskData.title;

    const description = document.createElement('p');
    description.textContent = taskData.description;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
        div.remove();
        saveTasksData();
    });

    div.append(title, description, deleteButton);
    attachTaskEvents(div);
    return div;
}

function renderStoredTasks() {
    tasksData = loadTasksData();

    columns.forEach(column => {
        const savedTasks = tasksData[column.id] || [];
        savedTasks.forEach(task => {
            column.appendChild(createTaskElement(task));
        });
    });

    updateTaskCounts();
}

function addDragEventsOnColumn(column) {
    column.addEventListener('dragenter', e => {
        e.preventDefault();
        column.classList.add('hover-over');
    });

    column.addEventListener('dragleave', e => {
        e.preventDefault();
        column.classList.remove('hover-over');
    });

    column.addEventListener('dragover', e => {
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'move';
        }
    });

    column.addEventListener('drop', e => {
        e.preventDefault();

        if (dragElement) {
            column.appendChild(dragElement);
            column.classList.remove('hover-over');
            saveTasksData();
            dragElement = null;
        }
    });
}

renderStoredTasks();

addDragEventsOnColumn(todo);
addDragEventsOnColumn(progress);
addDragEventsOnColumn(done);

const toggleModalButton = document.querySelector('#toggle-modal');
const modalBg = document.querySelector('.modal .bg');
const modal = document.querySelector('.modal');
const addNewTaskButton = document.querySelector('#add-new-task');

toggleModalButton.addEventListener('click', () => {
    modal.classList.toggle('active');
});

modalBg.addEventListener('click', () => {
    modal.classList.remove('active');
});

addNewTaskButton.addEventListener('click', () => {
    const taskTitle = document.querySelector('#task-title-input').value.trim();
    const taskDesc = document.querySelector('#task-desc-input').value.trim();

    if (!taskTitle) {
        return;
    }

    const div = createTaskElement({ title: taskTitle, description: taskDesc });
    todo.appendChild(div);
    saveTasksData();
    modal.classList.remove('active');
    document.querySelector('#task-title-input').value = '';
    document.querySelector('#task-desc-input').value = '';
});
