'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

interface Location {
  id: string;
  name: string;
  state: string;
  type: 'city' | 'state';
  population?: number;
}

interface UseLocationSearchOptions {
  debounceMs?: number;
  maxResults?: number;
  includeStates?: boolean;
  includePopularCities?: boolean;
}

interface UseLocationSearchResult {
  query: string;
  setQuery: (query: string) => void;
  results: Location[];
  isLoading: boolean;
  popularLocations: Location[];
  clearQuery: () => void;
  selectLocation: (location: Location) => void;
  selectedLocation: Location | null;
}

// Nigeria locations data
const NIGERIA_LOCATIONS: Location[] = [
  // States
  { id: 'lagos-state', name: 'Lagos State', state: 'Lagos', type: 'state' },
  { id: 'abuja-fct', name: 'Federal Capital Territory', state: 'FCT', type: 'state' },
  { id: 'rivers-state', name: 'Rivers State', state: 'Rivers', type: 'state' },
  { id: 'oyo-state', name: 'Oyo State', state: 'Oyo', type: 'state' },
  { id: 'kano-state', name: 'Kano State', state: 'Kano', type: 'state' },
  { id: 'kaduna-state', name: 'Kaduna State', state: 'Kaduna', type: 'state' },
  { id: 'ogun-state', name: 'Ogun State', state: 'Ogun', type: 'state' },
  { id: 'imo-state', name: 'Imo State', state: 'Imo', type: 'state' },
  { id: 'plateau-state', name: 'Plateau State', state: 'Plateau', type: 'state' },
  { id: 'akwa-ibom-state', name: 'Akwa Ibom State', state: 'Akwa Ibom', type: 'state' },

  // Major Cities - Lagos
  { id: 'lagos-island', name: 'Lagos Island', state: 'Lagos', type: 'city', population: 1200000 },
  { id: 'ikeja', name: 'Ikeja', state: 'Lagos', type: 'city', population: 600000 },
  { id: 'victoria-island', name: 'Victoria Island', state: 'Lagos', type: 'city', population: 500000 },
  { id: 'ikoyi', name: 'Ikoyi', state: 'Lagos', type: 'city', population: 400000 },
  { id: 'lekki', name: 'Lekki', state: 'Lagos', type: 'city', population: 800000 },
  { id: 'surulere', name: 'Surulere', state: 'Lagos', type: 'city', population: 700000 },
  { id: 'yaba', name: 'Yaba', state: 'Lagos', type: 'city', population: 300000 },
  { id: 'apapa', name: 'Apapa', state: 'Lagos', type: 'city', population: 400000 },
  { id: 'oshodi', name: 'Oshodi', state: 'Lagos', type: 'city', population: 500000 },
  { id: 'alaba', name: 'Alaba', state: 'Lagos', type: 'city', population: 200000 },
  { id: 'badagry', name: 'Badagry', state: 'Lagos', type: 'city', population: 150000 },

  // Major Cities - FCT Abuja
  { id: 'abuja-city', name: 'Abuja', state: 'FCT', type: 'city', population: 3000000 },
  { id: 'garki', name: 'Garki', state: 'FCT', type: 'city', population: 400000 },
  { id: 'wuse', name: 'Wuse', state: 'FCT', type: 'city', population: 300000 },
  { id: 'gwarinpa', name: 'Gwarinpa', state: 'FCT', type: 'city', population: 500000 },
  { id: 'asokoro', name: 'Asokoro', state: 'FCT', type: 'city', population: 200000 },
  { id: 'maitama', name: 'Maitama', state: 'FCT', type: 'city', population: 150000 },
  { id: 'kubwa', name: 'Kubwa', state: 'FCT', type: 'city', population: 600000 },

  // Major Cities - Rivers
  { id: 'port-harcourt', name: 'Port Harcourt', state: 'Rivers', type: 'city', population: 1500000 },
  { id: 'bonny', name: 'Bonny', state: 'Rivers', type: 'city', population: 100000 },
  { id: 'obio-akpor', name: 'Obio-Akpor', state: 'Rivers', type: 'city', population: 800000 },

  // Major Cities - Oyo
  { id: 'ibadan', name: 'Ibadan', state: 'Oyo', type: 'city', population: 3500000 },
  { id: 'ogbomoso', name: 'Ogbomoso', state: 'Oyo', type: 'city', population: 500000 },
  { id: 'oyo', name: 'Oyo', state: 'Oyo', type: 'city', population: 200000 },

  // Major Cities - Kano
  { id: 'kano-city', name: 'Kano', state: 'Kano', type: 'city', population: 4000000 },

  // Major Cities - Kaduna
  { id: 'kaduna-city', name: 'Kaduna', state: 'Kaduna', type: 'city', population: 1500000 },
  { id: 'zaria', name: 'Zaria', state: 'Kaduna', type: 'city', population: 800000 },

  // Other Major Cities
  { id: 'benin-city', name: 'Benin City', state: 'Edo', type: 'city', population: 1200000 },
  { id: 'warri', name: 'Warri', state: 'Delta', type: 'city', population: 600000 },
  { id: 'owerri', name: 'Owerri', state: 'Imo', type: 'city', population: 400000 },
  { id: 'enugu', name: 'Enugu', state: 'Enugu', type: 'city', population: 800000 },
  { id: 'jos', name: 'Jos', state: 'Plateau', type: 'city', population: 900000 },
  { id: 'uyo', name: 'Uyo', state: 'Akwa Ibom', type: 'city', population: 500000 },
  { id: 'calabar', name: 'Calabar', state: 'Cross River', type: 'city', population: 400000 },
  { id: 'maiduguri', name: 'Maiduguri', state: 'Borno', type: 'city', population: 1200000 },
  { id: 'ilorin', name: 'Ilorin', state: 'Kwara', type: 'city', population: 800000 },
  { id: 'abeokuta', name: 'Abeokuta', state: 'Ogun', type: 'city', population: 600000 },
  { id: 'akure', name: 'Akure', state: 'Ondo', type: 'city', population: 500000 },
  { id: 'ado-ekiti', name: 'Ado Ekiti', state: 'Ekiti', type: 'city', population: 300000 },
  { id: 'osogbo', name: 'Osogbo', state: 'Osun', type: 'city', population: 400000 },
  { id: 'bauchi', name: 'Bauchi', state: 'Bauchi', type: 'city', population: 600000 },
  { id: 'gombe', name: 'Gombe', state: 'Gombe', type: 'city', population: 400000 },
  { id: 'sokoto', name: 'Sokoto', state: 'Sokoto', type: 'city', population: 700000 },
  { id: 'katsina', name: 'Katsina', state: 'Katsina', type: 'city', population: 500000 },

  // More Lagos Areas
  { id: 'ajah', name: 'Ajah', state: 'Lagos', type: 'city', population: 300000 },
  { id: 'epe', name: 'Epe', state: 'Lagos', type: 'city', population: 200000 },
  { id: 'ikorodu', name: 'Ikorodu', state: 'Lagos', type: 'city', population: 600000 },
  { id: 'agege', name: 'Agege', state: 'Lagos', type: 'city', population: 500000 },
  { id: 'mushin', name: 'Mushin', state: 'Lagos', type: 'city', population: 600000 },
  { id: 'alimosho', name: 'Alimosho', state: 'Lagos', type: 'city', population: 1200000 },
  { id: 'kosofe', name: 'Kosofe', state: 'Lagos', type: 'city', population: 800000 },
];

