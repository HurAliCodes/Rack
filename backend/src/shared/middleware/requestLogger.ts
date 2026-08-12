// src/middleware/logger.ts
import { Request, Response, NextFunction } from "express";
import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, 'request.logs');

export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  const method = req.method;
  const url = req.url;
  const timestamp = new Date().toISOString();
  
  // Log to file
  const logEntry = `[${timestamp}] ${method} ${url}\n`;
  fs.appendFileSync(logFilePath, logEntry);
  
  next();
};