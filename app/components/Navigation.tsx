'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-gray-100 dark:bg-gray-800' : '';
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold">
              Diet Tracker
            </Link>
          </div>
          <div className="ml-10 flex space-x-4">
            <Link
              href="/foods"
              className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 ${isActive('/foods')}`}
            >
              Foods
            </Link>
            <Link
              href="/exercise"
              className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 ${isActive('/exercise')}`}
            >
              Exercise
            </Link>
            <Link
              href="/milestones"
              className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 ${isActive('/milestones')}`}
            >
              Milestones
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 