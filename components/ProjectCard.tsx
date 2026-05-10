import Link from "next/link"

interface ProjectCardProps {
  project: {
    id: any
    client_name: string
    description?: string
    go_live_date: string
  }
  getProjectProgress: (projectId: any) => number

  getProjectHealth: (
    projectId: any
  ) => {
    status: string
    reason: string
  }

  formatDate: (date: string) => string
}

export default function ProjectCard({
  project,
  getProjectProgress,
  getProjectHealth,
  formatDate
}: ProjectCardProps) {

    const progress = getProjectProgress(project.id)
    const healthData = getProjectHealth(project.id)

    let borderColor = "border-green-500"

    if (healthData.status === "Warning") {
    borderColor = "border-yellow-500"
    }

    if (healthData.status === "At Risk") {
    borderColor = "border-red-500"
    }
  return (
    <Link
    href={`/projects/${project.id}`}
    className={`block border border-gray-200 border-l-4 ${borderColor} p-4 hover:bg-gray-50 transition hover:shadow-sm`}
    >

    <div className="font-semibold">
        {project.client_name}
    </div>

    <div className="text-sm text-gray-500">
        Go Live: {formatDate(project.go_live_date)}
    </div>

    <div className="text-sm mt-2">

        {healthData.status === "Healthy" && "🟢 Healthy"}
        {healthData.status === "Warning" && "🟡 Warning"}
        {healthData.status === "At Risk" && "🔴 At Risk"}

    </div>
    <div className="text-sm text-gray-500">
    {healthData.reason}
    </div>
    <div className="text-sm text-gray-500">
    Progress: {progress}%
    </div>

    </Link>
  )
}