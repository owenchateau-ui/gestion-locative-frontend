# Correction de l'affichage des erreurs

## ❌ Problème identifié

Les messages d'erreur s'affichaient en JSON brut au lieu de messages clairs en français :

```json
[
  {
    "origin": "string",
    "code": "invalid_format",
    "format": "email",
    "path": ["email"],
    "message": "Format d'email invalide"
  }
]
```

## ✅ Solution appliquée

### 1. Fonction utilitaire `formatError()`

Créée pour gérer tous les types d'erreurs possibles :

```javascript
const formatError = (err) => {
  // Si c'est déjà un string, le retourner
  if (typeof err === 'string') {
    return err
  }

  // Si c'est un tableau d'erreurs Zod
  if (Array.isArray(err)) {
    return err.map(e => e.message || e).join(', ')
  }

  // Si c'est un objet avec errors (ZodError)
  if (err?.errors && Array.isArray(err.errors)) {
    return err.errors.map(e => e.message).join(', ')
  }

  // Si c'est un objet avec message
  if (err?.message) {
    return err.message
  }

  // Fallback
  return 'Une erreur est survenue'
}
```

### 2. Mise à jour du composant `ErrorMessage`

```javascript
const ErrorMessage = ({ error }) => {
  if (!error) return null
  return (
    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{formatError(error)}</span> {/* ✅ Utilise formatError */}
    </p>
  )
}
```

### 3. Correction de `validateStep()`

```javascript
catch (err) {
  if (err.errors && Array.isArray(err.errors)) {
    // Erreur Zod - extraire les messages par champ
    const fieldErrors = {}
    err.errors.forEach((error) => {
      const fieldName = error.path[0]
      // ✅ Ne stocker que le message, pas l'objet entier
      fieldErrors[fieldName] = error.message
    })
    setErrors(fieldErrors)
  } else {
    // Erreur générale
    setError(formatError(err)) // ✅ Utilise formatError
  }
  return false
}
```

### 4. Correction de tous les `setError()`

**Avant :**
```javascript
setError(err.message)
```

**Après :**
```javascript
setError(formatError(err))
```

Modifié dans :
- `loadLot()` → ligne 146
- `validateStep()` → ligne 232
- `handleSubmit()` → ligne 303

### 5. Correction de l'affichage JSX

**Avant :**
```jsx
{error && (
  <Alert variant="error" title="Erreur">
    {error}
  </Alert>
)}
```

**Après :**
```jsx
{error && (
  <Alert variant="error" title="Erreur">
    {typeof error === 'string' ? error : formatError(error)}
  </Alert>
)}
```

Modifié dans :
- Alerte globale principale (ligne 440)
- Alerte d'erreur de chargement (ligne 329)

## 🎯 Résultat

Maintenant, quel que soit le type d'erreur (string, objet Zod, tableau, etc.), l'utilisateur verra toujours un message clair en français :

✅ **Avant correction** :
```
[ { "origin": "string", "code": "invalid_format", "format": "email", "path": [ "email" ], "message": "Format d'email invalide" } ]
```

✅ **Après correction** :
```
Format d'email invalide
```

## 📝 Types d'erreurs gérés

1. **String direct** : `"Erreur de connexion"` → Affiché tel quel
2. **Objet avec message** : `{ message: "Erreur" }` → Extrait le message
3. **Erreur Zod** : `{ errors: [...] }` → Extrait les messages et les joint
4. **Tableau d'erreurs** : `[{message: "..."}, ...]` → Joint tous les messages
5. **Objet inconnu** : N'importe quoi d'autre → "Une erreur est survenue"

## 🧪 Tests à faire

1. **Erreur de validation** : Soumettre un formulaire invalide
   - Devrait afficher : "Format d'email invalide" (pas un JSON)

2. **Erreur réseau** : Simuler une erreur de connexion
   - Devrait afficher un message compréhensible

3. **Erreur Zod multiple** : Plusieurs champs invalides
   - Devrait afficher les messages séparés par des virgules

4. **Erreur garant** : Cocher "J'ai un garant" sans remplir
   - Devrait afficher : "Tous les champs du garant sont obligatoires si vous avez un garant"
