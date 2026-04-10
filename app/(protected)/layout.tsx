import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { requireAuth } from '@/lib/auth'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await requireAuth()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }} suppressHydrationWarning>
      {/* Sidebar — desktop only */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}
