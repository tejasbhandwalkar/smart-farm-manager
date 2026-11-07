import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckSquare,
  Plus,
  Calendar,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  X,
  Trash2,
} from 'lucide-react';
import { FarmDB } from '../services/db';
import { DailyTask, Worker, Plot, Priority, TaskStatus } from '../types';

export const TasksPage: React.FC = () => {
  const { t } = useTranslation();

  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [plotId, setPlotId] = useState('');
  const [assignedWorkerIds, setAssignedWorkerIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    setLoading(true);
    const [tasksData, workersData, plotsData] = await Promise.all([
      FarmDB.getTasks(),
      FarmDB.getWorkers(),
      FarmDB.getPlots(),
    ]);
    setTasks(tasksData);
    setWorkers(workersData);
    setPlots(plotsData);
    if (plotsData.length > 0 && !plotId) {
      setPlotId(plotsData[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleWorker = (wId: string) => {
    if (assignedWorkerIds.includes(wId)) {
      setAssignedWorkerIds(assignedWorkerIds.filter(id => id !== wId));
    } else {
      setAssignedWorkerIds([...assignedWorkerIds, wId]);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPlot = plots.find(p => p.id === plotId);

    await FarmDB.addTask({
      title,
      description,
      plot_id: plotId,
      plot_name: targetPlot?.name || 'प्लॉट',
      assigned_worker_ids: assignedWorkerIds,
      priority,
      status: 'pending',
      due_date: dueDate,
    });

    setModalOpen(false);
    setTitle('');
    setDescription('');
    setAssignedWorkerIds([]);
    await loadData();
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    await FarmDB.updateTask(taskId, { status: newStatus });
    await loadData();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('हे काम हटवायचे आहे का?')) {
      await FarmDB.deleteTask(taskId);
      await loadData();
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    return true;
  });

  const priorityBadges: Record<Priority, { label: string; badge: string }> = {
    urgent: { label: 'तातडीचे (Urgent)', badge: 'bg-rose-100 text-rose-800 border-rose-300' },
    medium: { label: 'मध्यम (Medium)', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
    low: { label: 'सामान्य (Low)', badge: 'bg-slate-100 text-slate-700 border-slate-300' },
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <CheckSquare className="w-6 h-6 text-emerald-700" />
            <span>{t('tasks.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            {t('tasks.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold shadow-md shadow-emerald-700/20 transition-all text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{t('tasks.add_task')}</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-700">फिल्टर:</span>
          
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-medium text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="all">सर्व स्थिती ({tasks.length})</option>
            <option value="pending">प्रलंबित (Pending)</option>
            <option value="in_progress">काम चालू (In Progress)</option>
            <option value="completed">पूर्ण झाले (Completed)</option>
          </select>

          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-medium text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="all">सर्व प्राधान्यक्रम</option>
            <option value="urgent">तातडीचे</option>
            <option value="medium">मध्यम</option>
            <option value="low">सामान्य</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          एकूण <strong>{filteredTasks.length}</strong> कामे दाखवली आहेत
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map(task => {
          const isDone = task.status === 'completed';
          return (
            <div
              key={task.id}
              className={`bg-white rounded-3xl p-5 border transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isDone
                  ? 'border-slate-200 bg-slate-50/70 opacity-70'
                  : task.priority === 'urgent'
                  ? 'border-rose-300 bg-rose-50/20'
                  : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="flex items-start space-x-3.5 flex-1">
                <button
                  onClick={() => handleUpdateStatus(task.id, isDone ? 'pending' : 'completed')}
                  className={`mt-1 w-6 h-6 rounded-xl border flex items-center justify-center transition-colors shrink-0 ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 hover:border-emerald-600'
                  }`}
                >
                  {isDone && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`text-base font-bold text-slate-900 ${isDone ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${priorityBadges[task.priority].badge}`}>
                      {priorityBadges[task.priority].label}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  {/* Metadata Chips: Plot, Workers, Due Date */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
                    <span className="flex items-center space-x-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{task.plot_name}</span>
                    </span>

                    <span className="flex items-center space-x-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>मुदत: {new Date(task.due_date).toLocaleDateString('mr-IN')}</span>
                    </span>

                    <span className="flex items-center space-x-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{task.assigned_worker_ids.length} मजूर नियुक्त</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                {!isDone ? (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
                        task.status === 'in_progress'
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      काम चालू
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'completed')}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                    >
                      पूर्ण झाले ✓
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(task.id, 'pending')}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded-xl"
                  >
                    पुन्हा चालू करा
                  </button>
                )}

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="काम हटवा"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Task */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base sm:text-lg">{t('tasks.add_task')}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-800 mb-1">कामाचे नाव / शीर्षक:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="उदा. कांद्याची खुरपणी करणे / उसाला ठिबक पाणी"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">कामाचे सविस्तर वर्णन:</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="कामाच्या सूचना..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">प्लॉट निवडा:</label>
                  <select
                    value={plotId}
                    onChange={e => setPlotId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {plots.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">प्राधान्यता (Priority):</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="urgent">तातडीचे (Urgent)</option>
                    <option value="medium">मध्यम (Medium)</option>
                    <option value="low">सामान्य (Low)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">पूर्ण करण्याची तारीख (Deadline):</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Assign Workers Checkboxes */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  मजूर नियुक्त करा ({assignedWorkerIds.length} निवडले):
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
                  {workers.map(w => {
                    const isSelected = assignedWorkerIds.includes(w.id);
                    return (
                      <button
                        type="button"
                        key={w.id}
                        onClick={() => handleToggleWorker(w.id)}
                        className={`p-2 rounded-lg text-left text-xs font-semibold flex items-center space-x-2 transition-colors ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${isSelected ? 'bg-white text-emerald-800' : 'border-slate-400'}`}>
                          {isSelected && '✓'}
                        </span>
                        <span className="truncate">{w.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:bg-emerald-800"
                >
                  काम जतन करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
