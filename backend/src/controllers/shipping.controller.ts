import { Request, Response } from 'express';
import { shiprocketService } from '../services/shiprocket.service';

export class ShippingController {
  public static async checkServiceability(req: Request, res: Response) {
    const pincode = req.query.pincode as string;

    if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit Indian delivery PIN code.',
      });
    }

    const result = await shiprocketService.checkServiceability(pincode);

    if (!result.isServiceable) {
      return res.status(200).json({
        success: false,
        message: `We currently do not deliver to PIN code ${pincode}. Please try another address.`,
        data: result,
      });
    }

    return res.json({
      success: true,
      message: `Delivery available for ${pincode} via ${result.courierName}.`,
      data: result,
    });
  }

  public static async trackShipment(req: Request, res: Response) {
    const { awb } = req.params;

    if (!awb) {
      return res.status(400).json({ success: false, message: 'AWB tracking number is required' });
    }

    const tracking = await shiprocketService.getTrackingDetails(awb);
    return res.json({ success: true, data: tracking });
  }
}

