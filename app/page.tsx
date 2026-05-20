'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import EmptyState from '@/components/EmptyState'
import ProjectList from '@/components/ProjectList'
import SummaryCard from '@/components/SummaryCard'
import CommandCenterSection from '@/components/CommandCenterSection'

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
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
  <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>

  <p className="text-sm text-gray-500">
    Loading dashboard...
  </p>
</div>
    
  )
}

if (error) {
  return (
    <div className="max-w-2xl mx-auto py-20">
      <div className="border border-red-200 bg-red-50 rounded-xl p-6">
        <p className="text-red-600 font-medium">
        Failed to load dashboard: {error}
        </p>
        </div>
    </div>
  )
}

  return (

    <div className="max-w-7xl mx-auto px-6 py-8">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">

      <h1 className="text-3xl font-bold tracking-tight">
        Implementation Dashboard
      </h1>

      <div className="flex items-center gap-3">

        <Link
          href="/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition disabled:opacity-50"
        >
          + Create Implementation
        </Link>

        <Link
          href="/members"
          className="border border-gray-300 bg-white hover:bg-gray-100 px-5 py-2 rounded-lg font-medium transition"
        >
          Members
        </Link>

        <button
          onClick={logout}
          className="border border-gray-300 bg-white hover:bg-gray-100 px-5 py-2 rounded-lg font-medium transition"
        >
          Logout
        </button>

      </div>

</div>

{/* Implementation Dashboard */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">


  <SummaryCard
   title="Active Projects"
   value={activeProjects}
   />

   <SummaryCard
   title="Delayed Milestones"
   value={delayedMilestones}
   valueColor='text-red-500'
   />

    <SummaryCard
   title="Open Risks"
   value={openRisks}
   valueColor='text-red-500'
   />

   <SummaryCard
   title="Completed Projects"
   value={completedProjects}
   valueColor='text-green-500'
   />

</div>

{/* command center */}
<div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-10">

<h2 className="text-2xl font-bold mb-6">
Implementation Command Center
</h2>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


<CommandCenterSection
  title="Needs Attention"
  color="text-red-600"
  projects={needsAttention}
  emoji='🔴'
  showReason={true}
  />

<CommandCenterSection
  title="Watchlist"
  color="text-yellow-600"
  projects={watchlist}
  emoji='🟡'
  showReason={true}
  />

<CommandCenterSection
  title="Healthy"
  color="text-green-600"
  projects={healthyProjects}
  emoji='🟢'
  showReason={false}
  />



</div>

</div>

{ projects.length === 0 ? (
  <div className='mt-10'>
  <EmptyState />
  </div>
) : (
  <ProjectList
    projects={projects}
    getProjectProgress={getProjectProgress}
    getProjectHealth={getProjectHealth}
    formatDate={formatDate}
    fetchDashboardData={fetchDashboardData} />
)
}
    </div>
  )
}