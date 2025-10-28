
import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Icon } from './Icon';
import { Slider } from './Slider';
import { Todo, Task, Session, DailySummary, View } from '../types';
import { useStopwatch } from '../hooks/useStopwatch';

interface DashboardProps {
    tasks: Task[];
    activeTask: Task | null;
    setActiveTaskId: (id: number | null) => void;
    onStartFocus: () => void;
    addTask: (newTask: Omit<Task, 'id' | 'actualTime' | 'status' | 'subTasks'>) => void;
    updateTask: (task: Task) => void;
    reorderTasks: (startIndex: number, endIndex: number) => void;
    deleteTask: (id: number) => void;
    reactivateTask: (id: number) => void;
    sessionHistory: Session[];
    dailyHistory: DailySummary[];
    onDeleteDailySummary: (id: number) => void;
    onNewDay: () => void;
    
    todos: Todo[];
    addTodo: (text: string) => void;
    toggleTodo: (id: number) => void;
    removeTodo: (id: number) => void;
    reorderTodos: (startIndex: number, endIndex: number) => void;

    energy: number;
    setEnergy: (value: number) => void;
    satisfaction: number;
    setSatisfaction: (value: number) => void;
    blockerNote: string;
    setBlockerNote: (note: string) => void;

    theme: 'light' | 'dark';
    onThemeChange: (theme: 'light' | 'dark') => void;

    activeView: View;
    setActiveView: (view: View) => void;
}

const formatStopwatchTime = (timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const formatSessionDuration = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const getKpiColorClass = (value: number) => {
    if (value >= 8) return 'text-green-700 dark:text-green-400';
    if (value >= 6) return 'text-green-500 dark:text-green-500';
    if (value <= 3) return 'text-red-600 dark:text-red-400';
    return 'text-yellow-500 dark:text-yellow-400';
};

const formatSecondsToHoursMinutes = (totalSeconds: number) => {
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
        return `${hours}h${String(minutes).padStart(2, '0')}`;
    }
    return `${minutes}min`;
};


