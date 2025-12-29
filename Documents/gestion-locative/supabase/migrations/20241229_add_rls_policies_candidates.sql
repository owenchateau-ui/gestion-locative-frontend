-- Migration: Politiques RLS pour le système de candidatures
-- Date: 2024-12-29
-- Description: Ajoute les politiques Row-Level Security pour les tables candidates

-- ============================================================================
-- TABLE: candidate_invitation_links
-- ============================================================================

-- Activer RLS si pas déjà fait
ALTER TABLE candidate_invitation_links ENABLE ROW LEVEL SECURITY;

-- Politique SELECT: Tout le monde peut lire les liens actifs (pour le formulaire public)
CREATE POLICY "Les liens actifs sont lisibles par tous"
ON candidate_invitation_links
FOR SELECT
USING (is_active = true);

-- Politique INSERT: Les utilisateurs authentifiés peuvent créer des liens pour leurs lots
CREATE POLICY "Les propriétaires peuvent créer des liens pour leurs lots"
ON candidate_invitation_links
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lots_new l
    INNER JOIN properties_new p ON l.property_id = p.id
    INNER JOIN entities e ON p.entity_id = e.id
    WHERE l.id = candidate_invitation_links.lot_id
    AND e.user_id = auth.uid()
  )
);

-- Politique UPDATE: Les utilisateurs authentifiés peuvent modifier leurs propres liens
CREATE POLICY "Les propriétaires peuvent modifier leurs liens"
ON candidate_invitation_links
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lots_new l
    INNER JOIN properties_new p ON l.property_id = p.id
    INNER JOIN entities e ON p.entity_id = e.id
    WHERE l.id = candidate_invitation_links.lot_id
    AND e.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lots_new l
    INNER JOIN properties_new p ON l.property_id = p.id
    INNER JOIN entities e ON p.entity_id = e.id
    WHERE l.id = candidate_invitation_links.lot_id
    AND e.user_id = auth.uid()
  )
);

-- Politique DELETE: Les utilisateurs authentifiés peuvent supprimer leurs propres liens
CREATE POLICY "Les propriétaires peuvent supprimer leurs liens"
ON candidate_invitation_links
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lots_new l
    INNER JOIN properties_new p ON l.property_id = p.id
    INNER JOIN entities e ON p.entity_id = e.id
    WHERE l.id = candidate_invitation_links.lot_id
    AND e.user_id = auth.uid()
  )
);

-- ============================================================================
-- TABLE: candidates
-- ============================================================================

-- Activer RLS
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

-- Politique SELECT: Les propriétaires peuvent voir les candidatures pour leurs lots
CREATE POLICY "Les propriétaires peuvent voir leurs candidatures"
ON candidates
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lots_new l
    INNER JOIN properties_new p ON l.property_id = p.id
    INNER JOIN entities e ON p.entity_id = e.id
    WHERE l.id = candidates.lot_id
    AND e.user_id = auth.uid()
  )
);

-- Politique SELECT: Les candidats peuvent voir leur propre candidature via le token
CREATE POLICY "Les candidats peuvent voir leur candidature via token"
ON candidates
FOR SELECT
TO anon
USING (true);

-- Politique INSERT: Tout le monde peut créer une candidature (formulaire public)
CREATE POLICY "Tout le monde peut soumettre une candidature"
ON candidates
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Politique UPDATE: Les propriétaires peuvent modifier le statut des candidatures
CREATE POLICY "Les propriétaires peuvent modifier le statut"
ON candidates
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lots_new l
    INNER JOIN properties_new p ON l.property_id = p.id
    INNER JOIN entities e ON p.entity_id = e.id
    WHERE l.id = candidates.lot_id
    AND e.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM lots_new l
    INNER JOIN properties_new p ON l.property_id = p.id
    INNER JOIN entities e ON p.entity_id = e.id
    WHERE l.id = candidates.lot_id
    AND e.user_id = auth.uid()
  )
);

-- Politique DELETE: Les propriétaires peuvent supprimer les candidatures
CREATE POLICY "Les propriétaires peuvent supprimer les candidatures"
ON candidates
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM lots_new l
    INNER JOIN properties_new p ON l.property_id = p.id
    INNER JOIN entities e ON p.entity_id = e.id
    WHERE l.id = candidates.lot_id
    AND e.user_id = auth.uid()
  )
);

-- ============================================================================
-- TABLE: candidate_documents
-- ============================================================================

-- Activer RLS
ALTER TABLE candidate_documents ENABLE ROW LEVEL SECURITY;

-- Politique SELECT: Les propriétaires peuvent voir les documents des candidatures pour leurs lots
CREATE POLICY "Les propriétaires peuvent voir les documents"
ON candidate_documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM candidates c
    INNER JOIN lots_new l ON c.lot_id = l.id
    INNER JOIN properties_new p ON l.property_id = p.id
    INNER JOIN entities e ON p.entity_id = e.id
    WHERE c.id = candidate_documents.candidate_id
    AND e.user_id = auth.uid()
  )
);

-- Politique SELECT: Les candidats peuvent voir leurs propres documents
CREATE POLICY "Les candidats peuvent voir leurs documents"
ON candidate_documents
FOR SELECT
TO anon
USING (true);

-- Politique INSERT: Tout le monde peut uploader des documents (formulaire public)
CREATE POLICY "Tout le monde peut uploader des documents"
ON candidate_documents
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Politique DELETE: Les propriétaires peuvent supprimer les documents
CREATE POLICY "Les propriétaires peuvent supprimer les documents"
ON candidate_documents
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM candidates c
    INNER JOIN lots_new l ON c.lot_id = l.id
    INNER JOIN properties_new p ON l.property_id = p.id
    INNER JOIN entities e ON p.entity_id = e.id
    WHERE c.id = candidate_documents.candidate_id
    AND e.user_id = auth.uid()
  )
);

-- ============================================================================
-- STORAGE: candidate-documents bucket
-- ============================================================================

-- Politique: Les propriétaires peuvent voir les documents de leurs candidats
CREATE POLICY "Les propriétaires peuvent voir les documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'candidate-documents'
  AND (
    -- Le fichier appartient à une candidature pour un lot du propriétaire
    EXISTS (
      SELECT 1 FROM candidate_documents cd
      INNER JOIN candidates c ON cd.candidate_id = c.id
      INNER JOIN lots_new l ON c.lot_id = l.id
      INNER JOIN properties_new p ON l.property_id = p.id
      INNER JOIN entities e ON p.entity_id = e.id
      WHERE storage.objects.name = cd.file_path
      AND e.user_id = auth.uid()
    )
  )
);

-- Politique: Les candidats peuvent voir leurs propres documents
CREATE POLICY "Les candidats peuvent voir leurs documents"
ON storage.objects
FOR SELECT
TO anon
USING (
  bucket_id = 'candidate-documents'
);

-- Politique: Tout le monde peut uploader des documents
CREATE POLICY "Tout le monde peut uploader des documents"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'candidate-documents'
  AND (storage.foldername(name))[1] IS NOT NULL
);

-- Politique: Les propriétaires peuvent supprimer les documents
CREATE POLICY "Les propriétaires peuvent supprimer les documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'candidate-documents'
  AND (
    EXISTS (
      SELECT 1 FROM candidate_documents cd
      INNER JOIN candidates c ON cd.candidate_id = c.id
      INNER JOIN lots_new l ON c.lot_id = l.id
      INNER JOIN properties_new p ON l.property_id = p.id
      INNER JOIN entities e ON p.entity_id = e.id
      WHERE storage.objects.name = cd.file_path
      AND e.user_id = auth.uid()
    )
  )
);

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
