import localforage from "localforage";

export interface LocalRecentSearch {
  id: string;
  origin: string;
  destination: string;
  searchType: string;
  searchDate?: string;
  metadata?: any;
  createdAt: string;
}

const GUEST_SEARCHES_KEY = "ezee_guest_recent_searches";

localforage.config({
  name: "ezeeflights",
  storeName: "recent_searches",
});

export async function getGuestRecentSearches(): Promise<LocalRecentSearch[]> {
  try {
    const searches = await localforage.getItem<LocalRecentSearch[]>(GUEST_SEARCHES_KEY);
    return searches || [];
  } catch (error) {
    console.error("Error reading guest searches:", error);
    return [];
  }
}

export async function saveGuestRecentSearch(search: Omit<LocalRecentSearch, "id" | "createdAt">): Promise<void> {
  try {
    const searches = await getGuestRecentSearches();
    
    // Check if duplicate (same origin, destination, type)
    const existingIndex = searches.findIndex(
      (s) => 
        s.origin === search.origin && 
        s.destination === search.destination && 
        s.searchType === search.searchType
    );

    let updated = [...searches];
    if (existingIndex > -1) {
      // Remove old one to move it to top
      updated.splice(existingIndex, 1);
    }

    const newSearch: LocalRecentSearch = {
      ...search,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    updated = [newSearch, ...updated].slice(0, 3); // Limit to 3
    await localforage.setItem(GUEST_SEARCHES_KEY, updated);
  } catch (error) {
    console.error("Error saving guest search:", error);
  }
}

export async function deleteGuestRecentSearch(id: string): Promise<void> {
  try {
    const searches = await getGuestRecentSearches();
    const updated = searches.filter((s) => s.id !== id);
    await localforage.setItem(GUEST_SEARCHES_KEY, updated);
  } catch (error) {
    console.error("Error deleting guest search:", error);
  }
}

export async function clearGuestRecentSearches(): Promise<void> {
  try {
    await localforage.removeItem(GUEST_SEARCHES_KEY);
  } catch (error) {
    console.error("Error clearing guest searches:", error);
  }
}
