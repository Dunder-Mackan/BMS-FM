'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BarChartIcon, LayoutDashboard, Receipt, PiggyBank, BarChart3, Settings, LogOut, User, Upload, ShieldCheck } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { useEffect, useState, useRef } from 'react'
import { getCurrentUser, updateProfilePicture, type User } from '@/lib/actions/user'
import { Skeleton } from "@/components/ui/skeleton"
import Image from 'next/image'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/dashboard/transactions', icon: Receipt },
  { name: 'Budget', href: '/dashboard/budget', icon: PiggyBank },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
]

export function DashboardNav() {
  const pathname = usePathname()
  const { collapsed } = useSidebar()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (res.ok) {
        router.push('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && user) {
      // TODO: Implement actual file upload to a storage service
      const fakeUploadedUrl = URL.createObjectURL(file)
      const success = await updateProfilePicture(user.id, fakeUploadedUrl)
      if (success) {
        setUser({ ...user, profile_picture: fakeUploadedUrl })
      }
    }
  }

  const renderNavigation = () => {
    return (
      <div className="flex flex-col space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
              pathname === item.href 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {!collapsed && <span>{item.name}</span>}
          </Link>
        ))}
        {user?.is_admin ? (
          <Link
            href="/dashboard/admin"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
              pathname === '/dashboard/admin'
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <ShieldCheck className="h-5 w-5" />
            {!collapsed && <span>Admin Panel</span>}
          </Link>
        ) : null}
      </div>
    )
  }

  function UserProfile() {
    if (loading) {
      return (
        <div className="flex items-center gap-3 px-2 py-1">
          <Skeleton className="h-10 w-10 rounded-full" />
          {!collapsed && (
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-3 w-[140px]" />
            </div>
          )}
        </div>
      )
    }

    if (!user) {
      return null
    }

    return (
      <div className="flex items-center gap-3 px-2 py-1">
        <div className="relative">
          {user.profile_picture ? (
            <Image
              src={user.profile_picture}
              alt={user.username}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1"
          >
            <Upload className="h-3 w-3" />
          </button>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleProfilePictureUpload}
        />
      </div>
    )
  }

  return (
    <nav className={`fixed left-0 top-0 border-r bg-background ${collapsed ? "w-[80px]" : "w-64"} transition-all flex flex-col h-screen`}>
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <BarChartIcon className="h-6 w-6 text-primary" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold leading-tight">BMS</span>
              <span className="text-xs leading-tight font-semibold">Financial Management</span>
            </div>
          )}
        </Link>
      </div>
      <div className="flex flex-col flex-1 p-4 overflow-y-auto">
        {renderNavigation()}
      </div>
      <div className="p-4 border-t">
        <div className="space-y-1">
          <div className="mb-1">
            <UserProfile />
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start"
            asChild
          >
            <Link href="/dashboard/settings">
              <Settings className="h-5 w-5" />
              {!collapsed && <span className="ml-2">Settings</span>}
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-2">Log out</span>}
          </Button>
        </div>
      </div>
    </nav>
  )
}

