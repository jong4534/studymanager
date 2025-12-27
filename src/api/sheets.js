// src/api/sheets.js

// TODO: REPLACE THIS WITH YOUR DEPLOYED GOOGLE APPS SCRIPT URL
// (Keep the user's existing URL if possible, assuming they will update the script at the same URL)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyxZ5VufUhUSMM900P1ijnpRh4w7we2W1HWiA_ME9jmhTQk_EGGDgB6UARuDOny6r51/exec';

/**
 * Fetch logs and settings from Google Sheet
 * Returns: { logs: [], settings: [] }
 */
export async function getTasks() {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json(); // Now returns { logs, settings }
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return { logs: [], settings: [] };
    }
}

/**
 * Add a new task
 */
export async function addTask(taskData) {
    const payload = {
        action: 'ADD_TASK',
        ...taskData
    };

    return await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    }).then(res => res.json());
}

/**
 * Update a task's status and note
 */
export async function updateTask(taskId, status, note) {
    const payload = {
        action: 'UPDATE_TASK',
        taskId,
        status,
        note
    };

    return await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    }, {
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        }
    }).then(res => res.json());
}
