'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'


export default function Dashboard() {

  const [projects, setProjects] = useState<any[]>([])
  const [milestones, setMilestones] = useState<any[]>([])
  const [risks, setRisks] = useState<any[]>([])
  const [needsAttention, setNeedsAttention] = useState<any[]>([])
  const [watchlist, setWatchlist] = useState<any[]>([])
  const [healthyProjects, setHealthyProjects] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchProjects(),
    fetchDashboardData()
  }, [])
  useEffect(()=>{
  if(projects.length > 0){
    computeCommandCenter()
  }
},[projects, risks])

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

    const { data: { user } } = await supabase.auth.getUser()

    const { data: membership } = await supabase
  .from('organization_members')
  .select('organization_id')
  .eq('user_id', user?.id)
  .single()

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user?.id)
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

//logout
const logout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

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

  const project = projects.find(p => p.id === projectId)

  const projectMilestones = milestones.filter(
    m => m.project_id === projectId
  )

  const projectRisks = risks.filter(
    r => r.project_id === projectId && r.status !== "Mitigated"
  )

  const delayedMilestones = projectMilestones.filter(
    m =>
      m.due_date &&
      new Date(m.due_date) < today &&
      m.status !== "Completed"
  )

  const daysToGoLive =
    (new Date(project.go_live_date).getTime() - today.getTime())
    / (1000 * 60 * 60 * 24)

  if (projectRisks.length > 0) {
    return {
      status: "At Risk",
      reason: "Open risk"
    }
  }

  if (delayedMilestones.length > 0) {
    return {
      status: "Warning",
      reason: "Delayed milestone"
    }
  }

  if (daysToGoLive <= 7) {
    return {
      status: "Warning",
      reason: "Go-live within 7 days"
    }
  }

  return {
    status: "Healthy",
    reason: "On track"
  }
}

//compute project health
const computeCommandCenter = () => {

  const today = new Date()

  const attention:any[] = []
  const watch:any[] = []
  const healthy:any[] = []

  projects.forEach(project => {

    const projectRisks = risks.filter(
      r => r.project_id === project.id && r.status !== "Mitigated"
    )

    const daysToGoLive =
      (new Date(project.go_live_date).getTime() - today.getTime())
      / (1000 * 60 * 60 * 24)

    if(projectRisks.length > 0){
      attention.push({
        ...project,
        reason: "Open Risk"
      })
      return
    }

    if(daysToGoLive <= 7){
      attention.push({
        ...project,
        reason: "Go-Live within 7 days"
      })
      return
    }

    if(daysToGoLive <= 14){
      watch.push({
        ...project,
        reason: "Go-Live approaching"
      })
      return
    }

    healthy.push(project)

  })

  setNeedsAttention(attention)
  setWatchlist(watch)
  setHealthyProjects(healthy)

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
        <Link href="/members"
        className="bg-blue-600 text-white px-4 py-2 rounded">
  Members
</Link>

        <button
  onClick={logout}
  className="border px-3 py-1 rounded">
Logout
</button>


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

{/* command center */}
<div className="bg-gray-50 border rounded p-4 mb-8">

<h2 className="text-lg font-semibold mb-4">
Implementation Command Center
</h2>

<div className="grid grid-cols-3 gap-8">

<div className="bg-white p-4 rounded border">

<h3 className="font-semibold text-red-600">
🔴 Needs Attention ({needsAttention.length})
</h3>

{needsAttention.map(p=>(
<div key={p.id} className="text-sm py-1">
<Link href={`/projects/${p.id}`}>
  {p.client_name} — {p.reason}
</Link>
</div>
))}

</div>

<div className="bg-white p-4 rounded border">

<h3 className="font-semibold text-yellow-600">
🟡 Watchlist ({watchlist.length})
</h3>

{watchlist.map(p=>(
<div key={p.id} className="text-sm py-1">
<Link href={`/projects/${p.id}`}>
  {p.client_name} — {p.reason}
</Link>
</div>
))}

</div>

<div className="bg-white p-4 rounded border">

<h3 className="font-semibold text-green-600">
🟢 Healthy ({healthyProjects.length})
</h3>

{healthyProjects.slice(0,5).map(p=>(
<div key={p.id} className="text-sm py-1">
<Link href={`/projects/${p.id}`}>
  {p.client_name}
</Link>
</div>
))}

</div>

</div>

</div>


<div className="border rounded">

{projects.map((project)=>{
  const progress = getProjectProgress(project.id)
  const healthData = getProjectHealth(project.id)

  //health based border
  let borderColor = "border-green-500"

if (healthData.status === "Warning") {
  borderColor = "border-yellow-500"
}

if (healthData.status === "At Risk") {
  borderColor = "border-red-500"
}

  return (

<Link
  key={project.id}
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

})}

</div>

    </div>
  )
}