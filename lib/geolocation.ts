/**
 * Service de géolocalisation
 * MonGaz+ - Récupération de la position et geocoding inverse
 */

import * as Location from 'expo-location';
import { Geolocalisation } from '@/stores/historiqueStore';

// ============================================
// TYPES
// ============================================

export interface GeoResult {
  success: boolean;
  data?: Geolocalisation;
  error?: string;
}

// ============================================
// FONCTIONS
// ============================================

/**
 * Demande les permissions de localisation
 */
export async function demanderPermissionLocalisation(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Erreur permission localisation:', error);
    return false;
  }
}

/**
 * Vérifie si les permissions sont accordées
 */
export async function verifierPermissionLocalisation(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    return false;
  }
}

/**
 * Récupère la position actuelle
 */
export async function obtenirPosition(): Promise<GeoResult> {
  try {
    // Vérifier les permissions
    const permissionAccordee = await demanderPermissionLocalisation();
    if (!permissionAccordee) {
      return {
        success: false,
        error: 'Permission de localisation refusée',
      };
    }

    // Obtenir la position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = location.coords;
    const precision = location.coords.accuracy;

    // Geocoding inverse pour obtenir l'adresse
    let adresse: string | undefined;
    try {
      const [resultat] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (resultat) {
        const parties = [
          resultat.streetNumber,
          resultat.street,
          resultat.postalCode,
          resultat.city,
        ].filter(Boolean);
        adresse = parties.join(' ');
      }
    } catch (geocodeError) {
      console.warn('Geocoding inverse échoué:', geocodeError);
      // On continue sans adresse
    }

    return {
      success: true,
      data: {
        latitude,
        longitude,
        adresse,
        precision,
      },
    };
  } catch (error) {
    console.error('Erreur géolocalisation:', error);
    return {
      success: false,
      error: 'Impossible d\'obtenir la position',
    };
  }
}

/**
 * Formate l'adresse pour affichage
 */
export function formaterAdresse(geo: Geolocalisation): string {
  if (geo.adresse) {
    return geo.adresse;
  }
  return `${geo.latitude.toFixed(6)}, ${geo.longitude.toFixed(6)}`;
}

/**
 * Calcule la distance entre deux points (en mètres)
 */
export function calculerDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Rayon de la Terre en mètres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
