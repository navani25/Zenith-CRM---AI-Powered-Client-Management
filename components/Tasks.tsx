import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, ActivityType } from '../types';
import { supabase } from '../supabaseClient'; // Import Supabase
import { Session } from '@supabase/supabase-js';

interface TasksProps {
    session: Session | null;
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    addActivity: (type: ActivityType, details: string) => void;
}

const inputClasses = "w-full px-3 py-2 rounded-md bg-secondary dark:bg-dark-secondary border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm";

const TaskItem: React.FC<{ task: Task, onToggle: (id: number, currentStatus: TaskStatus) => void }> = ({ task, onToggle }) => {
  const isOverdue = new Date(task.dueDate + 'T00:00:00') < new Date() && task.status !== 'done';

  return (
    <div className="flex items-center p-3 bg-card dark:bg-dark-card rounded-md border border-border dark:border-dark-border hover:bg-secondary/50 dark:hover:bg-dark-secondary/50">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-border dark:border-dark-border text-primary focus:ring-primary bg-secondary dark:bg-dark-secondary"
        checked={task.status === 'done'}
        onChange={() => onToggle(task.id, task.status)}
      />
      <div className="ml-4 flex-1">
        <p className={`font-medium text-sm text-foreground dark:text-dark-foreground ${task.status === 'done' ? 'line-through text-muted-foreground dark:text-dark-muted-foreground' : ''}`}>
          {task.title}
        </p>
        <div className="flex items-center text-xs text-muted-foreground dark:text-dark-muted-foreground mt-1 flex-wrap">
          <i data-lucide="calendar" className="w-3 h-3 mr-1.5"></i>
          <span>{new Date(task.dueDate + 'T00:00:00').toLocaleDateString()}</span>
          {isOverdue && (
            <span className="ml-3 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
              Overdue
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center ml-2">
        <img src={`https://picsum.photos/seed/user/32/32`} alt="Assignee" className="w-6 h-6 rounded-full" />
      </div>
    </div>
  );
};

const Tasks: React.FC<TasksProps> = ({ session,tasks, setTasks, addActivity }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
    const [filter, setFilter] = useState('All'); // New state for filtering

    const getTasks = async () => {
        const { data, error } = await supabase.from('tasks').select('*').order('dueDate');
        if (error) {
            console.error("Error fetching tasks:", error);
        } else {
            setTasks(data || []);
        }
    };

    useEffect(() => {
        getTasks();
    }, []); // Only fetch once on initial load

    useEffect(() => {
        // @ts-ignore
        if (window.lucide) {
            // @ts-ignore
            window.lucide.createIcons();
        }
    }, [tasks, isModalOpen, filter]); // Rerun when filter changes

    const filteredTasks = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (filter === 'Today') {
            return tasks.filter(task => new Date(task.dueDate + 'T00:00:00').toDateString() === today.toDateString());
        }
        if (filter === 'This Week') {
            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() + (6 - today.getDay())); // Assuming Sunday is start of week
            return tasks.filter(task => {
                const taskDate = new Date(task.dueDate + 'T00:00:00');
                return taskDate >= today && taskDate <= endOfWeek;
            });
        }
        if (filter === 'Overdue') {
            return tasks.filter(task => new Date(task.dueDate + 'T00:00:00') < today && task.status !== 'done');
        }
        return tasks; // 'All'
    }, [tasks, filter]);

    const handleToggleStatus = async (taskId: number, currentStatus: TaskStatus) => {
        const taskToToggle = tasks.find(t => t.id === taskId);
        const newStatus = currentStatus === 'done' ? 'todo' : 'done';

        const { error } = await supabase
            .from('tasks')
            .update({ status: newStatus })
            .eq('id', taskId);

        if (error) {
            alert(error.message);
        } else {
            if (newStatus === 'done' && taskToToggle) {
                addActivity('task_completed', `Completed task: "${taskToToggle.title}".`);
            }
            await getTasks(); // Refresh list
        }
    };

    const handleAddTask = async () => {
        if (!session?.user) return alert("You must be logged in.");
        if (!newTaskTitle.trim()) return;
        
        const { error } = await supabase.from('tasks').insert([{
            title: newTaskTitle,
            dueDate: newTaskDueDate,
            assignedTo: 'You',
            status: 'todo',
            user_id: session.user.id,
        }]);

        if (error) {
            alert(error.message);
        } else {
            await getTasks(); // Refresh list
            setIsModalOpen(false);
            setNewTaskTitle('');
        }
    };

    const groupedTasks = filteredTasks.reduce((acc, task) => {
        const status = task.status;
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(task);
        return acc;
    }, {} as Record<Task['status'], Task[]>);
    
    const FilterButton: React.FC<{ label: string }> = ({ label }) => (
        <button
            onClick={() => setFilter(label)}
            className={`px-3 py-1 text-sm font-medium rounded-md ${filter === label ? 'bg-primary text-primary-foreground' : 'bg-secondary dark:bg-dark-secondary text-muted-foreground dark:text-dark-muted-foreground hover:bg-card/50'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="h-full overflow-y-auto p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-foreground dark:text-dark-foreground">Tasks</h1>
                <div className="flex items-center gap-2">
                    <div className="flex items-center p-1 bg-secondary dark:bg-dark-secondary rounded-lg">
                        <FilterButton label="All" />
                        <FilterButton label="Today" />
                        <FilterButton label="This Week" />
                        <FilterButton label="Overdue" />
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 text-sm">
                        <i data-lucide="plus" className="w-5 h-5 mr-2"></i>
                        Add Task
                    </button>
                </div>
            </div>
            <div className="space-y-8">
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground dark:text-dark-foreground">To Do</h3>
                    <div className="space-y-3">
                        {(groupedTasks.todo || []).length > 0 ? (
                            groupedTasks.todo.map(task => <TaskItem key={task.id} task={task} onToggle={handleToggleStatus} />)
                        ) : (<p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">No tasks to do.</p>)}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground dark:text-dark-foreground">In Progress</h3>
                     <div className="space-y-3">
                        {(groupedTasks['in-progress'] || []).length > 0 ? (
                            groupedTasks['in-progress'].map(task => <TaskItem key={task.id} task={task} onToggle={handleToggleStatus} />)
                        ) : (<p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">No tasks in progress.</p>)}
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground dark:text-dark-foreground">Done</h3>
                    <div className="space-y-3">
                         {(groupedTasks.done || []).length > 0 ? (
                            groupedTasks.done.map(task => <TaskItem key={task.id} task={task} onToggle={handleToggleStatus} />)
                        ) : (<p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">No tasks are done.</p>)}
                    </div>
                </div>
            </div>

             {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-card dark:bg-dark-card rounded-lg shadow-xl w-full max-w-md m-4">
                        <div className="p-6 border-b border-border dark:border-dark-border">
                            <h3 className="text-lg font-semibold">Add New Task</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Task title" className={inputClasses} />
                            <input type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} placeholder="Due Date" className={inputClasses} />
                        </div>
                        <div className="p-4 bg-secondary/50 dark:bg-dark-secondary/50 rounded-b-lg flex justify-end space-x-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium rounded-md bg-card dark:bg-dark-card border border-border dark:border-dark-border hover:bg-secondary dark:hover:bg-dark-secondary">Cancel</button>
                            <button onClick={handleAddTask} className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90">Add Task</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
