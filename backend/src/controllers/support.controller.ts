import { Request, Response } from 'express';
import { dbStore, SupportTicketEntity } from '../data/dbStore';
import { logger } from '../utils/logger';

export class SupportController {
  public static async submitComplaint(req: Request, res: Response) {
    try {
      const {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        issueType,
        description,
        imageEvidenceUrl,
      } = req.body;

      if (!customerName || !customerEmail || !customerPhone || !description) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, phone, and detailed issue description are required.',
        });
      }

      let orderId: string | undefined;
      if (orderNumber) {
        const order = dbStore.getOrderByNumber(orderNumber.trim());
        if (order) {
          orderId = order.id;
        }
      }

      const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

      const ticket: SupportTicketEntity = {
        id: 'tkt-' + Math.random().toString(36).substring(2, 9),
        ticketNumber,
        orderId: orderId || null,
        customerName,
        customerEmail,
        customerPhone,
        issueType: issueType || 'DEFECTIVE_PRODUCT',
        description,
        imageEvidenceUrl: imageEvidenceUrl || null,
        status: 'OPEN',
        adminNotes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dbStore.createSupportTicket(ticket);
      logger.info(`Customer support ticket created #${ticketNumber} for order ${orderNumber || 'N/A'}`);

      return res.status(201).json({
        success: true,
        message: 'Your concern has been submitted to the ANAMIKA COLLECTIONS Concierge Team. A specialist will review your details within 24 business hours.',
        data: {
          ticketNumber: ticket.ticketNumber,
          status: ticket.status,
        },
      });
    } catch (err: any) {
      logger.error('Failed to submit support complaint', err);
      return res.status(500).json({ success: false, message: 'Failed to submit complaint' });
    }
  }

  public static async checkTicketStatus(req: Request, res: Response) {
    const { ticketNumber } = req.params;
    const tickets = dbStore.getAllSupportTicketsAdmin();
    const ticket = tickets.find((t) => t.ticketNumber === ticketNumber);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    return res.json({
      success: true,
      data: {
        ticketNumber: ticket.ticketNumber,
        issueType: ticket.issueType,
        status: ticket.status,
        adminNotes: ticket.adminNotes,
        createdAt: ticket.createdAt,
      },
    });
  }
}

