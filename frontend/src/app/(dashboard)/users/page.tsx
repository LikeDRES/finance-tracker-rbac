"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { UsersTable } from "@/components/users/UsersTable"

export default function UsersPage() {
  return (
    <DashboardLayout>
      <UsersTable />
    </DashboardLayout>
  )
}