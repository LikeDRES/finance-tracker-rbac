"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { MovementsTable } from "@/components/movements/MovementsTable"

export default function MovementsPage() {
  return (
    <DashboardLayout>
      <MovementsTable />
    </DashboardLayout>
  )
}