/**
 * Custom hook for searching Nigeria locations with debouncing and smart filtering
 */
export function useLocationSearch(options: UseLocationSearchOptions = {}): UseLocationSearchResult {
  const {
    debounceMs = 300,
    maxResults = 10,
    includeStates = true,
    includePopularCities = true
  } = options;

  const [query, setQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Popular locations (most searched/populated cities)
  const popularLocations = useMemo(() => {
    if (!includePopularCities) return [];

    return NIGERIA_LOCATIONS
      .filter(location => location.type === 'city' && (location.population || 0) > 500000)
      .sort((a, b) => (b.population || 0) - (a.population || 0))
      .slice(0, 8);
  }, [includePopularCities]);

  // Search function with intelligent filtering
  const searchLocations = useCallback((searchQuery: string): Location[] => {
    if (!searchQuery.trim()) return [];

    const normalizedQuery = searchQuery.toLowerCase().trim();
    const results: Location[] = [];

    // Exact matches first
    const exactMatches = NIGERIA_LOCATIONS.filter(location =>
      location.name.toLowerCase() === normalizedQuery ||
      location.state.toLowerCase() === normalizedQuery
    );

    // Starts with matches
    const startsWithMatches = NIGERIA_LOCATIONS.filter(location =>
      location.name.toLowerCase().startsWith(normalizedQuery) ||
      location.state.toLowerCase().startsWith(normalizedQuery)
    ).filter(location => !exactMatches.includes(location));

    // Contains matches
    const containsMatches = NIGERIA_LOCATIONS.filter(location =>
      location.name.toLowerCase().includes(normalizedQuery) ||
      location.state.toLowerCase().includes(normalizedQuery)
    ).filter(location => !exactMatches.includes(location) && !startsWithMatches.includes(location));

    // Combine results with priority
    results.push(...exactMatches);
    results.push(...startsWithMatches);
    results.push(...containsMatches);

    // Filter by type preferences
    const filteredResults = results.filter(location => {
      if (!includeStates && location.type === 'state') return false;
      return true;
    });

    // Sort by relevance and popularity
    const sortedResults = filteredResults.sort((a, b) => {
      // Cities before states
      if (a.type !== b.type) {
        return a.type === 'city' ? -1 : 1;
      }

      // Popular cities first
      if (a.type === 'city' && b.type === 'city') {
        const aPopulation = a.population || 0;
        const bPopulation = b.population || 0;
        if (aPopulation !== bPopulation) {
          return bPopulation - aPopulation;
        }
      }

      // Alphabetical
      return a.name.localeCompare(b.name);
    });

    return sortedResults.slice(0, maxResults);
  }, [includeStates, maxResults]);

  // Debounced search results
  const [results, setResults] = useState<Location[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const timeoutId = setTimeout(() => {
      const searchResults = searchLocations(query);
      setResults(searchResults);
      setIsLoading(false);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, searchLocations, debounceMs]);

  const clearQuery = useCallback(() => {
    setQuery('');
    setResults([]);
    setSelectedLocation(null);
  }, []);

  const selectLocation = useCallback((location: Location) => {
    setSelectedLocation(location);
    setQuery(location.name);
    setResults([]);
  }, []);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    if (selectedLocation && newQuery !== selectedLocation.name) {
      setSelectedLocation(null);
    }
  }, [selectedLocation]);

  return {
    query,
    setQuery: updateQuery,
    results,
    isLoading,
    popularLocations,
    clearQuery,
    selectLocation,
    selectedLocation
  };
}

/**
 * Utility function to format location display name
 */
export function formatLocationName(location: Location): string {
  if (location.type === 'state') {
    return location.name;
  }

  return `${location.name}, ${location.state}`;
}

/**
 * Utility function to get location icon based on type and importance
 */
export function getLocationIcon(location: Location): string {
  if (location.type === 'state') {
    return 'map-pin';
  }

  // Major cities (population > 1M)
  if ((location.population || 0) > 1000000) {
    return 'building-2';
  }

  // Medium cities
  if ((location.population || 0) > 500000) {
    return 'building';
  }

  // Smaller cities
  return 'map-pin';
}
