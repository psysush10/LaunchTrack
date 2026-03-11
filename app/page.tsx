'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function Dashboard() {

  const [projects, setProjects] = useState<any[]>([])
  const [milestones, setMilestones] = useState<any[]>([])
  const [risks, setRisks] = useState<any[]>([])

  useEffect(() => {
    fetchProjects(),
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {

  const { data: projectData } = await supabase
    .from('projects')
    .select('*')

  const { data: milestoneData } = await supabase
    .from('milestones')
    .select('*')

  const { data: riskData } = await supabase
    .from('risks')
    .select('*')

  setProjects(projectData || [])
  setMilestones(milestoneData || [])
  setRisks(riskData || [])

}
  const fetchProjects = async () => {

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if(error){
      console.error(error)
      return
    }

    setProjects(data || [])
  }

  const activeProjects = projects.length
  const completedProjects = projects.filter(p => p.status === "Completed").length
  const openRisks = risks.filter(r => r.status !== "Mitigated").length
  const today = new Date()
  const delayedMilestones = milestones.filter(m =>
m.due_date && new Date(m.due_date) < today && m.status !== "Completed").length

//project progress
const getProjectProgress = (projectId:string) => {

  const projectMilestones = milestones.filter(
    m => m.project_id === projectId
  )

  const completed = projectMilestones.filter(
    m => m.status === "Completed"
  ).length

  if(projectMilestones.length === 0) return 0

  return Math.round((completed / projectMilestones.length) * 100)
}

//project health function
const getProjectHealth = (projectId: string) => {

  const today = new Date()

  const projectMilestones = milestones.filter(
    (m) => m.project_id === projectId
  )

  const delayed = projectMilestones.filter(
    (m) =>
      m.due_date &&
      new Date(m.due_date) < today &&
      m.status !== "Completed"
  )

  if (delayed.length >= 3) return "At Risk"
  if (delayed.length > 0) return "Warning"

  return "Healthy"
}

//date format
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
}

  return (
    <div className="p-10">

      <div className="flex justify-between mb-6">

        <h1 className="text-2xl font-bold">
          Implementation Dashboard
        </h1>

        <Link
          href="/create"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Create Implementation
        </Link>

      </div>

<div className="grid grid-cols-4 gap-4 mb-8">

  <div className="bg-white border p-4 rounded">
    <div className="text-sm text-gray-500">
      Active Projects
    </div>
    <div className="text-2xl font-bold">
      {activeProjects}
    </div>
  </div>

  <div className="bg-white border p-4 rounded">
    <div className="text-sm text-gray-500">
      Delayed Milestones
    </div>
    <div className="text-2xl font-bold text-red-500">
      {delayedMilestones}
    </div>
  </div>

  <div className="bg-white border p-4 rounded">
    <div className="text-sm text-gray-500">
      Open Risks
    </div>
    <div className="text-2xl font-bold text-orange-500">
      {openRisks}
    </div>
  </div>

  <div className="bg-white border p-4 rounded">
    <div className="text-sm text-gray-500">
      Completed Projects
    </div>
    <div className="text-2xl font-bold text-green-500">
      {completedProjects}
    </div>
  </div>

</div>


<div className="border rounded">

{projects.map((project)=>{
  const progress = getProjectProgress(project.id)
  const health = getProjectHealth(project.id)

  return (

<Link
  key={project.id}
  href={`/project/${project.id}`}
  className="block border-b p-4 hover:bg-gray-50 transition hover:shadow-sm"
>

  <div className="font-semibold">
    {project.client_name}
  </div>

  <div className="text-sm text-gray-500">
    Go Live: {formatDate(project.go_live_date)}
  </div>

  <div className="text-sm mt-2">

    {health === "Healthy" && "🟢 Healthy"}
    {health === "Warning" && "🟡 Warning"}
    {health === "At Risk" && "🔴 At Risk"}

  </div>
  <div className="text-sm text-gray-500">
Progress: {progress}%
</div>

</Link>

  )

})}

</div>

    </div>
  )
}