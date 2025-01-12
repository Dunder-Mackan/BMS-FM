import { DashboardNav } from './nav'
import { SidebarProvider } from "@/components/ui/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex">
        <DashboardNav />
        <main className="flex-1 pl-[80px] md:pl-64">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}

