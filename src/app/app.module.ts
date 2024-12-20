import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/auth/login/login.component';
import { HeaderComponent } from './components/shared/header/header.component';
import { CategoryComponent } from './components/category/category.component';
import { ProductComponent } from './components/product/product.component';
// import { PurchaseComponent } from './components/purchase/purchase.component';
// import { SalesComponent } from './components/sales/sales.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AppRoutingModule } from './app-routing.module';
import { PurchaseComponent } from './components/purchase/purchase.component';
import { AddPurchaseComponent } from './components/add-purchase/add-purchase.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { SaleModalComponent } from './components/sale-modal/sale-modal.component';
import { SaleComponent } from './components/sale/sale.component';
import { ProfitComponent } from './components/profit/profit.component';
import { CustomerModalComponent } from './components/customer-modal/customer-modal.component';
import { CustomerComponent } from './components/customer/customer.component';
import { AuthService } from './services/auth.service';
import { CategoryService } from './services/category.service';
import { ProductService } from './services/product.service';
import { PurchaseService } from './services/purchase.service';
import { SaleService } from './services/sale.service';
import { CustomerService } from './services/customer.service';
import { ModalService } from './services/modal.service';
    
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HeaderComponent,
    CategoryComponent,
    ProductComponent,
    PurchaseComponent,
    AddPurchaseComponent,
    SaleModalComponent,
    SaleComponent,
    CustomerModalComponent,
    ProfitComponent,
    CustomerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AppRoutingModule,
    MatDialogModule,
    CommonModule,
    FormsModule,
    RouterModule,
    MatDialogModule,
    ToastrModule.forRoot()
  ],
  providers: [
    AuthService,
    CategoryService,
    ProductService,
    PurchaseService,
    SaleService,
    CustomerService,
    ModalService,
    ToastrService,
    
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }