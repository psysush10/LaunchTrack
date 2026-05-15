import Link from "next/link"
import HealthBadge from "./HealthBadge"
import { useState } from 'react'
import FormInput from "./FormInput"
import { supabase } from "@/lib/supabaseClient"

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
  fetchDashboardData: () => Promise<void>
}

export default function ProjectCard({
  project,
  getProjectProgress,
  getProjectHealth,
  formatDate,
  fetchDashboardData
}: ProjectCardProps) {

    const [editing, setEditing] = useState(false)
    const [clientName, setClientName] = useState(project.client_name)
    const [goLiveDate, setGoLiveDate] = useState(project.go_live_date)
    const progress = getProjectProgress(project.id)
    const healthData = getProjectHealth(project.id)

    let borderColor = "border-green-500"

    if (healthData.status === "Warning") {
    borderColor = "border-yellow-500"
    }

    if (healthData.status === "At Risk") {
    borderColor = "border-red-500"
    }

    const updateProject = async () => {
      try{
        const {error} = await supabase
        .from('projects')
        .update({
          client_name:clientName,
          go_live_date:goLiveDate
        })
        .eq('id',project.id)

        if(error){
          throw error
        }
        await fetchDashboardData()
        setEditing(false)
      }catch(err: any){
        console.log("Supabase Error :",err)
      }
    }

  return (
    <div
      className={`border border-gray-200 border-l-4 ${borderColor} p-4 hover:shadow-sm`}
    >

    <Link
      href={`/projects/${project.id}`}
      className="block hover:bg-gray-50 transition"
    >

      <div className="font-semibold">
        {project.client_name}
      </div>

      <div className="text-sm text-gray-500">
        Go Live: {formatDate(project.go_live_date)}
      </div>

      <HealthBadge status={healthData.status} />

      <div className="text-sm text-gray-500">
        {healthData.reason}
      </div>

      <div className="text-sm text-gray-500">
        Progress: {progress}%
      </div>

    </Link>

    <button
      onClick={() => setEditing(true)}
      className="text-sm text-blue-600 mt-2"
    >
      Edit
    </button>

    {editing && (

      <div className="mt-4 border rounded p-4">

        <FormInput
          placeholder="Client Name"
          value={clientName}
          onChange={setClientName}
        />

        <FormInput
          type="date"
          value={goLiveDate}
          onChange={setGoLiveDate}
        />

        <button
          onClick={updateProject}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save
        </button>

      </div>

    )}

  </div>
  )
}