import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/** 哈希密码（注册时调用） */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/** 校验密码（登录时调用） */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
