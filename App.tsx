import React, { useState, useCallback, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { FocusView } from './components/FocusView';
import { Modal } from './components/Modal';
import { Task, DailySummary, Todo, View, TaskCategory } from './types';

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Définition des incidents',
    description: 'Rédiger le document de spécification pour la gestion des incidents.',
    estimatedTime: 30,
    actualTime: 0,
    status: 'todo',
    subTasks: [],
    category: 'Travail',
  },
  {
    id: 2,
    title: 'Maquetter le nouveau dashboard',
    description: 'Créer les wireframes et mockups sur Figma.',
    estimatedTime: 90,
    actualTime: 900, // 15 minutes in seconds
    status: 'todo',
    subTasks: [],
    category: 'Travail',
  },
  {
    id: 3,
    title: 'Réunion de suivi projet',
    description: 'Préparer la présentation pour la réunion de lundi.',
    estimatedTime: 45,
    actualTime: 0,
    status: 'todo',
    subTasks: [],
    category: 'Ecole',
  },
];


const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(1);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [dailyHistory, setDailyHistory] = useState<DailySummary[]>([]);

  // State lifted from Dashboard
  const [todos, setTodos] = useState<Todo[]>([
      { id: 1, text: 'Faire un mail à benjamin pour le dashboard finance', completed: true, category: 'Travail' },
      { id: 2, text: 'Dire à pierre pour la visite emlyon', completed: false, category: 'Ecole' },
  ]);
  const [energy, setEnergy] = useState(7);
  const [satisfaction, setSatisfaction] = useState(5);
  const [blockerNote, setBlockerNote] = useState('');
  const [activeView, setActiveView] = useState<View>('today');

  const [isNewDayModalOpen, setIsNewDayModalOpen] = useState(false);
  const [archiveDate, setArchiveDate] = useState(new Date());
  
  const [summaryIdToDelete, setSummaryIdToDelete] = useState<number | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeChange = (selectedTheme: 'light' | 'dark') => {
    setTheme(selectedTheme);
  };

  const activeTask = tasks.find(t => t.id === activeTaskId) || null;

  const toggleFocusMode = useCallback(() => {
    if (activeTask) {
      setIsFocusMode(prev => !prev);
    } else {
      alert("Veuillez sélectionner une tâche active avant de lancer le mode focus.");
    }
  }, [activeTask]);

  const updateTask = (updatedTask: Task) => {
    setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
  };
  
  const addTask = (newTask: Omit<Task, 'id' | 'actualTime' | 'status' | 'subTasks'>) => {
      const task: Task = {
          ...newTask,
          id: Date.now(),
          actualTime: 0,
          status: 'todo',
          subTasks: [],
      };
      setTasks([...tasks, task]);
      setActiveTaskId(task.id);
  };

  const deleteTask = (taskId: number) => {
    setTasks(currentTasks => {
        const taskIndex = currentTasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return currentTasks; 

        const newTasks = currentTasks.filter(t => t.id !== taskId);

        if (activeTaskId === taskId) {
            if (newTasks.length > 0) {
                const newActiveIndex = Math.min(taskIndex, newTasks.length - 1);
                setActiveTaskId(newTasks[newActiveIndex].id);
            } else {
                setActiveTaskId(null);
            }
        }
        return newTasks;
    });
  };

  const reactivateTask = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: 'todo' } : task
    ));
    setActiveTaskId(taskId);
  };
  
  const handleSessionComplete = (timeSpentInSeconds: number) => {
    if (activeTask) {
      const updatedTask = {
        ...activeTask,
        actualTime: activeTask.actualTime + timeSpentInSeconds,
      };
      updateTask(updatedTask);
    }
  };

  const reorderTasks = useCallback((startIndex: number, endIndex: number) => {
    setTasks(currentTasks => {
        const result = Array.from(currentTasks);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    });
  }, []);
  
  // Todo handlers
  const addTodo = (text: string, category: TaskCategory) => {
    if (text.trim() !== '') {
        setTodos([...todos, { id: Date.now(), text, completed: false, category }]);
    }
  };

  const toggleTodo = (id: number) => {
      setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  const removeTodo = (id: number) => {
      setTodos(todos.filter(todo => todo.id !== id));
  };

  const reorderTodos = useCallback((startIndex: number, endIndex: number) => {
      setTodos(currentTodos => {
          const result = Array.from(currentTodos);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          return result;
      });
  }, []);
  
  const openNewDayModal = () => {
    setArchiveDate(new Date());
    setIsNewDayModalOpen(true);
  };

  const closeNewDayModal = () => {
    setIsNewDayModalOpen(false);
  };

  const confirmNewDay = () => {
    const tasksDone = tasks.filter(t => t.status === 'done');
    const totalProductiveTimeSeconds = tasks.reduce((sum, task) => sum + task.actualTime, 0);

    const summary: DailySummary = {
        id: Date.now(),
        date: archiveDate,
        completedTasks: tasksDone,
        totalProductiveTimeSeconds,
        energyLevel: energy,
        satisfactionLevel: satisfaction,
        blockerNote: blockerNote,
    };

    setDailyHistory(prev => [summary, ...prev]);

    // Reset for the new day
    const remainingTasks = tasks.filter(t => t.status !== 'done');
    setTasks(remainingTasks);
    setActiveTaskId(remainingTasks.length > 0 ? remainingTasks[0].id : null);
    
    setTodos([]); 
    setEnergy(7);
    setSatisfaction(5);
    setBlockerNote('');

    setActiveView('history');
    closeNewDayModal();
  };
  
  const deleteDailySummary = (summaryId: number) => {
    setDailyHistory(prev => prev.filter(summary => summary.id !== summaryId));
  };

  const requestDeleteDailySummary = (summaryId: number) => {
    setSummaryIdToDelete(summaryId);
  };

  const confirmDeleteDailySummary = () => {
    if (summaryIdToDelete !== null) {
      deleteDailySummary(summaryIdToDelete);
      setSummaryIdToDelete(null);
    }
  };

  const cancelDeleteDailySummary = () => {
    setSummaryIdToDelete(null);
  };

  const toYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-sans">
      <Modal 
        isOpen={isNewDayModalOpen} 
        onClose={closeNewDayModal}
        title="Archiver et commencer un nouveau jour"
      >
        <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Confirmez la date pour l'archive de cette journée. Toutes les données (tâches terminées, KPIs) seront sauvegardées.
            </p>
            <div>
                <label htmlFor="archive-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de la journée</label>
                <input 
                    type="date" 
                    id="archive-date"
                    value={toYYYYMMDD(archiveDate)} 
                    onChange={(e) => {
                        const parts = e.target.value.split('-').map(p => parseInt(p, 10));
                        setArchiveDate(new Date(parts[0], parts[1] - 1, parts[2]));
                    }}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-accent-blue focus:border-accent-blue sm:text-sm"
                />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800 mt-6">
                <button onClick={closeNewDayModal} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                    Annuler
                </button>
                <button onClick={confirmNewDay} className="px-4 py-2 text-sm font-medium text-white bg-accent-blue rounded-md hover:bg-blue-500">
                    Confirmer et Archiver
                </button>
            </div>
        </div>
      </Modal>

      <Modal 
        isOpen={summaryIdToDelete !== null} 
        onClose={cancelDeleteDailySummary}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Êtes-vous sûr de vouloir supprimer cette journée ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800 mt-6">
                <button onClick={cancelDeleteDailySummary} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
                    Annuler
                </button>
                <button onClick={confirmDeleteDailySummary} className="px-4 py-2 text-sm font-medium text-white bg-accent-red rounded-md hover:bg-red-500">
                    Oui, supprimer
                </button>
            </div>
        </div>
      </Modal>

      {isFocusMode && activeTask ? (
        <FocusView 
          task={activeTask} 
          onClose={toggleFocusMode} 
          onSessionComplete={handleSessionComplete} 
          updateTask={updateTask}
        />
      ) : (
        <Dashboard 
          tasks={tasks}
          activeTask={activeTask} 
          setActiveTaskId={setActiveTaskId}
          onStartFocus={toggleFocusMode}
          addTask={addTask}
          updateTask={updateTask}
          reorderTasks={reorderTasks}
          deleteTask={deleteTask}
          reactivateTask={reactivateTask}
          dailyHistory={dailyHistory}
          onDeleteDailySummary={requestDeleteDailySummary}
          onNewDay={openNewDayModal}
          
          todos={todos}
          addTodo={addTodo}
          toggleTodo={toggleTodo}
          removeTodo={removeTodo}
          reorderTodos={reorderTodos}

          energy={energy}
          setEnergy={setEnergy}
          satisfaction={satisfaction}
          setSatisfaction={setSatisfaction}
          blockerNote={blockerNote}
          setBlockerNote={setBlockerNote}

          theme={theme}
          onThemeChange={handleThemeChange}

          activeView={activeView}
          setActiveView={setActiveView}
        />
      )}
    </div>
  );
};

export default App;