let tasks = [];
let taskToUpdateId = null;


function loadTasks() {
    const savedTasks = localStorage.getItem("tasks");
    tasks = savedTasks ? JSON.parse(savedTasks) : [];
    renderTasks();
}


function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


function showNotification(message, type = "error") {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.style.backgroundColor = type === "error" ? "#f44336" : "#4CAF50";
    notification.style.display = "block";
    notification.classList.remove("hidden");
    
    if (window.notificationTimeout) {
        clearTimeout(window.notificationTimeout);
    }
    
    window.notificationTimeout = setTimeout(() => {
        notification.style.display = "none";
        notification.classList.add("hidden");
    }, 2000); 
}


function renderTasks(filter = "all", query = "") {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    let filteredTasks = tasks;

    if (filter === "completed") {
        filteredTasks = tasks.filter((task) => task.completed);
    } else if (filter === "incomplete") {
        filteredTasks = tasks.filter((task) => !task.completed);
    }

    if (query) {
        filteredTasks = filteredTasks.filter((task) =>
            task.title.toLowerCase().includes(query.toLowerCase())
        );
    }

    filteredTasks.forEach((task) => {
        const taskItem = document.createElement("div");
        taskItem.classList.add("task-item");
        if (task.completed) {
            taskItem.classList.add("task-completed");
        }

        taskItem.innerHTML = `
            <div>
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                <p>Priority: ${task.priority}</p>
                <p>Due Date: ${task.dueDate}</p>
            </div>
            <div class="task-actions">
                <button class="complete-btn" onclick="toggleTaskCompletion(${task.id})">
                    ${task.completed ? "Undo" : "Complete"}
                </button>
                <button class="update-btn" onclick="showUpdateForm(${task.id})">Update</button>
                <button class="delete-btn" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        taskList.appendChild(taskItem);
    });
}


function addTask(title, description, priority, dueDate) {
    // Check for empty fields
    if (!title || !priority || !dueDate) {
        showNotification("Task title, priority, and due date are required!", "error");
        return false;
    }

   
    const isDuplicate = tasks.some(
        (task) => task.title.toLowerCase() === title.toLowerCase()
    );
    if (isDuplicate) {
        showNotification("A task with this title already exists!", "error");
        return false;
    }

    const newTask = {
        id: Date.now(),
        title,
        description,
        priority,
        dueDate,
        completed: false,
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    showNotification("Task added successfully!", "success");
    return true;
}


function deleteTask(taskId) {
    tasks = tasks.filter((task) => task.id !== taskId);
    saveTasks();
    renderTasks();
    showNotification("Task deleted successfully!", "success");
}


function toggleTaskCompletion(taskId) {
    const task = tasks.find((task) => task.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        showNotification(
            `Task marked as ${task.completed ? "completed" : "incomplete"}!`,
            "success"
        );
    }
}


function showUpdateForm(taskId) {
    const task = tasks.find((task) => task.id === taskId);
    if (task) {
        document.getElementById("update-task-title").value = task.title;
        document.getElementById("update-task-details").value = task.description;
        document.getElementById("update-task-priority").value = task.priority;
        document.getElementById("update-task-due-date").value = task.dueDate;
        document.getElementById("update-task-form").classList.remove("hidden");
        taskToUpdateId = taskId;
    }
}


function hideUpdateForm() {
    document.getElementById("update-task-form").classList.add("hidden");
    taskToUpdateId = null;
}


function saveUpdatedTask() {
    const updatedTitle = document.getElementById("update-task-title").value.trim();
    const updatedDetails = document.getElementById("update-task-details").value.trim();
    const updatedPriority = document.getElementById("update-task-priority").value;
    const updatedDueDate = document.getElementById("update-task-due-date").value;


    if (!updatedTitle || !updatedDetails || !updatedPriority || !updatedDueDate) {
        showNotification("All fields are required for updating a task!", "error");
        return false;
    }

    const isDuplicate = tasks.some(
        (task) =>
            task.id !== taskToUpdateId &&
            task.title.toLowerCase() === updatedTitle.toLowerCase()
    );
    if (isDuplicate) {
        showNotification("A task with this title already exists!", "error");
        return false;
    }

    const task = tasks.find((task) => task.id === taskToUpdateId);
    if (task) {
        task.title = updatedTitle;
        task.description = updatedDetails;
        task.priority = updatedPriority;
        task.dueDate = updatedDueDate;

        saveTasks();
        renderTasks();
        showNotification("Task updated successfully!", "success");
        hideUpdateForm();
        return true;
    }
    return false;
}


document.getElementById("taskForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();
    const priority = document.getElementById("taskPriority").value;
    const dueDate = document.getElementById("taskDueDate").value;

    if (addTask(title, description, priority, dueDate)) {
        e.target.reset(); 
    }
});

document.getElementById("cancel-update-task").addEventListener("click", hideUpdateForm);
document.getElementById("save-updated-task").addEventListener("click", saveUpdatedTask);


document.getElementById("taskFilter").addEventListener("change", (e) => {
    const filter = e.target.value;
    const query = document.getElementById("taskSearch").value;
    renderTasks(filter, query);
});

document.getElementById("taskSearch").addEventListener("input", (e) => {
    const query = e.target.value;
    const filter = document.getElementById("taskFilter").value;
    renderTasks(filter, query);
});


document.getElementById("taskSort").addEventListener("change", (e) => {
    const sortBy = e.target.value;
    if (sortBy === "priority") {
        tasks.sort((a, b) => b.priority.localeCompare(a.priority));
    } else if (sortBy === "date") {
        tasks.sort((a, b) => new Date(b.id) - new Date(a.id));
    } else if (sortBy === "dueDate") {
        tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }
    renderTasks();
});


loadTasks();