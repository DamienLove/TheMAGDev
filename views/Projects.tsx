import React, { useState } from 'react';
import { Task } from '../types';

const Projects: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Implement Auth0 Authentication', status: 'DONE', priority: 'HIGH', assignee: 'JD', dueDate: 'Oct 12' },
    { id: '2', title: 'Refactor Database Schema', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'AL', dueDate: 'Oct 24' },
    { id: '3', title: 'Design New Landing Page', status: 'IN_PROGRESS', priority: 'MEDIUM', assignee: 'JD', dueDate: 'Oct 28' },
    { id: '4', title: 'Fix CSS Grid Issue on Mobile', status: 'TODO', priority: 'LOW', assignee: 'TS' },
    { id: '5', title: 'Optimize Image Assets', status: 'TODO', priority: 'MEDIUM' },
    { id: '6', title: 'Code Review: Payment Gateway', status: 'REVIEW', priority: 'HIGH', assignee: 'AL' },
  ]);

  const [filter, setFilter] = useState('');

  const columns: { id: Task['status']; label: string; color: string }[] = [
    { id: 'TODO', label: 'To Do', color: 'bg-zinc-500' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500' },
    { id: 'REVIEW', label: 'In Review', color: 'bg-amber-500' },
    { id: 'DONE', label: 'Done', color: 'bg-emerald-500' },
  ];

  const getPriorityColor = (p: Task['priority']) => {
    switch (p) {
      case 'HIGH': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'MEDIUM': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'LOW': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/50">
      {/* Project Toolbar */}
      <div className="px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <span className="material-symbols-rounded">tactic</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">Sprint 24: Core Features</h1>
            <p className="text-xs text-zinc-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Active
              <span className="mx-1">•</span>
              Oct 14 - Oct 28
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 mr-2">
            {['JD', 'AL', 'TS', 'RQ'].map((initial, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-300">
                {initial}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer">
              <span className="material-symbols-rounded text-[16px]">add</span>
            </div>
          </div>
          <div className="h-6 w-px bg-zinc-800 mx-2"></div>
          <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2">
            <span className="material-symbols-rounded text-[18px]">add</span> New Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex h-full gap-6 min-w-[1000px]">
          {columns.map((col) => (
            <div key={col.id} className="flex-1 flex flex-col min-w-[280px] bg-zinc-900/30 rounded-xl border border-zinc-800/50">
              {/* Column Header */}
              <div className="p-3 flex items-center justify-between border-b border-zinc-800/50">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.color}`}></span>
                  <span className="text-sm font-semibold text-zinc-300">{col.label}</span>
                  <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                    {tasks.filter(t => t.status === col.id).length}
                  </span>
                </div>
                <button className="text-zinc-600 hover:text-zinc-300">
                  <span className="material-symbols-rounded text-[18px]">more_horiz</span>
                </button>
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {tasks.filter(t => t.status === col.id).map((task) => (
                  <div key={task.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 p-4 rounded-lg shadow-sm cursor-pointer group transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <button className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-zinc-300 transition-opacity">
                         <span className="material-symbols-rounded text-[16px]">edit</span>
                      </button>
                    </div>
                    <h3 className="text-sm font-medium text-zinc-200 mb-3 leading-snug">{task.title}</h3>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                       <div className="flex items-center gap-2">
                          {task.assignee ? (
                            <div className="w-5 h-5 rounded-full bg-indigo-900 text-[10px] flex items-center justify-center text-indigo-200 border border-indigo-700">
                              {task.assignee}
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-zinc-700 border-dashed flex items-center justify-center">
                              <span className="material-symbols-rounded text-[12px] text-zinc-600">person_add</span>
                            </div>
                          )}
                       </div>
                       {task.dueDate && (
                         <div className={`flex items-center gap-1 text-[11px] ${col.id === 'DONE' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                           <span className="material-symbols-rounded text-[12px]">calendar_today</span>
                           {task.dueDate}
                         </div>
                       )}
                    </div>
                  </div>
                ))}
                
                <button className="w-full py-2 flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 rounded-lg border border-transparent hover:border-zinc-800 border-dashed text-sm transition-all">
                  <span className="material-symbols-rounded text-[16px]">add</span> Add Task
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;