import Link from 'next/link'
interface CommandCenterSectionProps{
    title: string
    color: string
    projects: any[]
    emoji: string
    showReason?: boolean
}

export default function CommandCenterSection({
    title,
    color,
    projects,
    emoji,
    showReason
}: CommandCenterSectionProps){
    return(
        <div className="bg-white p-4 rounded border">

            <h3 className={`font-semibold ${color}`}>
            {emoji} {title} ({projects.length})
            </h3>

            {projects.map(p=>(
            <div key={p.id} className="text-sm py-1">
            <Link href={`/projects/${p.id}`}>
            {p.client_name}

            {showReason && ` - ${p.reason}`}
            </Link>
            </div>
            ))}

        </div>
    )
}