'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function MembersPage() {

  const [members, setMembers] = useState<any[]>([])
  const [orgName, setOrgName] = useState('')

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {

    const { data: { user } } = await supabase.auth.getUser()

    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user?.id)
      .single()

    const { data } = await supabase
      .from('organization_members')
      .select(`
        role,
        user_id
      `)
      .eq('organization_id', membership?.organization_id)

      const { data: org } = await supabase
  .from('organizations')
  .select('name')
  .eq('id', membership?.organization_id)
  .single()

    setMembers(data || [])
    setOrgName(org?.name || '')
  }

  return (
    <div className="p-10">

      <h1 className="text-2xl font-bold mb-6">
        Workspace Members
      </h1>
      <p className="text-gray-500 mb-6">
  Workspace: {orgName}
</p>

      <div className="border rounded">

        {members.map((m)=>(
          <div
            key={m.user_id}
            className="p-4 border-b flex justify-between"
          >

            <div>
              {m.user_id.slice(0,8)}
            </div>

            <div className="text-sm text-gray-500">
              {m.role}
            </div>

          </div>
        ))}

      </div>

    </div>
  )
}