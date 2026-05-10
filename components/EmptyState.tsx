export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h2 className="text-2xl font-semibold text-gray-700">
        No projects found
      </h2>

      <p className="text-gray-500 mt-2">
        Create your first project to get started.
      </p>
    </div>
  )
}