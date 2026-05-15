import ProjectCard from "./ProjectCard"

interface ProjectListProps {
  projects: any[]
  getProjectProgress: (projectId: any) => number

  getProjectHealth: (
    projectId: any
  ) => {
    status: string
    reason: string
  }

  formatDate: (date: string) => string
  fetchDashboardData: () => Promise<void>
}

export default function ProjectList({
  projects,
  getProjectProgress,
  getProjectHealth,
  formatDate,
  fetchDashboardData
}: ProjectListProps) {
  return (
    <div className="grid gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          getProjectProgress={getProjectProgress}
          getProjectHealth={getProjectHealth}
          formatDate={formatDate}
          fetchDashboardData={fetchDashboardData}
        />
      ))}
    </div>
  )
}