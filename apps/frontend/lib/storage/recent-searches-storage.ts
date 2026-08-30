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

const SEARCHES_KEY = "ezee_recent_searches";

localforage.config({
  name: "ezeeflights",
  storeName: "recent_searches",
});

export async function getLocalRecentSearches(): Promise<LocalRecentSearch[]> {
  try {
    const searches = await localforage.getItem<LocalRecentSearch[]>(SEARCHES_KEY);
    return searches || [];
  } catch (error) {
    console.error("Error reading searches:", error);
    return [];
  }
}

export async function saveLocalRecentSearch(search: Omit<LocalRecentSearch, "id" | "createdAt">): Promise<void> {
  try {
    const searches = await getLocalRecentSearches();
    
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

    updated = [newSearch, ...updated].slice(0, 3);

    await localforage.setItem(SEARCHES_KEY, updated);
  } catch (error) {
    console.error("Error saving search:", error);
  }
}

export async function deleteLocalRecentSearch(id: string): Promise<void> {
  try {
    const searches = await getLocalRecentSearches();
    const updated = searches.filter((s) => s.id !== id);
    await localforage.setItem(SEARCHES_KEY, updated);
  } catch (error) {
    console.error("Error deleting search:", error);
  }
}

export async function clearLocalRecentSearches(): Promise<void> {
  try {
    await localforage.removeItem(SEARCHES_KEY);
  } catch (error) {
    console.error("Error clearing searches:", error);
  }
}
