import { Request, Response } from 'express';
export declare const getAllReservations: (_: Request, res: Response) => Promise<void>;
export declare const getReservationById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserReservations: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createReservation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateReservationStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const cancelReservation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteReservation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const checkAvailability: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=reservation.controller.d.ts.map