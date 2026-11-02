import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error('Unhandled server error:', err);
  const status = err.status || 500;
  const message = err.message || 'Internal server error occurred';
  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString()
  });
}
