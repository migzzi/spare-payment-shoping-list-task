import { IsInt, Length, Min, Max, IsNumber } from "class-validator";
import { CreateProductDto } from "../dtos/product.dto";

export class Product {
  @IsInt()
  id: number;

  @Length(2, 100)
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(0)
  quantity: number;

  constructor(id: number, dto: CreateProductDto) {
    this.id = id;
    this.name = dto.name;
    this.price = dto.price;
    this.quantity = dto.quantity;
  }
}
