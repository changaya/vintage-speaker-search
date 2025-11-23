export interface Speaker {
  id: string;
  name: string;
  brand: string;
  year: number;
  type: 'Bookshelf' | 'Floor Standing' | 'Monitor' | 'Horn';
  description: string;
  specs: {
    driver: string;
    frequency: string;
    impedance: string;
    sensitivity: string;
    dimensions?: string;
    weight?: string;
  };
  image: string;
  country: string;
}

export interface FilterOptions {
  search: string;
  brand: string;
  type: string;
  yearFrom: number;
  yearTo: number;
}
