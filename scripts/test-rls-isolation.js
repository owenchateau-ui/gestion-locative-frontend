#!/usr/bin/env node

/**
 * Test d'isolation RLS (Row Level Security)
 *
 * Ce script teste que les données sont bien isolées entre utilisateurs
 * via les policies RLS configurées sur Supabase.
 *
 * Prérequis:
 * - Migrations RLS exécutées avec succès
 * - Variables d'environnement configurées (.env)
 *
 * Usage:
 *   node scripts/test-rls-isolation.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Charger .env depuis frontend/ (1 niveau au-dessus)
dotenv.config({ path: join(__dirname, '../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ ERREUR: Variables d\'environnement manquantes')
  console.error('   Vérifiez que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définies dans .env')
  process.exit(1)
}

console.log('\n==========================================')
console.log('🧪 TEST RLS - ISOLATION MULTI-TENANT')
console.log('==========================================\n')

// Fonction utilitaire pour créer un client Supabase
function createTestClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

// Données de test
const userA = {
  email: `test-user-a-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  entityName: 'SCI Test User A'
}

const userB = {
  email: `test-user-b-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  entityName: 'SCI Test User B'
}

let results = {
  passed: 0,
  failed: 0,
  tests: []
}

function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL'
  console.log(`${status}: ${name}`)
  if (details) console.log(`   ${details}`)

  results.tests.push({ name, passed, details })
  if (passed) results.passed++
  else results.failed++
}

async function cleanup() {
  console.log('\n🧹 Nettoyage des données de test...')

  const supabase = createTestClient()

  // Supprimer les utilisateurs de test (si possible via admin)
  // Note: Supabase Auth ne permet pas de supprimer via l'API anonyme
  // Il faudrait utiliser la service_role key pour cela

  console.log('   ℹ️  Les utilisateurs de test resteront dans la base')
  console.log('   ℹ️  Supprimez-les manuellement via Supabase Dashboard > Authentication si nécessaire\n')
}

async function runTests() {
  try {
    // ========================================
    // TEST 1: Inscription User A
    // ========================================
    console.log('📝 Test 1: Inscription User A...')
    const supabaseA = createTestClient()
    const { data: dataA, error: errorA } = await supabaseA.auth.signUp({
      email: userA.email,
      password: userA.password
    })

    if (errorA) {
      logTest('User A: Inscription', false, errorA.message)
      throw new Error('Impossible de créer User A')
    }

    if (!dataA.user) {
      logTest('User A: Inscription', false, 'Aucun utilisateur retourné')
      throw new Error('User A non créé')
    }

    logTest('User A: Inscription', true, `ID: ${dataA.user.id}`)
    userA.id = dataA.user.id

    // Attendre un peu pour que l'utilisateur soit bien créé
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Créer l'entrée dans la table users (si elle n'existe pas déjà)
    const { error: errorUserA } = await supabaseA
      .from('users')
      .insert({
        id: dataA.user.id,
        email: userA.email
      })
      .select()

    if (errorUserA && !errorUserA.message.includes('duplicate key')) {
      console.log('⚠️  Erreur création user (peut-être déjà existe):', errorUserA.message)
    }

    // ========================================
    // TEST 2: Créer Entité pour User A
    // ========================================
    console.log('\n📝 Test 2: Créer entité pour User A...')
    const { data: entityA, error: errorEntityA } = await supabaseA
      .from('entities')
      .insert({
        user_id: dataA.user.id,
        name: userA.entityName,
        entity_type: 'individual'
      })
      .select()
      .single()

    if (errorEntityA) {
      logTest('User A: Création entité', false, errorEntityA.message)
      throw new Error('Impossible de créer entité User A')
    }

    logTest('User A: Création entité', true, `Entité: ${entityA.name}`)
    userA.entityId = entityA.id

    // ========================================
    // TEST 3: Inscription User B
    // ========================================
    console.log('\n📝 Test 3: Inscription User B...')
    const supabaseB = createTestClient()
    const { data: dataB, error: errorB } = await supabaseB.auth.signUp({
      email: userB.email,
      password: userB.password
    })

    if (errorB) {
      logTest('User B: Inscription', false, errorB.message)
      throw new Error('Impossible de créer User B')
    }

    if (!dataB.user) {
      logTest('User B: Inscription', false, 'Aucun utilisateur retourné')
      throw new Error('User B non créé')
    }

    logTest('User B: Inscription', true, `ID: ${dataB.user.id}`)
    userB.id = dataB.user.id

    // Attendre un peu
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Créer l'entrée dans la table users (si elle n'existe pas déjà)
    const { error: errorUserB } = await supabaseB
      .from('users')
      .insert({
        id: dataB.user.id,
        email: userB.email
      })
      .select()

    if (errorUserB && !errorUserB.message.includes('duplicate key')) {
      console.log('⚠️  Erreur création user (peut-être déjà existe):', errorUserB.message)
    }

    // ========================================
    // TEST 4: Créer Entité pour User B
    // ========================================
    console.log('\n📝 Test 4: Créer entité pour User B...')
    const { data: entityB, error: errorEntityB } = await supabaseB
      .from('entities')
      .insert({
        user_id: dataB.user.id,
        name: userB.entityName,
        entity_type: 'individual'
      })
      .select()
      .single()

    if (errorEntityB) {
      logTest('User B: Création entité', false, errorEntityB.message)
      throw new Error('Impossible de créer entité User B')
    }

    logTest('User B: Création entité', true, `Entité: ${entityB.name}`)
    userB.entityId = entityB.id

    // ========================================
    // TEST 5: User A voit UNIQUEMENT sa propre entité
    // ========================================
    console.log('\n📝 Test 5: User A voit uniquement sa propre entité...')
    const { data: entitiesForA, error: errorEntitiesA } = await supabaseA
      .from('entities')
      .select('*')

    if (errorEntitiesA) {
      logTest('RLS: User A SELECT entities', false, errorEntitiesA.message)
    } else {
      const seesOnlyOwn = entitiesForA.length === 1 && entitiesForA[0].id === userA.entityId
      const seesUserB = entitiesForA.some(e => e.id === userB.entityId)

      if (seesOnlyOwn && !seesUserB) {
        logTest('RLS: User A isolation', true, `Voit ${entitiesForA.length} entité (la sienne)`)
      } else {
        logTest('RLS: User A isolation', false, `Voit ${entitiesForA.length} entités (devrait voir 1)`)
        if (seesUserB) {
          console.log('   ❌ FAILLE DE SÉCURITÉ: User A peut voir l\'entité de User B !')
        }
      }
    }

    // ========================================
    // TEST 6: User B voit UNIQUEMENT sa propre entité
    // ========================================
    console.log('\n📝 Test 6: User B voit uniquement sa propre entité...')
    const { data: entitiesForB, error: errorEntitiesB } = await supabaseB
      .from('entities')
      .select('*')

    if (errorEntitiesB) {
      logTest('RLS: User B SELECT entities', false, errorEntitiesB.message)
    } else {
      const seesOnlyOwn = entitiesForB.length === 1 && entitiesForB[0].id === userB.entityId
      const seesUserA = entitiesForB.some(e => e.id === userA.entityId)

      if (seesOnlyOwn && !seesUserA) {
        logTest('RLS: User B isolation', true, `Voit ${entitiesForB.length} entité (la sienne)`)
      } else {
        logTest('RLS: User B isolation', false, `Voit ${entitiesForB.length} entités (devrait voir 1)`)
        if (seesUserA) {
          console.log('   ❌ FAILLE DE SÉCURITÉ: User B peut voir l\'entité de User A !')
        }
      }
    }

    // ========================================
    // TEST 7: User B ne peut PAS modifier l'entité de User A
    // ========================================
    console.log('\n📝 Test 7: User B ne peut PAS modifier l\'entité de User A...')
    const { error: errorUpdateA } = await supabaseB
      .from('entities')
      .update({ name: 'HACKED BY USER B' })
      .eq('id', userA.entityId)

    if (errorUpdateA) {
      // C'est ce qu'on veut : une erreur car l'accès est refusé
      logTest('RLS: User B UPDATE entité User A', true, 'Accès refusé (comme attendu)')
    } else {
      logTest('RLS: User B UPDATE entité User A', false, '❌ FAILLE: Modification autorisée !')
    }

    // ========================================
    // TEST 8: User A ne peut PAS supprimer l'entité de User B
    // ========================================
    console.log('\n📝 Test 8: User A ne peut PAS supprimer l\'entité de User B...')
    const { error: errorDeleteB } = await supabaseA
      .from('entities')
      .delete()
      .eq('id', userB.entityId)

    if (errorDeleteB) {
      // C'est ce qu'on veut : une erreur car l'accès est refusé
      logTest('RLS: User A DELETE entité User B', true, 'Accès refusé (comme attendu)')
    } else {
      logTest('RLS: User A DELETE entité User B', false, '❌ FAILLE: Suppression autorisée !')
    }

    // ========================================
    // RÉSUMÉ
    // ========================================
    console.log('\n==========================================')
    console.log('📊 RÉSULTATS DES TESTS')
    console.log('==========================================\n')

    console.log(`Tests réussis  : ${results.passed} ✅`)
    console.log(`Tests échoués  : ${results.failed} ❌`)
    console.log(`Total          : ${results.passed + results.failed}`)
    console.log('')

    if (results.failed === 0) {
      console.log('🎉 SUCCÈS COMPLET: RLS fonctionne parfaitement !')
      console.log('   L\'isolation multi-tenant est garantie.')
      console.log('   Score sécurité: 100/100 ✅\n')
    } else {
      console.log('❌ ÉCHEC: Certains tests ont échoué')
      console.log('   Vérifiez que toutes les migrations ont été exécutées.')
      console.log('   Consultez GUIDE_EXECUTION_RAPIDE.md\n')
    }

    // Nettoyage
    await cleanup()

    // Code de sortie
    process.exit(results.failed === 0 ? 0 : 1)

  } catch (error) {
    console.error('\n❌ ERREUR FATALE:', error.message)
    console.error(error)
    await cleanup()
    process.exit(1)
  }
}

// Lancer les tests
runTests()
