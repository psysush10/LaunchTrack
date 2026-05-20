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
    const [loading, setLoading] = useState(false)
    const [clientName, setClientName] = useState(project.client_name)
    const [goLiveDate, setGoLiveDate] = useState(project.go_live_date)
    const progress = getProjectProgress(project.id)
    const healthData = getProjectHealth(project.id)

    const updateProject = async () => {
      try{
        setLoading(true)
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
      }finally{
        setLoading(false)
      }
    }

  return (
    <div
      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
    >  

    <Link
      href={`/projects/${project.id}`}
      className="block hover:bg-gray-50 transition"
    >
    <div className="flex flex-col gap-4 h-full">
      {/* Top section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">
            {project.client_name}
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Go Live: {formatDate(project.go_live_date)}
          </p>
        </div>
        <HealthBadge status={healthData.status} />
      </div>
      
    {/* Middle section */}
    <div className="space-y-1 text-sm text-gray-600">
      <p>{healthData.reason}</p>
      <p>
        Progress tracking and milestone coordination
      </p>
    </div>

    <div className="mt-auto">
      <div className="flex justify-between text-sm mb-2">
  <span className="text-gray-500">
    Progress
  </span>

  <span className="font-medium">
    {progress}%
  </span>
</div>

<div className="w-full bg-gray-200 rounded-full h-2">
  <div
    className="bg-blue-500 h-2 rounded-full"
    style={{ width: `${progress}%` }}
  />
</div>
    </div>
    <div className="mt-4">
  <span className="text-sm font-medium text-blue-600 hover:text-blue-700">
    View Details →
  </span>
</div>
    </div>



    </Link>

    <button
      onClick={() => setEditing(true)}
      className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-4 inline-block"
    >
      Edit
    </button>

    {editing && (

      <div className="mt-5 border border-gray-200 rounded-xl p-5 bg-gray-50">

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

        <div
          className="flex gap-2 mt-4">
          <button
            onClick={() => {
              setClientName(project.client_name)
              setGoLiveDate(project.go_live_date)
              setEditing(false)
            }}
            className="border border-gray-300 bg-white hover:bg-gray-100 px-5 py-2 rounded-lg font-medium transition"
          >
              Cancel
          </button>

          <button
            disabled={loading}
            onClick={updateProject}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Save"}
          </button>
        </div>

      </div>

    )}

  </div>
  )
}