type Milestone = {
  id: string
  name: string
  status: string
  computedStatus?: string
  depends_on?: string[]
  blocker_reason?: string

}

export default function Timeline({ milestones }: { milestones: Milestone[] }) {



  const getStatusIcon = (status: string) => {
    if (status === "Completed") return "✔"
    if (status === "In Progress") return "●"
    if(status === "Blocked") return "⚠"
    return "○"
  }

  return(
    <div
    className="flex items-center gap-6 py-4 overflow-x-auto md:overflow-visible md:justify-center">

      {milestones.map((milestone, index) => {
    const displayStatus = milestone.computedStatus || milestone.status
    return (
          <div key={milestone.id} className="flex items-center gap-6 min-w-max">
            <div className="flex flex-col items-center">
              <div
    className={`text-2xl ${
      displayStatus === "Completed"
        ? "text-green-500"
        : displayStatus === "In Progress"
        ? "text-blue-500"
        : displayStatus === "Blocked"
        ? "text-red-500"
        : "text-gray-400"
    }`}
  >
    {getStatusIcon(displayStatus)}
  </div>

              <div className="text-xs text-gray-500 mt-3 text-center">
                {milestone.name}
              </div>

            </div>

            {index !== milestones.length - 1 && (
              <div className="w-8 h-[2px] bg-gray-200" />
            )}

          </div>
    )
  })}

    </div>
  )

  
}