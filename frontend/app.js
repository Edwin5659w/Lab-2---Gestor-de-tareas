const API_URL = 'http://localhost:3000';

// Cargar tareas al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    loadSummary();
});

// Obtener tareas
async function loadTasks(status = '') {
    try {
        const url = status ? `${API_URL}/tasks?status=${status}` : `${API_URL}/tasks`;
        const response = await fetch(url);
        const tasks = await response.json();
        displayTasks(tasks);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Crear tarea
async function createTask() {
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description }),
        });
        
        if (response.ok) {
            document.getElementById('taskTitle').value = '';
            document.getElementById('taskDescription').value = '';
            loadTasks();
            loadSummary();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Actualizar estado
async function updateTaskStatus(id, status) {
    try {
        await fetch(`${API_URL}/tasks/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });
        loadTasks();
        loadSummary();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Cargar resumen
async function loadSummary() {
    try {
        const response = await fetch(`${API_URL}/tasks/summary`);
        const summary = await response.json();
        displaySummary(summary);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Mostrar tareas en DOM
function displayTasks(tasks) {
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = tasks.map(task => `
        <div class="task-item" data-status="${task.status}">
            <div>
                <h3>${task.title}</h3>
                <p>${task.description || ''}</p>
            </div>
            <div>
                <select onchange="updateTaskStatus(${task.id}, this.value)">
                    <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>Por hacer</option>
                    <option value="doing" ${task.status === 'doing' ? 'selected' : ''}>En progreso</option>
                    <option value="done" ${task.status === 'done' ? 'selected' : ''}>Completada</option>
                </select>
            </div>
        </div>
    `).join('');
}

// Mostrar resumen en DOM
function displaySummary(summary) {
    document.getElementById('summary').innerHTML = `
        <h3>Resumen:</h3>
        <p>Por hacer: ${summary.todo}</p>
        <p>En progreso: ${summary.doing}</p>
        <p>Completadas: ${summary.done}</p>
    `;
}

// Filtrar tareas
function filterTasks(status) {
    if (status === 'all') {
        loadTasks();
    } else {
        loadTasks(status);
    }
}