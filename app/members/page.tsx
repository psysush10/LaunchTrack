'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function MembersPage() {

  const [members, setMembers] = useState<any[]>([])
  const [orgName, setOrgName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')

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

  const inviteMember = async () => {

  const { data: { user } } = await supabase.auth.getUser()

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user?.id)
    .single()

  // find user by email
  const { data: users } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', inviteEmail)
    .single()

  if(!users){
    alert("User not found")
    return
  }

  await supabase
    .from('organization_members')
    .insert({
      organization_id: membership?.organization_id,
      user_id: users.id,
      role: 'member'
    })

  alert("Member added")

  setInviteEmail('')
  loadMembers()
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
      <div className="mt-6 border rounded p-4">

  <h2 className="font-semibold mb-3">
    Invite Member
  </h2>

  <div className="flex gap-2">

    <input
      value={inviteEmail}
      onChange={(e)=>setInviteEmail(e.target.value)}
      placeholder="Email"
      className="border p-2 flex-1"
    />

    <button
      onClick={inviteMember}
      className="bg-blue-600 text-white px-4 rounded"
    >
      Add
    </button>

  </div>

</div>

    </div>
  )
}