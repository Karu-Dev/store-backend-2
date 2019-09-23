export interface Item {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  quantity: number;
  expected_delivery_date: string;
  seller: string;
  seller_image: string;
}
export interface sentItem{
  id: number;
  title: string;
  description: string;
  image: string;
  expectedDeliveryDate: string;
  seller: string;
  sellerImage: string;
}
export interface pageStructure{
  page:number,
  totalPages:number;
  totalItems:number;
  items:sentItem[]
}