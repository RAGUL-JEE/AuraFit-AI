import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem('workout_favorites');
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load favorites', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadFavorites();
  }, []);

  const saveFavorites = async (newFavorites: string[]) => {
    try {
      await AsyncStorage.setItem('workout_favorites', JSON.stringify(newFavorites));
    } catch (e) {
      console.error('Failed to save favorites', e);
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavs = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      saveFavorites(newFavs);
      return newFavs;
    });
  };

  const isFavorite = (id: string) => favorites.includes(id);

  return { favorites, toggleFavorite, isFavorite, isLoaded };
}
