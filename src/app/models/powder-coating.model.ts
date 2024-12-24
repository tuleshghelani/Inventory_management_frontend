export interface PowderCoatingProcess {
  id: number;
  productId: number;
  productName: string;
  customerId: number;
  customerName: string;
  quantity: number;
  remainingQuantity: number;
  status: 'A' | 'I';
  createdAt: string;
}

export interface PowderCoatingSearchRequest {
  search?: string;
  currentPage: number;
  perPageRecord: number;
  customerId?: number;
  productId?: number;
  sortBy?: string;
  sortDir?: string;
}

export interface PowderCoatingResponse {
  success: boolean;
  message: string;
  data: {
    content: PowderCoatingProcess[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  };
} 