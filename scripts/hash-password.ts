/** Usage: npm run admin:hash -- "your-password"  -> prints a bcrypt hash for ADMIN_PASSWORD_HASH */
import bcrypt from "bcryptjs";

const pw = process.argv[2];
if (!pw || pw.length < 12) {
  console.error('Provide a password of at least 12 characters: npm run admin:hash -- "your long password"');
  process.exit(1);
}
const hash = bcrypt.hashSync(pw, 12);
// Escape "$" so the value survives dotenv variable expansion in .env files.
console.log(`ADMIN_PASSWORD_HASH=${hash.replace(/\$/g, "\\$")}`);
