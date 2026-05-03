import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../firebase'
import './TaskBoard.css'

const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date)
}

const requestWithTimeout = async (url, options = {}) => {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 15000)

    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal,
        })
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Check backend auth, Firebase credentials, and MongoDB.', {
                cause: error,
            })
        }

        throw error
    } finally {
        window.clearTimeout(timeoutId)
    }
}

const getApiError = (error, fallback) => {
    if (error instanceof TypeError) {
        return 'Cannot reach the backend. Start FastAPI on port 8000.'
    }

    return error.message || fallback
}

const throwApiError = async (response, fallback) => {
    const getMessage = async () => {
        try {
            const data = await response.json()
            return data.detail || fallback
        } catch {
            return fallback
        }
    }

    throw new Error(await getMessage())
}

const TaskBoard = () => {
    const [isAdding, setIsAdding] = useState(false)
    const [taskText, setTaskText] = useState('')
    const [tasks, setTasks] = useState([])
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [authUser, setAuthUser] = useState(null)
    const [isAuthReady, setIsAuthReady] = useState(false)

    const today = useMemo(() => {
        return formatDate(new Date())
    }, [])

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setAuthUser(firebaseUser)
            setIsAuthReady(true)

            if (!firebaseUser) {
                setTasks([])
                setIsLoading(false)
            }
        })

        return unsubscribe
    }, [])

    useEffect(() => {
        if (!isAuthReady) {
            return
        }

        if (!authUser) {
            return
        }

        const fetchTasks = async () => {
            setIsLoading(true)

            try {
                const token = await authUser.getIdToken()
                const response = await requestWithTimeout('/api/tasks', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (!response.ok) {
                    await throwApiError(response, 'Unable to load tasks')
                }

                const data = await response.json()
                setTasks(data)
            } catch (fetchError) {
                setError(getApiError(fetchError, 'Unable to load tasks'))
            } finally {
                setIsLoading(false)
            }
        }

        fetchTasks()
    }, [authUser, isAuthReady])

    const getAuthHeaders = async () => {
        if (!authUser) {
            throw new Error('Login required to save tasks')
        }

        const token = await authUser.getIdToken()

        return {
            Authorization: `Bearer ${token}`,
        }
    }

    const handleAddTask = async (event) => {
        event.preventDefault()
        const title = taskText.trim()

        if (!title) {
            return
        }

        try {
            const authHeaders = await getAuthHeaders()
            const response = await requestWithTimeout('/api/tasks', {
                method: 'POST',
                headers: {
                    ...authHeaders,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, date: today }),
            })

            if (!response.ok) {
                await throwApiError(response, 'Unable to add task')
            }

            const createdTask = await response.json()
            setTasks((currentTasks) => [createdTask, ...currentTasks])
            setTaskText('')
            setIsAdding(false)
            setError('')
        } catch (addError) {
            setError(getApiError(addError, 'Unable to add task'))
        }
    }

    const toggleTask = async (taskId) => {
        const taskToUpdate = tasks.find((task) => task.id === taskId)

        if (!taskToUpdate) {
            return
        }

        try {
            const authHeaders = await getAuthHeaders()
            const response = await requestWithTimeout(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    ...authHeaders,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed: !taskToUpdate.completed }),
            })

            if (!response.ok) {
                await throwApiError(response, 'Unable to update task')
            }

            const updatedTask = await response.json()
            setTasks((currentTasks) =>
                currentTasks.map((task) => (task.id === taskId ? updatedTask : task)),
            )
            setError('')
        } catch (updateError) {
            setError(getApiError(updateError, 'Unable to update task'))
        }
    }

    const deleteTask = async (taskId) => {
        try {
            const authHeaders = await getAuthHeaders()
            const response = await requestWithTimeout(`/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: authHeaders,
            })

            if (!response.ok) {
                await throwApiError(response, 'Unable to delete task')
            }

            setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))
            setError('')
        } catch (deleteError) {
            setError(getApiError(deleteError, 'Unable to delete task'))
        }
    }

    return (
        <main className="task-board">
            <section className="task-board__header">
                <div>
                    <p className="task-board__eyebrow">{today}</p>
                    <h1 className="task-board__title">Daily Tasks</h1>
                </div>

                <button
                    className="task-board__add-button"
                    type="button"
                    disabled={!authUser}
                    onClick={() => setIsAdding(true)}
                >
                    <span aria-hidden="true">+</span>
                    Add Task
                </button>
            </section>

            {!authUser && !isLoading && (
                <div className="task-board__empty task-board__empty--auth">
                    <p>Login or sign up to save tasks to your account.</p>
                </div>
            )}

            {isAdding && authUser && (
                <form className="task-board__form" onSubmit={handleAddTask}>
                    <label className="task-board__field">
                        <span>Task</span>
                        <input
                            autoFocus
                            type="text"
                            value={taskText}
                            onChange={(event) => setTaskText(event.target.value)}
                            placeholder="Add today's task"
                        />
                    </label>

                    <div className="task-board__form-actions">
                        <button className="task-board__submit" type="submit">
                            Save Task
                        </button>
                        <button
                            className="task-board__cancel"
                            type="button"
                            onClick={() => {
                                setIsAdding(false)
                                setTaskText('')
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {error && <p className="task-board__error">{error}</p>}

            <section className="task-board__list" aria-label="Daily task list">
                {isLoading ? (
                    <div className="task-board__empty">
                        <p>Loading tasks...</p>
                    </div>
                ) : !authUser ? null : tasks.length > 0 ? (
                    tasks.map((task) => (
                        <article className="task-card" key={task.id}>
                            <label className="task-card__check">
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => toggleTask(task.id)}
                                />
                                <span aria-hidden="true" />
                            </label>

                            <div className="task-card__content">
                                <p className={task.completed ? 'task-card__title task-card__title--done' : 'task-card__title'}>
                                    {task.title}
                                </p>
                                <time className="task-card__date">{task.date}</time>
                            </div>

                            <button
                                className="task-card__delete"
                                type="button"
                                onClick={() => deleteTask(task.id)}
                            >
                                Delete
                            </button>
                        </article>
                    ))
                ) : (
                    <div className="task-board__empty">
                        <p>No tasks added for today.</p>
                    </div>
                )}
            </section>
        </main>
    )
}

export default TaskBoard
