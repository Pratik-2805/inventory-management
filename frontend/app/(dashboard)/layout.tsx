import { AppSidebar } from '@/components/layout/app-sidebar'
import { TopNavigation } from '@/components/layout/top-navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <AppSidebar />
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <TopNavigation />
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
