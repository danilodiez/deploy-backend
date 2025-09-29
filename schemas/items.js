import z from "zod";

const itemSchema = z.object({
  title: z.string({
    required_error: "El nombre es obligatorio",
    invalid_type_error: "El nombre debe ser una palabra o frase"
  }),
  year: z.number().min(2000).max(2025),
  brand: z.string(),
  price: z.number().positive(),
  poster: z.string(),
  category: z.array(
    z.enum([
      "Hogar",
      "Cocina",
      "Moda",
      "Calzado",
      "Electronica",
      "Audio",
      "Decoracion"
    ]),
    {
      required_error: "La categoria es obligatoria",
      invalid_type_error: "El campo es incorrecto",
    }
  ),
  rate: z.number().min(0).max(5)
});


export function validateItem(input) {
  return itemSchema.safeParse(input);
}

export function validateItemPartial(input) {
  return itemSchema.partial().safeParse(input);
}
