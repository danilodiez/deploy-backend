import { logger } from "../utils/logger.js";

export class PurchaseController {
  constructor({ purchaseModel, itemModel, userModel }) {
    this.purchaseModel = purchaseModel;
    this.itemModel = itemModel;
    this.userModel = userModel;
  }

  // Create a purchase (requires authentication)
  create = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Debe proporcionar productId y una cantidad válida",
      });
    }

    try {
      // 1. Get product
      const productResult = await this.itemModel.getById({ id: productId });
      if (productResult.statusCode !== 200) {
        return res.status(404).json({
          success: false,
          message: "Producto no encontrado",
        });
      }

      const product = productResult.result;

      // 2. Check stock
      if (!product.stock || product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente. Disponible: ${product.stock || 0}`,
        });
      }

      const totalPrice = product.price * quantity;

      // 3. Check user balance
      const balanceResult = await this.userModel.getBalance({ userId });
      if (balanceResult.statusCode !== 200) {
        logger.error("Error al obtener balance del usuario", balanceResult);
        return res.status(500).json({
          success: false,
          message: "Error al verificar el balance",
        });
      }

      if (balanceResult.balance < totalPrice) {
        return res.status(400).json({
          success: false,
          message: `Balance insuficiente. Balance actual: $${balanceResult.balance}`,
        });
      }

      // 4. Deduct from user balance
      const deductResult = await this.userModel.updateBalance({
        userId,
        amount: -totalPrice,
      });

      if (deductResult.statusCode !== 200) {
        logger.error("Error al descontar del balance", deductResult);
        return res.status(500).json({
          success: false,
          message: "Error al procesar el pago",
        });
      }

      // 5. Update product stock
      const stockResult = await this.itemModel.updateStock({
        id: productId,
        quantity,
      });

      if (!stockResult.result) {
        logger.error("Error al actualizar stock", stockResult);
        // Rollback balance if stock update fails
        await this.userModel.updateBalance({
          userId,
          amount: totalPrice,
        });
        return res.status(400).json({
          success: false,
          message: "No hay suficiente stock disponible",
        });
      }

      // 6. Create purchase record
      const purchaseResult = await this.purchaseModel.create({
        userId,
        productId,
        quantity,
        totalPrice,
        purchaseDate: new Date(),
      });

      if (purchaseResult.statusCode === 201) {
        logger.info("Compra realizada exitosamente", {
          userId,
          productId,
          quantity,
          totalPrice,
        });

        return res.status(201).json({
          success: true,
          purchase: purchaseResult.purchase,
          newBalance: deductResult.user.balance,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Error al registrar la compra",
      });
    } catch (error) {
      logger.error("Error al procesar la compra", error);
      return res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  };

  // Get user's purchases (requires authentication)
  getMyPurchases = async (req, res) => {
    const userId = req.user.userId;

    try {
      const result = await this.purchaseModel.getByUserId({ userId });

      return res.status(result.statusCode).json({
        success: true,
        purchases: result.purchases,
      });
    } catch (error) {
      logger.error("Error al obtener compras del usuario", error);
      return res.status(500).json({
        success: false,
        message: "Error al obtener las compras",
      });
    }
  };

  // Get all purchases (admin only - requires authentication)
  getAll = async (req, res) => {
    try {
      const result = await this.purchaseModel.getAll();

      return res.status(result.statusCode).json({
        success: true,
        purchases: result.purchases,
      });
    } catch (error) {
      logger.error("Error al obtener todas las compras", error);
      return res.status(500).json({
        success: false,
        message: "Error al obtener las compras",
      });
    }
  };

  // Get a single purchase by ID
  getById = async (req, res) => {
    const { id } = req.params;

    try {
      const result = await this.purchaseModel.getById({ id });

      if (result.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: "Compra no encontrada",
        });
      }

      return res.status(result.statusCode).json({
        success: true,
        purchase: result.purchase,
      });
    } catch (error) {
      logger.error("Error al obtener la compra", error);
      return res.status(500).json({
        success: false,
        message: "Error al obtener la compra",
      });
    }
  };
}

