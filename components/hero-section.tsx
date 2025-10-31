"use client";

import { Button, Input } from "@heroui/react";
import { useState } from "react";
import { Search, MapPin } from "lucide-react";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="relative w-full h-96 bg-gradient-to-r from-slate-900 to-slate-800 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=400&fit=crop')",
        }}
      />

      <div className="relative z-10 container h-full flex flex-col items-center justify-center gap-8 px-4">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Find Your Perfect Property
          </h1>
          <p className="text-lg text-gray-200">
            No Duplicates, Only Verified Listings
          </p>
        </div>

        <div className="w-full max-w-2xl">
          <div className="flex gap-2 bg-white rounded-lg p-2 shadow-lg">
            <div className="flex-1 flex items-center gap-2 px-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by location, address, or keyword"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border-none outline-none bg-transparent text-sm"
              />
            </div>
            <Button variant="primary" className="gap-2">
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>

          <div className="flex gap-2 mt-4 flex-wrap justify-center">
            <Button variant="tertiary" className="bg-white">
              Houses
            </Button>
            <Button variant="tertiary" className="bg-white">
              Event Centers
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
