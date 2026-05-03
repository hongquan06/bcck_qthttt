import jwt from "jsonwebtoken";

export type JwtPayload = {
  id: number;
  role: string;
};

export function verifyToken(req: Request): JwtPayload {
  const auth = req.headers.get("authorization");
  if (!auth) throw new Error("No token");
  const token = auth.split(" ")[1];
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
}

export function requireAdmin(req: Request): JwtPayload {
  const decoded = verifyToken(req);
  if (decoded.role !== "admin") throw new Error("Forbidden");
  return decoded;
}