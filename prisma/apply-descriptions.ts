import "dotenv/config"
import { readFileSync } from "node:fs"
import { Pool } from "pg"

// Taslak açıklamaları yalnızca açıklaması boş/kısa olan aktif ürünlere yazar.
// Önce kuru çalışma: npx tsx prisma/apply-descriptions.ts
// Uygulamak için:    npx tsx prisma/apply-descriptions.ts --apply
const apply = process.argv.includes("--apply")
const drafts: { byGroupCode: Record<string, string> } = JSON.parse(
  readFileSync(new URL("./aciklama-taslaklari.json", import.meta.url), "utf8")
)

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const { rows } = await pool.query(
    `select id, name, "groupCode" from "Product"
     where "isActive" and coalesce(length(trim(description)), 0) < 20`
  )
  for (const row of rows) {
    const text = row.groupCode ? drafts.byGroupCode[row.groupCode] : undefined
    if (!text) {
      console.log(`atlandı (taslak yok): #${row.id} ${row.name}`)
      continue
    }
    if (apply) {
      await pool.query(
        `update "Product" set description = $1, "updatedAt" = now()
         where id = $2 and coalesce(length(trim(description)), 0) < 20`,
        [text, row.id]
      )
    }
    console.log(`${apply ? "yazıldı" : "yazılacak"}: #${row.id} ${row.name}`)
  }
  await pool.end()
}

main()
