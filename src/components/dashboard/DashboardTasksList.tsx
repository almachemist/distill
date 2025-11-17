interface Task {
  id: string
  title: string
  priority?: 'high' | 'medium' | 'low'
}

interface DashboardTasksListProps {
  title: string
  tasks: Task[]
}

export function DashboardTasksList({ title, tasks }: DashboardTasksListProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-stone-900 mb-4">{title}</h2>
      
      {tasks.length === 0 ? (
        <p className="text-sm text-gray-500">No upcoming tasks</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-start gap-3 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#A65E2E] mt-2 flex-shrink-0" />
              <p className="text-sm text-stone-900">{task.title}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

