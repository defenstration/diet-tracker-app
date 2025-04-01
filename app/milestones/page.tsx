export default function MilestonesPage() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Milestones</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Set and track your health and fitness goals.
          </p>
        </div>

        <div className="grid gap-6">
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Goal</h2>
            {/* Goal creation form will go here */}
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Your Goals</h2>
            {/* Goals list will go here */}
          </section>
        </div>
      </main>
    </div>
  );
} 