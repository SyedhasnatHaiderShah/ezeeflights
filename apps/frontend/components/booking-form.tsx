"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import * as Tabs from "@radix-ui/react-tabs"
import {
  Plane,
  Hotel,
  Car,
  Package,
} from "lucide-react"
import { BookingSearchForm } from "./search/BookingSearchForm"
import { AppIcon } from "./ui/app-icon"

const TABS = [
  { id: "flights", icon: Plane, label: "Flights" },
  { id: "stays", icon: Hotel, label: "Stays" },
  { id: "cars", icon: Car, label: "Cars" },
  { id: "packages", icon: Package, label: "Packages" },
]

export function BookingForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = React.useState("flights")

  const [origin, setOrigin] = React.useState("")
  const [destination, setDestination] = React.useState("")
  const [departDate, setDepartDate] = React.useState<Date | undefined>(undefined)
  const [returnDate, setReturnDate] = React.useState<Date | undefined>(undefined)
  const [cabinClass, setCabinClass] = React.useState("Economy")
  const [passengers, setPassengers] = React.useState({ adults: 2, children: 0, infants: 0 })

  const handlePassengerChange = (key: string, val: number) =>
    setPassengers(prev => ({ ...prev, [key]: val }))

  const handleSearch = () => {
    const params = new URLSearchParams()
    params.set("org", origin)
    params.set("des", destination)
    if (departDate) params.set("dDate", format(departDate, "yyyy-MM-dd"))
    params.set("adt", passengers.adults.toString())
    router.push(`/flights/result?${params.toString()}`)
  }

  const commonProps = {
    origin, setOrigin,
    destination, setDestination,
    departDate, setDepartDate,
    returnDate, setReturnDate,
    passengers, handlePassengerChange,
    cabinClass, setCabinClass,
    handleSearch,
  }

  return (
    <div className="w-full">
      <Tabs.Root 
        defaultValue="flights" 
        className="w-full"
        onValueChange={(val) => setActiveTab(val)}
      >
        <Tabs.List
          className="flex items-center gap-1 mb-6 overflow-x-auto no-scrollbar scroll-smooth"
          aria-label="Search type"
        >
          {TABS.map((tab) => (
            <Tabs.Trigger
              key={tab.id}
              value={tab.id}
              className="tab-trigger flex flex-col items-center justify-center gap-1.5 cursor-pointer px-3 py-1.5 min-w-[80px] transition-all outline-none text-foreground/65 hover:text-foreground/90 relative data-[state=active]:text-foreground group"
            >
              <AppIcon 
                icon={tab.icon} 
                isActive={activeTab === tab.id}
                isFill={false}
                className="w-10 h-10"
              />
              <span className="text-xs capitalize tracking-wider font-semibold">
                {tab.label}
              </span>
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {TABS.map((tab) => (
          <Tabs.Content
            key={tab.id}
            value={tab.id}
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <BookingSearchForm
              variant={
                (tab.id === "stays" ? "hotel" : 
                  tab.id === "cars" ? "car" :
                    tab.id) as any
              }
              {...commonProps}
            />
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </div>
  )
}
