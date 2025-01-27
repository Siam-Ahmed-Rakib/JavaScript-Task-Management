let tasks = [];
let taskToUpdateId = null;


// The loadTasks function retrieves the tasks array from local storage and updates the tasks variable.
function loadTasks() {
    const savedTasks = localStorage.getItem("tasks");
    tasks = savedTasks ? JSON.parse(savedTasks) : [];
    renderTasks();
}
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


// The showNotification function displays a message on the screen
// for a short period of time. The message can be an error message or 
// a success message. The type parameter is used to determine the 
// background color of the notification box. The notification box is 
// hidden by default and is displayed for 2 seconds before disappearing.
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


// The renderTasks function displays the tasks on the screen based on the  
//   renderTasks function displays the tasks on the screen based on the 
//   filter and query parameters. The filter parameter can be "all",
//   "completed", or "incomplete" to display all tasks, completed tasks,
//   or incomplete tasks respectively. The query parameter is used to
//   filter tasks based on a search query. The tasks are displayed in a
//   list format with buttons to complete, update, and delete each task.
//   The task completion status is indicated by a strikethrough style.
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


// The addTask function adds a new task to the tasks array. It takes
// the title, description, priority, and dueDate of the task as parameters.
// The title, priority, and dueDate are required fields. If any of these
// fields are missing, an error message is displayed using the showNotification
// function. If a task with the same title already exists, an error message is
// displayed. Otherwise, a new task object is created with a unique id and
// added to the tasks array. The tasks array is then saved to local storage
// using the saveTasks function. The renderTasks function is called to display
// the updated list of tasks. A success message is displayed using the
// showNotification function to indicate that the task was added successfully.
// The function returns true if the task was added successfully, and false otherwise. 
function addTask(title, description, priority, dueDate) {
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



// The deleteTask function deletes a task from the tasks array based on the taskId.
// It filters out the task with the matching id and updates the tasks array. The
// updated tasks array is saved to local storage using the saveTasks function. The
// renderTasks function is called to display the updated list of tasks. A success
// message is displayed using the showNotification function to indicate that the
// task was deleted successfully.
function deleteTask(taskId) {
    tasks = tasks.filter((task) => task.id !== taskId);
    saveTasks();
    renderTasks();
    showNotification("Task deleted successfully!", "success");
}



// The toggleTaskCompletion function toggles the completion status of a task based on the taskId.
// It finds the task with the matching id in the tasks array and toggles the completed property.
// The updated tasks array is saved to local storage using the saveTasks function. The renderTasks
// function is called to display the updated list of tasks. A success message is displayed using
// the showNotification function to indicate that the task completion status was updated successfully.
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



// The showUpdateForm function displays the update form with the details of the task to be updated.
// It finds the task with the matching taskId in the tasks array and populates the update form fields
// with the task details. The update form is displayed by removing the "hidden" class. The taskId of
// the task to be updated is stored in the taskToUpdateId variable.
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


// The hideUpdateForm function hides the update form by adding the "hidden" class to the form element.
// It also resets the taskToUpdateId variable to null to indicate that no task is currently being updated.
function hideUpdateForm() {
    document.getElementById("update-task-form").classList.add("hidden");
    taskToUpdateId = null;
}


// The saveUpdatedTask function saves the updated task details to the tasks array. It retrieves the
// updated title, details, priority, and dueDate from the update form fields. It validates that all
// fields are filled out and that the title is unique. If the title is not unique, an error message
// is displayed using the showNotification function. If the title is unique, the task details are updated
// in the tasks array, and the tasks array is saved to local storage using the saveTasks function. The
// renderTasks function is called to display the updated list of tasks. A success message is displayed
// using the showNotification function to indicate that the task was updated successfully. The update
// form is then hidden using the hideUpdateForm function. The function returns true if the task was
// updated successfully, and false otherwise.
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



// Add an event listener for the task form to call the addTask function when the user submits the form.
// The event listener calls the addTask function with the title, description, priority, and dueDate values
// from the form fields. If the task is added successfully, the form is reset using the reset method.
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


// Add event listeners for the update form buttons and the filter elements 
// to call the appropriate functions when the user interacts with the form.
// The event listeners for the update form buttons call the hideUpdateForm and
// saveUpdatedTask functions when the user clicks on the cancel and save buttons
document.getElementById("cancel-update-task").addEventListener("click", hideUpdateForm);
document.getElementById("save-updated-task").addEventListener("click", saveUpdatedTask);



// Add event listeners for the filter and search elements to call the renderTasks
// function with the appropriate filter and query parameters when the user interacts
// with the elements. The taskFilter event listener listens for changes in the filter
// dropdown and calls the renderTasks function with the selected filter and the current query.
// The taskSearch event listener listens for input events in the search input field and calls
// the renderTasks function with the current filter and the search query. The taskSort event
// listener listens for changes in the sort dropdown and calls the renderTasks function with
// the selected sort option.
// The event listeners for the filter and search elements call the renderTasks function with
// the appropriate filter and query parameters based on the user input.
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