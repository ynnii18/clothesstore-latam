import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ItemCart } from '@appShared/models/shared/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  subjectStore = new BehaviorSubject<ItemCart[]>([]);
  store$ = this.subjectStore.asObservable();

  constructor() {
    const cartItems: ItemCart[] = JSON.parse(<string>localStorage.getItem('CartItems'));
    if (cartItems) {
      this.subjectStore.next(cartItems);
    }
  }

  get cart() {
    return this.store$;
  }

  get totalItems() {
    if (this.subjectStore.value.length === 0) {
      return 0;
    }
    return this.subjectStore.value.map((item) => item.productQty).reduce((acc, val) => acc + val);
  }

  get totalPrice() {
    return this.subjectStore.value.map((item) => item.productQty * item.productPrice).reduce((acc, val) => acc + val);
  }

  findProductInCart(productId: string): ItemCart | undefined {
    return this.subjectStore.value.find((x) => x.productId === productId);
  }

  findIndexProduct(productId: string): number {
    return this.subjectStore.value.findIndex((x) => x.productId === productId);
  }

  addItem(item: ItemCart) {
    const products = this.subjectStore.value;
    const productIndex = this.findIndexProduct(item.productId);

    if (productIndex !== -1) {
      products[productIndex].productQty += 1;
      this.subjectStore.next(products);
      localStorage.setItem('CartItems', JSON.stringify(this.subjectStore.value));
      return;
    }
    this.subjectStore.next([...products, { ...item, productQty: 1 }]);
  }

  removeItem(productId: string) {
    const products = this.subjectStore.value.filter((x) => x.productId !== productId);
    localStorage.setItem('CartItems', JSON.stringify(this.subjectStore.value));
    this.subjectStore.next(products);
  }

  updateItem(qty: number, productId: string) {
    const products = this.subjectStore.value;
    const productIndex = this.findIndexProduct(productId);

    if (productIndex !== -1) {
      products[productIndex].productQty = qty;
    }
    localStorage.setItem('CartItems', JSON.stringify(this.subjectStore.value));
  }

  clear() {
    this.subjectStore.next([]);
    this.subjectStore.complete();
    localStorage.removeItem('CartItems');
  }
}
