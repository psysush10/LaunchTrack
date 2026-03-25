type Milestone = {
  id: string
  name: string
  status: string
}

export default function Timeline({ milestones }: { milestones: Milestone[] }) {

  const getStatusIcon = (status: string) => {
    if (status === "Completed") return "✔"
    if (status === "In Progress") return "●"
    return "○"
  }

  return (
    <div className="flex items-center gap-4 overflow-x-auto py-4">

      {milestones.map((m, index) => (

        <div key={m.id} className="flex items-center gap-6">

          <div className="flex flex-col items-center">

            <div
  className={`text-lg ${
    m.status === "Completed"
      ? "text-green-500"
      : m.status === "In Progress"
      ? "text-blue-500"
      : m.status === "Blocked"
      ? "text-red-500"
      : "text-gray-400"
  }`}
>
  {getStatusIcon(m.status)}
</div>

            <div className="text-xs text-gray-500 mt-10">
              {m.name}
            </div>

          </div>

          {index !== milestones.length - 1 && (
            <div className="w-10 h-[2px] bg-gray-200" />
          )}

        </div>

      ))}

    </div>
  )
}