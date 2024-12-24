export interface TransportItem {
  productId: number;
  quantity: number;
  remarks?: string;
}

export interface TransportBag {
  weight: number;
  items: TransportItem[];
}

export interface Transport {
  id?: number;
  customerId: number;
  bags: TransportBag[];
  createdAt?: string;
  updatedAt?: string;
  status?: string;
} 