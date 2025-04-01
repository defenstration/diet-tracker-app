export default function ExercisePage() {
  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Exercise Tracker</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Log your workouts and track your physical activity.
          </p>
        </div>

        <div className="grid gap-6">
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Add Exercise</h2>
            {/* Exercise entry form will go here */}
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
            {/* Exercise log list will go here */}
          </section>
        </div>
      </main>
    </div>
  );
} 