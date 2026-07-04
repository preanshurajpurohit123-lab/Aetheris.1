with open("server.ts", "rb") as f:
    content = f.read()

start_idx = content.find(b"export async function authenticateMiddleware")
end_idx = content.find(b"export function generateToken")

if start_idx == -1 or end_idx == -1:
    print("Failed to find boundaries!", start_idx, end_idx)
    exit(1)

new_middleware = b"""export async function authenticateMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No authorization token provided" });
  }

  const token = authHeader.split(" ")[1];

  // Try local verification first (handles local logins and fallback signups)
  const localUserId = verifyToken(token);
  if (localUserId) {
    const localUser = db.getUserById(localUserId);
    if (localUser) {
      req.user = localUser;
      return next();
    }
  }

  if (isSupabaseActive) {
    try {
      const client = createClient(supabaseUrl!, supabaseAnonKey!, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
      const { data: { user }, error } = await client.auth.getUser(token);
      if (!error && user) {
        req.user = {
          id: user.id,
          email: user.email ? user.email.replace("+google@", "@") : "",
          passwordHash: "",
          createdAt: user.created_at || new Date().toISOString()
        };
        return next();
      }
    } catch (e: any) {
      // ignore and fallback
    }
  }

  return res.status(401).json({ error: "Invalid or expired authentication session" });
}

"""

new_content = content[:start_idx] + new_middleware + content[end_idx:]

with open("server.ts", "wb") as f:
    f.write(new_content)

print("SUCCESSFULLY REPLACED AUTH MIDDLEWARE!")
