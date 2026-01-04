import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', 'frontend', '.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixGuarantorColumns() {
  try {
    console.log('🔧 Correction des colonnes de garant...\n')

    // Lire le fichier SQL
    const sqlPath = join(__dirname, '..', 'supabase', 'migrations', '20260102_fix_guarantor_columns.sql')
    const sql = readFileSync(sqlPath, 'utf8')

    console.log('📄 Exécution du script SQL...')

    // Exécuter le SQL via l'API Supabase
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      console.error('❌ Erreur lors de l\'exécution:', error.message)

      // Si la fonction exec_sql n'existe pas, on va créer les colonnes manuellement
      console.log('\n⚠️  Tentative de création manuelle des colonnes...\n')

      // On va tester en insérant une candidature avec les champs
      const testData = {
        lot_id: '00000000-0000-0000-0000-000000000000', // UUID bidon pour tester
        entity_id: '00000000-0000-0000-0000-000000000000',
        first_name: 'Test',
        last_name: 'Test',
        email: 'test@test.com',
        guarantor_professional_status: 'test'
      }

      const { error: testError } = await supabase
        .from('candidates')
        .insert(testData)
        .select()

      if (testError) {
        if (testError.message.includes('guarantor_professional_status')) {
          console.error('❌ La colonne guarantor_professional_status n\'existe pas')
          console.log('\n📋 Instructions manuelles:')
          console.log('1. Allez sur https://supabase.com/dashboard')
          console.log('2. Ouvrez le SQL Editor')
          console.log('3. Copiez-collez le contenu du fichier:')
          console.log('   supabase/migrations/20260102_fix_guarantor_columns.sql')
          console.log('4. Exécutez le script\n')
        } else {
          console.log('✅ Les colonnes semblent exister (erreur de référence FK)')
        }
      }
    } else {
      console.log('✅ Migration exécutée avec succès!')
      console.log(data)
    }

  } catch (err) {
    console.error('❌ Erreur:', err.message)
  }
}

fixGuarantorColumns()
