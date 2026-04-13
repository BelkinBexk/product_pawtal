// ── Shared pet store using localStorage ──────────────────────────────────────

export type PetType = "Dog" | "Cat" | "Rabbit" | "Bird" | "Other";

export interface Pet {
  id:                  string;
  name:                string;
  type:                PetType;
  breed:               string;
  age:                 string;
  weight:              string;
  notes:               string;
  vaccinationConsent:  boolean;
  serviceConsent:      boolean;
}

export const PET_TYPES: PetType[] = ["Dog", "Cat", "Rabbit", "Bird", "Other"];

export const PET_EMOJI: Record<PetType, string> = {
  Dog: "🐶", Cat: "🐱", Rabbit: "🐰", Bird: "🐦", Other: "🐾",
};

export const AVATAR_COLORS: Record<PetType, { bg: string; text: string }> = {
  Dog:    { bg: "#fff3e0", text: "#f59e0b" },
  Cat:    { bg: "#f0e8ff", text: "#8b5cf6" },
  Rabbit: { bg: "#fce7f3", text: "#ec4899" },
  Bird:   { bg: "#d1fae5", text: "#10b981" },
  Other:  { bg: "#e0f2fe", text: "#17A8FF" },
};

const STORAGE_KEY = "pawtal_pets";

const DEFAULTS: Pet[] = [
  {
    id: "mock-1", name: "Mochi", type: "Dog", breed: "Shih Tzu", age: "3", weight: "4.2",
    notes: "Allergic to chicken-based food", vaccinationConsent: true, serviceConsent: true,
  },
  {
    id: "mock-2", name: "Luna", type: "Cat", breed: "Persian Cat", age: "2", weight: "3.8",
    notes: "", vaccinationConsent: false, serviceConsent: true,
  },
];

export const getPets = (): Pet[] => {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
};

export const savePets = (pets: Pet[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
};

export const getPetById = (id: string): Pet | undefined =>
  getPets().find(p => p.id === id);

export const upsertPet = (pet: Pet) => {
  const pets = getPets();
  const idx  = pets.findIndex(p => p.id === pet.id);
  if (idx >= 0) pets[idx] = pet;
  else pets.push(pet);
  savePets(pets);
};

export const deletePet = (id: string) => {
  savePets(getPets().filter(p => p.id !== id));
};