export const Dashboard: React.FC<DashboardProps> = ({ 
    tasks, activeTask, setActiveTaskId, onStartFocus, addTask, updateTask, reorderTasks, deleteTask, reactivateTask, sessionHistory, dailyHistory, onDeleteDailySummary, onNewDay,
    todos, addTodo, toggleTodo, removeTodo, reorderTodos,
    energy, setEnergy, satisfaction, setSatisfaction, blockerNote, setBlockerNote,
    theme, onThemeChange,
    activeView, setActiveView
}) => {
    const [newTodo, setNewTodo] = useState('');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [newTaskTime, setNewTaskTime] = useState(30);

    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const [draggedTodoIndex, setDraggedTodoIndex] = useState<number | null>(null);
    const [dragOverTodoIndex, setDragOverTodoIndex] = useState<number | null>(null);
    

    const { time, isActive, start, pause, reset } = useStopwatch(activeTask ? activeTask.actualTime : 0);

    useEffect(() => {
        if (activeTask) {
            reset(activeTask.actualTime);
        } else {
            reset(0);
            pause();
        }
    }, [activeTask, reset]);

    const handleTimerToggle = () => {
        if (!activeTask) return;
        if (isActive) {
            pause();
            updateTask({ ...activeTask, actualTime: time });
        } else {
            start();
        }
    };

    const handleMarkAsDone = () => {
        if (activeTask) {
            pause();
            updateTask({ ...activeTask, actualTime: time, status: 'done' });
            const nextTodoTask = tasks.find(t => t.status === 'todo' && t.id !== activeTask.id);
            setActiveTaskId(nextTodoTask ? nextTodoTask.id : null);
        }
    }

    const handleAddTodo = () => {
        addTodo(newTodo);
        setNewTodo('');
    };

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskTitle.trim() === '') return;
        addTask({
            title: newTaskTitle,
            description: newTaskDescription,
            estimatedTime: newTaskTime,
        });
        setNewTaskTitle('');
        setNewTaskDescription('');
    };
    
    // Drag handlers for Tasks
    const handleTaskDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleTaskDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (index !== draggedItemIndex) {
            setDragOverIndex(index);
        }
    };
    
    const handleTaskDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleTaskDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();
        if (draggedItemIndex !== null && draggedItemIndex !== dropIndex) {
            reorderTasks(draggedItemIndex, dropIndex);
        }
        setDraggedItemIndex(null);
        setDragOverIndex(null);
    };

    const handleTaskDragEnd = () => {
        setDraggedItemIndex(null);
        setDragOverIndex(null);
    };

    // Drag handlers for Todos
    const handleTodoDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedTodoIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleTodoDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (index !== draggedTodoIndex) {
            setDragOverTodoIndex(index);
        }
    };
    
    const handleTodoDragLeave = () => {
        setDragOverTodoIndex(null);
    };

    const handleTodoDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();
        if (draggedTodoIndex !== null && draggedTodoIndex !== dropIndex) {
            reorderTodos(draggedTodoIndex, dropIndex);
        }
        setDraggedTodoIndex(null);
        setDragOverTodoIndex(null);
    };

    const handleTodoDragEnd = () => {
        setDraggedTodoIndex(null);
        setDragOverTodoIndex(null);
    };

    
    const tasksDone = tasks.filter(t => t.status === 'done').length;
    const totalSeconds = tasks.reduce((sum, task) => sum + task.actualTime, 0);
    const totalHours = Math.floor(totalSeconds / 3600);
    const remainingMinutes = Math.floor((totalSeconds % 3600) / 60);
    
    const doneTasksWithEstimation = tasks.filter(t => t.status === 'done' && t.estimatedTime > 0);
    const avgDeviation = doneTasksWithEstimation.length > 0 
        ? doneTasksWithEstimation.reduce((sum, task) => sum + (((task.actualTime / 60) - task.estimatedTime) / task.estimatedTime), 0) / doneTasksWithEstimation.length * 100 
        : 0;
    const deviationCardClass = avgDeviation <= 0 ? 'bg-green-100 dark:bg-green-900/50 border-green-200 dark:border-green-500/30' : 'bg-red-100 dark:bg-red-900/50 border-red-200 dark:border-red-500/30';
    const deviationTextClass = avgDeviation <= 0 ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300';


    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ProductivityHub</h1>
                <nav className="mt-4 sm:mt-0">
                    <ul className="flex items-center space-x-4 text-sm">
                        <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveView('today'); }} className={activeView === 'today' ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-md" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"}>Aujourd'hui</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveView('analysis'); }} className={activeView === 'analysis' ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-md" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"}>Analyse</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveView('history'); }} className={activeView === 'history' ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-md" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"}>Historique</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); setActiveView('settings'); }} className={activeView === 'settings' ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-md" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"}>Paramètres</a></li>
                    </ul>
                </nav>
            </header>

            {activeView === 'today' ? (
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Column 1 */}
                    <div className="space-y-6">
                        <Card title="À faire" iconName="check">
                            <div className="space-y-3" onDragLeave={handleTodoDragLeave}>
                                {todos.map((todo, index) => {
                                    const isBeingDragged = draggedTodoIndex === index;
                                    const isDragOver = dragOverTodoIndex === index;
                                    let dropIndicatorClass = '';
                                    if (isDragOver && draggedTodoIndex !== null && !isBeingDragged) {
                                        dropIndicatorClass = draggedTodoIndex > index ? 'border-t-2 border-accent-blue' : 'border-b-2 border-accent-blue';
                                    }
                                    return (
                                        <div 
                                          key={todo.id} 
                                          draggable
                                          onDragStart={(e) => handleTodoDragStart(e, index)}
                                          onDragOver={(e) => handleTodoDragOver(e, index)}
                                          onDrop={(e) => handleTodoDrop(e, index)}
                                          onDragEnd={handleTodoDragEnd}
                                          className={`flex items-center justify-between bg-gray-100 dark:bg-gray-900/50 p-2 rounded-md transition-all ${isBeingDragged ? 'opacity-30 cursor-grabbing' : 'cursor-grab'} ${dropIndicatorClass}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} className="form-checkbox h-4 w-4 rounded bg-gray-300 dark:bg-gray-700 border-gray-400 dark:border-gray-600 text-accent-blue focus:ring-accent-blue" />
                                                <span className={`text-sm ${todo.completed ? 'line-through text-gray-500 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>{todo.text}</span>
                                            </div>
                                            <button onClick={() => removeTodo(todo.id)} className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-white">
                                                &times;
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 flex gap-2">
                                <input
                                    type="text"
                                    value={newTodo}
                                    onChange={(e) => setNewTodo(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                                    placeholder="Ajouter une chose à faire..."
                                    className="flex-grow bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-accent-blue focus:border-accent-blue"
                                />
                                <button onClick={handleAddTodo} className="bg-accent-blue text-white p-2 rounded-md hover:bg-blue-500">
                                    <Icon name="plus" className="w-5 h-5" />
                                </button>
                            </div>
                        </Card>

                        <Card title="Nouvelle tâche" iconName="plus">
                            <form className="space-y-4" onSubmit={handleAddTask}>
                                 <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400">Titre de la tâche...</label>
                                    <input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} type="text" className="w-full mt-1 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-accent-blue focus:border-accent-blue" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400">Description courte...</label>
                                    <textarea value={newTaskDescription} onChange={e => setNewTaskDescription(e.target.value)} rows={2} className="w-full mt-1 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-accent-blue focus:border-accent-blue"></textarea>
                                </div>
                                <div className="flex gap-2">
                                    <select value={newTaskTime} onChange={e => setNewTaskTime(parseInt(e.target.value))} className="w-1/2 mt-1 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-accent-blue focus:border-accent-blue">
                                        <option value={15}>15 min</option>
                                        <option value={30}>30 min</option>
                                        <option value={45}>45 min</option>
                                        <option value={60}>60 min</option>
                                        <option value={90}>90 min</option>
                                    </select>
                                    <button type="submit" className="w-1/2 bg-accent-green text-white font-semibold py-2 rounded-md hover:bg-green-500">
                                        Ajouter
                                    </button>
                                </div>
                            </form>
                        </Card>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-6">
                        <Card title="Mes tâches" iconName="list" actions={activeTask ? <button onClick={onStartFocus} className="text-sm bg-accent-purple text-white px-3 py-1 rounded-full hover:bg-purple-500 flex items-center gap-1"><Icon name="focus" className="w-4 h-4"/> Mode Focus</button> : null}>
                             <div className="space-y-2" onDragLeave={handleTaskDragLeave}>
                             {tasks.map((task, index) => {
                                const isBeingDragged = draggedItemIndex === index;
                                const isDragOver = dragOverIndex === index;

                                let dropIndicatorClass = '';
                                if (isDragOver && draggedItemIndex !== null && !isBeingDragged) {
                                    dropIndicatorClass = draggedItemIndex > index ? 'border-t-2 border-accent-blue' : 'border-b-2 border-accent-blue';
                                }

                                let statusText: string;
                                let statusBgClass: string;

                                if (task.status === 'done') {
                                    statusText = 'Terminé';
                                    statusBgClass = 'bg-accent-green';
                                } else if (task.id === activeTask?.id && isActive) {
                                    statusText = 'En cours';
                                    statusBgClass = 'bg-accent-yellow';
                                } else if (task.actualTime > 0) {
                                    statusText = 'Pause';
                                    statusBgClass = 'bg-accent-indigo';
                                } else {
                                    statusText = 'À faire';
                                    statusBgClass = 'bg-accent-blue';
                                }
                                 
                               return (
                               <div 
                                    key={task.id} 
                                    draggable 
                                    onDragStart={(e) => handleTaskDragStart(e, index)}
                                    onDragOver={(e) => handleTaskDragOver(e, index)}
                                    onDrop={(e) => handleTaskDrop(e, index)}
                                    onDragEnd={handleTaskDragEnd}
                                    onClick={() => setActiveTaskId(task.id)} 
                                    className={`group p-3 rounded-lg transition-all ${isBeingDragged ? 'cursor-grabbing' : 'cursor-grab'} ${dropIndicatorClass} ${task.id === activeTask?.id ? 'bg-accent-indigo/10 dark:bg-accent-indigo/20 border border-accent-indigo/20 dark:border-accent-indigo/30' : 'bg-gray-100 dark:bg-gray-900/50 hover:bg-gray-200 dark:hover:bg-gray-800/60'} ${isBeingDragged ? 'opacity-30' : ''}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-grow">
                                            <h4 className={`font-semibold text-gray-800 dark:text-gray-100 ${task.status === 'done' ? 'line-through text-gray-500 dark:text-gray-500' : ''}`}>{task.title}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Estimé: {task.estimatedTime}min</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={(e) => {
                                                        if (task.status === 'done') {
                                                          e.stopPropagation();
                                                          reactivateTask(task.id);
                                                        }
                                                    }}
                                                    className={`p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-gray-800 dark:hover:text-white ${task.status !== 'done' ? 'invisible' : ''}`}
                                                    aria-label={task.status === 'done' ? `Réactiver la tâche ${task.title}` : undefined}
                                                    disabled={task.status !== 'done'}
                                                >
                                                    <Icon name="reset" className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteTask(task.id);
                                                    }}
                                                    className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-gray-800 dark:hover:text-white"
                                                    aria-label={`Supprimer la tâche ${task.title}`}
                                                >
                                                    <Icon name="close" className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <span className={`text-xs text-white px-2 py-1 rounded-full ${statusBgClass}`}>{statusText}</span>
                                        </div>
                                    </div>
                               </div>
                               );
                            })}
                             </div>
                        </Card>
                        <Card title="Tâche active" iconName="" className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/20">
                            {activeTask ? (
                            <>
                                <div className="text-center">
                                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{activeTask?.title}</h4>
                                    <div className="text-6xl font-mono my-4 text-gray-900 dark:text-white">{formatStopwatchTime(time)}</div>
                                    <div className="flex justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span>Estimé: {activeTask?.estimatedTime}min</span>
                                        <span>|</span>
                                        <span>Écart: {Math.round(time/60) - activeTask?.estimatedTime}min</span>
                                    </div>
                                </div>
                                <div className="mt-6 flex gap-4">
                                    <button onClick={handleTimerToggle} className={`flex-1 font-bold py-3 rounded-lg text-white ${isActive ? 'bg-accent-yellow/90 hover:bg-accent-yellow' : 'bg-accent-green/90 hover:bg-accent-green'}`}>
                                        {isActive ? 'Pause' : 'Démarrer'}
                                    </button>
                                    <button onClick={handleMarkAsDone} className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-3 rounded-lg">Terminé</button>
                                </div>
                            </>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                    <p>Aucune tâche active sélectionnée.</p>
                                </div>
                            )}
                        </Card>
                        
                    </div>

                    {/* Column 3 */}
                    <div className="space-y-6">
                        <Card title="KPIs du jour" iconName="chart" actions={<button onClick={onNewDay} className="text-sm bg-accent-blue text-white px-3 py-1 rounded-full hover:bg-blue-500">Nouveau jour</button>}>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Tâches terminées</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{tasksDone}</p>
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Temps productif</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{`${String(totalHours).padStart(2,'0')}h${String(remainingMinutes).padStart(2,'0')}`}</p>
                                </div>
                                <div className={`${deviationCardClass} p-4 rounded-lg col-span-2`}>
                                    <p className={`text-sm ${deviationTextClass}`}>Écart moyen</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgDeviation.toFixed(0)}%</p>
                                </div>
                            </div>
                        </Card>
                         <Card title="Historique des sessions" iconName="calendar">
                            {sessionHistory.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 py-4">
                                    <p className="text-sm">Aucune session de focus terminée.</p>
                                </div>
                            ) : (
                                <ul className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                    {sessionHistory.map(session => (
                                        <li key={session.id} className="flex justify-between items-center text-sm p-2 bg-gray-100 dark:bg-gray-900/50 rounded-md">
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[150px]">{session.taskTitle}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{session.completedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                            <span className="font-mono text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-[#121212] px-2 py-1 rounded">
                                                {formatSessionDuration(session.durationSeconds)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                        <Card title="Blocage actuel ?" iconName="warning">
                             <textarea value={blockerNote} onChange={e => setBlockerNote(e.target.value)} rows={2} placeholder="Décrivez le problème rencontré..." className="w-full mt-1 bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-accent-blue focus:border-accent-blue"></textarea>
                        </Card>
                        <Card title="">
                            <div className="space-y-4">
                                <Slider label="⚡️ Énergie / Focus" value={energy} max={10} onChange={e => setEnergy(parseInt(e.target.value))} colorClass="bg-accent-blue" />
                                <Slider label="😊 Satisfaction" value={satisfaction} max={10} onChange={e => setSatisfaction(parseInt(e.target.value))} colorClass="bg-accent-purple" />
                            </div>
                        </Card>
                    </div>
                </main>
            ) : activeView === 'history' ? (
                 <main className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Historique des journées</h2>
                    {dailyHistory.length === 0 ? (
                        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                            <Icon name="calendar" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>Aucune journée n'a été archivée pour le moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dailyHistory.map(day => {
                                const dayTotalHours = Math.floor(day.totalProductiveTimeSeconds / 3600);
                                const dayRemainingMinutes = Math.floor((day.totalProductiveTimeSeconds % 3600) / 60);
                                return (
                                <Card 
                                    key={day.id} 
                                    title={day.date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} 
                                    iconName="calendar"
                                    actions={
                                        <button 
                                            onClick={() => onDeleteDailySummary(day.id)} 
                                            className="p-1.5 rounded-full text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-500"
                                            aria-label="Supprimer la journée"
                                        >
                                            <Icon name="trash" className="w-4 h-4" />
                                        </button>
                                    }
                                >
                                   <div className="space-y-4">
                                       <div className="grid grid-cols-2 gap-4 text-center">
                                            <div className="bg-gray-100 dark:bg-gray-900/50 p-3 rounded-lg">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Tâches</p>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">{day.completedTasks.length}</p>
                                            </div>
                                            <div className="bg-gray-100 dark:bg-gray-900/50 p-3 rounded-lg">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Temps</p>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">{`${String(dayTotalHours)}h${String(dayRemainingMinutes).padStart(2,'0')}`}</p>
                                            </div>
                                       </div>
                                       {day.completedTasks.length > 0 && (
                                       <div>
                                           <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">Détail des tâches terminées</h4>
                                           <ul className="text-xs space-y-1.5 text-gray-600 dark:text-gray-400 max-h-28 overflow-y-auto pr-2">
                                                {day.completedTasks.map(task => (
                                                   <li key={task.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/30 p-1.5 rounded-md">
                                                       <span className="truncate pr-2">{task.title}</span>
                                                       <span className="font-mono text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-[#121212] px-1.5 py-0.5 rounded text-[11px] shrink-0">
                                                           {formatSecondsToHoursMinutes(task.actualTime)}
                                                       </span>
                                                   </li>
                                               ))}
                                           </ul>
                                       </div>
                                       )}
                                       {day.blockerNote && (
                                           <div>
                                               <h4 className="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300">Blocage</h4>
                                               <p className="text-xs p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-md text-yellow-800 dark:text-yellow-300">{day.blockerNote}</p>
                                           </div>
                                       )}
                                       <div className="flex justify-around pt-2 border-t border-gray-200 dark:border-gray-800">
                                           <div className="text-center">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Énergie</p>
                                                <p className={`font-bold text-lg ${getKpiColorClass(day.energyLevel)}`}>{day.energyLevel}/10</p>
                                           </div>
                                           <div className="text-center">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Satisfaction</p>
                                                <p className={`font-bold text-lg ${getKpiColorClass(day.satisfactionLevel)}`}>{day.satisfactionLevel}/10</p>
                                           </div>
                                       </div>
                                   </div>
                                </Card>
                            )})}
                        </div>
                    )}
                </main>
            ) : activeView === 'settings' ? (
                <main className="flex items-start justify-center pt-10" style={{minHeight: '60vh'}}>
                  <div className="w-full max-w-lg">
                      <Card title="Paramètres" iconName="settings">
                          <div className="space-y-4">
                              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-900/50">
                                  <span className="font-medium text-gray-800 dark:text-gray-200">Thème d'apparence</span>
                                  <div className="flex items-center gap-1 rounded-lg bg-gray-200 dark:bg-[#121212] p-1">
                                      <button 
                                        onClick={() => onThemeChange('light')} 
                                        className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${theme === 'light' ? 'bg-white text-accent-blue shadow' : 'text-gray-500 hover:bg-white/50'}`}
                                      >
                                          Clair
                                      </button>
                                      <button 
                                        onClick={() => onThemeChange('dark')} 
                                        className={`px-4 py-1 text-sm font-semibold rounded-md transition-colors ${theme === 'dark' ? 'bg-[#2A2A2A] text-accent-blue shadow' : 'text-gray-400 hover:bg-gray-700/50'}`}
                                      >
                                          Sombre
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </Card>
                  </div>
                </main>
            ) : (
                <main className="flex items-center justify-center" style={{minHeight: '60vh'}}>
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <Icon name={ 'chart' } className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                           Analyse
                        </h2>
                        <p>Cette section est en cours de construction.</p>
                    </div>
                </main>
            )}
        </div>
    );
};
