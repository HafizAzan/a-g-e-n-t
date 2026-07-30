export type Lead = {
  businessName: string;
  category: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  website: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  googleMapsLink: string;
  aiNotes: string;
};

export type GenerateLeadsRequest = {
  prompt: string;
  country: string;
  city: string;
  limit: number;
};
