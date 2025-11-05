import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { supabase } from '../supabaseClient'; // Import Supabase
import { Session } from '@supabase/supabase-js';

// Define props for the Calendar component
interface CalendarProps {
    tasks: Task[];
    session: Session | null;
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const inputClasses = "w-full px-3 py-2 rounded-md bg-secondary dark:bg-dark-secondary border border-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm";

const Calendar: React.FC<CalendarProps> = ({ session,tasks, setTasks }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');

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
    }, [currentDate]); // Refetch tasks when month changes

    useEffect(() => {
        // @ts-ignore
        if (window.lucide) {
            // @ts-ignore
            window.lucide.createIcons();
        }
    }, [currentDate, tasks, isModalOpen]);

    const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    const tasksByDate = tasks.reduce((acc, task) => {
        const date = new Date(task.dueDate + 'T00:00:00').toDateString(); // Ensure correct date parsing
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    const changeMonth = (offset: number) => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };
    
    // Function to open the modal and set the date of the clicked day
    const handleDayClick = (dayNumber: number) => {
        const date = new Date(year, currentDate.getMonth(), dayNumber);
        // Format to YYYY-MM-DD for the input[type=date]
        const formattedDate = date.toISOString().split('T')[0]; 
        setNewTaskDueDate(formattedDate);
        setIsModalOpen(true);
    };
    
    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return;
        if (!session?.user) return alert("You must be logged in.");
        const { error } = await supabase.from('tasks').insert([{
            user_id: session.user.id,
            title: newTaskTitle,
            dueDate: newTaskDueDate,
            assignedTo: 'You',
            status: 'todo'
        }]);

        if (error) {
            alert(error.message);
        } else {
            await getTasks(); // Refresh list
            setIsModalOpen(false);
            setNewTaskTitle('');
        }
    };

    const renderTask = (task: Task) => (
        <div key={task.id} className="text-xs p-1 mt-1 rounded-sm bg-accent text-accent-foreground truncate" title={task.title}>
            {task.title}
        </div>
    );
    
    const today = new Date().toDateString();

    return (
        <div className="h-full overflow-y-auto p-4 md:p-6">
            <div className="bg-card p-4 sm:p-6 rounded-lg border border-border">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                    <h3 className="text-xl font-semibold text-foreground">{monthName} {year}</h3>
                    <div className="flex items-center space-x-1 self-end sm:self-auto">
                        <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-secondary">
                            <i data-lucide="chevron-left" className="w-5 h-5 text-muted-foreground"></i>
                        </button>
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-secondary">
                            <i data-lucide="chevron-right" className="w-5 h-5 text-muted-foreground"></i>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-xs sm:text-sm font-semibold py-2 text-muted-foreground border-b border-border">{day.substring(0,3)}</div>
                    ))}
                    {Array.from({ length: startDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="border-r border-b border-border bg-secondary/50"></div>
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, day) => {
                        const dayNumber = day + 1;
                        const date = new Date(year, currentDate.getMonth(), dayNumber);
                        const dateString = date.toDateString();
                        const isToday = dateString === today;
                        const dayOfWeek = date.getDay();

                        return (
                            <div 
                                key={day} 
                                className={`p-1 sm:p-2 min-h-[80px] sm:min-h-[120px] border-b border-r border-border cursor-pointer hover:bg-secondary ${isToday ? 'bg-secondary' : ''} ${dayOfWeek === 6 ? 'border-r-0' : ''}`}
                                onClick={() => handleDayClick(dayNumber)}
                            >
                                <div className={`font-semibold text-sm ${isToday ? 'text-primary' : 'text-foreground'}`}>{dayNumber}</div>
                                <div className="overflow-hidden">
                                    {tasksByDate[dateString]?.map(renderTask)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-card dark:bg-dark-card rounded-lg shadow-xl w-full max-w-md m-4">
                        <div className="p-6 border-b border-border dark:border-dark-border">
                            <h3 className="text-lg font-semibold">Add New Task for {new Date(newTaskDueDate + 'T00:00:00').toLocaleDateString()}</h3>
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

export default Calendar;