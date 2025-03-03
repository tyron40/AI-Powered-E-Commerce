import { User } from '../types';

export const currentUser: User = {
  id: 1,
  name: "John Doe",
  email: "john.doe@example.com",
  preferences: ["electronics", "home"],
  purchaseHistory: [
    { productId: 2, date: "2023-10-15" },
    { productId: 5, date: "2023-11-02" },
    { productId: 8, date: "2023-12-20" }
  ]
};