# Git & GitHub – A2 eMeldewesen

Dieses Verzeichnis ist ein **eigenes Git-Repository** (getrennt vom JVP-Starter A1).

## Täglicher Ablauf

```bash
cd meldewesen-a2-main   # Projektroot A2

git status
git add .
git commit -m "Kurz: was du erreicht hast"
git push
```

`.env` wird **nicht** versioniert (nur `.env.example`).

## GitHub-Repo einmalig anlegen

### Variante A – Skript (empfohlen)

1. GitHub CLI installieren und anmelden:

   ```bash
   brew install gh
   gh auth login
   ```

2. Im Projektroot:

   ```bash
   chmod +x scripts/github-setup.sh
   ./scripts/github-setup.sh
   ```

   Optional anderer Repo-Name:

   ```bash
   ./scripts/github-setup.sh DEIN_GITHUB_USER heureka-meldewesen-a2
   ```

### Variante B – manuell in der GitHub-Oberfläche

1. Auf [github.com/new](https://github.com/new) ein **leeres privates** Repository anlegen (ohne README).
2. Im Terminal:

   ```bash
   git remote add origin git@github.com:DEIN_USER/meldewesen-a2.git
   git push -u origin main
   ```

## Ältere Version wiederherstellen

| Ziel | Befehl |
|------|--------|
| Commit-Historie anzeigen | `git log --oneline` |
| Einzelne Datei zurücksetzen | `git restore pfad/zur/datei` |
| Ganzen Stand eines Commits ansehen | `git checkout COMMIT_HASH` |
| Zurück auf aktuellen Stand | `git checkout main` |
| Letzten Commit rückgängig (lokal) | `git revert HEAD` |

Auf GitHub: Tab **Commits** → gewünschten Stand → **Browse repository** oder neuen Branch erstellen.

## Git-Identität (nur dieses Repo)

Falls Commits fehlschlagen („Author identity unknown“):

```bash
git config user.name "Vorname Nachname"
git config user.email "deine@email.de"
```

(Nur lokal in diesem Ordner, ohne `--global`.)
