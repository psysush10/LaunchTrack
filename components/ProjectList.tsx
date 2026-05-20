import ProjectCard from "./ProjectCard"
import { useState } from "react"

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

  const [search, setSearch] = useState("")

  const filteredProjects = projects.filter((project) =>
  project.client_name
    .toLowerCase()
    .includes(search.toLowerCase())
  )

  return (
    
    <div className="grid gap-4">
      <input
        type="text"
        placeholder="Search projects..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {filteredProjects.length > 0 ? (

        filteredProjects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          getProjectProgress={getProjectProgress}
          getProjectHealth={getProjectHealth}
          formatDate={formatDate}
          fetchDashboardData={fetchDashboardData}
        />
      ))

      ): (
         <div className="text-gray-500 text-sm border rounded p-4">
          No matching projects found.
        </div>
      )}
      
    </div>
  )
}