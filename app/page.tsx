'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import EmptyState from '@/components/EmptyState'
import ProjectList from '@/components/ProjectList'

export default function Dashboard() {

  const [projects, setProjects] = useState<any[]>([])
  const [milestones, setMilestones] = useState<any[]>([])
  const [risks, setRisks] = useState<any[]>([])
  const [needsAttention, setNeedsAttention] = useState<any[]>([])
  const [watchlist, setWatchlist] = useState<any[]>([])
  const [healthyProjects, setHealthyProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      router.push('/login')
      return
    }

    await fetchDashboardData()
  }

  checkAuth()

  }, [])
  useEffect(()=>{
  if(projects.length > 0){
    computeCommandCenter()
  }
},[projects, risks])

  const fetchDashboardData = async () => {
  try{
    setLoading(true)
    setError(null)

      const { data: projectData , error: projectError } = await supabase
      .from('projects')
      .select('*')

      if(projectError){
        throw projectError
      }

      const { data: milestoneData, error: milestoneError } = await supabase
        .from('milestones')
        .select('*')

      if(milestoneError){
        throw milestoneError
      }

      const { data: riskData, error: riskError } = await supabase
        .from('risks')
        .select('*')

      if(riskError){
        throw riskError;
      }

      setProjects(projectData || [])
      setMilestones(milestoneData || [])
      setRisks(riskData || [])

  }catch(err: any){
    console.log(err)
    setError(err.message)
  }finally{
    setLoading(false)
  }
  

}

  const activeProjects = projects.length
  const completedProjects = projects.filter(p => p.status === "Completed").length || 3
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

if(loading){
  return(
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
    </div>
    
  )
}

if (error) {
  return (
    <div className="p-10">
      <p className="text-red-500">
        Failed to load dashboard: {error}
      </p>
    </div>
  )
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

{ projects.length === 0 ? (
  <EmptyState />
) : (
  <ProjectList
    projects={projects}
    getProjectProgress={getProjectProgress}
    getProjectHealth={getProjectHealth}
    formatDate={formatDate} />
)
}
    </div>
  )
}